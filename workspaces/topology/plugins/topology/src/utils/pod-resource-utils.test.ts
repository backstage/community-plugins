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
  V1CronJob,
  V1DaemonSet,
  V1Deployment,
  V1Pod,
  V1StatefulSet,
} from '@kubernetes/client-node';

import { mockKubernetesResponse } from '../__fixtures__/1-deployments';
import {
  getDeploymentRevision,
  getPodsForCronJob,
  getPodsForDaemonSet,
  getPodsForDeployment,
  getPodsForStatefulSet,
  podPhase,
} from './pod-resource-utils';

describe('PodResourceUtils', () => {
  let mockResources = {};
  beforeEach(() => {
    mockResources = {
      deployments: { data: mockKubernetesResponse.deployments },
      pods: { data: mockKubernetesResponse.pods },
      jobs: { data: mockKubernetesResponse.jobs },
      cronJobs: { data: mockKubernetesResponse.cronJobs },
      daemonSets: { data: mockKubernetesResponse.daemonSets },
      statefulsets: { data: mockKubernetesResponse.statefulsets },
      replicasets: { data: mockKubernetesResponse.replicasets },
    };
  });

  it('should return deployment revision if annotations are present', () => {
    const deployment = {
      metadata: {
        annotations: {
          'deployment.kubernetes.io/revision': '1',
        },
      },
    };
    expect(getDeploymentRevision(deployment)).toBe(1);
  });

  it('should return undefined if annotations are not present', () => {
    const deployment = {
      metadata: {
        annotations: {},
      },
    };
    expect(getDeploymentRevision(deployment)).toBe(undefined);
    expect(getDeploymentRevision({})).toBe(undefined);
  });

  it('should return pods for a given Deployment', () => {
    let podRCData = getPodsForDeployment(
      mockKubernetesResponse.deployments[0] as V1Deployment,
      mockResources,
    );
    expect(podRCData.pods).toHaveLength(3);
    expect(podRCData.current).not.toBeNull();
    expect(podRCData.previous).toBeFalsy();
    expect(podRCData.isRollingOut).toBeFalsy();

    podRCData = getPodsForDeployment({}, mockResources);
    expect(podRCData.pods).toHaveLength(0);

    podRCData = getPodsForDeployment(
      mockKubernetesResponse.deployments[1] as V1Deployment,
      mockResources,
    );
    expect(podRCData.pods).toHaveLength(1);

    podRCData = getPodsForDeployment(
      mockKubernetesResponse.deployments[2] as V1Deployment,
      mockResources,
    );
    expect(podRCData.pods).toHaveLength(1);
  });

  it('should return pods when StatefulSet exists', () => {
    let podRCData = getPodsForStatefulSet(
      mockKubernetesResponse.statefulsets[0] as V1StatefulSet,
      mockResources,
    );
    expect(podRCData.pods).toHaveLength(1);
    expect(podRCData.current).not.toBeNull();
    expect(podRCData.previous).toBeFalsy();
    expect(podRCData.isRollingOut).toBeFalsy();

    podRCData = getPodsForStatefulSet({}, mockResources);
    expect(podRCData.pods).toHaveLength(0);

    mockKubernetesResponse.statefulsets = [];
    podRCData = getPodsForStatefulSet(
      mockKubernetesResponse.statefulsets[0] as V1StatefulSet,
      mockResources,
    );
    expect(podRCData.pods).toHaveLength(0);
  });

  it('should return pods when DaemonSet exists', () => {
    let podRCData = getPodsForDaemonSet(
      mockKubernetesResponse.daemonSets[0] as V1DaemonSet,
      mockResources,
    );
    expect(podRCData.pods).toHaveLength(1);
    expect(podRCData.current).not.toBeNull();
    expect(podRCData.previous).toBeFalsy();
    expect(podRCData.isRollingOut).toBeFalsy();

    podRCData = getPodsForDaemonSet({}, mockResources);
    expect(podRCData.pods).toHaveLength(0);

    podRCData = getPodsForDaemonSet(mockKubernetesResponse.daemonSets[0], {
      pods: { data: [] },
    });
    expect(podRCData.pods).toHaveLength(0);
  });

  it('should return pods when CronJob exists', () => {
    let podRCData = getPodsForCronJob(
      mockKubernetesResponse.cronJobs[0] as V1CronJob,
      mockResources,
    );
    expect(podRCData.pods).toHaveLength(1);
    expect(podRCData.current).not.toBeNull();
    expect(podRCData.previous).toBeFalsy();
    expect(podRCData.isRollingOut).toBeFalsy();

    podRCData = getPodsForCronJob({}, mockResources);
    expect(podRCData.pods).toHaveLength(0);

    mockResources = { jobs: { loaded: false, loadError: 'error', data: [] } };
    podRCData = getPodsForCronJob(
      mockKubernetesResponse.cronJobs[0] as V1CronJob,
      mockResources,
    );
    expect(podRCData.pods).toHaveLength(0);
  });
});

describe('podPhase', () => {
  let pod: V1Pod;

  beforeEach(() => {
    pod = {
      metadata: {},
      status: {},
    };
  });

  it('should return empty string for invalid pod', () => {
    const invalidPods: any[] = [null, undefined, {}];
    invalidPods.forEach(p => {
      const phase = podPhase(p);

      expect(phase).toEqual('');
    });
  });

  it('should return `Terminating` if given pod has deletion timestamp', () => {
    pod = { metadata: { deletionTimestamp: new Date('2017-08-14T03:51:45Z') } };
    const phase = podPhase(pod);

    expect(phase).toEqual('Terminating');
  });

  it('should return `Unknown` if given pod has reason `NodeLost`', () => {
    pod = { status: { reason: 'NodeLost' } };
    const phase = podPhase(pod);

    expect(phase).toEqual('Unknown');
  });

  it('should return the pod status phase', () => {
    pod = { status: { phase: 'Pending' } };
    const phase = podPhase(pod);

    expect(phase).toEqual(pod?.status?.phase);
  });

  it('should return the pod status reason if defined', () => {
    pod = { status: { reason: 'Unschedulable' } };
    const phase = podPhase(pod);

    expect(phase).toEqual(pod?.status?.reason);
  });

  it('should return the state reason of the first waiting or terminated container in the pod', () => {
    pod = {
      status: {
        containerStatuses: [
          { state: { running: {} } },
          { state: { waiting: { reason: 'Unschedulable' } } },
          { state: { terminated: { reason: 'Initialized' } } },
          { state: { waiting: { reason: 'Ready' } } },
        ],
      },
    } as V1Pod;
    const phase = podPhase(pod);
    expect(phase).toEqual('Unschedulable');
  });
});
