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
import { IncidentPick } from '@backstage-community/plugin-servicenow-common';
import {
  createApiRef,
  DiscoveryApi,
  FetchApi,
  IdentityApi,
} from '@backstage/core-plugin-api';
import { IncidentsData, PaginatedIncidentsData } from '../types';
import {
  ServiceNowCMDBResponse,
  ServiceNowInfraResponse,
  ServiceNowUserResponse,
} from './cmdb/types';

export interface ServiceNowBackendAPI {
  getIncidents(queryParams: URLSearchParams): Promise<PaginatedIncidentsData>;
  getBusinessApplication(appCode: string): Promise<ServiceNowCMDBResponse>;
  getUserDetails(userId: string): Promise<ServiceNowUserResponse>;
  getInfraDetails(appCode: string): Promise<ServiceNowInfraResponse>;
}

export const serviceNowApiRef = createApiRef<ServiceNowBackendAPI>({
  id: 'plugin.servicenow.service',
});

export class ServiceNowBackendClient implements ServiceNowBackendAPI {
  constructor(
    private readonly discoveryApi: DiscoveryApi,
    private readonly fetchApi: FetchApi,
    private readonly identityApi: IdentityApi,
  ) {}

  async getBaseUrl() {
    return await this.discoveryApi.getBaseUrl('servicenow');
  }

  private async fetchFromServiceNow<T>(
    path: string,
    queryParams?: URLSearchParams,
  ): Promise<{ items: T; totalCount: number }> {
    const proxyBase = await this.getBaseUrl();
    const url = `${proxyBase}${path}${queryParams ? `?${queryParams}` : ''}`;

    const { token } = await this.identityApi.getCredentials();
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await this.fetchApi.fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`ServiceNow API request failed: ${response.status}`);
    }

    return (await response.json()) as { items: T; totalCount: number };
  }

  async getIncidents(
    queryParams: URLSearchParams,
  ): Promise<PaginatedIncidentsData> {
    const { items, totalCount } = await this.fetchFromServiceNow<
      IncidentPick[]
    >('/incidents', queryParams);

    const incidents = incidentsPickToIncidentsData(items);
    return { incidents, totalCount };
  }
  async getBusinessApplication(appCode: string) {
    const apiUrl = `${await this.getBaseUrl()}/cmdb/business-application/${appCode}`;
    const response = await this.fetchApi.fetch(apiUrl);

    if (response.status >= 400 && response.status < 600) {
      throw new Error('Failed to fetch application details');
    }

    return (await response.json()) as ServiceNowCMDBResponse;
  }

  async getUserDetails(userId: string) {
    const apiUrl = `${await this.getBaseUrl()}/cmdb/user/${userId}`;
    const response = await this.fetchApi.fetch(apiUrl);
    if (response.status >= 400 && response.status < 600) {
      throw new Error('Failed to fetch user details');
    }

    return (await response.json()) as ServiceNowUserResponse;
  }

  async getInfraDetails(appCode: string) {
    const apiUrl = `${await this.getBaseUrl()}/cmdb/infra/${appCode}`;
    const response = await this.fetchApi.fetch(apiUrl);
    if (response.status >= 400 && response.status < 600) {
      throw new Error('Failed to fetch user details');
    }

    return (await response.json()) as ServiceNowInfraResponse;
  }
}

export function incidentsPickToIncidentsData(
  data: IncidentPick[],
): IncidentsData[] {
  return data.map(item => ({
    sysId: item.sys_id,
    number: item.number,
    shortDescription: item.short_description,
    description: item.description,
    sysCreatedOn: item.sys_created_on,
    priority: item.priority,
    incidentState: item.incident_state,
    url: item.url,
  }));
}
