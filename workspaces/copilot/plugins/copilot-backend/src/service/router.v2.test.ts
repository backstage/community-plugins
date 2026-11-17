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

import express from 'express';
import request from 'supertest';
import { mockCredentials, mockServices } from '@backstage/backend-test-utils';
import { DateTime } from 'luxon';
import { createRouterFromConfig, RouterOptions } from './router';

let mockDbV1: any;
let mockDbV2: any;
let mockTaskV2: any;
let mockScheduler: any;

jest.mock('../db/DatabaseHandler', () => ({
  DatabaseHandler: {
    create: jest.fn().mockImplementation(async () => mockDbV1),
  },
}));

jest.mock('../db/DatabaseHandlerV2', () => ({
  DatabaseHandlerV2: {
    create: jest.fn().mockImplementation(async () => mockDbV2),
  },
}));

jest.mock('../client/GithubClientV2', () => ({
  GithubClientV2: {
    fromConfig: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('../task/TaskManagementV2', () => ({
  TaskManagementV2: {
    create: jest.fn().mockImplementation(() => mockTaskV2),
  },
}));

describe('router v2 endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockDbV1 = {
      getMostRecentDayFromMetrics: jest.fn(),
      getMetrics: jest.fn(),
      getEarliestDayFromMetricsV2: jest.fn(),
      getMetricsV2: jest.fn(),
      getBreakdown: jest.fn(),
      getEngagementMetrics: jest.fn(),
      getSeatMetrics: jest.fn(),
      getPeriodRange: jest.fn(),
      getPeriodRangeV2: jest.fn(),
      getTeams: jest.fn(),
    };

    mockDbV2 = {
      getDailyTotals: jest.fn(),
      getPrMetrics: jest.fn(),
      getByFeature: jest.fn(),
      getByIde: jest.fn(),
      getByLanguageFeature: jest.fn(),
      getByModelFeature: jest.fn(),
      getByLanguageModel: jest.fn(),
      getCostCenters: jest.fn(),
      getTeams: jest.fn(),
      getPeriodRange: jest.fn(),
      getIngestionLog: jest.fn(),
      getBackfillStatus: jest.fn(),
      getDashboardData: jest.fn(),
      hasUsersWithoutCostCenterOnDashboard: jest.fn(),
      getUserDashboardData: jest.fn(),
      hasUserMetrics: jest.fn(),
    };

    mockTaskV2 = {
      runAsync: jest.fn(),
      runBackfill: jest.fn(),
    };

    mockScheduler = {
      scheduleTask: jest.fn().mockResolvedValue(undefined),
    };

    mockDbV2.getDailyTotals.mockResolvedValue([]);
    mockDbV2.getPrMetrics.mockResolvedValue([]);
    mockDbV2.getByFeature.mockResolvedValue([]);
    mockDbV2.getByIde.mockResolvedValue([]);
    mockDbV2.getByLanguageFeature.mockResolvedValue([]);
    mockDbV2.getByModelFeature.mockResolvedValue([]);
    mockDbV2.getByLanguageModel.mockResolvedValue([]);
    mockDbV2.getCostCenters.mockResolvedValue({
      costCenters: [],
      hasUsersWithoutCostCenter: false,
    });
    mockDbV2.getTeams.mockResolvedValue([]);
    mockDbV2.getPeriodRange.mockResolvedValue({
      minDate: '2025-10-10',
      maxDate: '2026-05-20',
    });
    mockDbV2.getIngestionLog.mockResolvedValue([]);
    mockDbV2.getBackfillStatus.mockResolvedValue([]);
    mockDbV2.getDashboardData.mockResolvedValue({
      daily: [],
      byFeature: [],
      byLanguage: [],
      byModelFeature: [],
      byLanguageModel: [],
      prMetrics: [],
      customizationMetrics: [
        {
          category: 'skill',
          item_name: 'release-checks',
          interaction_count: 7,
        },
      ],
      customizationSummaries: [{ category: 'skill', distinct_item_count: 1 }],
    });
    mockDbV2.hasUsersWithoutCostCenterOnDashboard.mockResolvedValue(false);
    mockDbV2.getUserDashboardData.mockResolvedValue({
      userLogin: 'octocat',
      daily: [],
      byFeature: [],
      byIde: [],
      byLanguage: [],
      byModelFeature: [],
      byLanguageModel: [],
    });
    mockDbV2.hasUserMetrics.mockResolvedValue(true);
    mockTaskV2.runAsync.mockResolvedValue(undefined);
    mockTaskV2.runBackfill.mockResolvedValue(undefined);
    mockScheduler.scheduleTask.mockResolvedValue(undefined);
  });

  async function createTestApp(overrides: Partial<RouterOptions> = {}) {
    const router = await createRouterFromConfig({
      logger: mockServices.logger.mock(),
      database: {} as any,
      scheduler: mockScheduler as any,
      config: mockServices.rootConfig({ data: {} }),
      ...overrides,
    });

    const app = express();
    app.use(router);
    return app;
  }

  const costCenterMetricRoutes: Array<{
    path: string;
    reader: string;
    expectedArgs: unknown[];
  }> = [
    {
      path: '/v2/metrics/daily',
      reader: 'getDailyTotals',
      expectedArgs: [
        'enterprise',
        'ent-1',
        '2026-05-01',
        '2026-05-20',
        undefined,
        'cc-1',
      ],
    },
    {
      path: '/v2/metrics/pull-requests',
      reader: 'getPrMetrics',
      expectedArgs: [
        'enterprise',
        'ent-1',
        '2026-05-01',
        '2026-05-20',
        undefined,
        'cc-1',
      ],
    },
    {
      path: '/v2/metrics/by-feature',
      reader: 'getByFeature',
      expectedArgs: [
        'enterprise',
        'ent-1',
        '2026-05-01',
        '2026-05-20',
        undefined,
        'cc-1',
      ],
    },
    {
      path: '/v2/metrics/by-ide',
      reader: 'getByIde',
      expectedArgs: [
        'enterprise',
        'ent-1',
        '2026-05-01',
        '2026-05-20',
        undefined,
        'cc-1',
      ],
    },
    {
      path: '/v2/metrics/by-language',
      reader: 'getByLanguageFeature',
      expectedArgs: [
        'enterprise',
        'ent-1',
        '2026-05-01',
        '2026-05-20',
        undefined,
        undefined,
        'cc-1',
      ],
    },
    {
      path: '/v2/metrics/by-model-feature',
      reader: 'getByModelFeature',
      expectedArgs: [
        'enterprise',
        'ent-1',
        '2026-05-01',
        '2026-05-20',
        undefined,
        'cc-1',
      ],
    },
    {
      path: '/v2/metrics/by-language-model',
      reader: 'getByLanguageModel',
      expectedArgs: [
        'enterprise',
        'ent-1',
        '2026-05-01',
        '2026-05-20',
        undefined,
        'cc-1',
      ],
    },
    {
      path: '/v2/dashboard',
      reader: 'getDashboardData',
      expectedArgs: [
        'enterprise',
        'ent-1',
        '2026-05-01',
        '2026-05-20',
        undefined,
        { kind: 'costCenter', id: 'cc-1' },
      ],
    },
  ];

  it('GET /v2/metrics/daily returns daily totals', async () => {
    mockDbV2.getDailyTotals.mockResolvedValue([
      { day: '2026-05-20', metrics_type: 'enterprise', entity_id: 'ent-1' },
    ]);

    const app = await createTestApp();
    const response = await request(app).get(
      '/v2/metrics/daily?type=enterprise&entityId=ent-1&from=2026-05-01&to=2026-05-20',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { day: '2026-05-20', metrics_type: 'enterprise', entity_id: 'ent-1' },
    ]);
    expect(mockDbV2.getDailyTotals).toHaveBeenCalledWith(
      'enterprise',
      'ent-1',
      '2026-05-01',
      '2026-05-20',
      undefined,
      undefined,
    );
    expect(mockDbV2.getCostCenters).not.toHaveBeenCalled();
  });

  it('GET /v2/metrics/pull-requests returns PR metrics', async () => {
    mockDbV2.getPrMetrics.mockResolvedValue([
      { day: '2026-05-20', total_created: 3 },
    ]);

    const app = await createTestApp();
    const response = await request(app).get(
      '/v2/metrics/pull-requests?type=organization&entityId=org-1&from=2026-05-01&to=2026-05-20',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ day: '2026-05-20', total_created: 3 }]);
  });

  it('GET /v2/metrics/by-feature returns feature breakdown', async () => {
    mockDbV2.getByFeature.mockResolvedValue([
      { day: '2026-05-20', feature: 'chat' },
    ]);

    const app = await createTestApp();
    const response = await request(app).get(
      '/v2/metrics/by-feature?type=enterprise&entityId=ent-1&from=2026-05-01&to=2026-05-20&team=platform',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ day: '2026-05-20', feature: 'chat' }]);
  });

  it('GET /v2/metrics/by-ide returns IDE breakdown', async () => {
    mockDbV2.getByIde.mockResolvedValue([{ day: '2026-05-20', ide: 'vscode' }]);

    const app = await createTestApp();
    const response = await request(app).get(
      '/v2/metrics/by-ide?type=enterprise&entityId=ent-1&from=2026-05-01&to=2026-05-20',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ day: '2026-05-20', ide: 'vscode' }]);
  });

  it('GET /v2/metrics/by-language returns language breakdown', async () => {
    mockDbV2.getByLanguageFeature.mockResolvedValue([
      { day: '2026-05-20', language: 'TypeScript', feature: 'code_completion' },
    ]);

    const app = await createTestApp();
    const response = await request(app).get(
      '/v2/metrics/by-language?type=enterprise&entityId=ent-1&from=2026-05-01&to=2026-05-20&feature=code_completion',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { day: '2026-05-20', language: 'TypeScript', feature: 'code_completion' },
    ]);
  });

  it('GET /v2/teams stays independent from cost-center filters', async () => {
    mockDbV2.getTeams.mockResolvedValue(['platform', 'core']);

    const app = await createTestApp();
    const response = await request(app).get(
      '/v2/teams?type=enterprise&entityId=ent-1&from=2026-05-01&to=2026-05-20&costCenter=cc-1',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(['platform', 'core']);
    expect(mockDbV2.getCostCenters).not.toHaveBeenCalled();
    expect(mockDbV2.getTeams).toHaveBeenCalledWith(
      'enterprise',
      'ent-1',
      '2026-05-01',
      '2026-05-20',
    );
  });

  it('GET /v2/cost-centers returns eligible enterprise cost centers', async () => {
    mockDbV2.getCostCenters.mockResolvedValue({
      costCenters: [{ id: 'cc-1', name: 'Platform' }],
      hasUsersWithoutCostCenter: true,
    });

    const app = await createTestApp();
    const response = await request(app).get(
      '/v2/cost-centers?type=enterprise&entityId=ent-1&from=2026-05-01&to=2026-05-20',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      costCenters: [{ id: 'cc-1', name: 'Platform' }],
      hasUsersWithoutCostCenter: true,
    });
    expect(mockDbV2.getCostCenters).toHaveBeenCalledWith(
      'enterprise',
      'ent-1',
      '2026-05-01',
      '2026-05-20',
    );
  });

  it('GET /v2/cost-centers returns an empty result when organization scope is not enabled', async () => {
    const app = await createTestApp();
    const response = await request(app).get(
      '/v2/cost-centers?type=organization&entityId=org-1&from=2026-05-01&to=2026-05-20',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      costCenters: [],
      hasUsersWithoutCostCenter: false,
    });
    expect(mockDbV2.getCostCenters).not.toHaveBeenCalled();
  });

  it('GET /v2/cost-centers lists eligible centers for a configured organization scope', async () => {
    mockDbV2.getCostCenters.mockResolvedValue({
      costCenters: [{ id: 'cc-1', name: 'Platform' }],
      hasUsersWithoutCostCenter: true,
    });
    const app = await createTestApp({
      config: mockServices.rootConfig({
        data: {
          copilot: {
            enterprise: 'ent-1',
            organization: 'org-1',
            ingestCostCenters: true,
          },
        },
      }),
    });
    const response = await request(app).get(
      '/v2/cost-centers?type=organization&entityId=org-1&from=2026-05-01&to=2026-05-20',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      costCenters: [{ id: 'cc-1', name: 'Platform' }],
      hasUsersWithoutCostCenter: true,
    });
    expect(mockDbV2.getCostCenters).toHaveBeenCalledWith(
      'organization',
      'org-1',
      '2026-05-01',
      '2026-05-20',
    );
  });

  it('GET /v2/cost-centers returns an empty result when no cost centers are eligible', async () => {
    const app = await createTestApp();
    const response = await request(app).get(
      '/v2/cost-centers?type=enterprise&entityId=ent-1',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      costCenters: [],
      hasUsersWithoutCostCenter: false,
    });
  });

  it('GET /v2/no-cost-center/dashboard returns the shared dashboard for eligible users', async () => {
    mockDbV2.hasUsersWithoutCostCenterOnDashboard.mockResolvedValueOnce(true);

    const app = await createTestApp();
    const response = await request(app).get(
      '/v2/no-cost-center/dashboard?type=enterprise&entityId=ent-1&from=2026-05-01&to=2026-05-20',
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('daily');
    expect(mockDbV2.getCostCenters).not.toHaveBeenCalled();
    expect(mockDbV2.getDashboardData).toHaveBeenCalledWith(
      'enterprise',
      'ent-1',
      '2026-05-01',
      '2026-05-20',
      undefined,
      { kind: 'noCostCenter' },
    );
    expect(mockDbV2.hasUsersWithoutCostCenterOnDashboard).toHaveBeenCalledWith(
      'enterprise',
      'ent-1',
      [],
    );
  });

  it('GET /v2/no-cost-center/dashboard enforces the distinct-user threshold', async () => {
    const app = await createTestApp();
    const response = await request(app).get(
      '/v2/no-cost-center/dashboard?type=enterprise&entityId=ent-1&from=2026-05-01&to=2026-05-20',
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error:
        'No-cost-center scope is not eligible for the requested date range',
    });
    expect(mockDbV2.getDashboardData).toHaveBeenCalledTimes(1);
    expect(mockDbV2.hasUsersWithoutCostCenterOnDashboard).toHaveBeenCalledTimes(
      1,
    );
  });

  it.each(['team=platform', 'costCenter=cc-1'])(
    'GET /v2/no-cost-center/dashboard rejects %s',
    async extraParam => {
      const app = await createTestApp();
      const response = await request(app).get(
        `/v2/no-cost-center/dashboard?type=enterprise&entityId=ent-1&from=2026-05-01&to=2026-05-20&${extraParam}`,
      );

      expect(response.status).toBe(400);
      expect(mockDbV2.getCostCenters).not.toHaveBeenCalled();
      expect(mockDbV2.getDashboardData).not.toHaveBeenCalled();
    },
  );

  it('GET /v2/dashboard accepts an eligible cost center for a configured organization', async () => {
    mockDbV2.getCostCenters.mockResolvedValue({
      costCenters: [{ id: 'cc-1', name: 'Platform' }],
      hasUsersWithoutCostCenter: false,
    });
    const app = await createTestApp({
      config: mockServices.rootConfig({
        data: {
          copilot: {
            enterprise: 'ent-1',
            organization: 'org-1',
            ingestCostCenters: true,
          },
        },
      }),
    });
    const response = await request(app).get(
      '/v2/dashboard?type=organization&entityId=org-1&from=2026-05-01&to=2026-05-20&costCenter=cc-1',
    );

    expect(response.status).toBe(200);
    expect(mockDbV2.getDashboardData).toHaveBeenCalledWith(
      'organization',
      'org-1',
      '2026-05-01',
      '2026-05-20',
      undefined,
      { kind: 'costCenter', id: 'cc-1' },
    );
  });

  it.each(costCenterMetricRoutes)(
    '$path rejects an ineligible cost center before reading metrics',
    async ({ path, reader }) => {
      mockDbV2.getCostCenters.mockResolvedValueOnce({
        costCenters: [],
        hasUsersWithoutCostCenter: false,
      });

      const app = await createTestApp();
      const response = await request(app).get(
        `${path}?type=enterprise&entityId=ent-1&from=2026-05-01&to=2026-05-20&costCenter=cc-hidden`,
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error:
          'Cost center is not eligible for the requested scope and date range',
      });
      expect(mockDbV2.getCostCenters).toHaveBeenCalledWith(
        'enterprise',
        'ent-1',
        '2026-05-01',
        '2026-05-20',
      );
      expect(mockDbV2[reader]).not.toHaveBeenCalled();
    },
  );

  it.each(costCenterMetricRoutes)(
    '$path rejects cost centers for organization scope',
    async ({ path, reader }) => {
      const app = await createTestApp();
      const response = await request(app).get(
        `${path}?type=organization&entityId=org-1&from=2026-05-01&to=2026-05-20&costCenter=cc-1`,
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Cost centers are only supported for enterprise scope',
      });
      expect(mockDbV2.getCostCenters).not.toHaveBeenCalled();
      expect(mockDbV2[reader]).not.toHaveBeenCalled();
    },
  );

  it.each(costCenterMetricRoutes)(
    '$path reads metrics for an eligible cost center',
    async ({ path, reader, expectedArgs }) => {
      mockDbV2.getCostCenters.mockResolvedValueOnce({
        costCenters: [{ id: 'cc-1', name: 'Platform' }],
        hasUsersWithoutCostCenter: false,
      });

      const app = await createTestApp();
      const response = await request(app).get(
        `${path}?type=enterprise&entityId=ent-1&from=2026-05-01&to=2026-05-20&costCenter=cc-1`,
      );

      expect(response.status).toBe(200);
      expect(mockDbV2[reader]).toHaveBeenCalledWith(...expectedArgs);
    },
  );

  it.each(costCenterMetricRoutes)(
    '$path rejects team and costCenter filters together',
    async ({ path, reader }) => {
      const app = await createTestApp();
      const response = await request(app).get(
        `${path}?type=enterprise&entityId=ent-1&from=2026-05-01&to=2026-05-20&team=platform&costCenter=cc-1`,
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Team and costCenter filters cannot be used together',
      });
      expect(mockDbV2.getCostCenters).not.toHaveBeenCalled();
      expect(mockDbV2.getTeams).not.toHaveBeenCalled();
      expect(mockDbV2[reader]).not.toHaveBeenCalled();
    },
  );

  it('rejects a cost-center filter even when the team value is empty', async () => {
    const app = await createTestApp();
    const response = await request(app).get(
      '/v2/metrics/daily?type=enterprise&entityId=ent-1&from=2026-05-01&to=2026-05-20&team=&costCenter=cc-1',
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Team and costCenter filters cannot be used together',
    });
    expect(mockDbV2.getDailyTotals).not.toHaveBeenCalled();
  });

  it('rejects a cost-center filter for organization scope', async () => {
    const app = await createTestApp({
      config: mockServices.rootConfig({
        data: {
          copilot: {
            organization: 'org-1',
            ingestCostCenters: true,
          },
        },
      }),
    });
    const response = await request(app).get(
      '/v2/metrics/daily?type=organization&entityId=org-1&from=2026-05-01&to=2026-05-20&costCenter=cc-1',
    );

    expect(response.status).toBe(400);
    expect(mockDbV2.getCostCenters).not.toHaveBeenCalled();
    expect(mockDbV2.getDailyTotals).not.toHaveBeenCalled();
  });

  it.each(['', 'x'.repeat(256)])(
    'rejects an invalid costCenter query value',
    async costCenter => {
      const app = await createTestApp();
      const response = await request(app).get(
        `/v2/metrics/daily?type=enterprise&entityId=ent-1&from=2026-05-01&to=2026-05-20&costCenter=${costCenter}`,
      );

      expect(response.status).toBe(400);
      expect(mockDbV2.getCostCenters).not.toHaveBeenCalled();
      expect(mockDbV2.getDailyTotals).not.toHaveBeenCalled();
    },
  );

  it('rejects repeated costCenter query parameters', async () => {
    const app = await createTestApp();
    const response = await request(app).get(
      '/v2/metrics/daily?type=enterprise&entityId=ent-1&from=2026-05-01&to=2026-05-20&costCenter=cc-a&costCenter=cc-b',
    );

    expect(response.status).toBe(400);
    expect(mockDbV2.getCostCenters).not.toHaveBeenCalled();
    expect(mockDbV2.getDailyTotals).not.toHaveBeenCalled();
  });

  it('allows an unbounded range on the unchanged teams endpoint', async () => {
    mockDbV2.getTeams.mockResolvedValue(['platform']);

    const app = await createTestApp();
    const response = await request(app).get(
      '/v2/teams?type=enterprise&entityId=ent-1',
    );

    expect(response.status).toBe(200);
    expect(mockDbV2.getTeams).toHaveBeenCalledWith(
      'enterprise',
      'ent-1',
      undefined,
      undefined,
    );
  });

  it('accepts a real cost center with the formerly reserved ID on the dashboard', async () => {
    mockDbV2.getCostCenters.mockResolvedValueOnce({
      costCenters: [{ id: '__none__', name: 'Platform' }],
      hasUsersWithoutCostCenter: false,
    });

    const app = await createTestApp();
    const response = await request(app).get(
      '/v2/dashboard?type=enterprise&entityId=ent-1&from=2026-05-01&to=2026-05-20&costCenter=__none__',
    );

    expect(response.status).toBe(200);
    expect(mockDbV2.getDashboardData).toHaveBeenCalledWith(
      'enterprise',
      'ent-1',
      '2026-05-01',
      '2026-05-20',
      undefined,
      { kind: 'costCenter', id: '__none__' },
    );
  });

  it('GET /v2/metrics/period-range returns period range', async () => {
    mockDbV2.getPeriodRange.mockResolvedValue({
      minDate: '2025-10-10',
      maxDate: '2026-05-20',
    });

    const app = await createTestApp();
    const response = await request(app).get(
      '/v2/metrics/period-range?type=organization&entityId=org-1',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      minDate: '2025-10-10',
      maxDate: '2026-05-20',
    });
  });

  it('GET /v2/metrics/period-range returns 404 when no data', async () => {
    mockDbV2.getPeriodRange.mockResolvedValue(null);

    const app = await createTestApp();
    const response = await request(app).get(
      '/v2/metrics/period-range?type=organization&entityId=org-1',
    );

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'No data found' });
  });

  it('GET /v2/backfill/status returns ingestion log with parsed components_loaded', async () => {
    mockDbV2.getBackfillStatus.mockResolvedValue([
      {
        day: '2026-05-20',
        metrics_type: 'enterprise',
        entity_id: 'ent-1',
        status: 'success',
        components_loaded: '["totals","teams"]',
        source: 'scheduled',
      },
    ]);

    const app = await createTestApp();
    const response = await request(app).get(
      '/v2/backfill/status?type=enterprise&entityId=ent-1&from=2026-05-01&to=2026-05-20',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        day: '2026-05-20',
        metrics_type: 'enterprise',
        entity_id: 'ent-1',
        status: 'success',
        components_loaded: ['totals', 'teams'],
        source: 'scheduled',
      },
    ]);
    expect(mockDbV2.getBackfillStatus).toHaveBeenCalledWith(
      'enterprise',
      'ent-1',
      '2026-05-01',
      '2026-05-20',
    );
  });

  it('POST /v2/backfill returns 202 and starts backfill', async () => {
    const expectedYesterday = DateTime.utc().minus({ days: 1 }).toISODate();

    const app = await createTestApp();
    const response = await request(app).post('/v2/backfill').send({
      type: 'enterprise',
      entityId: 'ent-1',
      fromDate: '2025-10-10',
    });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({
      message: 'Backfill started',
      from: '2025-10-10',
      to: expectedYesterday,
    });
    expect(mockTaskV2.runBackfill).toHaveBeenCalledWith(
      '2025-10-10',
      expectedYesterday,
      'enterprise',
      'ent-1',
    );
  });

  it('POST /v2/backfill returns 400 for fromDate before minimum', async () => {
    const app = await createTestApp();
    const response = await request(app).post('/v2/backfill').send({
      type: 'organization',
      entityId: 'org-1',
      fromDate: '2025-10-09',
      toDate: '2025-10-10',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'fromDate must be greater than or equal to 2025-10-10',
    });
  });

  it('POST /v2/backfill returns 400 for future toDate', async () => {
    const futureDate = DateTime.now().plus({ days: 2 }).toFormat('yyyy-MM-dd');
    const app = await createTestApp();
    const response = await request(app).post('/v2/backfill').send({
      type: 'organization',
      entityId: 'org-1',
      fromDate: '2025-10-10',
      toDate: futureDate,
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'toDate cannot be in the future' });
  });

  it('input validation returns 400 for invalid v2 query params', async () => {
    const app = await createTestApp();
    const response = await request(app).get(
      '/v2/metrics/daily?type=enterprise&entityId=&from=2026-05-01&to=2026-05-20',
    );

    expect(response.status).toBe(400);
  });

  it('GET /v2/users is no longer available', async () => {
    const app = await createTestApp();
    const response = await request(app).get(
      '/v2/users?type=organization&entityId=org-1&from=2026-05-01&to=2026-05-20',
    );

    expect(response.status).not.toBe(200);
  });

  it('GET /v2/dashboard returns aggregated dashboard data', async () => {
    mockDbV2.getDashboardData.mockResolvedValue({
      daily: [
        { day: '2026-05-20', metrics_type: 'organization', entity_id: 'org-1' },
      ],
      byFeature: [],
      byLanguage: [],
      byModelFeature: [],
      byLanguageModel: [],
      prMetrics: [],
      customizationMetrics: [
        {
          category: 'skill',
          item_name: 'release-checks',
          interaction_count: 7,
        },
      ],
      customizationSummaries: [{ category: 'skill', distinct_item_count: 1 }],
    });

    const app = await createTestApp();
    const response = await request(app).get(
      '/v2/dashboard?type=organization&entityId=org-1&from=2026-05-01&to=2026-05-20',
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('daily');
    expect(response.body.daily).toHaveLength(1);
    expect(response.body.customizationMetrics).toEqual([
      {
        category: 'skill',
        item_name: 'release-checks',
        interaction_count: 7,
      },
    ]);
    expect(response.body.customizationSummaries).toEqual([
      { category: 'skill', distinct_item_count: 1 },
    ]);
    expect(mockDbV2.getDashboardData).toHaveBeenCalledWith(
      'organization',
      'org-1',
      '2026-05-01',
      '2026-05-20',
      undefined,
      undefined,
    );
  });

  it('GET /v2/dashboard passes team when provided', async () => {
    const app = await createTestApp();
    const response = await request(app).get(
      '/v2/dashboard?type=organization&entityId=org-1&from=2026-05-01&to=2026-05-20&team=my-team',
    );

    expect(response.status).toBe(200);
    expect(mockDbV2.getDashboardData).toHaveBeenCalledWith(
      'organization',
      'org-1',
      '2026-05-01',
      '2026-05-20',
      'my-team',
      undefined,
    );
  });

  describe('GET /v2/me/dashboard', () => {
    function createMeTestApp(
      httpAuthOverrides?: Partial<Parameters<typeof mockServices.httpAuth>[0]>,
      overrides: Partial<RouterOptions> = {},
    ) {
      const catalog = {
        getEntityByRef: jest.fn().mockResolvedValue({
          metadata: {
            annotations: { 'github.com/user-login': 'mock' },
          },
        }),
      };
      return createTestApp({
        httpAuth: mockServices.httpAuth(httpAuthOverrides),
        userInfo: mockServices.userInfo(),
        catalog: catalog as any,
        ...overrides,
      });
    }

    it('returns 501 when the me routes are not configured with auth services', async () => {
      const app = await createTestApp();
      const response = await request(app).get(
        '/v2/me/dashboard?type=organization&entityId=org-1&from=2026-05-01&to=2026-05-20',
      );

      expect(response.status).toBe(501);
    });

    it('resolves the caller from their own entity ref and returns their data', async () => {
      mockDbV2.getUserDashboardData.mockResolvedValue({
        userLogin: 'mock',
        daily: [{ day: '2026-05-01' }],
        byFeature: [],
        byIde: [],
        byLanguage: [],
        byModelFeature: [],
        byLanguageModel: [],
        customizationMetrics: [],
        customizationSummaries: [],
      });

      const app = await createMeTestApp();
      const response = await request(app)
        .get(
          '/v2/me/dashboard?type=organization&entityId=org-1&from=2026-05-01&to=2026-05-20',
        )
        .set('Authorization', mockCredentials.user.header());

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        matched: true,
        userLogin: 'mock',
        daily: [{ day: '2026-05-01' }],
        byFeature: [],
        byIde: [],
        byLanguage: [],
        byModelFeature: [],
        byLanguageModel: [],
        customizationMetrics: [],
        customizationSummaries: [],
      });
      expect(mockDbV2.getUserDashboardData).toHaveBeenCalledWith(
        'organization',
        'org-1',
        'mock',
        '2026-05-01',
        '2026-05-20',
      );
    });

    it('returns matched: false when the configured user resolver finds no login', async () => {
      const app = await createMeTestApp(undefined, {
        userResolver: {
          resolveUserLogin: jest.fn().mockResolvedValue(undefined),
        },
      });
      const response = await request(app)
        .get(
          '/v2/me/dashboard?type=organization&entityId=org-1&from=2026-05-01&to=2026-05-20',
        )
        .set('Authorization', mockCredentials.user.header());

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ matched: false });
      expect(mockDbV2.getUserDashboardData).not.toHaveBeenCalled();
    });

    it('returns matched: false when the resolved login has no ingested metrics', async () => {
      mockDbV2.hasUserMetrics.mockResolvedValue(false);
      const app = await createMeTestApp();
      const response = await request(app)
        .get(
          '/v2/me/dashboard?type=organization&entityId=org-1&from=2026-05-01&to=2026-05-20',
        )
        .set('Authorization', mockCredentials.user.header());

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ matched: false });
      expect(mockDbV2.getUserDashboardData).not.toHaveBeenCalled();
    });

    it('returns matched data when historical metrics are outside the selected range', async () => {
      const app = await createMeTestApp();
      const response = await request(app)
        .get(
          '/v2/me/dashboard?type=organization&entityId=org-1&from=2026-05-01&to=2026-05-20',
        )
        .set('Authorization', mockCredentials.user.header());

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        matched: true,
        userLogin: 'octocat',
        daily: [],
        byFeature: [],
        byIde: [],
        byLanguage: [],
        byModelFeature: [],
        byLanguageModel: [],
      });
    });

    it('rejects unauthenticated callers and never reaches the database', async () => {
      const app = await createMeTestApp({
        defaultCredentials: mockCredentials.none(),
      });
      const response = await request(app).get(
        '/v2/me/dashboard?type=organization&entityId=org-1&from=2026-05-01&to=2026-05-20',
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);
      expect(mockDbV2.getUserDashboardData).not.toHaveBeenCalled();
    });

    it('rejects requests carrying a user or team query parameter', async () => {
      const app = await createMeTestApp();
      const response = await request(app)
        .get(
          '/v2/me/dashboard?type=organization&entityId=org-1&from=2026-05-01&to=2026-05-20&user=someone-else',
        )
        .set('Authorization', mockCredentials.user.header());

      expect(response.status).toBe(400);
      expect(mockDbV2.getUserDashboardData).not.toHaveBeenCalled();
    });
  });
});
