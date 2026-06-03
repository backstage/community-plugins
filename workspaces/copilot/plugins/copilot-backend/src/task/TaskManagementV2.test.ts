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

import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
import { DatabaseHandlerV2 } from '../db/DatabaseHandlerV2';
import { GithubClientV2 } from '../client/GithubClientV2';
import { TaskManagementV2, runBackfill } from './TaskManagementV2';

describe('TaskManagementV2', () => {
  it('runAsync with no missing days exits without API calls', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillFromDate': '2026-05-10',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': false,
    });
    const logger = createLoggerMock();

    db.getMissingDays.mockResolvedValue([]);

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runAsync();

    expect(db.getMissingDays).toHaveBeenCalledTimes(1);
    expect(db.getMissingDays).toHaveBeenCalledWith(
      'enterprise',
      'ent-1',
      '2026-05-10',
      expect.any(String),
      ['totals'],
    );
    expect(api.fetchEnterpriseReportLinks).not.toHaveBeenCalled();
  });

  it('runAsync with one missing day ingests once', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillFromDate': '2026-05-10',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': false,
    });
    const logger = createLoggerMock();

    db.getMissingDays.mockResolvedValue(['2026-05-10']);
    api.fetchEnterpriseReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/report.json'],
    });
    api.fetchEnterpriseUserTeamsLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/user-teams.json'],
    });
    api.downloadDocument.mockResolvedValueOnce(
      makeEnterpriseDocument('2026-05-10'),
    );
    api.downloadNdjsonDocument.mockResolvedValueOnce(
      makeUserTeamsDocument('2026-05-10'),
    );

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runAsync();

    expect(api.fetchEnterpriseReportLinks).toHaveBeenCalledWith('2026-05-10');
    expect(db.upsertIngestionLog).toHaveBeenCalledWith(
      expect.objectContaining({
        day: '2026-05-10',
        metrics_type: 'enterprise',
        entity_id: 'ent-1',
        status: 'success',
      }),
    );
  });

  it('runAsync continues to next day when one day fails', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillFromDate': '2026-05-10',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': false,
    });
    const logger = createLoggerMock();

    db.getMissingDays.mockResolvedValue(['2026-05-10', '2026-05-11']);

    api.fetchEnterpriseReportLinks.mockImplementation(async day => {
      if (day === '2026-05-10') {
        throw new Error('enterprise report failed');
      }
      return {
        download_links: ['https://downloads.github.com/report-day2.json'],
      };
    });

    api.fetchEnterpriseUserTeamsLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/user-teams-day2.json'],
    });

    api.downloadDocument.mockResolvedValueOnce(
      makeEnterpriseDocument('2026-05-11'),
    );
    api.downloadNdjsonDocument.mockResolvedValueOnce(
      makeUserTeamsDocument('2026-05-11'),
    );

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runAsync();

    expect(api.fetchEnterpriseReportLinks).toHaveBeenCalledTimes(2);
    expect(db.upsertIngestionLog).toHaveBeenCalledWith(
      expect.objectContaining({ day: '2026-05-10', status: 'error' }),
    );
    expect(db.upsertIngestionLog).toHaveBeenCalledWith(
      expect.objectContaining({ day: '2026-05-11', status: 'success' }),
    );
    expect(logger.error).toHaveBeenCalled();
  });

  it('runBackfill processes only the specified range', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': false,
    });
    const logger = createLoggerMock();

    db.getMissingDays.mockResolvedValue(['2026-05-12']);
    api.fetchOrganizationReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/org-report.json'],
    });
    api.fetchOrganizationUserTeamsLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/org-user-teams.json'],
    });
    api.downloadDocument.mockResolvedValueOnce(
      makeEnterpriseDocument('2026-05-12'),
    );
    api.downloadNdjsonDocument.mockResolvedValueOnce(
      makeUserTeamsDocument('2026-05-12'),
    );

    await runBackfill(
      {
        db: db as unknown as DatabaseHandlerV2,
        api: api as unknown as GithubClientV2,
        config,
        logger,
      },
      '2026-05-12',
      '2026-05-12',
      'organization',
      'org-1',
    );

    expect(db.getMissingDays).toHaveBeenCalledWith(
      'organization',
      'org-1',
      '2026-05-12',
      '2026-05-12',
      ['totals'],
    );
    expect(api.fetchOrganizationReportLinks).toHaveBeenCalledWith('2026-05-12');
    expect(api.fetchOrganizationUserTeamsLinks).not.toHaveBeenCalled();
  });

  it('ingestDay flow with ingestTeams false does not call team endpoints', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillFromDate': '2026-05-10',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': false,
    });
    const logger = createLoggerMock();

    db.getMissingDays.mockResolvedValue(['2026-05-10']);
    api.fetchEnterpriseReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/report.json'],
    });
    api.fetchEnterpriseUserTeamsLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/user-teams.json'],
    });
    api.downloadDocument.mockResolvedValueOnce(
      makeEnterpriseDocument('2026-05-10'),
    );
    api.downloadNdjsonDocument.mockResolvedValueOnce(
      makeUserTeamsDocument('2026-05-10'),
    );

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runAsync();

    expect(api.fetchEnterpriseUserReportLinks).not.toHaveBeenCalled();
    expect(api.fetchEnterpriseUserTeamsLinks).not.toHaveBeenCalled();
  });

  it('runAsync records partial status when required team components are missing', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillFromDate': '2026-05-10',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': true,
    });
    const logger = createLoggerMock();

    db.getMissingDays.mockResolvedValue(['2026-05-10']);
    api.fetchEnterpriseReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/report.json'],
    });
    api.fetchEnterpriseUserReportLinks.mockResolvedValue({
      download_links: [],
    });
    api.fetchEnterpriseUserTeamsLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/user-teams.json'],
    });
    api.downloadDocument.mockResolvedValueOnce(
      makeEnterpriseDocument('2026-05-10'),
    );
    api.downloadNdjsonDocument.mockResolvedValueOnce(
      makeUserTeamsDocument('2026-05-10'),
    );

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runAsync();

    expect(db.getMissingDays).toHaveBeenCalledWith(
      'enterprise',
      'ent-1',
      '2026-05-10',
      expect.any(String),
      ['totals', 'users', 'teams'],
    );
    expect(db.upsertIngestionLog).toHaveBeenCalledWith(
      expect.objectContaining({
        day: '2026-05-10',
        status: 'partial',
        components_loaded: JSON.stringify(['totals']),
        error_message: 'Missing components: users, teams',
      }),
    );
  });

  it('idempotency: running same backfill twice skips API calls on second run', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': false,
    });
    const logger = createLoggerMock();

    db.getMissingDays
      .mockResolvedValueOnce(['2026-05-10'])
      .mockResolvedValueOnce([]);

    api.fetchOrganizationReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/org-report.json'],
    });
    api.fetchOrganizationUserTeamsLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/org-user-teams.json'],
    });
    api.downloadDocument.mockResolvedValueOnce(
      makeEnterpriseDocument('2026-05-10'),
    );
    api.downloadNdjsonDocument.mockResolvedValueOnce(
      makeUserTeamsDocument('2026-05-10'),
    );

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runBackfill('2026-05-10', '2026-05-10', 'organization', 'org-1');
    await task.runBackfill('2026-05-10', '2026-05-10', 'organization', 'org-1');

    expect(db.getMissingDays).toHaveBeenCalledTimes(2);
    expect(api.fetchOrganizationReportLinks).toHaveBeenCalledTimes(1);
  });
});

function createDbMock() {
  return {
    getMissingDays: jest.fn(),
    insertDailyTotals: jest.fn().mockResolvedValue(undefined),
    insertPrMetrics: jest.fn().mockResolvedValue(undefined),
    insertByFeature: jest.fn().mockResolvedValue(undefined),
    insertByIde: jest.fn().mockResolvedValue(undefined),
    insertByLanguageFeature: jest.fn().mockResolvedValue(undefined),
    insertByModelFeature: jest.fn().mockResolvedValue(undefined),
    insertByLanguageModel: jest.fn().mockResolvedValue(undefined),
    insertByCli: jest.fn().mockResolvedValue(undefined),
    insertUserMetrics: jest.fn().mockResolvedValue(undefined),
    insertUserTeams: jest.fn().mockResolvedValue(undefined),
    upsertIngestionLog: jest.fn().mockResolvedValue(undefined),
  };
}

function createApiMock() {
  return {
    fetchEnterpriseReportLinks: jest.fn(),
    fetchOrganizationReportLinks: jest.fn(),
    fetchEnterpriseUserReportLinks: jest.fn(),
    fetchOrganizationUserReportLinks: jest.fn(),
    fetchEnterpriseUserTeamsLinks: jest.fn(),
    fetchOrganizationUserTeamsLinks: jest.fn(),
    downloadDocument: jest.fn(),
    downloadNdjsonDocument: jest.fn(),
  };
}

function createLoggerMock(): LoggerService {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn(),
  };
}

function createConfigMock(values: Record<string, unknown>): Config {
  return {
    getOptionalString: jest.fn((key: string) => {
      const value = values[key];
      return typeof value === 'string' ? value : undefined;
    }),
    getOptionalNumber: jest.fn((key: string) => {
      const value = values[key];
      return typeof value === 'number' ? value : undefined;
    }),
    getOptionalBoolean: jest.fn((key: string) => {
      const value = values[key];
      return typeof value === 'boolean' ? value : undefined;
    }),
  } as unknown as Config;
}

function makeEnterpriseDocument(day: string) {
  return [
    {
      enterprise_id: 'ent-1',
      report_start_day: day,
      report_end_day: day,
      day_totals: [
        {
          day,
          enterprise_id: 'ent-1',
          daily_active_users: 2,
          weekly_active_users: 2,
          monthly_active_users: 2,
          code_acceptance_activity_count: 5,
          code_generation_activity_count: 6,
          loc_added_sum: 10,
          loc_deleted_sum: 3,
          loc_suggested_to_add_sum: 12,
          loc_suggested_to_delete_sum: 4,
          user_initiated_interaction_count: 1,
        },
      ],
    },
  ];
}

function makeUserTeamsDocument(day: string) {
  return [
    {
      user_id: 1,
      user_login: 'octocat',
      day,
      enterprise_id: 'ent-1',
      team_id: 42,
      slug: 'platform',
    },
  ];
}
