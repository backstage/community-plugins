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
import { ConfigReader } from '@backstage/config';
import {
  CheckmarxConfig,
  DefaultCheckmarxInfoProvider,
  getOldestAgeLabel,
  normalizeCheckmarxSummary,
} from './checkmarxInfoProvider';

describe('CheckmarxConfig', () => {
  it('maps location to AST and IAM URLs', () => {
    const config = new ConfigReader({
      checkmarx: {
        location: 'US2',
        tenant: 'tenant-a',
        apiKey: 'refresh-token',
      },
    });

    expect(
      CheckmarxConfig.fromConfig(config).getInstanceConfig(),
    ).toMatchObject({
      location: 'US2',
      tenant: 'tenant-a',
      astBaseUrl: 'https://us.ast.checkmarx.net',
      iamBaseUrl: 'https://us.iam.checkmarx.net',
    });
  });
});

describe('normalizeCheckmarxSummary', () => {
  it('computes dashboard metrics from raw counters', () => {
    const normalized = normalizeCheckmarxSummary({
      projectId: 'project-123',
      branch: 'main',
      scanId: 'scan-1',
      scanUrl: 'https://us.ast.checkmarx.net/projects/project-123/scans',
      lastUpdated: '2026-05-20T00:00:00.000Z',
      engines: ['sast', 'sca'],
      summary: {
        sastCounters: {
          severityCounters: [
            { severity: 'LOW', counter: 3 },
            { severity: 'MEDIUM', counter: 1 },
          ],
          statusCounters: [{ status: 'RECURRENT', counter: 4 }],
          stateCounters: [{ state: 'TO_VERIFY', counter: 4 }],
          ageCounters: [{ age: '90+', counter: 4 }],
          totalCounter: 4,
          languageCounters: [{ language: 'CSharp', counter: 4 }],
          complianceCounters: [{ compliance: 'OWASP Top 10 2021', counter: 4 }],
        },
        scaPackagesCounters: {
          totalCounter: 76,
          outdatedCounter: 75,
          stateCounters: [{ state: 'TO_VERIFY', counter: 76 }],
          riskLevelCounters: [{ riskLevel: 'UNKNOWN', counter: 76 }],
          licenseCounters: [{ license: 'mit', counter: 12 }],
        },
      },
    });

    expect(normalized.metrics).toEqual({
      sastFindings: 4,
      criticalHighFindings: 0,
      scaPackages: 76,
      outdatedPackages: 75,
      recurrentFindings: 4,
      recurrentFindingsPercent: 100,
      additionalFindings: 0,
      oldestAgeLabel: '90+',
    });
  });
});

describe('DefaultCheckmarxInfoProvider', () => {
  it('uses main/master fallback when no default branch is provided', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'access-token',
          expires_in: 1800,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          scans: [
            {
              id: 'scan-1',
              projectId: 'project-123',
              projectName: 'project-a',
              branch: 'main',
              updatedAt: '2026-05-20T00:00:00.000Z',
              engines: ['sast', 'sca'],
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          scansSummaries: [
            {
              sastCounters: {
                severityCounters: [],
                statusCounters: [],
                stateCounters: [],
                ageCounters: [],
                totalCounter: 0,
              },
              scaPackagesCounters: {
                severityCounters: [],
                statusCounters: [],
                stateCounters: [],
                ageCounters: [],
                totalCounter: 0,
                outdatedCounter: 0,
                riskLevelCounters: [],
                licenseCounters: [],
              },
            },
          ],
        }),
      });

    const provider = DefaultCheckmarxInfoProvider.fromConfig(
      new ConfigReader({
        checkmarx: {
          location: 'US2',
          tenant: 'tenant-a',
          apiKey: 'refresh-token',
        },
      }),
      { fetchFn: fetchFn as any },
    );

    await provider.getSummary({ projectId: 'project-123' });

    expect(fetchFn.mock.calls[1][0]).toContain('branches=main%2Cmaster');
    expect(fetchFn.mock.calls[2][0]).toContain('scan-ids=scan-1');
  });
});

describe('getOldestAgeLabel', () => {
  it('returns the oldest non-empty age bucket', () => {
    expect(
      getOldestAgeLabel([
        { age: '0-7', counter: 10 },
        { age: '30-60', counter: 3 },
        { age: '90+', counter: 1 },
      ]),
    ).toBe('90+');
  });
});
