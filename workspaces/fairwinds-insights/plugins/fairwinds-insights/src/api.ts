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

import { useApi } from '@backstage/core-plugin-api';
import { discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import type {
  ActionItemsListResponse,
  ActionItemsTopResponse,
  ActionItemFiltersResponse,
  CostsMtdResponse,
  ResourcesSummaryTimeseriesResponse,
  VulnerabilitiesResponse,
} from '@backstage-community/plugin-fairwinds-insights-common';

export interface ActionItemsListParams {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  search?: string;
  reportType?: string;
}

export function useFairwindsInsightsApi() {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);

  return {
    async getVulnerabilities(entityRef: string) {
      const baseUrl = await discoveryApi.getBaseUrl('fairwinds-insights');
      const url = `${baseUrl}/vulnerabilities?entityRef=${encodeURIComponent(
        entityRef,
      )}`;

      const response = await fetchApi.fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch vulnerabilities: ${response.statusText} - ${errorText}`,
        );
      }
      return response.json() as Promise<VulnerabilitiesResponse>;
    },

    async getActionItemsList(
      entityRef: string,
      params: ActionItemsListParams = {},
    ): Promise<ActionItemsListResponse> {
      const baseUrl = await discoveryApi.getBaseUrl('fairwinds-insights');
      const searchParams = new URLSearchParams();
      searchParams.set('entityRef', entityRef);
      searchParams.set('page', String(params.page ?? 0));
      searchParams.set('pageSize', String(params.pageSize ?? 25));
      searchParams.set('orderBy', params.orderBy ?? 'Severity.desc');
      if (params.search) searchParams.set('Search', params.search);
      if (params.reportType) searchParams.set('ReportType', params.reportType);
      const url = `${baseUrl}/action-items?${searchParams.toString()}`;

      const response = await fetchApi.fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch action items: ${response.statusText} - ${errorText}`,
        );
      }
      return response.json() as Promise<ActionItemsListResponse>;
    },

    async getActionItemFilters(
      entityRef: string,
      params: { fixed?: boolean; resolution?: string; field?: string } = {},
    ): Promise<ActionItemFiltersResponse> {
      const baseUrl = await discoveryApi.getBaseUrl('fairwinds-insights');
      const searchParams = new URLSearchParams();
      searchParams.set('entityRef', entityRef);
      searchParams.set('Fixed', String(params.fixed ?? false));
      searchParams.set('Resolution', params.resolution ?? 'None');
      searchParams.set('Field', params.field ?? 'ReportType');
      const url = `${baseUrl}/action-item-filters?${searchParams.toString()}`;

      const response = await fetchApi.fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch action item filters: ${response.statusText} - ${errorText}`,
        );
      }
      return response.json() as Promise<ActionItemFiltersResponse>;
    },

    async getActionItemsTop(
      entityRef: string,
    ): Promise<ActionItemsTopResponse> {
      const baseUrl = await discoveryApi.getBaseUrl('fairwinds-insights');
      const url = `${baseUrl}/action-items/top?entityRef=${encodeURIComponent(
        entityRef,
      )}`;

      const response = await fetchApi.fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch action items top: ${response.statusText} - ${errorText}`,
        );
      }
      return response.json() as Promise<ActionItemsTopResponse>;
    },

    async getCosts(entityRef: string): Promise<CostsMtdResponse> {
      const baseUrl = await discoveryApi.getBaseUrl('fairwinds-insights');
      const url = `${baseUrl}/costs-mtd-summary?entityRef=${encodeURIComponent(
        entityRef,
      )}`;

      const response = await fetchApi.fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch costs: ${response.statusText} - ${errorText}`,
        );
      }
      return response.json() as Promise<CostsMtdResponse>;
    },

    async getResourcesSummaryTimeseries(
      entityRef: string,
      datePreset: string,
    ): Promise<ResourcesSummaryTimeseriesResponse> {
      const baseUrl = await discoveryApi.getBaseUrl('fairwinds-insights');
      const searchParams = new URLSearchParams();
      searchParams.set('entityRef', entityRef);
      searchParams.set('datePreset', datePreset);
      const url = `${baseUrl}/resources-summary-timeseries?${searchParams.toString()}`;

      const response = await fetchApi.fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch resources summary timeseries: ${response.statusText} - ${errorText}`,
        );
      }
      return response.json() as Promise<ResourcesSummaryTimeseriesResponse>;
    },
  };
}
