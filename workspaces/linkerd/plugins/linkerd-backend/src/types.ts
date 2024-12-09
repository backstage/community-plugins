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
export interface StatRow {
  resource: {
    type: string;
    name: string;
    namespace: string;
  };
  timeWindow: string;
  status: string;
  meshedPodCount: string;
  runningPodCount: string;
  failedPodCount: string;
  stats: {
    successCount: string;
    failureCount: string;
    latencyMsP50: string;
    latencyMsP95: string;
    latencyMsP99: string;
    actualSuccessCount: string;
    actualFailureCount: string;
  };
  tcpStats?: {
    openConnections: string;
    readBytesTotal: string;
    writeBytesTotal: string;
  };
}

export interface StatsResponse {
  ok: {
    statTables: {
      podGroup: {
        rows: StatRow[];
      };
    }[];
  };
}

export interface EdgesResponse {
  ok: {
    edges: {
      src: {
        namespace: string;
        resource: string;
        type: string;
      };
      dst: {
        namespace: string;
        resource: string;
        type: string;
      };
      clientId: string;
      serverId: string;
      noIdentityMsg: string;
    }[];
  };
}
