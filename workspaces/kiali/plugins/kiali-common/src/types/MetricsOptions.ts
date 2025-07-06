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
import { TargetKind } from './Common';

export interface MetricsQuery {
  rateInterval?: string;
  rateFunc?: string;
  queryTime?: number;
  duration?: number;
  step?: number;
  quantiles?: string[];
  avg?: boolean;
  byLabels?: string[];
}

export interface DashboardQuery extends MetricsQuery {
  rawDataAggregator?: Aggregator;
  labelsFilters?: string;
  additionalLabels?: string;
  workload?: string;
  workloadType?: string;
  cluster?: string;
}

export type Aggregator = 'sum' | 'avg' | 'min' | 'max' | 'stddev' | 'stdvar';

export interface IstioMetricsOptions extends MetricsQuery {
  direction: Direction;
  filters?: string[];
  requestProtocol?: string;
  reporter: Reporter;
  clusterName?: string;
}

export type Reporter = 'source' | 'destination' | 'both';
export type Direction = 'inbound' | 'outbound';

export interface Target {
  namespace: string;
  name: string;
  kind: TargetKind;
  cluster?: string;
}

export interface MetricsStatsQuery {
  avg: boolean;
  direction: Direction;
  interval: string;
  peerTarget?: Target;
  quantiles: string[];
  queryTime: number;
  target: Target;
}
