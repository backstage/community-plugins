/*
 * Copyright 2026 The Backstage Authors
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

export const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#B65050',
  HIGH: '#D7743F',
  MEDIUM: '#BD8C00',
  LOW: '#654D96',
};

export function severityNumericToLabel(value: number): string {
  if (Number.isNaN(value)) return 'LOW';
  if (value >= 0.9) return 'CRITICAL';
  if (value >= 0.7) return 'HIGH';
  if (value >= 0.4) return 'MEDIUM';
  return 'LOW';
}

export interface ActionItemRow {
  id: string;
  title: string;
  severity: string;
  category: string;
  report: string;
  cluster: string;
  name: string;
  namespace: string;
  container: string;
  labels: string;
  annotations: string;
}

export interface ActionItemsListResponse {
  data: ActionItemRow[];
  total: number;
  insightsUrl?: string;
}

export interface ActionItemFiltersResponse {
  ReportType: string[];
}

export type VulnerabilitySeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Vulnerability {
  id: string;
  severity: VulnerabilitySeverity;
  cve: string;
  title: string;
  description: string;
  affectedResources: number;
  packageName?: string;
  packageVersion?: string;
  fixedIn?: string;
  publishedDate?: string;
  link?: string;
}

export interface VulnerabilitySummary {
  severity: VulnerabilitySeverity;
  count: number;
}

export interface VulnerabilityTopItem {
  title: string;
  severity: VulnerabilitySeverity;
  count: number;
  affectedResources: number;
}

export interface ActionItem {
  id: string;
  type: string;
  severity: VulnerabilitySeverity;
  priority: number;
  title: string;
  description: string;
  resourceRef?: string;
  resourceName?: string;
  namespace?: string;
  cluster?: string;
  fixed: boolean;
  resolution?: string;
  createdAt?: string;
  updatedAt?: string;
  link?: string;
}

export interface ActionItemSummary {
  severity: VulnerabilitySeverity;
  count: number;
}

export interface ActionItemTopItem {
  severity: VulnerabilitySeverity;
  count: number;
}

export interface FairwindsInsightsApiConfig {
  apiUrl: string;
  apiKey: string;
  organization: string;
  cacheTTL: number;
}

export interface VulnerabilitiesTopItem {
  count: number;
  title: string;
}

export interface VulnerabilitiesResponse {
  topByTitle: VulnerabilitiesTopItem[];
  topBySeverity: VulnerabilitiesTopItem[];
  topByPackage: VulnerabilitiesTopItem[];
  items: Vulnerability[];
  total: number;
  insightsUrl?: string;
}

export interface ActionItemsResponse {
  summaries: ActionItemSummary[];
  top: ActionItemTopItem[];
  items: ActionItem[];
  total: number;
  insightsUrl?: string;
}

export interface ActionItemsTopItem {
  count: number;
  title: string;
}

export interface ActionItemsTopResponse {
  topBySeverity: ActionItemsTopItem[];
  topByTitle: ActionItemsTopItem[];
  topByNamespace: ActionItemsTopItem[];
  topByResource: ActionItemsTopItem[];
  insightsUrl?: string;
}

export interface ResourcesTotalCostsResponse {
  costRecommendationCPU: number;
  costRecommendationMemory: number;
  costRecommendationTotal: number;
  filteredCPUCost: number;
  filteredMemoryCost: number;
  filteredNetworkReceiveCost: number;
  filteredNetworkTransmitCost: number;
  filteredResourcesCost: number;
  filteredStorageCapacityCost: number;
  idleNodesCost: number;
  otherResourcesCost: number;
  overheadCost: number;
  realIdleNodesCost: number;
  totalNodesCost: number;
  totalResourcesCost: number;
  totalUsageCost: number;
}

export interface CostsMtdResponse {
  currentMtd: ResourcesTotalCostsResponse;
  previousMtd: ResourcesTotalCostsResponse;
  insightsUrl?: string;
}

export type ResourcesSummaryTimeseriesDatePreset =
  | '7d'
  | '30d'
  | '365d'
  | 'last_month'
  | 'mtd'
  | 'last_quarter'
  | 'qtd'
  | 'last_year'
  | 'ytd';

export interface ResourcesSummaryTimeseriesMetricSeries {
  minUsage: (number | null)[];
  avgUsage: (number | null)[];
  maxUsage: (number | null)[];
  recommendedLimits: (number | null)[];
  recommendedRequests: (number | null)[];
  actualLimits: (number | null)[];
  actualRequests: (number | null)[];
}

export interface ResourcesSummaryTimeseriesResponse {
  dates: string[];
  podCount: { avg: (number | null)[] };
  cpu: ResourcesSummaryTimeseriesMetricSeries;
  memory: ResourcesSummaryTimeseriesMetricSeries;
  insightsUrl?: string;
}

export const RESOURCES_SUMMARY_TIMESERIES_DATE_PRESETS: ReadonlyArray<{
  value: ResourcesSummaryTimeseriesDatePreset;
  label: string;
}> = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '365d', label: '365 days' },
  { value: 'last_month', label: 'Last month' },
  { value: 'mtd', label: 'Month to date' },
  { value: 'last_quarter', label: 'Last quarter' },
  { value: 'qtd', label: 'Quarter to date' },
  { value: 'last_year', label: 'Last year' },
  { value: 'ytd', label: 'Year to date' },
];
