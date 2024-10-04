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
export interface Metric {
  name: string;
  namespace: string;
  type: MetricType;
  totalRequests: number;
  requestRate: number;
  successRate: number;
  pods: {
    totalPods: number;
    meshedPods: number;
    meshedPodsPercentage: number;
  };
  tcpStats?: {
    openConnections: number;
    readBytes: number;
    writeBytes: number;
    readRate: number;
    writeRate: number;
  };
  latency?: {
    p50: number;
    p95: number;
    p99: number;
  };
}

export interface Edge {
  src: {
    namespace: string;
    name: string;
    type: MetricType;
  };
  dst: {
    namespace: string;
    name: string;
    type: MetricType;
  };
  clientId: string;
  serverId: string;
  noIdentityMsg: string;
}

type MetricType = Partial<'deployment' | 'service' | 'authority' | 'pod'>;

export interface DeploymentResponse {
  incoming: Metric[];
  outgoing: Metric[];
  current: Metric;
  edges: Edge[];
}

export interface L5dClient {
  getForDeployment(
    namespace: string,
    deployment: string,
  ): Promise<DeploymentResponse>;
}
