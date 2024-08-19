import { V1ObjectMeta } from '@kubernetes/client-node';

export interface Application {
  apiVersion?: string;
  kind?: string;
  metadata: V1ObjectMeta & { instance: Instance };
  spec: Spec;
  status: Status;
  operation?: Operation;
  isAppOfAppsPattern?: boolean;
}

export interface Instance {
  name: string;
}

export interface Spec {
  source: Source;
  destination: Destination;
  project: string;
}

export interface Destination {
  server: string;
  namespace: string;
}

export interface Source {
  chart?: string;
  repoURL: string;
  path: string;
  helm?: {
    parameters: {
      name: string;
      value: string;
    }[];
  };
  targetRevision?: string;
}

export interface Status {
  sync: StatusSync;
  health: Health;
  operationState: OperationState;
  resources?: StatusResource[];
  history?: History[];
  reconciledAt?: string;
  sourceType?: string;
  summary: Summary;
}

export interface Health {
  status: string;
}

export interface History {
  revision: string;
  deployedAt: string;
  id: number;
  source: Source;
  deployStartedAt: string;
}

export interface OperationState {
  operation: Operation;
  phase?: string;
  message?: string;
  syncResult?: SyncResult;
  startedAt?: string;
  finishedAt?: string;
}

export interface Operation {
  sync: OperationSync;
  initiatedBy?: InitiatedBy;
  retry?: {};
}

export interface InitiatedBy {
  username: string;
}

export interface OperationSync {
  prune?: boolean;
  revision: string;
  syncStrategy?: SyncStrategy;
  syncOptions?: string[];
}

export interface SyncStrategy {
  hook: {};
}

export interface SyncResult {
  resources: SyncResultResource[];
  revision: string;
  source: Source;
}

export interface SyncResultResource {
  group: string;
  version: string;
  kind: string;
  namespace: string;
  name: string;
  status: string;
  message: string;
  hookPhase: string;
  syncPhase: string;
}

export interface StatusResource {
  version: string;
  kind: string;
  namespace: string;
  name: string;
  status: string;
  health: Health;
  group?: string;
}

export interface Summary {
  images: string[];
}

export interface StatusSync {
  status: string;
  comparedTo?: {
    source: Source;
    destination: Destination;
  };
  revision?: string;
}

export interface Revision {
  author: string;
  date: Date;
  message: string;
}

export enum HealthStatus {
  Healthy = 'Healthy',
  Suspended = 'Suspended',
  Degraded = 'Degraded',
  Progressing = 'Progressing',
  Missing = 'Missing',
  Unknown = 'Unknown',
}

export type SyncStatusCode = 'Unknown' | 'Synced' | 'OutOfSync';

export const SyncStatuses: { [key: string]: SyncStatusCode } = {
  Synced: 'Synced',
  Unknown: 'Unknown',
  OutOfSync: 'OutOfSync',
};

export type OperationPhase =
  | 'Running'
  | 'Error'
  | 'Failed'
  | 'Succeeded'
  | 'Terminating';

export const OperationPhases: { [key: string]: OperationPhase } = {
  Running: 'Running',
  Failed: 'Failed',
  Error: 'Error',
  Succeeded: 'Succeeded',
  Terminating: 'Terminating',
};

export type Instances = {
  name: string;
  url: string;
}[];
