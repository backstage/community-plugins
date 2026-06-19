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
import { Entity } from '@backstage/catalog-model';
import { CheckmarxClient } from './CheckmarxClient';

describe('CheckmarxClient', () => {
  const entity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'service-a',
      namespace: 'default',
    },
    spec: {
      type: 'service',
      lifecycle: 'production',
      owner: 'guests',
    },
  } as Entity;

  it('fetches the entity summary from the backend plugin', async () => {
    const discoveryApi = {
      getBaseUrl: jest
        .fn()
        .mockResolvedValue('http://localhost:7007/api/checkmarx'),
    };
    const fetchApi = {
      fetch: jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          projectId: 'project-123',
          branch: 'main',
          scanId: 'scan-1',
          scanUrl: 'https://us.ast.checkmarx.net/projects/project-123/scans',
          lastUpdated: '2026-05-20T00:00:00.000Z',
          engines: ['sast'],
          metrics: {
            sastFindings: 4,
            criticalHighFindings: 0,
            scaPackages: 76,
            outdatedPackages: 75,
            recurrentFindings: 4,
            recurrentFindingsPercent: 100,
            additionalFindings: 0,
            oldestAgeLabel: '90+',
          },
          counters: {
            sast: {
              severityCounters: [],
              statusCounters: [],
              stateCounters: [],
              ageCounters: [],
              totalCounter: 4,
            },
            kics: {
              severityCounters: [],
              statusCounters: [],
              stateCounters: [],
              ageCounters: [],
              totalCounter: 0,
            },
            sca: {
              severityCounters: [],
              statusCounters: [],
              stateCounters: [],
              ageCounters: [],
              totalCounter: 0,
            },
            scaPackages: {
              severityCounters: [],
              statusCounters: [],
              stateCounters: [],
              ageCounters: [],
              totalCounter: 76,
              outdatedCounter: 75,
              riskLevelCounters: [],
              licenseCounters: [],
            },
            apiSec: {
              severityCounters: [],
              statusCounters: [],
              stateCounters: [],
              ageCounters: [],
              totalCounter: 0,
            },
            containers: {
              severityCounters: [],
              statusCounters: [],
              stateCounters: [],
              ageCounters: [],
              totalCounter: 0,
            },
          },
        }),
      }),
    };

    const client = new CheckmarxClient({
      discoveryApi: discoveryApi as any,
      fetchApi: fetchApi as any,
    });

    const summary = await client.getEntitySummary(entity);

    expect(summary?.projectId).toBe('project-123');
    expect(fetchApi.fetch).toHaveBeenCalledWith(
      'http://localhost:7007/api/checkmarx/entities/Component/default/service-a/summary',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );
  });
});
