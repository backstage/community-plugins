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
  DiscoveryApi,
  FetchApi,
  IdentityApi,
} from '@backstage/core-plugin-api';

import {
  ServiceNowBackendClient,
  incidentsPickToIncidentsData,
} from './ServiceNowBackendClient';

describe('ServiceNowBackendClient', () => {
  const baseUrl = 'http://localhost:7007/api/servicenow';
  let discoveryApi: jest.Mocked<Pick<DiscoveryApi, 'getBaseUrl'>>;
  let fetchApi: jest.Mocked<Pick<FetchApi, 'fetch'>>;
  let identityApi: jest.Mocked<Pick<IdentityApi, 'getCredentials'>>;
  let client: ServiceNowBackendClient;

  beforeEach(() => {
    discoveryApi = {
      getBaseUrl: jest.fn().mockResolvedValue(baseUrl),
    };
    fetchApi = {
      fetch: jest.fn(),
    };
    identityApi = {
      getCredentials: jest.fn().mockResolvedValue({ token: 'test-token' }),
    };
    client = new ServiceNowBackendClient(
      discoveryApi as unknown as DiscoveryApi,
      fetchApi as unknown as FetchApi,
      identityApi as unknown as IdentityApi,
    );
  });

  it('getIncidents builds discovery URL with auth header and maps snake_case fields', async () => {
    const rawItems = [
      {
        sys_id: 'abc',
        number: 'INC001',
        short_description: 'Short',
        description: 'Long',
        sys_created_on: '2024-01-01',
        priority: 2,
        incident_state: 1,
        url: 'https://example.service-now.com/INC001',
      },
    ];
    fetchApi.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ items: rawItems, totalCount: 1 }),
    } as Response);

    const queryParams = new URLSearchParams({ limit: '10' });
    const result = await client.getIncidents(queryParams);

    expect(discoveryApi.getBaseUrl).toHaveBeenCalledWith('servicenow');
    expect(identityApi.getCredentials).toHaveBeenCalled();
    expect(fetchApi.fetch).toHaveBeenCalledWith(
      `${baseUrl}/incidents?limit=10`,
      {
        headers: { Authorization: 'Bearer test-token' },
      },
    );
    expect(result).toEqual({
      incidents: incidentsPickToIncidentsData(rawItems),
      totalCount: 1,
    });
    expect(result.incidents[0]).toEqual(
      expect.objectContaining({
        sysId: 'abc',
        shortDescription: 'Short',
        incidentState: 1,
      }),
    );
  });

  it('getIncidents throws parsed error message on non-OK response', async () => {
    fetchApi.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({
        error: { message: 'backend failed' },
      }),
    } as Response);

    await expect(client.getIncidents(new URLSearchParams())).rejects.toThrow(
      'backend failed',
    );
  });
});
