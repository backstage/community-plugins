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
export type ClusterStatus = {
  available: boolean;
  reason?: string;
};

export type ClusterBase = {
  name: string;
};

export type ClusterUpdate = {
  available?: boolean;
  version?: string;
  url?: string;
};

export type ClusterNodesStatus = {
  status: string;
  type: string;
};

export type ClusterDetails = {
  consoleUrl?: string;
  kubernetesVersion?: string;
  oauthUrl?: string;
  openshiftId?: string;
  openshiftVersion?: string;
  platform?: string;
  region?: string;
  allocatableResources?: {
    cpuCores?: number;
    memorySize?: string;
    numberOfPods?: number;
  };
  availableResources?: {
    cpuCores?: number;
    memorySize?: string;
    numberOfPods?: number;
  };
  update?: ClusterUpdate;
  status: ClusterStatus;
};

export type Cluster = ClusterBase & ClusterDetails;
export type ClusterOverview = ClusterBase & {
  status: ClusterStatus;
  update: ClusterUpdate;
  platform: string;
  openshiftVersion: string;
  nodes: Array<ClusterNodesStatus>;
};
