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
  V1ContainerStatus,
  V1Deployment,
  V1Pod,
} from '@kubernetes/client-node';

import {
  AllPodStatus,
  DeploymentPhase,
  DeploymentStrategy,
  podColor,
} from '../components/Pods/pod';
import { resourceModels } from '../models';
import { PodControllerOverviewItem, PodRCData } from '../types/pods';
import { ResKindAbbrColor } from '../types/topology-types';
import { K8sWorkloadResource, Model } from '../types/types';

export const podStatus = Object.keys(podColor);

const isContainerFailedFilter = (containerStatus: V1ContainerStatus) => {
  return (
    containerStatus.state?.terminated &&
    containerStatus.state.terminated.exitCode !== 0
  );
};

const isContainerLoopingFilter = (containerStatus: V1ContainerStatus) => {
  return (
    containerStatus.state?.waiting &&
    containerStatus.state.waiting.reason === 'CrashLoopBackOff'
  );
};

const isContainerImagePullBackOffFilter = (
  containerStatus: V1ContainerStatus,
) =>
  containerStatus.state?.waiting &&
  containerStatus.state.waiting.reason === 'ImagePullBackOff';

const numContainersReadyFilter = (pod: V1Pod) => {
  const containerStatuses = pod.status?.containerStatuses;
  let numReady = 0;
  containerStatuses?.forEach(status => {
    if (status.ready) {
      numReady++;
    }
  });
  return numReady;
};

const isReady = (pod: V1Pod) => {
  const containers = pod.spec?.containers;
  const numReady = numContainersReadyFilter(pod);
  const total = containers ? Object.keys(containers).length : 0;

  return numReady === total;
};

const podWarnings = (pod: V1Pod) => {
  const phase = pod.status?.phase;
  const containerStatuses = pod.status?.containerStatuses;
  if (
    (phase === AllPodStatus.Running || phase === AllPodStatus.Pending) &&
    containerStatuses
  ) {
    return containerStatuses
      .map(containerStatus => {
        if (!containerStatus.state) {
          return null;
        }

        if (isContainerFailedFilter(containerStatus)) {
          if (pod.metadata?.deletionTimestamp) {
            return AllPodStatus.Failed;
          }
          return AllPodStatus.Warning;
        }
        if (isContainerLoopingFilter(containerStatus)) {
          return AllPodStatus.CrashLoopBackOff;
        }
        if (isContainerImagePullBackOffFilter(containerStatus)) {
          return AllPodStatus.ErrImagePull;
        }
        return null;
      })
      .filter(x => x);
  }
  return null;
};

export const getPodStatus = (pod: V1Pod): AllPodStatus => {
  if (pod.metadata?.deletionTimestamp) {
    return AllPodStatus.Terminating;
  }
  const warnings = podWarnings(pod);
  if (warnings?.length) {
    if (warnings.includes(AllPodStatus.CrashLoopBackOff)) {
      return AllPodStatus.CrashLoopBackOff;
    }
    if (warnings.includes(AllPodStatus.Failed)) {
      return AllPodStatus.Failed;
    }
    if (warnings.includes(AllPodStatus.ErrImagePull)) {
      return AllPodStatus.ErrImagePull;
    }
    return AllPodStatus.Warning;
  }
  const phase = pod.status?.phase ?? AllPodStatus.Unknown;
  if (phase === AllPodStatus.Running && !isReady(pod)) {
    return AllPodStatus.NotReady;
  }
  return phase as AllPodStatus;
};

export const calculateRadius = (size: number) => {
  const radius = size / 2;
  const podStatusStrokeWidth = (8 / 104) * size;
  const podStatusInset = (5 / 104) * size;
  const podStatusOuterRadius = radius - podStatusInset;
  const podStatusInnerRadius = podStatusOuterRadius - podStatusStrokeWidth;
  const decoratorRadius = radius * 0.25;

  return {
    radius,
    podStatusInnerRadius,
    podStatusOuterRadius,
    decoratorRadius,
    podStatusStrokeWidth,
    podStatusInset,
  };
};

const getScalingUp = (dc: K8sWorkloadResource) => {
  return {
    ...(dc.metadata || {}),
    status: {
      phase: AllPodStatus.ScalingUp,
    },
  };
};

export const podDataInProgress = (
  dc: K8sWorkloadResource,
  current: PodControllerOverviewItem,
  isRollingOut: boolean,
): boolean => {
  const strategy = (dc as V1Deployment)?.spec?.strategy?.type;
  return (
    current?.phase !== DeploymentPhase.complete &&
    (strategy === DeploymentStrategy.recreate ||
      strategy === DeploymentStrategy.rolling) &&
    isRollingOut
  );
};

export const getPodData = (
  podRCData: PodRCData,
): {
  inProgressDeploymentData: V1Pod[] | null;
  completedDeploymentData: V1Pod[];
} => {
  const strategy =
    (podRCData.obj as V1Deployment)?.spec?.strategy?.type || null;
  const currentDeploymentphase = podRCData.current?.phase;
  const currentPods = podRCData.current?.pods || [];
  const previousPods = podRCData.previous?.pods || [];
  // DaemonSets and StatefulSets
  if (!strategy)
    return {
      inProgressDeploymentData: null,
      completedDeploymentData: podRCData.pods,
    };

  // Scaling no. of pods
  if (currentDeploymentphase === DeploymentPhase.complete) {
    return {
      inProgressDeploymentData: null,
      completedDeploymentData: currentPods as V1Pod[],
    };
  }

  // Deploy - Rolling - Recreate
  if (
    (strategy === DeploymentStrategy.recreate ||
      strategy === DeploymentStrategy.rolling ||
      strategy === DeploymentStrategy.rollingUpdate) &&
    podRCData.isRollingOut
  ) {
    return {
      inProgressDeploymentData: currentPods,
      completedDeploymentData: previousPods,
    };
  }
  // if build is not finished show `Scaling Up` on pod phase
  if (!podRCData.current && podRCData.obj && !podRCData.previous) {
    return {
      inProgressDeploymentData: null,
      completedDeploymentData: [getScalingUp(podRCData.obj)],
    };
  }
  return {
    inProgressDeploymentData: null,
    completedDeploymentData: podRCData.pods,
  };
};

const kindToAbbr = (kind: string): string =>
  (kind.replace(/[^A-Z]/g, '') || kind.toLocaleUpperCase('en-US')).slice(0, 4);

const getAssociatedModel = (kind: string): Model | undefined => {
  const resourcesModelsList = Object.values(resourceModels);
  return resourcesModelsList.find(resModel => resModel.kind === kind);
};

export const getKindAbbrColor = (kind: string): ResKindAbbrColor => {
  const kindObj = getAssociatedModel(kind);
  const kindStr = kindObj?.kind ?? kind;
  const kindAbbr = kindObj?.abbr ?? kindToAbbr(kindStr);
  const kindColor = kindObj?.color;
  return { kindStr, kindAbbr, kindColor };
};
