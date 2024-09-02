import { V1Pod, V1ReplicaSet } from '@kubernetes/client-node';

import { AnalysisRun } from './analysisRuns';
import { Rollout } from './rollouts';

export const k8sResourceTypes = ['pods', 'replicasets'];
export const customResourceTypes = ['analysisruns', 'rollouts'];
export const customResourceKinds = ['AnalysisRun', 'Rollout'];

export type ArgoCDResourcesKind =
  | 'Pod'
  | 'ReplicaSet'
  | 'AnalysisRun'
  | 'Rollout';

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
};

export const ArgoCDkindPluralMap: {
  [key in ArgoCDResourcesKind]: keyof ArgoResources;
} = {
  Pod: 'pods',
  ReplicaSet: 'replicasets',
  AnalysisRun: 'analysisruns',
  Rollout: 'rollouts',
} as const;
