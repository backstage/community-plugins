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
import type { SchedulerServiceTaskScheduleDefinition } from '@backstage/backend-plugin-api';

import type {
  CustomObjectsApi,
  KubernetesObject,
  V1PodCondition,
} from '@kubernetes/client-node';

export type OcmConfig = {
  id: string;
  url: string;
  hubResourceName: string;
  serviceAccountToken?: string;
  skipTLSVerify?: boolean;
  caData?: string;
  owner: string;
  schedule?: SchedulerServiceTaskScheduleDefinition;
};

export interface ClusterClaim {
  name: string;
  value: string;
}

export interface ManagedCluster extends KubernetesObject {
  spec: {
    hubAcceptsClient: boolean;
    leaseDurationSeconds: number;
    managedClusterClientConfigs: {
      caBundle: string;
      url: string;
    }[];
  };
  status?: {
    allocatable: Record<string, string>;
    capacity: Record<string, string>;
    clusterClaims: ClusterClaim[];
    conditions: V1PodCondition[];
    version: {
      kubernetes: string;
    };
  };
}

interface OcpVersion {
  channels: string[];
  image: string;
  url: string;
  version: string;
}

export interface ManagedClusterInfo extends KubernetesObject {
  spec: {
    masterEndpoint: string;
  };
  status?: {
    nodeList?: {
      capacity: {
        cpu: string;
        memory: string;
        socket: string;
      };
      conditions: {
        status: string;
        type: string;
      }[];
      labels: Record<string, string>;
      name: string;
    }[];
    distributionInfo: {
      ocp: {
        availableUpdates?: string[];
        channel: string;
        desired: OcpVersion;
        desiredVersion: string;
        managedClusterConfig: {
          caBundle: string;
          url: string;
        };
        version: string;
        versionAvailableUpdates: OcpVersion[];
        versionHistory: {
          image: string;
          state: string;
          verified: boolean;
          version: string;
        }[];
      };
      type: string;
    };
    loggingEndpoint: {
      hostname: string;
      ip: string;
    };
    clusterID: string;
    kubeVendor: string;
    consoleURL: string;
    version: string;
    conditions: V1PodCondition[];
  };
}

export type ClientDetails = {
  client: CustomObjectsApi;
  hubResourceName: string;
};
