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
import { DateTime } from 'luxon';
import {
  V2UserMetricRow,
  V2UserTeamRow,
} from '@backstage-community/plugin-copilot-common';
import { DatabaseHandlerV2 } from '../db/DatabaseHandlerV2';
import { GithubClientV2 } from '../client/GithubClientV2';
import { UserBreakdownData } from '../utils/reportParser';
import { TaskManagementV2, runBackfill } from './TaskManagementV2';

describe('TaskManagementV2', () => {
  it('does not retry newly required user and team reports outside their retention window', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const logger = createLoggerMock();
    const rollingStart = DateTime.utc()
      .startOf('day')
      .minus({ years: 1 })
      .toISODate()!;
    const reportWindowStart =
      rollingStart > '2025-10-10' ? rollingStart : '2025-10-10';
    const backfillFromDate = DateTime.fromISO(reportWindowStart, {
      zone: 'utc',
    })
      .minus({ days: 1 })
      .toISODate()!;
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillFromDate': backfillFromDate,
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': true,
    });

    db.getMissingDays.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runAsync();

    expect(db.getMissingDays).toHaveBeenNthCalledWith(
      1,
      'enterprise',
      'ent-1',
      reportWindowStart,
      expect.any(String),
      ['totals', 'users', 'teams'],
    );
    expect(db.getMissingDays).toHaveBeenNthCalledWith(
      2,
      'enterprise',
      'ent-1',
      backfillFromDate,
      expect.any(String),
      ['totals'],
    );
    expect(api.fetchEnterpriseUserReportLinks).not.toHaveBeenCalled();
    expect(api.fetchEnterpriseUserTeamsLinks).not.toHaveBeenCalled();
  });

  it('continues loading totals outside the user and team report window', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const logger = createLoggerMock();
    const rollingStart = DateTime.utc()
      .startOf('day')
      .minus({ years: 1 })
      .toISODate()!;
    const reportWindowStart =
      rollingStart > '2025-10-10' ? rollingStart : '2025-10-10';
    const outsideWindowDay = DateTime.fromISO(reportWindowStart, {
      zone: 'utc',
    })
      .minus({ days: 1 })
      .toISODate()!;
    const config = createConfigMock({
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': true,
    });

    db.getMissingDays
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([outsideWindowDay]);
    api.fetchEnterpriseReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/totals.json'],
    });
    api.downloadDocument.mockResolvedValueOnce(
      makeEnterpriseDocument(outsideWindowDay),
    );

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runBackfill(
      outsideWindowDay,
      outsideWindowDay,
      'enterprise',
      'ent-1',
    );

    expect(db.getMissingDays).toHaveBeenNthCalledWith(
      1,
      'enterprise',
      'ent-1',
      reportWindowStart,
      outsideWindowDay,
      ['totals', 'users', 'teams'],
    );
    expect(db.getMissingDays).toHaveBeenNthCalledWith(
      2,
      'enterprise',
      'ent-1',
      outsideWindowDay,
      outsideWindowDay,
      ['totals'],
    );
    expect(api.fetchEnterpriseReportLinks).toHaveBeenCalledWith(
      outsideWindowDay,
    );
    expect(api.fetchEnterpriseUserReportLinks).not.toHaveBeenCalled();
    expect(api.fetchEnterpriseUserTeamsLinks).not.toHaveBeenCalled();
    expect(db.upsertIngestionLog).toHaveBeenCalledWith(
      expect.objectContaining({
        day: outsideWindowDay,
        status: 'success',
        components_loaded: '["totals"]',
      }),
    );
  });

  it('runAsync with no missing days exits without API calls', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillFromDate': '2026-05-10',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': false,
      'copilot.ingestCostCenters': false,
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
    expect(api.fetchCostCenterMemberships).not.toHaveBeenCalled();
    expect(db.getDaysMissingCostCenterAggregation).not.toHaveBeenCalled();
    expect(db.upsertCostCenters).not.toHaveBeenCalled();
    expect(db.upsertUserCostCenters).not.toHaveBeenCalled();
    expect(db.getUserMetricsForDay).not.toHaveBeenCalled();
    expect(db.getUserBreakdownsForDay).not.toHaveBeenCalled();
    expect(db.getUserTeamsForDay).not.toHaveBeenCalled();
    expect(db.markCostCenterAggregationDone).not.toHaveBeenCalled();
    expect(db.replaceCostCenterAggregates).not.toHaveBeenCalled();
  });

  it('does not fetch a cost-center snapshot when no days need processing', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillFromDate': '2026-05-10',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': false,
      'copilot.ingestCostCenters': true,
    });
    const logger = createLoggerMock();

    db.getMissingDays.mockResolvedValue([]);
    db.getDaysMissingCostCenterAggregation.mockResolvedValue([]);

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runAsync();

    expect(api.fetchCostCenterMemberships).not.toHaveBeenCalled();
    expect(db.upsertCostCenters).not.toHaveBeenCalled();
  });

  it('warns without an enterprise and continues organization ingestion', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.organization': 'org-1',
      'copilot.backfillFromDate': '2026-05-10',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': false,
      'copilot.ingestCostCenters': true,
    });
    const logger = createLoggerMock();

    db.getMissingDays.mockResolvedValue(['2026-05-10']);
    api.fetchOrganizationReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/org-report.json'],
    });
    api.downloadDocument.mockResolvedValueOnce({
      day: '2026-05-10',
      organization_id: 'org-1',
      daily_active_users: 1,
    });

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runAsync();

    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'copilot.ingestCostCenters is enabled, but copilot.enterprise is not configured',
      ),
    );
    expect(api.fetchOrganizationReportLinks).toHaveBeenCalledWith('2026-05-10');
    expect(api.fetchCostCenterMemberships).not.toHaveBeenCalled();
    expect(db.getDaysMissingCostCenterAggregation).not.toHaveBeenCalled();
  });

  it('warns and skips organization cost centers when no organization is configured', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': false,
      'copilot.ingestCostCenters': true,
    });
    const logger = createLoggerMock();
    const day = '2026-05-10';

    db.getMissingDays.mockResolvedValue([day]);
    api.fetchOrganizationReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/org-report.json'],
    });
    api.downloadDocument.mockResolvedValueOnce({
      day,
      organization_id: 'org-1',
      daily_active_users: 1,
      weekly_active_users: 1,
      monthly_active_users: 1,
      code_acceptance_activity_count: 0,
      code_generation_activity_count: 0,
      loc_added_sum: 0,
      loc_deleted_sum: 0,
      loc_suggested_to_add_sum: 0,
      loc_suggested_to_delete_sum: 0,
      user_initiated_interaction_count: 0,
    });

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runBackfill(day, day, 'organization', 'org-1');

    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'Organization cost-center ingestion requires copilot.enterprise and the configured copilot.organization',
      ),
    );
    expect(api.fetchOrganizationReportLinks).toHaveBeenCalledWith(day);
    expect(api.fetchCostCenterMemberships).not.toHaveBeenCalled();
    expect(db.getDaysMissingCostCenterAggregation).not.toHaveBeenCalled();
    expect(db.replaceCostCenterAggregates).not.toHaveBeenCalled();
  });

  it('ingests organization cost centers independently of team ingestion', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.organization': 'org-1',
      'copilot.backfillFromDate': '2026-05-10',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': false,
      'copilot.ingestCostCenters': true,
    });
    const logger = createLoggerMock();
    const day = '2026-05-10';
    const organizationUsers = [
      {
        user_id: 1,
        user_login: 'octocat-user-1',
        day,
        used_agent: true,
        loc_added_sum: 10,
      },
      {
        user_id: 2,
        user_login: 'hubot',
        day,
        used_chat: true,
        loc_added_sum: 20,
      },
    ];
    db.getMissingDays.mockImplementation(async metricsType =>
      metricsType === 'organization' ? [day] : [],
    );
    db.getUserMetricsForDay.mockResolvedValue([
      makeStoredUserMetric(day, {
        metrics_type: 'organization',
        entity_id: 'org-1',
        loc_added_sum: 10,
      }),
      makeStoredUserMetric(day, {
        metrics_type: 'organization',
        entity_id: 'org-1',
        user_id: 2,
        user_login: 'hubot',
        loc_added_sum: 20,
      }),
    ]);
    db.getUserBreakdownsForDay.mockResolvedValue([
      makeStoredUserBreakdown(1, 'octocat-user-1'),
      makeStoredUserBreakdown(2, 'hubot'),
    ]);
    api.fetchCostCenterMemberships.mockResolvedValue(
      makeCostCenterSnapshot(
        new Map([[1, { costCenterId: 'cc-1', login: 'octocat-user-1' }]]),
      ),
    );
    api.fetchOrganizationReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/org-totals.json'],
    });
    api.fetchOrganizationUserReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/org-users.json'],
    });
    api.downloadDocument.mockResolvedValueOnce({
      day,
      organization_id: 'org-1',
      daily_active_users: 2,
    });
    api.downloadNdjsonDocument.mockResolvedValue(organizationUsers);

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runAsync();

    expect(db.getMissingDays).toHaveBeenCalledWith(
      'organization',
      'org-1',
      '2026-05-10',
      expect.any(String),
      ['totals', 'users'],
    );
    expect(db.getDaysMissingCostCenterAggregation).toHaveBeenCalledWith(
      'organization',
      'org-1',
      '2026-05-10',
      expect.any(String),
    );
    expect(api.fetchCostCenterMemberships).toHaveBeenCalledTimes(1);
    expect(api.fetchOrganizationUserReportLinks).toHaveBeenCalledWith(day);
    expect(api.fetchOrganizationUserTeamsLinks).not.toHaveBeenCalled();
    expect(db.getUserTeamsForDay).not.toHaveBeenCalled();
    expect(api.fetchEnterpriseUserReportLinks).not.toHaveBeenCalled();
    expect(api.fetchEnterpriseUserTeamsLinks).not.toHaveBeenCalled();
    expect(db.upsertCostCenters).toHaveBeenCalledWith([
      {
        metrics_type: 'organization',
        entity_id: 'org-1',
        cost_center_id: 'cc-1',
        name: 'Engineering',
      },
    ]);
    expect(db.replaceCostCenterAggregates).toHaveBeenCalledWith(
      day,
      'organization',
      'org-1',
      [
        expect.objectContaining({
          metrics_type: 'organization',
          entity_id: 'org-1',
          user_id: 1,
          cost_center_id: 'cc-1',
        }),
      ],
      expect.objectContaining({
        dailyTotals: expect.arrayContaining([
          expect.objectContaining({
            team_slug: '',
            cost_center_id: 'cc-1',
            daily_active_users: 1,
            loc_added_sum: 10,
          }),
          expect.objectContaining({
            team_slug: '',
            cost_center_id: '',
            without_cost_center: true,
            daily_active_users: 1,
            loc_added_sum: 20,
          }),
        ]),
      }),
      true,
    );
    const [, , , , aggregates] = db.replaceCostCenterAggregates.mock.calls[0];
    expect(aggregates.dailyTotals).toHaveLength(2);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('shares one enterprise membership snapshot across enabled cost-center scopes', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.organization': 'org-1',
      'copilot.backfillFromDate': '2026-05-10',
      'copilot.ingestCostCenters': true,
    });
    const day = '2026-05-10';

    db.getMissingDays.mockResolvedValue([]);
    db.getDaysMissingCostCenterAggregation.mockResolvedValue([day]);
    db.getUserMetricsForDay.mockImplementation(
      async (metricsType, entityId) => [
        makeStoredUserMetric(day, {
          metrics_type: metricsType,
          entity_id: entityId,
        }),
      ],
    );
    db.getUserBreakdownsForDay.mockResolvedValue([
      makeStoredUserBreakdown(1, 'octocat-user-1'),
    ]);
    api.fetchCostCenterMemberships.mockResolvedValue(
      makeCostCenterSnapshot(
        new Map([[1, { costCenterId: 'cc-1', login: 'octocat-user-1' }]]),
      ),
    );

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger: createLoggerMock(),
    });

    await task.runAsync();

    expect(api.fetchCostCenterMemberships).toHaveBeenCalledTimes(1);
    expect(db.upsertCostCenters).toHaveBeenCalledTimes(2);
    expect(db.upsertCostCenters).toHaveBeenCalledWith([
      expect.objectContaining({
        metrics_type: 'enterprise',
        entity_id: 'ent-1',
        cost_center_id: 'cc-1',
      }),
    ]);
    expect(db.upsertCostCenters).toHaveBeenCalledWith([
      expect.objectContaining({
        metrics_type: 'organization',
        entity_id: 'org-1',
        cost_center_id: 'cc-1',
      }),
    ]);
    expect(db.replaceCostCenterAggregates).toHaveBeenCalledTimes(2);
  });

  it('ingests enterprise users for cost centers without fetching teams', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillFromDate': '2026-05-10',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': false,
      'copilot.ingestCostCenters': true,
    });
    const logger = createLoggerMock();
    const day = '2026-05-10';

    db.getMissingDays.mockResolvedValue([day]);
    db.getDaysMissingCostCenterAggregation.mockResolvedValue([]);
    db.getUserMetricsForDay.mockResolvedValue([
      makeStoredUserMetric(day, { loc_added_sum: 10 }),
    ]);
    db.getUserBreakdownsForDay.mockResolvedValue([
      makeStoredUserBreakdown(1, 'octocat-user-1'),
    ]);
    api.fetchCostCenterMemberships.mockResolvedValue(
      makeCostCenterSnapshot(
        new Map([[1, { costCenterId: 'cc-1', login: 'octocat-user-1' }]]),
        ['Skipping a cost-center organization with no members.'],
      ),
    );
    api.fetchEnterpriseReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/report.json'],
    });
    api.fetchEnterpriseUserReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/users.json'],
    });
    api.downloadDocument.mockResolvedValueOnce(makeEnterpriseDocument(day));
    api.downloadNdjsonDocument.mockResolvedValueOnce(
      makeUserMetricsDocument(day),
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
      ['totals', 'users'],
    );
    expect(api.fetchEnterpriseUserReportLinks).toHaveBeenCalledWith(day);
    expect(api.fetchEnterpriseUserTeamsLinks).not.toHaveBeenCalled();
    expect(db.getUserTeamsForDay).not.toHaveBeenCalled();
    expect(db.upsertCostCenters).toHaveBeenCalledWith([
      {
        metrics_type: 'enterprise',
        entity_id: 'ent-1',
        cost_center_id: 'cc-1',
        name: 'Engineering',
      },
    ]);
    expect(db.replaceCostCenterAggregates).toHaveBeenCalledWith(
      day,
      'enterprise',
      'ent-1',
      [
        expect.objectContaining({
          day,
          metrics_type: 'enterprise',
          entity_id: 'ent-1',
          user_id: 1,
          user_login: 'octocat-user-1',
          cost_center_id: 'cc-1',
        }),
      ],
      expect.objectContaining({
        dailyTotals: [
          expect.objectContaining({
            team_slug: '',
            cost_center_id: 'cc-1',
            daily_active_users: 1,
            loc_added_sum: 10,
          }),
        ],
        byFeature: [
          expect.objectContaining({
            team_slug: '',
            cost_center_id: 'cc-1',
            feature: 'chat_panel',
            loc_added_sum: 10,
          }),
        ],
        byCli: [],
        byVscodeAgent: [],
      }),
      true,
    );
    expect(db.upsertUserCostCenters).not.toHaveBeenCalled();
    expect(db.markCostCenterAggregationDone).not.toHaveBeenCalled();
  });

  it('re-aggregates cost centers for re-ingested customization-metric days', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const day = '2026-10-28';
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillFromDate': day,
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': false,
      'copilot.ingestCostCenters': true,
    });
    const userDocument = [
      {
        ...makeUserMetricsDocument(day)[0],
        totals_by_skill: [{ skill: 'release-checks', interaction_count: 4 }],
      },
    ];
    const userBreakdown = makeStoredUserBreakdown(1, 'octocat-user-1');
    userBreakdown.customizations = [
      {
        category: 'skill',
        item_name: 'release-checks',
        interaction_count: 4,
      },
    ];

    db.getMissingDays.mockResolvedValue([day]);
    db.getUserMetricsForDay.mockResolvedValue([
      makeStoredUserMetric(day, { loc_added_sum: 10 }),
    ]);
    db.getUserBreakdownsForDay.mockResolvedValue([userBreakdown]);
    api.fetchCostCenterMemberships.mockResolvedValue(
      makeCostCenterSnapshot(
        new Map([[1, { costCenterId: 'cc-1', login: 'octocat-user-1' }]]),
      ),
    );
    api.fetchEnterpriseReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/totals.json'],
    });
    api.fetchEnterpriseUserReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/users.json'],
    });
    api.downloadDocument.mockResolvedValueOnce(makeEnterpriseDocument(day));
    api.downloadNdjsonDocument.mockResolvedValueOnce(userDocument);

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger: createLoggerMock(),
    });

    await task.runAsync();

    expect(api.fetchEnterpriseUserReportLinks).toHaveBeenCalledWith(day);
    expect(db.insertCustomizationMetrics).toHaveBeenCalledWith([
      expect.objectContaining({
        day,
        metrics_type: 'enterprise',
        entity_id: 'ent-1',
        scope: 'user',
        category: 'skill',
        item_name: 'release-checks',
        interaction_count: 4,
      }),
    ]);
    expect(db.replaceCostCenterAggregates).toHaveBeenCalledWith(
      day,
      'enterprise',
      'ent-1',
      expect.arrayContaining([
        expect.objectContaining({ user_id: 1, cost_center_id: 'cc-1' }),
      ]),
      expect.objectContaining({
        customizationMetrics: [
          expect.objectContaining({
            cost_center_id: 'cc-1',
            without_cost_center: false,
            category: 'skill',
            item_name: 'release-checks',
            interaction_count: 4,
          }),
        ],
      }),
      true,
    );
  });

  it('keeps team and cost-center aggregates in separate scopes', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillFromDate': '2026-05-10',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': true,
      'copilot.ingestCostCenters': true,
    });
    const logger = createLoggerMock();
    const day = '2026-05-10';
    const usersDocument = makeUserMetricsDocument(day);
    usersDocument.push({
      ...usersDocument[0],
      user_id: 2,
      user_login: 'hubot',
      loc_added_sum: 20,
    });
    const teamsDocument = [
      ...makeUserTeamsDocument(day),
      {
        user_id: 2,
        user_login: 'hubot',
        day,
        enterprise_id: 'ent-1',
        team_id: 42,
        slug: 'platform',
      },
    ];

    db.getMissingDays.mockResolvedValue([day]);
    db.getDaysMissingCostCenterAggregation.mockResolvedValue([]);
    db.getUserMetricsForDay.mockResolvedValue([
      makeStoredUserMetric(day, { loc_added_sum: 10 }),
      makeStoredUserMetric(day, {
        user_id: 2,
        user_login: 'hubot',
        loc_added_sum: 20,
      }),
    ]);
    db.getUserBreakdownsForDay.mockResolvedValue([
      makeStoredUserBreakdown(1, 'octocat-user-1'),
      makeStoredUserBreakdown(2, 'hubot'),
    ]);
    db.getUserTeamsForDay.mockResolvedValue([
      makeStoredUserTeam(day, { user_id: 1, user_login: 'octocat-user-1' }),
      makeStoredUserTeam(day, { user_id: 2, user_login: 'hubot' }),
    ]);
    api.fetchCostCenterMemberships.mockResolvedValue(
      makeCostCenterSnapshot(
        new Map([[1, { costCenterId: 'cc-1', login: 'octocat-user-1' }]]),
      ),
    );
    api.fetchEnterpriseReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/report.json'],
    });
    api.fetchEnterpriseUserReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/users.json'],
    });
    api.fetchEnterpriseUserTeamsLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/user-teams.json'],
    });
    api.downloadDocument.mockResolvedValueOnce(makeEnterpriseDocument(day));
    api.downloadNdjsonDocument.mockImplementation(async (url: string) =>
      url.includes('users.json') ? usersDocument : teamsDocument,
    );

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runAsync();

    expect(db.replaceCostCenterAggregates).toHaveBeenCalledTimes(1);
    const [, , , userCostCenters, costCenterAggregates] =
      db.replaceCostCenterAggregates.mock.calls[0];
    expect(userCostCenters).toEqual([
      expect.objectContaining({ user_id: 1, cost_center_id: 'cc-1' }),
    ]);
    const costCenterTotals = costCenterAggregates.dailyTotals;
    expect(costCenterTotals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          team_slug: '',
          cost_center_id: 'cc-1',
          daily_active_users: 1,
          loc_added_sum: 10,
        }),
        expect.objectContaining({
          team_slug: '',
          cost_center_id: '',
          without_cost_center: true,
          daily_active_users: 1,
          loc_added_sum: 20,
        }),
      ]),
    );
    expect(costCenterTotals).toHaveLength(2);
    expect(
      (costCenterTotals as Array<{ team_slug: string }>).every(
        row => row.team_slug === '',
      ),
    ).toBe(true);
    expect(api.fetchEnterpriseUserTeamsLinks).toHaveBeenCalledWith(day);
    expect(db.getUserTeamsForDay).not.toHaveBeenCalled();
  });

  it('marks a successfully loaded day with no per-user rows without aggregating', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillFromDate': '2026-05-10',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': false,
      'copilot.ingestCostCenters': true,
    });
    const logger = createLoggerMock();
    const day = '2026-05-10';

    db.getMissingDays.mockResolvedValue([day]);
    db.getDaysMissingCostCenterAggregation.mockResolvedValue([]);
    api.fetchCostCenterMemberships.mockResolvedValue(
      makeCostCenterSnapshot(new Map()),
    );
    api.fetchEnterpriseReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/report.json'],
    });
    api.fetchEnterpriseUserReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/users.json'],
    });
    api.downloadDocument.mockResolvedValueOnce(makeEnterpriseDocument(day));
    api.downloadNdjsonDocument.mockResolvedValueOnce([]);

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runAsync();

    expect(db.replaceCostCenterAggregates).toHaveBeenCalledWith(
      day,
      'enterprise',
      'ent-1',
      [],
      expect.objectContaining({
        dailyTotals: [],
        byFeature: [],
        byCli: [],
        byVscodeAgent: [],
      }),
      true,
    );
    expect(db.insertDailyTotals).toHaveBeenCalledTimes(1);
    expect(db.markCostCenterAggregationDone).not.toHaveBeenCalled();
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
    expect(db.insertByVscodeAgent).toHaveBeenCalledWith([
      expect.objectContaining({
        day: '2026-05-10',
        metrics_type: 'enterprise',
        entity_id: 'ent-1',
        session_count: 2,
        total_user_messages: 8,
      }),
    ]);
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

  it('preserves totals-only history and backfills users within the report window', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const logger = createLoggerMock();
    const rollingStart = DateTime.utc()
      .startOf('day')
      .minus({ years: 1 })
      .toISODate()!;
    const reportWindowStart =
      rollingStart > '2025-10-10' ? rollingStart : '2025-10-10';
    const outsideWindowDay = DateTime.fromISO(reportWindowStart, {
      zone: 'utc',
    })
      .minus({ days: 1 })
      .toISODate()!;
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.organization': 'org-1',
      'copilot.backfillFromDate': outsideWindowDay,
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': true,
    });

    db.getMissingDays.mockResolvedValue([reportWindowStart]);
    db.getIngestionLog.mockResolvedValue([
      {
        day: reportWindowStart,
        metrics_type: 'enterprise',
        entity_id: 'ent-1',
        status: 'success',
        components_loaded: '["totals"]',
        source: 'scheduled',
      },
    ]);
    api.fetchEnterpriseUserReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/users.json'],
    });
    api.fetchEnterpriseUserTeamsLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/user-teams.json'],
    });
    api.downloadNdjsonDocument
      .mockResolvedValueOnce(makeUserMetricsDocument(reportWindowStart))
      .mockResolvedValueOnce(makeUserTeamsDocument(reportWindowStart));

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
      reportWindowStart,
      expect.any(String),
      ['totals', 'users', 'teams'],
    );
    expect(db.getIngestionLog).toHaveBeenCalledWith(
      'enterprise',
      'ent-1',
      reportWindowStart,
      reportWindowStart,
    );
    expect(api.fetchEnterpriseReportLinks).not.toHaveBeenCalled();
    expect(api.fetchEnterpriseUserReportLinks).toHaveBeenCalledWith(
      reportWindowStart,
    );
    expect(api.fetchEnterpriseUserTeamsLinks).toHaveBeenCalledWith(
      reportWindowStart,
    );
    expect(api.fetchEnterpriseUserReportLinks).not.toHaveBeenCalledWith(
      outsideWindowDay,
    );
    expect(db.upsertIngestionLog).toHaveBeenCalledWith(
      expect.objectContaining({
        day: reportWindowStart,
        status: 'success',
        components_loaded: JSON.stringify(['totals', 'users', 'teams']),
      }),
    );
  });

  it('limits newly enabled cost-center aggregation to the report window', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': false,
      'copilot.ingestCostCenters': true,
    });
    const logger = createLoggerMock();
    const rollingStart = DateTime.utc()
      .startOf('day')
      .minus({ years: 1 })
      .toISODate()!;
    const reportWindowStart =
      rollingStart > '2025-10-10' ? rollingStart : '2025-10-10';
    const outsideWindowDay = DateTime.fromISO(reportWindowStart, {
      zone: 'utc',
    })
      .minus({ days: 1 })
      .toISODate()!;

    db.getMissingDays.mockResolvedValue([]);
    db.getDaysMissingCostCenterAggregation.mockResolvedValue([]);

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runBackfill(
      outsideWindowDay,
      outsideWindowDay,
      'enterprise',
      'ent-1',
    );

    expect(db.getMissingDays).toHaveBeenCalledWith(
      'enterprise',
      'ent-1',
      reportWindowStart,
      outsideWindowDay,
      ['totals', 'users'],
    );
    expect(db.getDaysMissingCostCenterAggregation).toHaveBeenCalledWith(
      'enterprise',
      'ent-1',
      reportWindowStart,
      outsideWindowDay,
    );
    expect(api.fetchCostCenterMemberships).not.toHaveBeenCalled();
    expect(api.fetchEnterpriseUserReportLinks).not.toHaveBeenCalled();
  });

  it('keeps core totals backfill behavior outside the user-report window', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': true,
    });
    const logger = createLoggerMock();
    const rollingStart = DateTime.utc()
      .startOf('day')
      .minus({ years: 1 })
      .toISODate()!;
    const reportWindowStart =
      rollingStart > '2025-10-10' ? rollingStart : '2025-10-10';
    const outsideWindowDay = DateTime.fromISO(reportWindowStart, {
      zone: 'utc',
    })
      .minus({ days: 1 })
      .toISODate()!;

    db.getMissingDays
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([outsideWindowDay]);
    api.fetchEnterpriseReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/totals.json'],
    });
    api.downloadDocument.mockResolvedValueOnce(
      makeEnterpriseDocument(outsideWindowDay),
    );

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runBackfill(
      outsideWindowDay,
      outsideWindowDay,
      'enterprise',
      'ent-1',
    );

    expect(db.getMissingDays).toHaveBeenNthCalledWith(
      1,
      'enterprise',
      'ent-1',
      reportWindowStart,
      outsideWindowDay,
      ['totals', 'users', 'teams'],
    );
    expect(db.getMissingDays).toHaveBeenNthCalledWith(
      2,
      'enterprise',
      'ent-1',
      outsideWindowDay,
      outsideWindowDay,
      ['totals'],
    );
    expect(api.fetchEnterpriseReportLinks).toHaveBeenCalledWith(
      outsideWindowDay,
    );
    expect(api.fetchEnterpriseUserReportLinks).not.toHaveBeenCalled();
    expect(api.fetchEnterpriseUserTeamsLinks).not.toHaveBeenCalled();
  });

  it('retries an in-window generic HTTP 400 for a newly required team report', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': true,
    });
    const logger = createLoggerMock();
    const day = DateTime.utc().startOf('day').minus({ days: 2 }).toISODate()!;
    const genericBadRequest = Object.assign(new Error('Validation failed'), {
      status: 400,
      response: {
        status: 400,
        data: { message: 'Validation failed' },
      },
    });

    db.getMissingDays.mockResolvedValue([day]);
    db.getIngestionLog.mockResolvedValue([
      {
        day,
        metrics_type: 'enterprise',
        entity_id: 'ent-1',
        status: 'success',
        components_loaded: '["totals","users"]',
        source: 'scheduled',
      },
    ]);
    db.getUserMetricsForDay.mockResolvedValue([makeStoredUserMetric(day)]);
    db.getUserBreakdownsForDay.mockResolvedValue([
      makeStoredUserBreakdown(1, 'octocat-user-1'),
    ]);
    api.fetchEnterpriseUserTeamsLinks.mockRejectedValue(genericBadRequest);

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runBackfill(day, day, 'enterprise', 'ent-1');
    await task.runBackfill(day, day, 'enterprise', 'ent-1');

    expect(api.fetchEnterpriseReportLinks).not.toHaveBeenCalled();
    expect(api.fetchEnterpriseUserReportLinks).not.toHaveBeenCalled();
    expect(api.fetchEnterpriseUserTeamsLinks).toHaveBeenCalledTimes(2);
  });

  it('logs organization user-teams permission errors and continues ingestion', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const logger = createLoggerMock();
    const day = '2026-05-10';
    const error = Object.assign(
      new Error('Resource not accessible by integration'),
      { status: 404 },
    );
    const config = createConfigMock({
      'copilot.organization': 'org-1',
      'copilot.backfillFromDate': day,
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': true,
    });

    db.getMissingDays.mockResolvedValue([day]);
    api.fetchOrganizationReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/org-report.json'],
    });
    api.fetchOrganizationUserReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/org-users.json'],
    });
    api.fetchOrganizationUserTeamsLinks.mockRejectedValue(error);
    api.downloadDocument.mockResolvedValueOnce([
      {
        day,
        daily_active_users: 1,
        weekly_active_users: 1,
        monthly_active_users: 1,
      },
    ]);
    api.downloadNdjsonDocument.mockResolvedValueOnce(
      makeUserMetricsDocument(day),
    );

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runAsync();

    expect(api.fetchOrganizationUserTeamsLinks).toHaveBeenCalledWith(day);
    expect(db.insertDailyTotals).toHaveBeenCalledTimes(1);
    expect(db.insertUserMetrics).toHaveBeenCalledTimes(1);
    expect(db.replaceTeamAggregates).not.toHaveBeenCalled();
    expect(db.upsertIngestionLog).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'partial',
        components_loaded: '["totals","users"]',
      }),
    );
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('GitHub returned HTTP 404'),
      error,
    );
    const permissionLog = (logger.error as jest.Mock).mock.calls.find(
      ([message]) =>
        typeof message === 'string' &&
        message.includes('organization user-teams report'),
    )?.[0] as string;
    expect(permissionLog).toContain(error.message);
    expect(permissionLog).toContain('likely due to missing permissions');
    expect(permissionLog).toContain('Organization Copilot metrics: read');
    expect(permissionLog).toContain('read:org');
    expect(permissionLog).toContain('manage_billing:copilot');
    expect(permissionLog).toContain('read:enterprise');
    expect(permissionLog).toContain(
      'https://github.com/backstage/community-plugins/blob/main/workspaces/copilot/plugins/copilot-backend/README.md#required-github-permissions',
    );
  });

  it('logs organization per-user permission errors and skips cost-center aggregation', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const logger = createLoggerMock();
    const day = '2026-05-10';
    const error = Object.assign(new Error('Not Found'), { status: 403 });
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.organization': 'org-1',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': false,
      'copilot.ingestCostCenters': true,
    });

    db.getMissingDays.mockResolvedValue([day]);
    db.getDaysMissingCostCenterAggregation.mockResolvedValue([day]);
    api.fetchCostCenterMemberships.mockResolvedValue(
      makeCostCenterSnapshot(new Map()),
    );
    api.fetchOrganizationReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/org-report.json'],
    });
    api.fetchOrganizationUserReportLinks.mockRejectedValue(error);
    api.downloadDocument.mockResolvedValueOnce([
      {
        day,
        daily_active_users: 1,
        weekly_active_users: 1,
        monthly_active_users: 1,
      },
    ]);

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runBackfill(day, day, 'organization', 'org-1');

    expect(db.insertDailyTotals).toHaveBeenCalledTimes(1);
    expect(db.replaceCostCenterAggregates).not.toHaveBeenCalled();
    expect(db.markCostCenterAggregationDone).not.toHaveBeenCalled();
    expect(db.upsertIngestionLog).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'partial',
        components_loaded: '["totals"]',
      }),
    );
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('GitHub returned HTTP 403'),
      error,
    );
    const permissionLog = (logger.error as jest.Mock).mock.calls.find(
      ([message]) =>
        typeof message === 'string' &&
        message.includes('organization per-user report'),
    )?.[0] as string;
    expect(permissionLog).toContain(error.message);
    expect(permissionLog).toContain('likely due to missing permissions');
    expect(permissionLog).toContain('Organization Copilot metrics: read');
    expect(permissionLog).toContain('read:org');
    expect(permissionLog).toContain('manage_billing:copilot');
    expect(permissionLog).toContain('read:enterprise');
    expect(permissionLog).toContain(
      'https://github.com/backstage/community-plugins/blob/main/workspaces/copilot/plugins/copilot-backend/README.md#required-github-permissions',
    );
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

  it('backfills cost-center aggregates from stored user data without downloading reports', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': true,
      'copilot.ingestCostCenters': true,
    });
    const logger = createLoggerMock();
    const day = '2026-05-12';

    db.getMissingDays.mockResolvedValue([]);
    db.getDaysMissingCostCenterAggregation.mockResolvedValue([day]);
    db.getUserMetricsForDay.mockResolvedValue([
      makeStoredUserMetric(day, { loc_added_sum: 15 }),
    ]);
    db.getUserBreakdownsForDay.mockResolvedValue([
      makeStoredUserBreakdown(1, 'octocat-user-1'),
    ]);
    api.fetchCostCenterMemberships.mockResolvedValue(
      makeCostCenterSnapshot(
        new Map([[1, { costCenterId: 'cc-1', login: 'octocat-user-1' }]]),
      ),
    );

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runBackfill(day, day, 'enterprise', 'ent-1');

    expect(db.getDaysMissingCostCenterAggregation).toHaveBeenCalledWith(
      'enterprise',
      'ent-1',
      day,
      day,
    );
    expect(db.getUserMetricsForDay).toHaveBeenCalledWith(
      'enterprise',
      'ent-1',
      day,
    );
    expect(db.getUserBreakdownsForDay).toHaveBeenCalledWith(
      'enterprise',
      'ent-1',
      day,
    );
    expect(db.getUserTeamsForDay).not.toHaveBeenCalled();
    expect(api.fetchEnterpriseUserReportLinks).not.toHaveBeenCalled();
    expect(api.fetchEnterpriseUserTeamsLinks).not.toHaveBeenCalled();
    expect(api.downloadNdjsonDocument).not.toHaveBeenCalled();
    expect(db.replaceCostCenterAggregates).toHaveBeenCalledWith(
      day,
      'enterprise',
      'ent-1',
      [expect.objectContaining({ user_id: 1, cost_center_id: 'cc-1' })],
      expect.objectContaining({
        dailyTotals: expect.arrayContaining([
          expect.objectContaining({ loc_added_sum: 15 }),
        ]),
      }),
      true,
    );
    expect(db.markCostCenterAggregationDone).not.toHaveBeenCalled();
  });

  it('re-aggregates incomplete unassigned days after the snapshot becomes complete', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': false,
      'copilot.ingestCostCenters': true,
    });
    const logger = createLoggerMock();
    const day = '2026-05-12';

    db.getMissingDays.mockResolvedValue([]);
    db.getDaysMissingCostCenterAggregation.mockResolvedValue([]);
    db.getDaysWithIncompleteCostCenterAggregation.mockResolvedValue([day]);
    db.getUserMetricsForDay.mockResolvedValue([
      makeStoredUserMetric(day, { loc_added_sum: 15 }),
    ]);
    db.getUserBreakdownsForDay.mockResolvedValue([
      makeStoredUserBreakdown(1, 'octocat-user-1'),
    ]);
    api.fetchCostCenterMemberships.mockResolvedValue(
      makeCostCenterSnapshot(
        new Map([[1, { costCenterId: 'cc-1', login: 'octocat-user-1' }]]),
      ),
    );

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runBackfill(day, day, 'enterprise', 'ent-1');

    expect(db.getDaysWithIncompleteCostCenterAggregation).toHaveBeenCalledWith(
      'enterprise',
      'ent-1',
      day,
      day,
    );
    expect(db.replaceCostCenterAggregates).toHaveBeenCalledWith(
      day,
      'enterprise',
      'ent-1',
      [expect.objectContaining({ user_id: 1, cost_center_id: 'cc-1' })],
      expect.objectContaining({
        dailyTotals: expect.arrayContaining([
          expect.objectContaining({ loc_added_sum: 15 }),
        ]),
      }),
      true,
    );
  });

  it('does not rewrite an incomplete day while the snapshot still has unknown members', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': false,
      'copilot.ingestCostCenters': true,
    });
    const logger = createLoggerMock();
    const day = '2026-05-12';

    db.getMissingDays.mockResolvedValue([]);
    db.getDaysMissingCostCenterAggregation.mockResolvedValue([]);
    db.getDaysWithIncompleteCostCenterAggregation.mockResolvedValue([day]);
    api.fetchCostCenterMemberships.mockResolvedValue(
      makeCostCenterSnapshot(new Map(), [], true, false),
    );

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runBackfill(day, day, 'enterprise', 'ent-1');

    expect(api.fetchCostCenterMemberships).toHaveBeenCalledTimes(1);
    expect(db.replaceCostCenterAggregates).not.toHaveBeenCalled();
    expect(db.markCostCenterAggregationDone).not.toHaveBeenCalled();
  });

  it('ingests named centers but omits no-cost-center data when an org installation is missing', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': false,
      'copilot.ingestCostCenters': true,
    });
    const logger = createLoggerMock();
    const day = '2026-05-12';

    db.getMissingDays.mockResolvedValue([]);
    db.getDaysMissingCostCenterAggregation.mockResolvedValue([day]);
    db.getUserMetricsForDay.mockResolvedValue([
      makeStoredUserMetric(day, { user_id: 1, loc_added_sum: 15 }),
      makeStoredUserMetric(day, {
        user_id: 2,
        user_login: 'unassigned-user',
        loc_added_sum: 25,
      }),
    ]);
    db.getUserBreakdownsForDay.mockResolvedValue([
      makeStoredUserBreakdown(1, 'octocat-user-1'),
      makeStoredUserBreakdown(2, 'unassigned-user'),
    ]);
    api.fetchCostCenterMemberships.mockResolvedValue(
      makeCostCenterSnapshot(
        new Map([[1, { costCenterId: 'cc-1', login: 'octocat-user-1' }]]),
        [
          'Skipping organization resource "demo-org" in cost center "Demo"; the GitHub App is not installed for this organization.',
        ],
        true,
        false,
      ),
    );

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runBackfill(day, day, 'enterprise', 'ent-1');

    const [, , , userCostCenters, aggregates, unassignedComplete] =
      db.replaceCostCenterAggregates.mock.calls[0];
    expect(userCostCenters).toEqual([
      expect.objectContaining({ user_id: 1, cost_center_id: 'cc-1' }),
    ]);
    expect(aggregates.dailyTotals).toEqual([
      expect.objectContaining({
        cost_center_id: 'cc-1',
        daily_active_users: 1,
        loc_added_sum: 15,
      }),
    ]);
    expect(aggregates.dailyTotals).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ without_cost_center: true }),
      ]),
    );
    expect(unassignedComplete).toBe(false);
  });

  it('backfills organization cost-center marker gaps from stored user data', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.organization': 'org-1',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': true,
      'copilot.ingestCostCenters': true,
    });
    const logger = createLoggerMock();
    const day = '2026-05-12';

    db.getMissingDays.mockResolvedValue([]);
    db.getDaysMissingCostCenterAggregation.mockResolvedValue([day]);
    db.getUserMetricsForDay.mockResolvedValue([
      makeStoredUserMetric(day, {
        metrics_type: 'organization',
        entity_id: 'org-1',
        loc_added_sum: 15,
      }),
    ]);
    db.getUserBreakdownsForDay.mockResolvedValue([
      makeStoredUserBreakdown(1, 'octocat-user-1'),
    ]);
    api.fetchCostCenterMemberships.mockResolvedValue(
      makeCostCenterSnapshot(
        new Map([[1, { costCenterId: 'cc-1', login: 'octocat-user-1' }]]),
      ),
    );

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runBackfill(day, day, 'organization', 'org-1');

    expect(db.getDaysMissingCostCenterAggregation).toHaveBeenCalledWith(
      'organization',
      'org-1',
      day,
      day,
    );
    expect(db.getUserMetricsForDay).toHaveBeenCalledWith(
      'organization',
      'org-1',
      day,
    );
    expect(db.getUserTeamsForDay).not.toHaveBeenCalled();
    expect(api.fetchCostCenterMemberships).toHaveBeenCalledTimes(1);
    expect(api.fetchOrganizationUserReportLinks).not.toHaveBeenCalled();
    expect(db.replaceCostCenterAggregates).toHaveBeenCalledWith(
      day,
      'organization',
      'org-1',
      [expect.objectContaining({ user_id: 1, cost_center_id: 'cc-1' })],
      expect.objectContaining({
        dailyTotals: expect.arrayContaining([
          expect.objectContaining({ loc_added_sum: 15 }),
        ]),
      }),
      true,
    );
  });

  it('preserves existing cost-center data when the membership snapshot is incomplete', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': false,
      'copilot.ingestCostCenters': true,
    });
    const logger = createLoggerMock();
    const day = '2026-05-12';
    const persistedState = {
      memberships: [{ user_id: 4, cost_center_id: 'cc-previous' }],
      aggregates: [{ day, cost_center_id: 'cc-previous', active_users: 5 }],
    };
    const originalState = structuredClone(persistedState);

    db.getMissingDays.mockResolvedValue([]);
    db.getDaysMissingCostCenterAggregation.mockResolvedValue([day]);
    api.fetchCostCenterMemberships.mockResolvedValue(
      makeCostCenterSnapshot(
        new Map([[1, { costCenterId: 'cc-partial', login: 'octocat-user-1' }]]),
        ['An organization roster could not be resolved.'],
        false,
      ),
    );
    db.replaceCostCenterAggregates.mockImplementation(
      async (_day, _metricsType, _entityId, memberships, aggregates) => {
        persistedState.memberships = memberships;
        persistedState.aggregates = aggregates.dailyTotals;
      },
    );

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runBackfill(day, day, 'enterprise', 'ent-1');

    expect(persistedState).toEqual(originalState);
    expect(db.upsertCostCenters).not.toHaveBeenCalled();
    expect(db.replaceCostCenterAggregates).not.toHaveBeenCalled();
    expect(db.markCostCenterAggregationDone).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'preserving existing membership and aggregate data',
      ),
    );
  });

  it('marks a backfill day with an ingested but empty user report', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': false,
      'copilot.ingestCostCenters': true,
    });
    const logger = createLoggerMock();
    const day = '2026-05-12';

    db.getMissingDays.mockResolvedValue([]);
    db.getDaysMissingCostCenterAggregation.mockResolvedValue([day]);
    api.fetchCostCenterMemberships.mockResolvedValue(
      makeCostCenterSnapshot(new Map()),
    );
    db.getUserMetricsForDay.mockResolvedValue([]);

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runBackfill(day, day, 'enterprise', 'ent-1');

    expect(api.fetchEnterpriseUserReportLinks).not.toHaveBeenCalled();
    expect(api.downloadNdjsonDocument).not.toHaveBeenCalled();
    expect(db.replaceCostCenterAggregates).toHaveBeenCalledWith(
      day,
      'enterprise',
      'ent-1',
      [],
      expect.objectContaining({
        dailyTotals: [],
        byFeature: [],
      }),
      true,
    );
  });

  it('does not reprocess cost-center days after their marker is written', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': false,
      'copilot.ingestCostCenters': true,
    });
    const logger = createLoggerMock();
    const day = '2026-05-12';

    db.getMissingDays.mockResolvedValue([]);
    db.getDaysMissingCostCenterAggregation
      .mockResolvedValueOnce([day])
      .mockResolvedValueOnce([]);
    db.getUserMetricsForDay.mockResolvedValue([
      makeStoredUserMetric(day, { loc_added_sum: 15 }),
    ]);
    db.getUserBreakdownsForDay.mockResolvedValue([]);
    api.fetchCostCenterMemberships.mockResolvedValue(
      makeCostCenterSnapshot(
        new Map([[1, { costCenterId: 'cc-1', login: 'octocat-user-1' }]]),
      ),
    );

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runBackfill(day, day, 'enterprise', 'ent-1');
    await task.runBackfill(day, day, 'enterprise', 'ent-1');

    expect(api.fetchCostCenterMemberships).toHaveBeenCalledTimes(1);
    expect(db.getUserMetricsForDay).toHaveBeenCalledTimes(1);
    expect(db.replaceCostCenterAggregates).toHaveBeenCalledTimes(1);
    expect(db.markCostCenterAggregationDone).not.toHaveBeenCalled();
  });

  it('continues core ingestion and leaves cost-center days unmarked when listing fails', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillFromDate': '2026-05-10',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': false,
      'copilot.ingestCostCenters': true,
    });
    const logger = createLoggerMock();
    const day = '2026-05-10';

    db.getMissingDays.mockResolvedValue([day]);
    db.getDaysMissingCostCenterAggregation.mockResolvedValue([]);
    api.fetchCostCenterMemberships.mockRejectedValue(
      new Error('cost-center list failed'),
    );
    api.fetchEnterpriseReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/report.json'],
    });
    api.fetchEnterpriseUserReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/users.json'],
    });
    api.downloadDocument.mockResolvedValueOnce(makeEnterpriseDocument(day));
    api.downloadNdjsonDocument.mockResolvedValueOnce(
      makeUserMetricsDocument(day),
    );

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runAsync();

    expect(api.fetchEnterpriseReportLinks).toHaveBeenCalledWith(day);
    expect(api.fetchEnterpriseUserReportLinks).toHaveBeenCalledWith(day);
    expect(db.insertUserMetrics).toHaveBeenCalled();
    expect(db.upsertIngestionLog).toHaveBeenCalledWith(
      expect.objectContaining({ day, status: 'success' }),
    );
    expect(db.upsertCostCenters).not.toHaveBeenCalled();
    expect(db.replaceCostCenterAggregates).not.toHaveBeenCalled();
    expect(db.markCostCenterAggregationDone).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining(
        'Failed to load cost-center membership for enterprise:ent-1',
      ),
      expect.any(Error),
    );
  });

  it('does not replace cost-center data when a scheduled roster snapshot is incomplete', async () => {
    const db = createDbMock();
    const api = createApiMock();
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillFromDate': '2026-05-10',
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': false,
      'copilot.ingestCostCenters': true,
    });
    const logger = createLoggerMock();
    const day = '2026-05-10';
    const persistedState = {
      memberships: [{ user_id: 4, cost_center_id: 'cc-previous' }],
      aggregates: [{ day, cost_center_id: 'cc-previous', active_users: 5 }],
    };
    const originalState = structuredClone(persistedState);

    db.getMissingDays.mockResolvedValue([day]);
    db.getDaysMissingCostCenterAggregation.mockResolvedValue([]);
    api.fetchCostCenterMemberships.mockResolvedValue(
      makeCostCenterSnapshot(
        new Map([[1, { costCenterId: 'cc-partial', login: 'octocat-user-1' }]]),
        ['An organization roster could not be resolved.'],
        false,
      ),
    );
    api.fetchEnterpriseReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/report.json'],
    });
    api.fetchEnterpriseUserReportLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/users.json'],
    });
    api.downloadDocument.mockResolvedValueOnce(makeEnterpriseDocument(day));
    api.downloadNdjsonDocument.mockResolvedValueOnce(
      makeUserMetricsDocument(day),
    );
    db.replaceCostCenterAggregates.mockImplementation(
      async (_day, _metricsType, _entityId, memberships, aggregates) => {
        persistedState.memberships = memberships;
        persistedState.aggregates = aggregates.dailyTotals;
      },
    );

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runAsync();

    expect(db.insertUserMetrics).toHaveBeenCalled();
    expect(db.upsertIngestionLog).toHaveBeenCalledWith(
      expect.objectContaining({ day, status: 'success' }),
    );
    expect(persistedState).toEqual(originalState);
    expect(db.upsertCostCenters).not.toHaveBeenCalled();
    expect(db.replaceCostCenterAggregates).not.toHaveBeenCalled();
    expect(db.markCostCenterAggregationDone).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'preserving existing membership and aggregate data',
      ),
    );
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

  it.each([
    { status: 'partial', cached: true },
    { status: 'partial', cached: false },
    { status: 'error', cached: false },
  ])('retries $status (breakdowns: $cached)', async ({ status, cached }) => {
    const db = createDbMock();
    const api = createApiMock();
    const logger = createLoggerMock();
    const day = DateTime.utc().minus({ days: 5 }).toISODate()!;
    const config = createConfigMock({
      'copilot.enterprise': 'ent-1',
      'copilot.backfillFromDate': day,
      'copilot.backfillDelayMs': 0,
      'copilot.ingestTeams': true,
    });
    const userDocument = makeUserMetricsDocument(day);
    const storedUserMetric = {
      day,
      metrics_type: 'enterprise',
      entity_id: 'ent-1',
      user_id: 1,
      user_login: 'user-1',
      used_agent: true,
      used_chat: true,
      used_cli: false,
      used_vscode_agent: false,
      code_acceptance_activity_count: 3,
      code_generation_activity_count: 4,
      loc_added_sum: 10,
      loc_deleted_sum: 2,
      loc_suggested_to_add_sum: 12,
      loc_suggested_to_delete_sum: 3,
      user_initiated_interaction_count: 7,
      ai_credits_used: 5.5,
    };
    const storedBreakdown = {
      user_id: 1,
      user_login: 'user-1',
      byFeature: userDocument[0].totals_by_feature,
      byIde: userDocument[0].totals_by_ide,
      byLanguageFeature: [],
      byModelFeature: [],
      byLanguageModel: [],
      customizations: [],
    };

    db.getMissingDays
      .mockResolvedValueOnce([day])
      .mockResolvedValue(cached ? [] : [day]);
    db.getIngestionLog.mockResolvedValue([
      {
        day,
        metrics_type: 'enterprise',
        entity_id: 'ent-1',
        status,
        components_loaded: '["totals","users"]',
        source: 'scheduled',
      },
    ]);
    db.getUserMetricsForDay.mockResolvedValue([storedUserMetric]);
    db.getUserBreakdownsForDay.mockResolvedValue(
      cached ? [storedBreakdown] : [],
    );
    api.fetchEnterpriseUserReportLinks
      .mockResolvedValueOnce({ download_links: [] })
      .mockResolvedValue({
        download_links: ['https://downloads.github.com/users.json'],
      });
    api.fetchEnterpriseUserTeamsLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/user-teams.json'],
    });
    api.downloadNdjsonDocument.mockImplementation(async (url: string) =>
      url.endsWith('/users.json') ? userDocument : makeUserTeamsDocument(day),
    );

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runAsync();

    expect(db.insertDailyTotals).not.toHaveBeenCalled();
    expect(db.upsertIngestionLog).toHaveBeenLastCalledWith(
      expect.objectContaining({
        day,
        status: cached ? 'success' : 'partial',
        components_loaded: cached
          ? '["totals","users","teams"]'
          : '["totals","users"]',
      }),
    );
    await task.runAsync();

    expect(db.getUserMetricsForDay).toHaveBeenCalledWith(
      'enterprise',
      'ent-1',
      day,
    );
    expect(db.getUserBreakdownsForDay).toHaveBeenCalledWith(
      'enterprise',
      'ent-1',
      day,
    );
    expect(api.fetchEnterpriseReportLinks).not.toHaveBeenCalled();
    expect(api.fetchEnterpriseUserReportLinks).toHaveBeenCalledTimes(
      cached ? 0 : 2,
    );
    expect(db.insertUserMetricsByFeature).toHaveBeenCalledTimes(cached ? 0 : 1);
    expect(api.fetchEnterpriseUserTeamsLinks).toHaveBeenCalledWith(day);
    expect(db.replaceTeamAggregates).toHaveBeenCalledWith(
      day,
      'enterprise',
      'ent-1',
      [expect.objectContaining({ day, team_slug: 'platform' })],
      expect.objectContaining({
        dailyTotals: [expect.objectContaining({ day, team_slug: 'platform' })],
      }),
    );
    expect(db.upsertIngestionLog).toHaveBeenCalledWith(
      expect.objectContaining({
        day,
        status: 'success',
        components_loaded: '["totals","users","teams"]',
      }),
    );
  });

  it.each([
    { report: 'empty', userRows: [] },
    { report: 'invalid', userRows: [{}] },
  ])(
    'refetches $report user reports on partial team retries until user rows become available',
    async ({ userRows }) => {
      const db = createDbMock();
      const api = createApiMock();
      const logger = createLoggerMock();
      const day = DateTime.utc().minus({ days: 5 }).toISODate()!;
      const config = createConfigMock({
        'copilot.enterprise': 'ent-1',
        'copilot.backfillFromDate': day,
        'copilot.backfillDelayMs': 0,
        'copilot.ingestTeams': true,
      });

      db.getMissingDays.mockResolvedValue([day]);
      db.getIngestionLog.mockResolvedValueOnce([]).mockResolvedValue([
        {
          day,
          metrics_type: 'enterprise',
          entity_id: 'ent-1',
          status: 'partial',
          components_loaded: '["totals","users"]',
          source: 'scheduled',
        },
      ]);
      db.getUserMetricsForDay.mockResolvedValue([]);
      db.getUserBreakdownsForDay.mockResolvedValue([]);
      api.fetchEnterpriseReportLinks.mockResolvedValue({
        download_links: ['https://downloads.github.com/totals.json'],
      });
      api.downloadDocument.mockResolvedValue(makeEnterpriseDocument(day));
      api.fetchEnterpriseUserReportLinks.mockResolvedValue({
        download_links: ['https://downloads.github.com/users.json'],
      });
      api.fetchEnterpriseUserTeamsLinks.mockResolvedValue({
        download_links: ['https://downloads.github.com/user-teams.json'],
      });
      const userReports = [userRows, userRows, makeUserMetricsDocument(day)];
      api.downloadNdjsonDocument.mockImplementation(async (url: string) =>
        url.endsWith('/users.json')
          ? userReports.shift() ?? []
          : makeUserTeamsDocument(day),
      );

      const task = TaskManagementV2.create({
        db: db as unknown as DatabaseHandlerV2,
        api: api as unknown as GithubClientV2,
        config,
        logger,
      });

      for (const attempt of [1, 2]) {
        await task.runAsync();

        expect(api.fetchEnterpriseUserReportLinks).toHaveBeenCalledTimes(
          attempt,
        );
        expect(db.upsertIngestionLog).toHaveBeenLastCalledWith(
          expect.objectContaining({
            day,
            status: 'partial',
            components_loaded: '["totals","users"]',
            error_message: 'Missing components: teams',
          }),
        );
        expect(db.insertUserMetrics).toHaveBeenLastCalledWith([]);
        expect(db.insertDailyTotals).toHaveBeenCalledTimes(1);
      }

      await task.runAsync();

      expect(api.fetchEnterpriseReportLinks).toHaveBeenCalledTimes(1);
      expect(api.fetchEnterpriseUserReportLinks).toHaveBeenCalledTimes(3);
      expect(db.getUserMetricsForDay).toHaveBeenCalledTimes(2);
      expect(db.insertUserMetrics).toHaveBeenLastCalledWith([
        expect.objectContaining({ day, user_id: 1 }),
      ]);
      expect(db.replaceTeamAggregates).toHaveBeenLastCalledWith(
        day,
        'enterprise',
        'ent-1',
        [expect.objectContaining({ day, team_slug: 'platform' })],
        expect.objectContaining({
          dailyTotals: [
            expect.objectContaining({
              day,
              team_slug: 'platform',
              daily_active_users: 1,
              code_generation_activity_count: 4,
            }),
          ],
        }),
      );
      expect(db.upsertIngestionLog).toHaveBeenLastCalledWith(
        expect.objectContaining({
          day,
          status: 'success',
          components_loaded: '["totals","users","teams"]',
        }),
      );
      expect(logger.error).not.toHaveBeenCalled();
    },
  );

  it('persists per-user breakdown rows in addition to team aggregates when ingesting teams', async () => {
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
      download_links: ['https://downloads.github.com/users.json'],
    });
    api.fetchEnterpriseUserTeamsLinks.mockResolvedValue({
      download_links: ['https://downloads.github.com/user-teams.json'],
    });
    api.downloadDocument.mockResolvedValueOnce(
      makeEnterpriseDocument('2026-05-10'),
    );
    api.downloadNdjsonDocument.mockImplementation(async (url: string) => {
      if (url.includes('users.json')) {
        return makeUserMetricsDocument('2026-05-10');
      }
      return makeUserTeamsDocument('2026-05-10');
    });

    const task = TaskManagementV2.create({
      db: db as unknown as DatabaseHandlerV2,
      api: api as unknown as GithubClientV2,
      config,
      logger,
    });

    await task.runAsync();

    // Per-user breakdown rows are persisted, keyed by the resolved user.
    expect(db.insertUserMetricsByFeature).toHaveBeenCalledWith([
      expect.objectContaining({
        day: '2026-05-10',
        metrics_type: 'enterprise',
        entity_id: 'ent-1',
        user_id: 1,
        user_login: 'octocat',
        feature: 'chat_panel',
      }),
    ]);
    expect(db.insertUserMetricsByIde).toHaveBeenCalledWith([
      expect.objectContaining({
        user_id: 1,
        user_login: 'octocat',
        ide: 'vscode',
      }),
    ]);
    expect(db.replaceTeamAggregates).toHaveBeenCalledWith(
      '2026-05-10',
      'enterprise',
      'ent-1',
      expect.arrayContaining([
        expect.objectContaining({ team_slug: 'platform' }),
      ]),
      expect.objectContaining({
        dailyTotals: expect.arrayContaining([
          expect.objectContaining({ team_slug: 'platform' }),
        ]),
      }),
    );
    expect(db.upsertIngestionLog).toHaveBeenCalledWith(
      expect.objectContaining({ day: '2026-05-10', status: 'success' }),
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

it('ingestTotals returns partial status when downloaded document yields 0 parsed rows', async () => {
  // Regression test for: https://github.com/backstage/community-plugins/issues/9458
  // Before the fix, ingestTotals always returned true even when 0 rows were parsed,
  // causing the ingestion log to record status='success' and getMissingDays to
  // permanently skip those days on future runs.
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
  // Return a payload that is structurally valid (an object) but has no 'day' field,
  // so parseEnterpriseDocument produces 0 dailyTotals rows.
  api.downloadDocument.mockResolvedValueOnce({ not_a_day: 'malformed' });

  const task = TaskManagementV2.create({
    db: db as unknown as DatabaseHandlerV2,
    api: api as unknown as GithubClientV2,
    config,
    logger,
  });

  await task.runAsync();

  // Should NOT be logged as success — totals component was not loaded
  expect(db.upsertIngestionLog).toHaveBeenCalledWith(
    expect.objectContaining({
      day: '2026-05-10',
      metrics_type: 'enterprise',
      entity_id: 'ent-1',
      status: 'partial',
    }),
  );
  expect(db.upsertIngestionLog).not.toHaveBeenCalledWith(
    expect.objectContaining({ status: 'success' }),
  );
});

function makeCostCenterSnapshot(
  members: Map<number, { costCenterId: string; login: string }>,
  warnings: string[] = [],
  complete = true,
  unassignedComplete = true,
) {
  return {
    costCenters: [{ id: 'cc-1', name: 'Engineering' }],
    members,
    warnings,
    complete,
    unassignedComplete,
  };
}

function makeStoredUserMetric(
  day: string,
  overrides: Partial<V2UserMetricRow> = {},
): V2UserMetricRow {
  return {
    day,
    metrics_type: 'enterprise',
    entity_id: 'ent-1',
    user_id: 1,
    user_login: 'octocat-user-1',
    used_agent: false,
    used_chat: false,
    used_cli: false,
    used_vscode_agent: false,
    code_acceptance_activity_count: 3,
    code_generation_activity_count: 4,
    loc_added_sum: 10,
    loc_deleted_sum: 2,
    loc_suggested_to_add_sum: 12,
    loc_suggested_to_delete_sum: 3,
    user_initiated_interaction_count: 7,
    ...overrides,
  };
}

function makeStoredUserTeam(
  day: string,
  overrides: Partial<V2UserTeamRow> = {},
): V2UserTeamRow {
  return {
    day,
    metrics_type: 'enterprise',
    entity_id: 'ent-1',
    user_id: 1,
    user_login: 'octocat-user-1',
    team_id: 42,
    team_slug: 'platform',
    ...overrides,
  };
}

function makeStoredUserBreakdown(
  userId: number,
  userLogin: string,
): UserBreakdownData {
  return {
    user_id: userId,
    user_login: userLogin,
    byFeature: [
      {
        feature: 'chat_panel',
        user_initiated_interaction_count: 7,
        code_generation_activity_count: 4,
        code_acceptance_activity_count: 3,
        loc_added_sum: 10,
        loc_deleted_sum: 2,
        loc_suggested_to_add_sum: 12,
        loc_suggested_to_delete_sum: 3,
      },
    ],
    byIde: [],
    byLanguageFeature: [],
    byModelFeature: [],
    byLanguageModel: [],
    customizations: [],
  };
}

function createDbMock() {
  return {
    getMissingDays: jest.fn(),
    getDaysMissingCostCenterAggregation: jest.fn().mockResolvedValue([]),
    getDaysWithIncompleteCostCenterAggregation: jest.fn().mockResolvedValue([]),
    getIngestionLog: jest.fn().mockResolvedValue([]),
    insertDailyTotals: jest.fn().mockResolvedValue(undefined),
    insertPrMetrics: jest.fn().mockResolvedValue(undefined),
    insertByFeature: jest.fn().mockResolvedValue(undefined),
    insertByIde: jest.fn().mockResolvedValue(undefined),
    insertByLanguageFeature: jest.fn().mockResolvedValue(undefined),
    insertByModelFeature: jest.fn().mockResolvedValue(undefined),
    insertByLanguageModel: jest.fn().mockResolvedValue(undefined),
    insertByCli: jest.fn().mockResolvedValue(undefined),
    insertByVscodeAgent: jest.fn().mockResolvedValue(undefined),
    insertCustomizationMetrics: jest.fn().mockResolvedValue(undefined),
    insertCustomizationSummaries: jest.fn().mockResolvedValue(undefined),
    insertUserMetrics: jest.fn().mockResolvedValue(undefined),
    insertUserTeams: jest.fn().mockResolvedValue(undefined),
    insertUserMetricsByFeature: jest.fn().mockResolvedValue(undefined),
    insertUserMetricsByIde: jest.fn().mockResolvedValue(undefined),
    insertUserMetricsByLanguageFeature: jest.fn().mockResolvedValue(undefined),
    insertUserMetricsByModelFeature: jest.fn().mockResolvedValue(undefined),
    insertUserMetricsByLanguageModel: jest.fn().mockResolvedValue(undefined),
    getUserMetricsForDay: jest.fn().mockResolvedValue([]),
    getUserBreakdownsForDay: jest.fn().mockResolvedValue([]),
    getUserTeamsForDay: jest.fn().mockResolvedValue([]),
    replaceTeamAggregates: jest.fn().mockResolvedValue(undefined),
    upsertCostCenters: jest.fn().mockResolvedValue(undefined),
    upsertUserCostCenters: jest.fn().mockResolvedValue(undefined),
    markCostCenterAggregationDone: jest.fn().mockResolvedValue(undefined),
    replaceCostCenterAggregates: jest.fn().mockResolvedValue(undefined),
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
    fetchCostCenterMemberships: jest.fn(),
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
          totals_by_vscode_agent: {
            session_count: 2,
            total_user_messages: 8,
          },
        },
      ],
    },
  ];
}

function makeUserMetricsDocument(day: string) {
  return [
    {
      user_id: 1,
      user_login: 'octocat',
      day,
      enterprise_id: 'ent-1',
      used_agent: true,
      used_chat: true,
      used_cli: false,
      code_acceptance_activity_count: 3,
      code_generation_activity_count: 4,
      loc_added_sum: 10,
      loc_deleted_sum: 2,
      loc_suggested_to_add_sum: 12,
      loc_suggested_to_delete_sum: 3,
      user_initiated_interaction_count: 7,
      ai_credits_used: 5.5,
      totals_by_feature: [
        {
          feature: 'chat_panel',
          user_initiated_interaction_count: 7,
          code_generation_activity_count: 4,
          code_acceptance_activity_count: 3,
          loc_added_sum: 10,
          loc_deleted_sum: 2,
          loc_suggested_to_add_sum: 12,
          loc_suggested_to_delete_sum: 3,
        },
      ],
      totals_by_ide: [
        {
          ide: 'vscode',
          user_initiated_interaction_count: 7,
          code_generation_activity_count: 4,
          code_acceptance_activity_count: 3,
          loc_added_sum: 10,
          loc_deleted_sum: 2,
          loc_suggested_to_add_sum: 12,
          loc_suggested_to_delete_sum: 3,
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
