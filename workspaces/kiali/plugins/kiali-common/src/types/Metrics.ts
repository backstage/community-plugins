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

export type Datapoint = [number, number, number?];

export interface Metric {
  labels: Labels;
  datapoints: Datapoint[];
  name: string;
  stat?: string;
}

export type ControlPlaneMetricsMap = {
  istiod_proxy_time?: Metric[];
  istiod_container_cpu?: Metric[];
  istiod_container_mem?: Metric[];
  istiod_process_cpu?: Metric[];
  istiod_process_mem?: Metric[];
};

export type IstioMetricsMap = {
  grpc_received?: Metric[];
  grpc_sent?: Metric[];
  request_count?: Metric[];
  request_error_count?: Metric[];
  request_duration_millis?: Metric[];
  request_throughput?: Metric[];
  response_throughput?: Metric[];
  request_size?: Metric[];
  response_size?: Metric[];
  tcp_received?: Metric[];
  tcp_sent?: Metric[];
  pilot_proxy_convergence_time?: Metric[];
  container_cpu_usage_seconds_total?: Metric[];
  container_memory_working_set_bytes?: Metric[];
  process_cpu_seconds_total?: Metric[];
  process_resident_memory_bytes?: Metric[];
};

export enum MetricsObjectTypes {
  SERVICE,
  WORKLOAD,
  APP,
}

export interface MetricsStatsResult {
  stats: MetricsStatsMap;
  // Note: warnings here is for non-blocking errors, it's set when some stats are available, but not all, for instance due to inaccessible namespaces
  // For more serious errors (e.g. prometheus inaccessible) the query would return an HTTP error
  warnings?: string[];
}

// Key is built from query params, see StatsComparison.genKey. The same key needs to be generated server-side for matching.
export type MetricsStatsMap = { [key: string]: MetricsStats };

export interface MetricsStats {
  isCompact: boolean;
  responseTimes: Stat[];
}

export interface Stat {
  name: string;
  value: number;
}

export type LabelDisplayName = string;
export type PromLabel = string;

// Collection of values for a single label, associated to a show/hide flag
export type SingleLabelValues = { [key: string]: boolean };

// Map of all labels (using prometheus name), each with its set of values
export type AllPromLabelsValues = Map<PromLabel, SingleLabelValues>;

export type Labels = {
  [key: string]: string;
};
