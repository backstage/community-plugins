/*
 * Copyright 2025 The Backstage Authors
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
  url: string;
  password?: string;
  token?: string;
  username?: string;
}

export interface Spec {
  source: Source;
  sources?: Source[];
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
  path?: string;
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
  resources?: Resource[];
  history?: History[];
  reconciledAt?: string;
  sourceType?: string;
  sourceTypes?: string[];
  controllerNamespace?: string;
  summary: Summary;
}

export interface Health {
  status: string;
}

export interface History {
  revision?: string;
  revisions?: string[];
  deployedAt: string;
  id: number;
  source: Source;
  sources?: Source[];
  deployStartedAt: string;
  initiatedBy?: InitiatedBy;
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
  revision?: string;
  sources?: Source[];
  revisions?: string[];
  syncStrategy?: SyncStrategy;
  syncOptions?: string[];
}

export interface SyncStrategy {
  hook: {};
}

export interface SyncResult {
  resources: SyncResultResource[];
  revision: string;
  revisions?: string[];
  source: Source;
  sources?: Source[];
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

export interface Summary {
  images: string[];
}

export interface StatusSync {
  status: string;
  comparedTo?: {
    source: Source;
    sources?: Source[];
    destination: Destination;
  };
  revision?: string;
  revisions?: string[];
}

export interface RevisionInfo {
  author: string;
  date: Date;
  message: string;
  revisionID?: string;
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

export type Order = 'asc' | 'desc';

export type OpenRowStatus = {
  [x: string]: boolean;
};

export interface Resource {
  version: string;
  kind: string;
  namespace?: string;
  name: string;
  status: string;
  health?: Health;
  group?: string;
  createTimestamp?: string;
}

export type HealthStatusType = keyof typeof HealthStatus;
