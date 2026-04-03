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

import { DevlakeClientImpl } from './DevlakeClient';
import {
  DoraMetrics,
  DoraMetricsTrend,
  DoraTeam,
} from '@backstage-community/plugin-devlake-common';

const BASE_URL = 'http://localhost:7007/api/devlake';

const mockDiscoveryApi = {
  getBaseUrl: jest.fn().mockResolvedValue(BASE_URL),
};

const mockFetchApi = {
  fetch: jest.fn(),
};

const client = new DevlakeClientImpl({
  discoveryApi: mockDiscoveryApi as any,
  fetchApi: mockFetchApi as any,
});

const mockOkResponse = (data: unknown) => ({
  ok: true,
  json: jest.fn().mockResolvedValue(data),
});

const mockErrorResponse = (statusText: string) => ({
  ok: false,
  statusText,
});

describe('DevlakeClientImpl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDiscoveryApi.getBaseUrl.mockResolvedValue(BASE_URL);
  });

  describe('getTeams', () => {
    const teams: DoraTeam[] = [
      { name: 'All', devlakeProjectName: '__all__' },
      { name: 'Team Alpha', devlakeProjectName: 'project-alpha' },
    ];

    it('fetches teams from the correct URL', async () => {
      mockFetchApi.fetch.mockResolvedValue(mockOkResponse(teams));
      const result = await client.getTeams();
      expect(mockFetchApi.fetch).toHaveBeenCalledWith(`${BASE_URL}/teams`);
      expect(result).toEqual(teams);
    });

    it('throws on a non-ok response', async () => {
      mockFetchApi.fetch.mockResolvedValue(mockErrorResponse('Not Found'));
      await expect(client.getTeams()).rejects.toThrow(
        'Failed to fetch teams: Not Found',
      );
    });
  });

  describe('getDoraMetrics', () => {
    const mockMetrics: DoraMetrics = {
      deploymentFrequency: {
        value: 2.5,
        unit: 'deploys/day',
        level: 'elite',
        trend: 0,
      },
      leadTimeForChanges: {
        value: 4.0,
        unit: 'hours',
        level: 'high',
        trend: 0,
      },
      changeFailureRate: { value: 5.0, unit: '%', level: 'medium', trend: 0 },
      meanTimeToRecovery: { value: 2.0, unit: 'hours', level: 'low', trend: 0 },
    };

    it('fetches metrics with preset param', async () => {
      mockFetchApi.fetch.mockResolvedValue(mockOkResponse(mockMetrics));
      const result = await client.getDoraMetrics({
        team: 'Team Alpha',
        preset: '30d',
      });
      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        `${BASE_URL}/dora/metrics?team=Team+Alpha&preset=30d`,
      );
      expect(result).toEqual(mockMetrics);
    });

    it('fetches metrics with custom from/to params', async () => {
      mockFetchApi.fetch.mockResolvedValue(mockOkResponse(mockMetrics));
      await client.getDoraMetrics({
        team: 'Team Alpha',
        from: '2024-01-01',
        to: '2024-01-31',
      });
      const calledUrl = mockFetchApi.fetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('from=2024-01-01');
      expect(calledUrl).toContain('to=2024-01-31');
    });

    it('throws on a non-ok response', async () => {
      mockFetchApi.fetch.mockResolvedValue(
        mockErrorResponse('Internal Server Error'),
      );
      await expect(
        client.getDoraMetrics({ team: 'Team Alpha', preset: '30d' }),
      ).rejects.toThrow('Failed to fetch DORA metrics: Internal Server Error');
    });
  });

  describe('getDoraTrend', () => {
    const mockTrend: DoraMetricsTrend = {
      deploymentFrequency: [{ date: '2024-01-01', value: 3 }],
      leadTimeForChanges: [{ date: '2024-01-01', value: 5 }],
      changeFailureRate: [{ date: '2024-01-01', value: 2 }],
      meanTimeToRecovery: [{ date: '2024-01-01', value: 1 }],
    };

    it('fetches trend data from the correct URL', async () => {
      mockFetchApi.fetch.mockResolvedValue(mockOkResponse(mockTrend));
      const result = await client.getDoraTrend({
        team: 'Team Alpha',
        preset: '7d',
      });
      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        `${BASE_URL}/dora/metrics/trend?team=Team+Alpha&preset=7d`,
      );
      expect(result).toEqual(mockTrend);
    });

    it('throws on a non-ok response', async () => {
      mockFetchApi.fetch.mockResolvedValue(
        mockErrorResponse('Service Unavailable'),
      );
      await expect(
        client.getDoraTrend({ team: 'Team Alpha', preset: '30d' }),
      ).rejects.toThrow('Failed to fetch DORA trend data: Service Unavailable');
    });
  });
});
