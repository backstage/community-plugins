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
import { TechInsightsClient } from './TechInsightsClient';
import { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';
import { CompoundEntityRef } from '@backstage/catalog-model';
import {
  BulkCheckResponse,
  Check,
} from '@backstage-community/plugin-tech-insights-common';

jest.mock('@backstage/core-plugin-api');
jest.mock('@backstage/catalog-model');

describe('TechInsightsClient', () => {
  const mockDiscoveryApi: jest.Mocked<DiscoveryApi> = {
    getBaseUrl: jest.fn(),
  } as any;

  const mockIdentityApi: jest.Mocked<IdentityApi> = {
    getCredentials: jest.fn(),
  } as any;

  const mockApi = jest.fn();
  const client = new TechInsightsClient({
    discoveryApi: mockDiscoveryApi,
    identityApi: mockIdentityApi,
  });

  // Mock the private `api` method
  (client as any).api = mockApi;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDiscoveryApi.getBaseUrl.mockResolvedValue('http://mock-api');
  });

  it('should call the API in chunks and return the aggregated response', async () => {
    const entities: CompoundEntityRef[] = Array.from(
      { length: 1000 },
      (_, i) => ({
        namespace: 'default',
        kind: 'Component',
        name: `entity-${i}`,
      }),
    );
    const checks: Check[] = [
      {
        id: 'check-1',
        type: '',
        name: '',
        description: '',
        factIds: [],
      },
      {
        id: 'check-2',
        type: '',
        name: '',
        description: '',
        factIds: [],
      },
    ];
    const mockResponses: BulkCheckResponse[] = [
      [{ entity: 'default/Component/entity-0', results: [] }],
      [{ entity: 'default/Component/entity-750', results: [] }],
    ];

    mockApi
      .mockResolvedValueOnce(mockResponses[0])
      .mockResolvedValueOnce(mockResponses[1]);

    const result = await client.runBulkChecks(entities, checks);

    expect(mockApi).toHaveBeenCalledTimes(2);
    expect(mockApi).toHaveBeenCalledWith('/checks/run', {
      method: 'POST',
      body: JSON.stringify({
        entities: entities.slice(0, 750),
        checks: ['check-1', 'check-2'],
      }),
    });
    expect(mockApi).toHaveBeenCalledWith('/checks/run', {
      method: 'POST',
      body: JSON.stringify({
        entities: entities.slice(750, 1000),
        checks: ['check-1', 'check-2'],
      }),
    });
    expect(result).toEqual([...mockResponses[0], ...mockResponses[1]]);
  });

  it('should handle cases where no checks are provided', async () => {
    const entities: CompoundEntityRef[] = [
      { namespace: 'default', kind: 'Component', name: 'entity-1' },
    ];
    const mockResponse: BulkCheckResponse = [
      { entity: 'default/Component/entity-1', results: [] },
    ];

    mockApi.mockResolvedValueOnce(mockResponse);

    const result = await client.runBulkChecks(entities);

    expect(mockApi).toHaveBeenCalledTimes(1);
    expect(mockApi).toHaveBeenCalledWith('/checks/run', {
      method: 'POST',
      body: JSON.stringify({
        entities,
        checks: undefined,
      }),
    });
    expect(result).toEqual(mockResponse);
  });

  it('should return an empty response when no entities are provided', async () => {
    const result = await client.runBulkChecks([]);

    expect(mockApi).toHaveBeenCalledTimes(1);
    expect(mockApi).toHaveBeenCalledWith('/checks/run', {
      method: 'POST',
      body: JSON.stringify({
        entities: [],
        checks: undefined,
      }),
    });
    expect(result).toEqual([]);
  });
});
