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
import { V1Pod, V1ReplicaSet } from '@kubernetes/client-node';

import { AnalysisRun } from './analysisRuns';
import { Rollout } from './rollouts';
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';
import { argocdTranslationRef } from '../translations/ref';

export const k8sResourceTypes = ['pods', 'replicasets'];
export const customResourceTypes = ['analysisruns', 'rollouts'];
export const customResourceKinds = ['AnalysisRun', 'Rollout'];

export type ArgoCDResourcesKind =
  | 'Pod'
  | 'ReplicaSet'
  | 'AnalysisRun'
  | 'Rollout'
  | string;

export type ReplicaSet = V1ReplicaSet;
export type Pod = V1Pod;

export type ValidArgoResource = Pod | ReplicaSet | Rollout | AnalysisRun;
export type ValidArgoResources =
  | Pod[]
  | ReplicaSet[]
  | Rollout[]
  | AnalysisRun[];

export type ArgoResources = {
  pods: Pod[];
  replicasets: ReplicaSet[];
  rollouts: Rollout[];
  analysisruns: AnalysisRun[];
  [resourceType: string]: any[];
};

export const ArgoCDkindPluralMap: {
  [key in ArgoCDResourcesKind]: keyof ArgoResources;
} = {
  Pod: 'pods',
  ReplicaSet: 'replicasets',
  AnalysisRun: 'analysisruns',
  Rollout: 'rollouts',
} as const;

export enum ResourcesFilters {
  SearchByName = 'Name',
  Kind = 'Kind',
  SyncStatus = 'Sync status',
  HealthStatus = 'Health status',
}
export const getResourceFilterTranslation = (
  key: keyof typeof ResourcesFilters | undefined,
  t: TranslationFunction<typeof argocdTranslationRef.T>,
): string => {
  if (!key) {
    return t(
      'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.Unset',
    );
  }

  return t(
    `deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.${key}`,
  );
};
export interface FiltersType {
  SearchByName: string[];
  Kind: string[];
  SyncStatus: string[];
  HealthStatus: string[];
}
