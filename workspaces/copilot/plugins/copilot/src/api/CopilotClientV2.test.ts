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

import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { CopilotClientV2 } from './CopilotClientV2';

describe('CopilotClientV2', () => {
  const mockFetch = jest.fn();
  const mockDiscovery = {
    getBaseUrl: jest.fn().mockResolvedValue('http://localhost/api/copilot'),
  };
  const mockFetchApi = {
    fetch: mockFetch,
  };

  const client = new CopilotClientV2({
    discoveryApi: mockDiscovery as unknown as DiscoveryApi,
    fetchApi: mockFetchApi as unknown as FetchApi,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getDailyMetrics builds URL and returns data', async () => {
    const payload = [{ day: '2026-05-21', entity_id: 'ent-1' }];
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(payload), { status: 200 }),
    );

    const result = await client.getDailyMetrics({
      type: 'enterprise',
      entityId: 'ent-1',
      from: '2026-05-01',
      to: '2026-05-21',
      team: 'platform',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost/api/copilot/v2/metrics/daily?type=enterprise&entityId=ent-1&from=2026-05-01&to=2026-05-21&team=platform',
    );
    expect(result).toEqual(payload);
  });

  it('getPrMetrics builds correct URL', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    await client.getPrMetrics({
      type: 'organization',
      entityId: 'org-1',
      from: '2026-05-01',
      to: '2026-05-21',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost/api/copilot/v2/metrics/pull-requests?type=organization&entityId=org-1&from=2026-05-01&to=2026-05-21',
    );
  });

  it('getTeams builds URL with optional params', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(['team-a']), { status: 200 }),
    );

    await client.getTeams({
      type: 'enterprise',
      entityId: 'ent-1',
      from: '2026-05-01',
      to: '2026-05-21',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost/api/copilot/v2/teams?type=enterprise&entityId=ent-1&from=2026-05-01&to=2026-05-21',
    );
  });

  it('getPeriodRange returns null on 404 and throws on other errors', async () => {
    mockFetch.mockResolvedValueOnce(new Response('not found', { status: 404 }));

    await expect(
      client.getPeriodRange({ type: 'enterprise', entityId: 'ent-1' }),
    ).resolves.toBeNull();

    mockFetch.mockResolvedValueOnce(new Response('boom', { status: 500 }));

    await expect(
      client.getPeriodRange({ type: 'enterprise', entityId: 'ent-1' }),
    ).rejects.toThrow();
  });

  it('getByLanguage includes feature param when provided', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    // eslint-disable-next-line testing-library/no-await-sync-queries
    await client.getByLanguage({
      type: 'enterprise',
      entityId: 'ent-1',
      from: '2026-05-01',
      to: '2026-05-21',
      feature: 'code_completion',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost/api/copilot/v2/metrics/by-language?type=enterprise&entityId=ent-1&from=2026-05-01&to=2026-05-21&feature=code_completion',
    );
  });
});
