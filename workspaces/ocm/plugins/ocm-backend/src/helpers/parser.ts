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
import { maxSatisfying } from 'semver';

import type {
  ClusterDetails,
  ClusterNodesStatus,
  ClusterStatus,
} from '@backstage-community/plugin-ocm-common';

import { CONSOLE_CLAIM, HUB_CLUSTER_NAME_IN_OCM } from '../constants';
import { ClusterClaim, ManagedCluster, ManagedClusterInfo } from '../types';

const convertCpus = (cpus: string | undefined): number | undefined => {
  if (!cpus) {
    return undefined;
  }
  if (cpus.endsWith('m')) {
    return parseInt(cpus.slice(0, cpus.length - 1), 10) / 1000;
  }
  return parseInt(cpus, 10);
};

export const parseResources = (
  resources: Record<string, string>,
): Record<string, string | number | undefined> => ({
  cpuCores: convertCpus(resources?.cpu),
  memorySize: resources?.memory,
  numberOfPods: parseInt(resources?.pods, 10) || undefined,
});

export const getClaim = (
  cluster: { status?: { clusterClaims: ClusterClaim[] } },
  claimName: string,
): string =>
  cluster.status?.clusterClaims?.find(value => value.name === claimName)
    ?.value ?? '';

export const parseClusterStatus = (mc: ManagedCluster): ClusterStatus => {
  const available = mc.status?.conditions.find(
    (value: any) => value.type === 'ManagedClusterConditionAvailable',
  );

  return {
    available: available?.status.toLowerCase() === 'true',
    reason: available?.message,
  };
};

export const parseManagedCluster = (mc: ManagedCluster): ClusterDetails => ({
  status: parseClusterStatus(mc),
  consoleUrl: getClaim(mc, CONSOLE_CLAIM),
  kubernetesVersion: getClaim(mc, 'kubeversion.open-cluster-management.io'),
  oauthUrl: getClaim(mc, 'oauthredirecturis.openshift.io'),
  openshiftId:
    mc.metadata!.labels?.clusterID ?? getClaim(mc, 'id.openshift.io'),
  openshiftVersion:
    mc.metadata!.labels?.openshiftVersion ??
    getClaim(mc, 'version.openshift.io'),
  platform: getClaim(mc, 'platform.open-cluster-management.io'),
  region: getClaim(mc, 'region.open-cluster-management.io'),
  allocatableResources: parseResources(mc.status?.allocatable || {}),
  availableResources: parseResources(mc.status?.capacity || {}),
});

export const parseUpdateInfo = (clusterInfo: ManagedClusterInfo) => {
  const { availableUpdates, versionAvailableUpdates } =
    clusterInfo.status?.distributionInfo.ocp || {};

  if (
    !availableUpdates ||
    availableUpdates?.length === 0 ||
    !versionAvailableUpdates ||
    versionAvailableUpdates?.length === 0
  ) {
    return {
      update: {
        available: false,
      },
    };
  }

  const version = maxSatisfying(availableUpdates, '*');

  return {
    update: {
      available: true,
      version,
      url: versionAvailableUpdates[availableUpdates.indexOf(version as string)]
        ?.url,
    },
  };
};

export const parseNodeStatus = (clusterInfo: ManagedClusterInfo) =>
  clusterInfo.status?.nodeList?.map(node => {
    if (node.conditions.length !== 1) {
      throw new Error('Found more node conditions then one');
    }
    const condition = node.conditions[0];
    return {
      status: condition.status,
      type: condition.type,
    } as ClusterNodesStatus;
  }) || [];

export const translateResourceToOCM = (
  clusterName: string,
  hubResourceName: string,
) => (clusterName === hubResourceName ? HUB_CLUSTER_NAME_IN_OCM : clusterName);

export const translateOCMToResource = (
  clusterName: string,
  hubResourceName: string,
) => (clusterName === HUB_CLUSTER_NAME_IN_OCM ? hubResourceName : clusterName);
