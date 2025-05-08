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
import type { LabelDisplayName, Metric, PromLabel } from './Metrics';

export interface DashboardModel {
  title: string;
  charts: ChartModel[];
  aggregations: AggregationModel[];
  externalLinks: ExternalLink[];
  rows: number;
}

export type SpanValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type ChartType = 'area' | 'line' | 'bar' | 'scatter';
export type XAxisType = 'time' | 'series';

export interface ChartModel {
  name: string;
  unit: string;
  spans: SpanValue;
  rowSpans?: SpanValue;
  chartType?: ChartType;
  min?: number;
  max?: number;
  metrics: Metric[];
  error?: string;
  startCollapsed: boolean;
  xAxis?: XAxisType;
}

export interface AggregationModel {
  label: PromLabel;
  displayName: LabelDisplayName;
  singleSelection: boolean;
}

export interface ExternalLink {
  url: string;
  name: string;
  variables: ExternalLinkVariables;
}

export interface ExternalLinkVariables {
  app?: string;
  namespace?: string;
  service?: string;
  version?: string;
  workload?: string;
}
