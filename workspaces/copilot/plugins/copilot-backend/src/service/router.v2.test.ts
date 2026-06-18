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
import { mockServices } from '@backstage/backend-test-utils';
import { DateTime } from 'luxon';
import { createRouterFromConfig } from './router';

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
      getTeams: jest.fn(),
      getPeriodRange: jest.fn(),
      getIngestionLog: jest.fn(),
      getDashboardData: jest.fn(),
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
    mockDbV2.getTeams.mockResolvedValue([]);
    mockDbV2.getPeriodRange.mockResolvedValue({
      minDate: '2025-10-10',
      maxDate: '2026-05-20',
    });
    mockDbV2.getIngestionLog.mockResolvedValue([]);
    mockDbV2.getDashboardData.mockResolvedValue({
      daily: [],
      byFeature: [],
      byLanguage: [],
      byModelFeature: [],
      byLanguageModel: [],
      prMetrics: [],
    });
    mockTaskV2.runAsync.mockResolvedValue(undefined);
    mockTaskV2.runBackfill.mockResolvedValue(undefined);
    mockScheduler.scheduleTask.mockResolvedValue(undefined);
  });

  async function createTestApp() {
    const router = await createRouterFromConfig({
      logger: mockServices.logger.mock(),
      database: {} as any,
      scheduler: mockScheduler as any,
      config: mockServices.rootConfig({ data: {} }),
    });

    const app = express();
    app.use(router);
    return app;
  }

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
    );
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

  it('GET /v2/teams returns team list', async () => {
    mockDbV2.getTeams.mockResolvedValue(['platform', 'core']);

    const app = await createTestApp();
    const response = await request(app).get(
      '/v2/teams?type=enterprise&entityId=ent-1&from=2026-05-01&to=2026-05-20',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(['platform', 'core']);
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
    mockDbV2.getIngestionLog.mockResolvedValue([
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
    });

    const app = await createTestApp();
    const response = await request(app).get(
      '/v2/dashboard?type=organization&entityId=org-1&from=2026-05-01&to=2026-05-20',
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('daily');
    expect(response.body.daily).toHaveLength(1);
    expect(mockDbV2.getDashboardData).toHaveBeenCalledWith(
      'organization',
      'org-1',
      '2026-05-01',
      '2026-05-20',
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
    );
  });
});
