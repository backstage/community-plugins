/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  V1ContainerState,
  V1ContainerStatus,
  V1CronJob,
  V1DaemonSet,
  V1Deployment,
  V1Pod,
  V1ReplicaSet,
  V1StatefulSet,
} from '@kubernetes/client-node';

import { AllPodStatus, PodPhase } from '../components/Pods/pod';
import { ReplicaSetGVK, StatefulSetGVK } from '../models';
import {
  OverviewItemAlerts,
  PodControllerOverviewItem,
  PodRCData,
} from '../types/pods';
import {
  GroupVersionKind,
  K8sResponseData,
  K8sWorkloadResource,
} from '../types/types';
import { VMKind } from '../types/vm';
import { getPodsForVM } from './vm-utils';

// List of container status waiting reason values that we should call out as errors in project status rows.
const CONTAINER_WAITING_STATE_ERROR_REASONS = [
  'CrashLoopBackOff',
  'ErrImagePull',
  'ImagePullBackOff',
];

const DEPLOYMENT_REVISION_ANNOTATION = 'deployment.kubernetes.io/revision';

const apiVersionForModel = (gvk: GroupVersionKind) =>
  !gvk?.apiGroup ? gvk.apiVersion : `${gvk.apiGroup}/${gvk.apiVersion}`;

const getAnnotation = (obj: K8sWorkloadResource, annotation: string) => {
  return obj?.metadata?.annotations?.[annotation];
};

const isIdled = (deployment: K8sWorkloadResource): boolean => {
  return !!deployment.metadata?.annotations?.[
    'idling.alpha.openshift.io/idled-at'
  ];
};

export const getDeploymentRevision = (
  obj: K8sWorkloadResource,
): number | undefined => {
  const revisionAnnotation = getAnnotation(obj, DEPLOYMENT_REVISION_ANNOTATION);
  const revision = revisionAnnotation && parseInt(revisionAnnotation, 10);
  return revision && Number.isFinite(revision) ? revision : undefined;
};

const getOwnedResources = <T extends K8sWorkloadResource>(
  obj: K8sWorkloadResource,
  resources: T[],
): T[] => {
  const uid = obj?.metadata?.uid;
  if (!uid || !resources) {
    return [];
  }
  return resources.filter(res => {
    const ownerReferences = res.metadata?.ownerReferences;
    return ownerReferences?.some(
      or => or.uid === uid && or.controller === true,
    );
  });
};

const getActiveReplicaSets = (
  deployment: K8sWorkloadResource,
  resources: K8sResponseData,
) => {
  const { replicasets } = resources;
  const currentRevision = getDeploymentRevision(deployment);
  const ownedRS = getOwnedResources(
    deployment,
    replicasets?.data,
  ) as V1ReplicaSet[];
  return ownedRS.filter(
    rs => rs?.status?.replicas || getDeploymentRevision(rs) === currentRevision,
  );
};

const sortByRevision = (
  replicators: V1ReplicaSet[],
  getRevision: Function,
  descending: boolean = true,
) => {
  const compare = (left: any, right: any) => {
    const leftVersion = getRevision(left);
    const rightVersion = getRevision(right);
    if (!isFinite(leftVersion) && !isFinite(rightVersion)) {
      const leftName = left?.metadata?.name || '';
      const rightName = right?.metadata?.name || '';
      if (descending) {
        return rightName.localeCompare(leftName);
      }
      return leftName.localeCompare(rightName);
    }

    if (!leftVersion) {
      return descending ? 1 : -1;
    }

    if (!rightVersion) {
      return descending ? -1 : 1;
    }

    if (descending) {
      return rightVersion - leftVersion;
    }

    return leftVersion - rightVersion;
  };

  return Array.from(replicators)?.sort(compare);
};

const sortReplicaSetsByRevision = (
  replicaSets: V1ReplicaSet[],
): V1ReplicaSet[] => {
  return sortByRevision(replicaSets, getDeploymentRevision);
};

const getPodsForResource = (
  resource: K8sWorkloadResource,
  resources: K8sResponseData,
): V1Pod[] => {
  const { pods } = resources;
  return getOwnedResources(resource, pods?.data as V1Pod[]);
};

// Only show an alert once if multiple pods have the same error for the same owner.
const podAlertKey = (
  alert: any,
  pod: K8sWorkloadResource,
  containerName: string = 'all',
): string => {
  const id = pod?.metadata?.ownerReferences?.[0]?.uid || pod.metadata?.uid;
  return `${alert}--${id}--${containerName}`;
};

const getPodAlerts = (pod: V1Pod): OverviewItemAlerts => {
  const alerts = {} as { [key: string]: any };
  const statuses = [
    ...(pod?.status?.initContainerStatuses
      ? pod.status.initContainerStatuses
      : []),
    ...(pod?.status?.containerStatuses ? pod.status.containerStatuses : []),
  ];
  statuses.forEach(status => {
    const { name, state } = status;
    const waitingReason = state?.waiting?.reason;
    if (
      waitingReason &&
      CONTAINER_WAITING_STATE_ERROR_REASONS.includes(waitingReason)
    ) {
      const key = podAlertKey(waitingReason, pod, name);
      const message = state.waiting?.message || waitingReason;
      alerts[key] = { severity: 'error', message };
    }
  });
  const podStatusConditions = pod?.status?.conditions || [];
  podStatusConditions.forEach((condition: any) => {
    const { type, status, reason, message } = condition;
    if (
      type === 'PodScheduled' &&
      status === 'False' &&
      reason === 'Unschedulable'
    ) {
      const key = podAlertKey(reason, pod);
      alerts[key] = {
        severity: 'error',
        message: `${reason}: ${message}`,
      };
    }
  });

  return alerts;
};

const combinePodAlerts = (pods: V1Pod[]) =>
  pods.reduce(
    (acc, pod) => ({
      ...acc,
      ...getPodAlerts(pod),
    }),
    {} as OverviewItemAlerts,
  );

const toResourceItem = (
  rs: V1ReplicaSet,
  gvk: GroupVersionKind,
  resources: K8sResponseData,
): PodControllerOverviewItem => {
  const obj = {
    ...rs,
    apiVersion: apiVersionForModel(gvk),
    kind: `${gvk.kind}`,
  };
  const podData = getPodsForResource(rs, resources);
  const alerts = combinePodAlerts(podData);
  return {
    alerts,
    obj,
    pods: podData,
    revision: getDeploymentRevision(rs),
  };
};

const getIdledStatus = (
  rc: PodControllerOverviewItem,
  dc: K8sWorkloadResource,
) => {
  const { pods } = rc;
  if (pods && !pods.length && isIdled(dc)) {
    return {
      ...rc,
      pods: [
        {
          ...(rc.obj?.metadata && { metadata: rc.obj.metadata }),
          ...(rc.obj?.spec && { spec: rc.obj.spec }),
          ...(rc.obj?.status && { status: rc.obj.status }),
          status: { phase: AllPodStatus.Idle },
        },
      ],
    };
  }
  return rc;
};

const getReplicaSetsForResource = (
  deployment: K8sWorkloadResource,
  resources: K8sResponseData,
) => {
  const replicaSets = getActiveReplicaSets(deployment, resources);
  const sortReplicaSets = sortReplicaSetsByRevision(replicaSets);
  return sortReplicaSets.map((rs: V1ReplicaSet) =>
    getIdledStatus(toResourceItem(rs, ReplicaSetGVK, resources), deployment),
  );
};

const getActiveStatefulSets = (
  ss: V1StatefulSet,
  resources: K8sResponseData,
) => {
  if (!resources?.statefulsets?.data?.length) {
    return [];
  }
  const ownedRS = resources.statefulsets.data.filter(
    f => f.metadata?.name === ss?.metadata?.name,
  ) as V1StatefulSet[];
  return ownedRS.filter(rs => rs?.status?.replicas);
};

export const getStatefulSetsResource = (
  statefulSet: V1StatefulSet,
  resources: K8sResponseData,
) => {
  const activeStatefulSets = getActiveStatefulSets(statefulSet, resources);
  return activeStatefulSets.map(pss =>
    getIdledStatus(toResourceItem(pss, StatefulSetGVK, resources), statefulSet),
  );
};

export const getPodsForDeployment = (
  deployment: V1Deployment,
  resources: K8sResponseData,
): PodRCData => {
  const replicaSets = getReplicaSetsForResource(deployment, resources);
  const [current, previous] = replicaSets;
  const isRollingOut = !!current && !!previous;

  return {
    obj: deployment,
    current: current as PodControllerOverviewItem,
    previous: previous as PodControllerOverviewItem,
    isRollingOut,
    pods: [...(current?.pods || []), ...(previous?.pods || [])] as V1Pod[],
  };
};

export const getPodsForStatefulSet = (
  statefulSet: V1StatefulSet,
  resources: K8sResponseData,
): PodRCData => {
  const statefulSets = getStatefulSetsResource(statefulSet, resources);
  const [current, previous] = statefulSets;
  const isRollingOut = !!current && !!previous;

  return {
    obj: statefulSet,
    current: current as PodControllerOverviewItem,
    previous: previous as PodControllerOverviewItem,
    isRollingOut,
    pods: [...(current?.pods || []), ...(previous?.pods || [])] as V1Pod[],
  };
};

export const getJobsForCronJob = (
  cronJobUid: string,
  resources: K8sResponseData,
) => {
  if (!resources?.jobs?.data?.length || resources?.jobs?.data?.length === 0) {
    return [];
  }
  return resources.jobs.data.filter(job =>
    job.metadata?.ownerReferences?.find(ref => ref.uid === cronJobUid),
  );
};

export const getPodsForCronJob = (
  cronJob: V1CronJob,
  resources: K8sResponseData,
): PodRCData => {
  const jobs = getJobsForCronJob(cronJob?.metadata?.uid as string, resources);
  return {
    obj: cronJob,
    current: undefined,
    previous: undefined,
    isRollingOut: undefined,
    pods: jobs?.reduce((acc: V1Pod[], job) => {
      acc.push(...getPodsForResource(job, resources));
      return acc;
    }, []),
  };
};

export const getPodsForVirtualMachine = (
  vm: VMKind,
  resources: K8sResponseData,
): PodRCData => {
  const pods = getPodsForVM(vm, resources);
  return {
    obj: vm,
    current: undefined,
    previous: undefined,
    isRollingOut: undefined,
    pods: pods,
  };
};

export const getPodsForDaemonSet = (
  daemonSet: V1DaemonSet,
  resources: K8sResponseData,
): PodRCData => {
  return {
    obj: daemonSet,
    current: undefined,
    previous: undefined,
    isRollingOut: undefined,
    pods: getPodsForResource(daemonSet, resources),
  };
};

/**
 * Extract the resources from `getResourcesToWatchForPods` which are watched with `useK8sWatchResources`.
 */
export const getPodsDataForResource = (
  resource: K8sWorkloadResource,
  resources: K8sResponseData,
): PodRCData => {
  const kind = resource.kind;
  switch (kind) {
    case 'Deployment':
      return getPodsForDeployment(resource as V1Deployment, resources);
    case 'StatefulSet':
      return getPodsForStatefulSet(resource as V1StatefulSet, resources);
    case 'DaemonSet':
      return getPodsForDaemonSet(resource as V1DaemonSet, resources);
    case 'CronJob':
      return getPodsForCronJob(resource as V1CronJob, resources);
    case 'VirtualMachine':
      return getPodsForVirtualMachine(resource as VMKind, resources);
    case 'Pod':
      return {
        obj: resource,
        isRollingOut: true,
        pods: [resource as V1Pod],
      };
    default:
      return {
        obj: resource,
        pods: getPodsForResource(resource, resources),
      };
  }
};

// This logic is replicated from k8s (at this writing, Kubernetes 1.17)
// (See https://github.com/kubernetes/kubernetes/blob/release-1.17/pkg/printers/internalversion/printers.go)
export const podPhase = (pod: V1Pod): PodPhase => {
  if (!pod) {
    return '';
  }

  if (pod?.metadata?.deletionTimestamp) {
    return 'Terminating';
  }

  if (!pod.status) {
    return '';
  }

  if (pod.status.reason === 'NodeLost') {
    return 'Unknown';
  }

  if (pod.status.reason === 'Evicted') {
    return 'Evicted';
  }

  let initializing = false;
  let phase = pod.status.phase || pod.status.reason || null;

  pod.status.initContainerStatuses?.forEach(
    (container: V1ContainerStatus, i: number) => {
      const { terminated, waiting } = container.state as V1ContainerState;
      if (terminated?.exitCode === 0) {
        return true;
      }

      initializing = true;
      if (terminated?.reason) {
        phase = `Init:${terminated.reason}`;
      } else if (terminated && !terminated.reason) {
        phase = terminated.signal
          ? `Init:Signal:${terminated.signal}`
          : `Init:ExitCode:${terminated.exitCode}`;
      } else if (waiting?.reason && waiting.reason !== 'PodInitializing') {
        phase = `Init:${waiting.reason}`;
      } else {
        phase = `Init:${i}/${pod?.status?.initContainerStatuses?.length}`;
      }
      return false;
    },
  );

  if (!initializing) {
    let hasRunning = false;
    const containerStatuses = pod.status.containerStatuses || [];
    for (let i = containerStatuses.length - 1; i >= 0; i--) {
      const { state, ready } = containerStatuses[i];
      if (state?.terminated?.reason) {
        phase = state?.terminated.reason;
      } else if (state?.waiting?.reason) {
        phase = state?.waiting.reason;
      } else if (state?.waiting && !state.waiting?.reason) {
        phase = state?.terminated?.signal
          ? `Signal:${state?.terminated.signal}`
          : `ExitCode:${state?.terminated?.exitCode}`;
      } else if (state?.running && ready) {
        hasRunning = true;
      }
    }

    // Change pod status back to "Running" if there is at least one container
    // still reporting as "Running" status.
    if (phase === 'Completed' && hasRunning) {
      phase = 'Running';
    }
  }

  return phase;
};
