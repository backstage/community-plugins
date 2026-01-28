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

/**
 * @public
 */
export interface Application {
  apiVersion?: string;
  kind?: string;
  metadata: V1ObjectMeta & { instance: Instance };
  spec: Spec;
  status: Status;
  operation?: Operation;
  isAppOfAppsPattern?: boolean;
}

/**
 * @public
 */
export type ApplicationPayload = Omit<Application, 'status' | 'metadata'> & {
  metadata: V1ObjectMeta & Omit<Application['metadata'], 'instance'>;
};

/**
 * @public
 */
export interface Instance {
  name: string;
  url: string;
  password?: string;
  token?: string;
  username?: string;
}

/**
 * @public
 */
export interface InstanceApplications {
  name: string;
  url: string;
  appName: string[];
  applications?: Application[];
}

/**
 * @public
 */
export interface Spec {
  source: Source;
  sources?: Source[];
  destination: Destination;
  project: string;
  revisionHistoryLimit?: number;
  syncPolicy?: SyncPolicy;
}

/**
 * @public
 */
export interface Destination {
  server: string;
  namespace: string;
}

/**
 * @public
 */
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

/**
 * @public
 */
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

/**
 * @public
 */
export interface Health {
  status: string;
}

/**
 * @public
 */
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

/**
 * @public
 */
export interface OperationState {
  operation: Operation;
  phase?: string;
  message?: string;
  syncResult?: SyncResult;
  startedAt?: string;
  finishedAt?: string;
}

/**
 * @public
 */
export interface Operation {
  sync: OperationSync;
  initiatedBy?: InitiatedBy;
  retry?: {};
}

/**
 * @public
 */
export interface InitiatedBy {
  username: string;
}

/**
 * @public
 */
export interface OperationSync {
  prune?: boolean;
  revision?: string;
  sources?: Source[];
  revisions?: string[];
  syncStrategy?: SyncStrategy;
  syncOptions?: string[];
}

/**
 * @public
 */
export interface SyncStrategy {
  hook: {};
}

/**
 * @public
 */
export interface SyncResult {
  resources: SyncResultResource[];
  revision: string;
  revisions?: string[];
  source: Source;
  sources?: Source[];
}

/**
 * @public
 */
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

/**
 * @public
 */
export interface Summary {
  images: string[];
}

/**
 * @public
 */
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

/**
 * @public
 */
export interface RevisionInfo {
  author: string;
  date: Date;
  message: string;
  revisionID?: string;
}

/**
 * @public
 */
export enum HealthStatus {
  Healthy = 'Healthy',
  Suspended = 'Suspended',
  Degraded = 'Degraded',
  Progressing = 'Progressing',
  Missing = 'Missing',
  Unknown = 'Unknown',
}

/**
 * @public
 */
export type SyncStatusCode = 'Unknown' | 'Synced' | 'OutOfSync';

/**
 * @public
 */
export const SyncStatuses: { [key: string]: SyncStatusCode } = {
  Synced: 'Synced',
  Unknown: 'Unknown',
  OutOfSync: 'OutOfSync',
};

/**
 * @public
 */
export type OperationPhase =
  | 'Running'
  | 'Error'
  | 'Failed'
  | 'Succeeded'
  | 'Terminating';

/**
 * @public
 */
export const OperationPhases: { [key: string]: OperationPhase } = {
  Running: 'Running',
  Failed: 'Failed',
  Error: 'Error',
  Succeeded: 'Succeeded',
  Terminating: 'Terminating',
};

/**
 * @public
 */
export type Instances = {
  name: string;
  url: string;
}[];

/**
 * @public
 */
export type Order = 'asc' | 'desc';

/**
 * @public
 */
export type OpenRowStatus = {
  [x: string]: boolean;
};

/**
 * @public
 */
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

/**
 * @public
 */
export type HealthStatusType = keyof typeof HealthStatus;

/**
 * @public
 */
export interface SyncPolicy {
  automated?: {
    enabled?: boolean;
    allowEmpty?: boolean;
    prune?: boolean;
    selfHeal?: boolean;
  };
  retry?: {
    backoff: {
      duration: string;
      factor: number;
      maxDuration: string;
    };
    limit: number;
  };
  syncOptions?: string[];
}
