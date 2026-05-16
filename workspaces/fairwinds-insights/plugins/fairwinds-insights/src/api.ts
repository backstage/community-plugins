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

import {
  createApiRef,
  DiscoveryApi,
  FetchApi,
  useApi,
} from '@backstage/core-plugin-api';
import type {
  ActionItemsListResponse,
  ActionItemsTopResponse,
  ActionItemFiltersResponse,
  CostsMtdResponse,
  ResourcesSummaryTimeseriesResponse,
  VulnerabilitiesResponse,
} from '@backstage-community/plugin-fairwinds-insights-common';
import { ResponseError } from '@backstage/errors';

/** @public */
export const fairwindsInsightsApiRef = createApiRef<FairwindsInsightsApi>({
  id: 'plugin.fairwinds-insights.service',
});

/** @public */
export interface ActionItemsListParams {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  search?: string;
  reportType?: string;
}

/**
 * API for the Fairwinds Insights frontend plugin (proxied via the backend).
 *
 * @public
 */
export interface FairwindsInsightsApi {
  getVulnerabilities(entityRef: string): Promise<VulnerabilitiesResponse>;
  getActionItemsList(
    entityRef: string,
    params?: ActionItemsListParams,
  ): Promise<ActionItemsListResponse>;
  getActionItemFilters(
    entityRef: string,
    params?: { fixed?: boolean; resolution?: string; field?: string },
  ): Promise<ActionItemFiltersResponse>;
  getActionItemsTop(entityRef: string): Promise<ActionItemsTopResponse>;
  getCosts(entityRef: string): Promise<CostsMtdResponse>;
  getResourcesSummaryTimeseries(
    entityRef: string,
    datePreset: string,
  ): Promise<ResourcesSummaryTimeseriesResponse>;
}

/**
 * Default implementation calling the fairwinds-insights backend plugin.
 *
 * @public
 */
export class FairwindsInsightsClient implements FairwindsInsightsApi {
  constructor(
    private readonly deps: { discoveryApi: DiscoveryApi; fetchApi: FetchApi },
  ) {}

  async getVulnerabilities(entityRef: string) {
    const baseUrl = await this.deps.discoveryApi.getBaseUrl(
      'fairwinds-insights',
    );
    const url = `${baseUrl}/vulnerabilities?entityRef=${encodeURIComponent(
      entityRef,
    )}`;

    const response = await this.deps.fetchApi.fetch(url);
    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    return response.json() as Promise<VulnerabilitiesResponse>;
  }

  async getActionItemsList(
    entityRef: string,
    params: ActionItemsListParams = {},
  ): Promise<ActionItemsListResponse> {
    const baseUrl = await this.deps.discoveryApi.getBaseUrl(
      'fairwinds-insights',
    );
    const searchParams = new URLSearchParams();
    searchParams.set('entityRef', entityRef);
    searchParams.set('page', String(params.page ?? 0));
    searchParams.set('pageSize', String(params.pageSize ?? 25));
    searchParams.set('orderBy', params.orderBy ?? 'Severity.desc');
    if (params.search) searchParams.set('Search', params.search);
    if (params.reportType) searchParams.set('ReportType', params.reportType);
    const url = `${baseUrl}/action-items?${searchParams.toString()}`;

    const response = await this.deps.fetchApi.fetch(url);
    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    return response.json() as Promise<ActionItemsListResponse>;
  }

  async getActionItemFilters(
    entityRef: string,
    params: { fixed?: boolean; resolution?: string; field?: string } = {},
  ): Promise<ActionItemFiltersResponse> {
    const baseUrl = await this.deps.discoveryApi.getBaseUrl(
      'fairwinds-insights',
    );
    const searchParams = new URLSearchParams();
    searchParams.set('entityRef', entityRef);
    searchParams.set('Fixed', String(params.fixed ?? false));
    searchParams.set('Resolution', params.resolution ?? 'None');
    searchParams.set('Field', params.field ?? 'ReportType');
    const url = `${baseUrl}/action-item-filters?${searchParams.toString()}`;

    const response = await this.deps.fetchApi.fetch(url);
    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    return response.json() as Promise<ActionItemFiltersResponse>;
  }

  async getActionItemsTop(entityRef: string): Promise<ActionItemsTopResponse> {
    const baseUrl = await this.deps.discoveryApi.getBaseUrl(
      'fairwinds-insights',
    );
    const url = `${baseUrl}/action-items/top?entityRef=${encodeURIComponent(
      entityRef,
    )}`;

    const response = await this.deps.fetchApi.fetch(url);

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    return response.json() as Promise<ActionItemsTopResponse>;
  }

  async getCosts(entityRef: string): Promise<CostsMtdResponse> {
    const baseUrl = await this.deps.discoveryApi.getBaseUrl(
      'fairwinds-insights',
    );
    const url = `${baseUrl}/costs-mtd-summary?entityRef=${encodeURIComponent(
      entityRef,
    )}`;

    const response = await this.deps.fetchApi.fetch(url);

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    return response.json() as Promise<CostsMtdResponse>;
  }

  async getResourcesSummaryTimeseries(
    entityRef: string,
    datePreset: string,
  ): Promise<ResourcesSummaryTimeseriesResponse> {
    const baseUrl = await this.deps.discoveryApi.getBaseUrl(
      'fairwinds-insights',
    );
    const searchParams = new URLSearchParams();
    searchParams.set('entityRef', entityRef);
    searchParams.set('datePreset', datePreset);
    const url = `${baseUrl}/resources-summary-timeseries?${searchParams.toString()}`;

    const response = await this.deps.fetchApi.fetch(url);
    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    return response.json() as Promise<ResourcesSummaryTimeseriesResponse>;
  }
}

/**
 * @public
 */
export function useFairwindsInsightsApi(): FairwindsInsightsApi {
  return useApi(fairwindsInsightsApiRef);
}
