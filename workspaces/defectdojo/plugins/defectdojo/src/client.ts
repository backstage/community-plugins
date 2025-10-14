/*
 * Copyright 2025 The Backstage Authors
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
} from '@backstage/core-plugin-api';

/**
 * DefectDojo vulnerability interface
 * @public
 */
export interface DefectDojoVulnerability {
  id: number;
  title: string;
  severity: string;
  description: string;
  cwe: number;
  product: string;
  engagement: string;
  url: string;
  created: string;
  test?: {
    id: number;
    engagement: number;
    title?: string;
  };
}

/**
 * DefectDojo product interface
 * @public
 */
export interface DefectDojoProduct {
  id: number;
  name: string;
}

/**
 * DefectDojo engagement interface
 * @public
 */
export interface DefectDojoEngagement {
  id: number;
  name: string;
  product: number;
}

/**
 * Paginated findings response
 * @public
 */
export interface PaginatedFindingsResponse {
  total: number;
  findings: DefectDojoVulnerability[];
  next: string | null;
  previous: string | null;
}

/**
 * DefectDojo API interface
 * @public
 */
export interface DefectDojoApi {
  getFindings(
    productId: number,
    engagementId?: number,
    options?: { limit?: number; offset?: number },
  ): Promise<PaginatedFindingsResponse>;
  getProduct(identifier: string | number): Promise<DefectDojoProduct>;
  getEngagements(productId: number): Promise<DefectDojoEngagement[]>;
}

/**
 * DefectDojo API reference
 * @public
 */
export const defectdojoApiRef = createApiRef<DefectDojoApi>({
  id: 'plugin.defectdojo.service',
});

/**
 * DefectDojo API client implementation
 * @public
 */
export class DefectDojoClient implements DefectDojoApi {
  constructor(
    private readonly discoveryApi: DiscoveryApi,
    private readonly fetchApi: FetchApi,
  ) {}

  private async makeRequest<T>(path: string): Promise<T> {
    const baseUrl = await this.discoveryApi.getBaseUrl('defectdojo');

    const response = await this.fetchApi.fetch(`${baseUrl}${path}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DefectDojo API error ${response.status}: ${errorText}`);
    }

    return response.json() as T;
  }

  async getProduct(identifier: string | number): Promise<DefectDojoProduct> {
    return this.makeRequest<DefectDojoProduct>(
      `/v1/products/${encodeURIComponent(String(identifier))}`,
    );
  }

  async getEngagements(productId: number): Promise<DefectDojoEngagement[]> {
    const response = await this.makeRequest<{
      engagements: DefectDojoEngagement[];
    }>(`/v1/engagements?productId=${productId}`);
    return response.engagements;
  }

  async getFindings(
    productId: number,
    engagementId?: number,
    options?: { limit?: number; offset?: number },
  ): Promise<PaginatedFindingsResponse> {
    const params = new URLSearchParams({ productId: String(productId) });
    if (engagementId) {
      params.set('engagementId', String(engagementId));
    }
    if (options?.limit !== undefined) {
      params.set('limit', String(options.limit));
    }
    if (options?.offset !== undefined) {
      params.set('offset', String(options.offset));
    }
    return this.makeRequest<PaginatedFindingsResponse>(
      `/v1/findings?${params.toString()}`,
    );
  }
}
