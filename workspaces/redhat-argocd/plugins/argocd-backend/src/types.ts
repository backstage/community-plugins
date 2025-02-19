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

export type Instance = {
  name: string;
  password?: string;
  token?: string;
  url: string;
  username?: string;
};

export interface Application {
  metadata: V1ObjectMeta & { instance: Instance };
  spec: Spec;
  status: Status;
}

export interface Spec {
  source: Source;
  destination: Destination;
  project: string;
}

export interface Status {
  sync: StatusSync;
  health: Health;
  operationState: OperationState;
  resources?: Resource[];
  history?: History[];
  reconciledAt?: string;
  sourceType?: string;
  summary: Summary;
}

export interface Operation {
  sync: OperationSync;
  initiatedBy?: InitiatedBy;
  retry?: {};
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

export interface Destination {
  server: string;
  namespace: string;
}

export interface StatusSync {
  status: string;
  comparedTo?: {
    source: Source;
    destination: Destination;
  };
  revision?: string;
}
export interface Health {
  status: string;
}

export interface OperationState {
  operation: Operation;
  phase?: string;
  message?: string;
  syncResult?: SyncResult;
  startedAt?: string;
  finishedAt?: string;
}

export interface Resource {
  version: string;
  kind: string;
  namespace: string;
  name: string;
  status: string;
  health?: Health;
  group?: string;
  createTimestamp?: string;
}

export interface Summary {
  images: string[];
}

export interface OperationSync {
  prune?: boolean;
  revision: string;
  syncStrategy?: SyncStrategy;
  syncOptions?: string[];
}

export interface InitiatedBy {
  username: string;
}

export interface SyncResult {
  resources: SyncResultResource[];
  revision: string;
  source: Source;
}

export interface SyncStrategy {
  hook: {};
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

export interface RevisionInfo {
  author: string;
  date: Date;
  message: string;
}
