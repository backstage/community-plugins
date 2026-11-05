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

import { TestDatabaseId, TestDatabases } from '@backstage/backend-test-utils';
import { Knex } from 'knex';
import {
  V2DailyTotal,
  V2CustomizationMetricRow,
  V2CustomizationSummaryRow,
  V2IngestionLogRow,
  V2UserMetricRow,
  V2UserCostCenterRow,
  V2UserMetricsByFeatureRow,
  V2UserMetricsByIdeRow,
  V2UserMetricsByLanguageFeatureRow,
  V2UserMetricsByModelFeatureRow,
  V2UserMetricsByLanguageModelRow,
  V2UserTeamRow,
} from '@backstage-community/plugin-copilot-common';
import { migrationsDir } from './DatabaseHandler';
import type { CostCenterAggregateRows } from './DatabaseHandlerV2';
import { DatabaseHandlerV2 } from './DatabaseHandlerV2';

const costCenterMigration = jest.requireActual<{
  up(knex: Knex): Promise<void>;
  down(knex: Knex): Promise<void>;
}>('../../migrations/202611020000_add_cost_centers.js');

jest.setTimeout(60_000);

const costCenterAggregateUniqueColumns: Record<string, string[]> = {
  copilot_daily_totals: ['day', 'metrics_type', 'entity_id', 'team_slug'],
  copilot_pr_metrics: ['day', 'metrics_type', 'entity_id', 'team_slug'],
  copilot_metrics_by_feature: [
    'day',
    'metrics_type',
    'entity_id',
    'team_slug',
    'feature',
  ],
  copilot_metrics_by_ide: [
    'day',
    'metrics_type',
    'entity_id',
    'team_slug',
    'ide',
  ],
  copilot_metrics_by_language_feature: [
    'day',
    'metrics_type',
    'entity_id',
    'team_slug',
    'language',
    'feature',
  ],
  copilot_metrics_by_model_feature: [
    'day',
    'metrics_type',
    'entity_id',
    'team_slug',
    'model_id',
    'feature',
  ],
  copilot_metrics_by_language_model: [
    'day',
    'metrics_type',
    'entity_id',
    'team_slug',
    'language',
    'model_id',
  ],
  copilot_metrics_by_cli: ['day', 'metrics_type', 'entity_id', 'team_slug'],
  copilot_metrics_by_vscode_agent: [
    'day',
    'metrics_type',
    'entity_id',
    'team_slug',
  ],
};

const costCenterAggregateTables = Object.keys(costCenterAggregateUniqueColumns);

async function createLegacyAggregateSchema(knex: Knex): Promise<void> {
  for (const [tableName, uniqueColumns] of Object.entries(
    costCenterAggregateUniqueColumns,
  )) {
    await knex.schema.createTable(tableName, table => {
      table.increments('id').primary();
      table.date('day').notNullable();
      table.string('metrics_type', 64).notNullable();
      table.string('entity_id', 64).notNullable();
      table.string('team_slug', 64).notNullable().defaultTo('');

      for (const column of uniqueColumns.slice(4)) {
        table.string(column, 64).notNullable();
      }

      if (knex.client.config.client === 'mysql2') {
        table.unique(
          uniqueColumns,
          `uq_legacy_${tableName.replace(/^copilot_/, '')}`,
        );
      } else {
        table.unique(uniqueColumns);
      }
    });

    await knex.schema.alterTable(tableName, table => {
      table.index(
        ['metrics_type', 'entity_id', 'team_slug', 'day'],
        `idx_${tableName}_type_entity_team_day`,
      );
    });
  }
}

describe('DatabaseHandlerV2', () => {
  const databases = TestDatabases.create();

  async function createDatabase(databaseId: TestDatabaseId) {
    const knex = await databases.init(databaseId);
    await knex.migrate.latest({ directory: migrationsDir });
    return knex;
  }

  describe.each(databases.eachSupportedId())('database: %s', databaseId => {
    let knex: Knex;
    let handler: DatabaseHandlerV2;

    if (databaseId.startsWith('MYSQL')) {
      it('adds and reverses the cost-center migration on MySQL', async () => {
        const mysqlKnex = await databases.init(databaseId);

        try {
          await createLegacyAggregateSchema(mysqlKnex);
          await costCenterMigration.up(mysqlKnex);

          await mysqlKnex('copilot_daily_totals').insert([
            {
              day: '2026-05-01',
              metrics_type: 'organization',
              entity_id: 'org-1',
              team_slug: '',
              cost_center_id: '',
            },
            {
              day: '2026-05-01',
              metrics_type: 'organization',
              entity_id: 'org-1',
              team_slug: '',
              cost_center_id: 'cc-a',
            },
            {
              day: '2026-05-01',
              metrics_type: 'organization',
              entity_id: 'org-1',
              team_slug: '',
              cost_center_id: 'cc-b',
            },
          ]);

          await costCenterMigration.down(mysqlKnex);

          for (const tableName of costCenterAggregateTables) {
            expect(
              await mysqlKnex.schema.hasColumn(tableName, 'cost_center_id'),
            ).toBe(false);
          }
          expect(await mysqlKnex.schema.hasTable('copilot_cost_centers')).toBe(
            false,
          );
          expect(
            await mysqlKnex.schema.hasTable('copilot_user_cost_centers'),
          ).toBe(false);
          expect(
            await mysqlKnex.schema.hasTable(
              'copilot_cost_center_aggregation_log',
            ),
          ).toBe(false);
          expect(
            await mysqlKnex.schema.hasTable(
              'copilot_customization_metrics_by_cost_center',
            ),
          ).toBe(false);
          const rows = await mysqlKnex('copilot_daily_totals').select('*');
          expect(rows).toHaveLength(1);
          expect(rows[0]).not.toHaveProperty('cost_center_id');
        } finally {
          await mysqlKnex.destroy();
        }
      });
      return;
    }

    beforeEach(async () => {
      knex = await createDatabase(databaseId);
      handler = await DatabaseHandlerV2.create({
        database: {
          getClient: async () => knex,
          migrations: { skip: true },
        } as any,
      });
    });

    afterEach(async () => {
      await knex?.destroy();
    });

    it('re-ingests incomplete reports from the customization availability date', async () => {
      await knex('copilot_ingestion_log').insert([
        buildIngestionLog({
          day: '2026-10-21',
          status: 'partial',
          components_loaded: '["totals","users"]',
        }),
        buildIngestionLog({
          day: '2026-10-22',
          status: 'partial',
          components_loaded: '["totals","users"]',
        }),
        buildIngestionLog({
          day: '2026-10-23',
          status: 'error',
          components_loaded: '["totals","users","teams"]',
        }),
        buildIngestionLog({
          day: '2026-10-24',
          status: 'success',
          components_loaded: '["totals","users","teams"]',
        }),
      ]);

      const migration = jest.requireActual(
        '../../migrations/202611040000_reingest_partial_customization_days',
      ) as { up: (database: Knex) => Promise<void> };
      await migration.up(knex);

      const logs = await handler.getIngestionLog('organization', 'org-1');
      expect(logs.map(({ day, status }) => ({ day, status }))).toEqual([
        { day: '2026-10-21', status: 'partial' },
        { day: '2026-10-24', status: 'success' },
      ]);
      await expect(
        handler.getMissingDays(
          'organization',
          'org-1',
          '2026-10-22',
          '2026-10-23',
          ['totals', 'users', 'teams'],
        ),
      ).resolves.toEqual(['2026-10-22', '2026-10-23']);
    });
    it('adds and reverses the cost-center schema migration', async () => {
      await costCenterMigration.down(knex);

      for (const tableName of costCenterAggregateTables) {
        expect(await knex.schema.hasColumn(tableName, 'cost_center_id')).toBe(
          false,
        );
        expect(
          await knex.schema.hasColumn(tableName, 'without_cost_center'),
        ).toBe(false);
      }
      await expect(knex.schema.hasTable('copilot_cost_centers')).resolves.toBe(
        false,
      );
      await expect(
        knex.schema.hasTable('copilot_user_cost_centers'),
      ).resolves.toBe(false);
      await expect(
        knex.schema.hasTable('copilot_cost_center_aggregation_log'),
      ).resolves.toBe(false);

      await costCenterMigration.up(knex);

      for (const tableName of costCenterAggregateTables) {
        expect(await knex.schema.hasColumn(tableName, 'cost_center_id')).toBe(
          true,
        );
        expect(
          await knex.schema.hasColumn(tableName, 'without_cost_center'),
        ).toBe(true);
      }
      expect(
        await knex.schema.hasColumn('copilot_cost_centers', 'metrics_type'),
      ).toBe(true);
      expect(
        await knex.schema.hasColumn(
          'copilot_cost_center_aggregation_log',
          'unassigned_complete',
        ),
      ).toBe(true);

      await handler.insertDailyTotals([
        buildDailyTotal({ cost_center_id: 'cc-a' }),
        buildDailyTotal({ cost_center_id: 'cc-b' }),
      ]);
      const rows = await knex('copilot_daily_totals').where({
        day: '2026-05-01',
        metrics_type: 'organization',
        entity_id: 'org-1',
        team_slug: '',
      });
      expect(rows).toHaveLength(2);
    });

    it('preserves legacy aggregate rows and merges them after migration', async () => {
      await costCenterMigration.down(knex);
      await knex('copilot_daily_totals').insert(
        buildDailyTotal({
          day: '2026-05-09',
          total_ai_credits_used: 3,
          daily_active_vscode_agent_users: 7,
        }),
      );

      await costCenterMigration.up(knex);
      const migratedRows = await knex('copilot_daily_totals').where({
        day: '2026-05-09',
        metrics_type: 'organization',
        entity_id: 'org-1',
        team_slug: '',
      });
      expect(migratedRows).toHaveLength(1);
      expect(migratedRows[0].cost_center_id).toBe('');

      await handler.insertDailyTotals([
        buildDailyTotal({
          day: '2026-05-09',
          total_ai_credits_used: 9,
          daily_active_vscode_agent_users: 11,
        }),
      ]);

      const mergedRows = await knex('copilot_daily_totals').where({
        day: '2026-05-09',
        metrics_type: 'organization',
        entity_id: 'org-1',
        team_slug: '',
        cost_center_id: '',
      });
      expect(mergedRows).toHaveLength(1);
      expect(mergedRows[0].total_ai_credits_used).toBe(9);
      expect(mergedRows[0].daily_active_vscode_agent_users).toBe(11);

      await knex('copilot_daily_totals').insert({
        ...buildDailyTotal({
          day: '2026-05-09',
          team_slug: '',
          cost_center_id: '',
          daily_active_users: 4,
        }),
        without_cost_center: true,
      });
      await costCenterMigration.down(knex);
      const rolledBackRows = await knex('copilot_daily_totals').where({
        day: '2026-05-09',
        metrics_type: 'organization',
        entity_id: 'org-1',
        team_slug: '',
      });
      expect(rolledBackRows).toHaveLength(1);
      expect(rolledBackRows[0]).not.toHaveProperty('cost_center_id');
      expect(rolledBackRows[0]).not.toHaveProperty('without_cost_center');
      expect(rolledBackRows[0].total_ai_credits_used).toBe(9);
    });

    it('getMissingDays returns all days when ingestion log is empty', async () => {
      const result = await handler.getMissingDays(
        'organization',
        'org-1',
        '2026-05-01',
        '2026-05-03',
      );

      expect(result).toEqual(['2026-05-01', '2026-05-02', '2026-05-03']);
    });

    it('getMissingDays skips successful days and returns remaining days', async () => {
      await handler.upsertIngestionLog(
        buildIngestionLog({ day: '2026-05-01', status: 'success' }),
      );
      await handler.upsertIngestionLog(
        buildIngestionLog({ day: '2026-05-03', status: 'success' }),
      );

      const result = await handler.getMissingDays(
        'organization',
        'org-1',
        '2026-05-01',
        '2026-05-03',
      );

      expect(result).toEqual(['2026-05-02']);
    });

    it('getMissingDays returns empty array when all days are successful', async () => {
      await handler.upsertIngestionLog(
        buildIngestionLog({ day: '2026-05-01', status: 'success' }),
      );
      await handler.upsertIngestionLog(
        buildIngestionLog({ day: '2026-05-02', status: 'success' }),
      );
      await handler.upsertIngestionLog(
        buildIngestionLog({ day: '2026-05-03', status: 'success' }),
      );

      const result = await handler.getMissingDays(
        'organization',
        'org-1',
        '2026-05-01',
        '2026-05-03',
      );

      expect(result).toEqual([]);
    });

    it('getMissingDays does not skip error days missing required components', async () => {
      await handler.upsertIngestionLog(
        buildIngestionLog({ day: '2026-05-01', status: 'success' }),
      );
      await handler.upsertIngestionLog(
        buildIngestionLog({
          day: '2026-05-02',
          status: 'error',
          components_loaded: '[]',
        }),
      );

      const result = await handler.getMissingDays(
        'organization',
        'org-1',
        '2026-05-01',
        '2026-05-03',
      );

      expect(result).toEqual(['2026-05-02', '2026-05-03']);
    });

    it('does not retry components already loaded before a later error', async () => {
      await knex('copilot_ingestion_log').insert(
        buildIngestionLog({
          day: '2026-05-02',
          status: 'error',
          components_loaded: '["totals"]',
        }),
      );

      await expect(
        handler.getMissingDays(
          'organization',
          'org-1',
          '2026-05-02',
          '2026-05-02',
          ['totals'],
        ),
      ).resolves.toEqual([]);
      await expect(
        handler.getMissingDays(
          'organization',
          'org-1',
          '2026-05-02',
          '2026-05-02',
          ['totals', 'users'],
        ),
      ).resolves.toEqual(['2026-05-02']);
    });

    it('getMissingDays only skips success rows with all required components', async () => {
      await handler.upsertIngestionLog(
        buildIngestionLog({
          day: '2026-05-01',
          status: 'success',
          components_loaded: '["totals"]',
        }),
      );
      await handler.upsertIngestionLog(
        buildIngestionLog({
          day: '2026-05-02',
          status: 'success',
          components_loaded: '["totals","users","teams"]',
        }),
      );

      const result = await handler.getMissingDays(
        'organization',
        'org-1',
        '2026-05-01',
        '2026-05-03',
        ['totals', 'users', 'teams'],
      );

      expect(result).toEqual(['2026-05-01', '2026-05-03']);
    });

    it('upsertIngestionLog inserts a new row', async () => {
      await handler.upsertIngestionLog(
        buildIngestionLog({
          day: '2026-05-10',
          status: 'success',
          components_loaded: '["totals","users"]',
        }),
      );

      const logs = await handler.getIngestionLog('organization', 'org-1');
      expect(logs).toHaveLength(1);
      expect(typeof logs[0].day).toBe('string');
      expect(logs[0].day).toBe('2026-05-10');
      expect(logs[0].status).toBe('success');
      expect(logs[0].components_loaded).toBe('["totals","users"]');
    });

    it('upsertIngestionLog updates existing row on conflict', async () => {
      await handler.upsertIngestionLog(
        buildIngestionLog({
          day: '2026-05-11',
          status: 'success',
          components_loaded: '["totals"]',
        }),
      );

      await handler.upsertIngestionLog(
        buildIngestionLog({
          day: '2026-05-11',
          status: 'error',
          components_loaded: '[]',
          error_message: 'download failed',
          source: 'backfill',
        }),
      );

      const logs = await handler.getIngestionLog('organization', 'org-1');
      expect(logs).toHaveLength(1);
      expect(logs[0].status).toBe('success');
      expect(logs[0].components_loaded).toBe('["totals"]');
      expect(logs[0].error_message).toBe('download failed');
      expect(logs[0].source).toBe('backfill');
      await expect(
        handler.getMissingDays(
          'organization',
          'org-1',
          '2026-05-11',
          '2026-05-11',
          ['totals'],
        ),
      ).resolves.toEqual([]);
      await expect(
        handler.getMissingDays(
          'organization',
          'org-1',
          '2026-05-11',
          '2026-05-11',
          ['totals', 'users'],
        ),
      ).resolves.toEqual(['2026-05-11']);
    });

    it('tracks cost-center aggregation idempotently and reads back a day for backfill', async () => {
      await handler.insertUserMetrics([
        buildUserMetric({
          day: '2026-05-01',
          user_id: 1,
          user_login: 'octocat',
        }),
        buildUserMetric({
          day: '2026-05-02',
          user_id: 2,
          user_login: 'octodog',
        }),
      ]);
      await handler.insertUserMetricsByFeature([
        buildUserMetricsByFeature({
          day: '2026-05-01',
          user_id: 1,
          user_login: 'octocat',
        }),
      ]);
      await handler.insertUserMetricsByIde([
        buildUserMetricsByIde({
          day: '2026-05-01',
          user_id: 1,
          user_login: 'octocat',
        }),
      ]);
      await handler.insertUserMetricsByLanguageFeature([
        buildUserMetricsByLanguageFeature({
          day: '2026-05-01',
          user_id: 1,
          user_login: 'octocat',
        }),
      ]);
      await handler.insertUserMetricsByModelFeature([
        buildUserMetricsByModelFeature({
          day: '2026-05-01',
          user_id: 1,
          user_login: 'octocat',
        }),
      ]);
      await handler.insertUserMetricsByLanguageModel([
        buildUserMetricsByLanguageModel({
          day: '2026-05-01',
          user_id: 1,
          user_login: 'octocat',
        }),
      ]);
      await handler.insertUserTeams([
        buildUserTeam({
          day: '2026-05-01',
          user_id: 1,
          user_login: 'octocat',
          team_slug: 'alpha',
        }),
      ]);

      await expect(
        handler.getDaysMissingCostCenterAggregation(
          'organization',
          'org-1',
          '2026-05-01',
          '2026-05-03',
        ),
      ).resolves.toEqual(['2026-05-01', '2026-05-02']);
      await handler.markCostCenterAggregationDone(
        '2026-05-01',
        'organization',
        'org-1',
      );
      await handler.markCostCenterAggregationDone(
        '2026-05-01',
        'organization',
        'org-1',
      );

      const [metric] = await handler.getUserMetricsForDay(
        'organization',
        'org-1',
        '2026-05-01',
      );
      const [breakdown] = await handler.getUserBreakdownsForDay(
        'organization',
        'org-1',
        '2026-05-01',
      );
      const teams = await knex('copilot_user_teams')
        .where({
          day: '2026-05-01',
          metrics_type: 'organization',
          entity_id: 'org-1',
        })
        .select('*');

      expect(metric).toEqual(
        expect.objectContaining({
          day: '2026-05-01',
          user_id: 1,
          user_login: 'octocat',
        }),
      );
      expect(breakdown).toEqual(
        expect.objectContaining({
          user_id: 1,
          user_login: 'octocat',
          byFeature: [expect.objectContaining({ feature: 'chat_panel' })],
          byIde: [expect.objectContaining({ ide: 'vscode' })],
          byLanguageFeature: [
            expect.objectContaining({
              language: 'typescript',
              feature: 'chat_panel',
            }),
          ],
          byModelFeature: [
            expect.objectContaining({
              model_id: 'gpt-4o',
              feature: 'chat_panel',
            }),
          ],
          byLanguageModel: [
            expect.objectContaining({
              language: 'typescript',
              model_id: 'gpt-4o',
            }),
          ],
        }),
      );
      expect(teams).toHaveLength(1);
      expect(teams[0].team_slug).toBe('alpha');
      expect(Number(teams[0].user_id)).toBe(1);
      expect(
        await knex('copilot_cost_center_aggregation_log').where({
          day: '2026-05-01',
          metrics_type: 'organization',
          entity_id: 'org-1',
        }),
      ).toHaveLength(1);
      await expect(
        handler.getDaysMissingCostCenterAggregation(
          'organization',
          'org-1',
          '2026-05-01',
          '2026-05-03',
        ),
      ).resolves.toEqual(['2026-05-02']);

      await handler.markCostCenterAggregationDone(
        '2026-05-02',
        'organization',
        'org-1',
      );
      await expect(
        handler.getDaysMissingCostCenterAggregation(
          'organization',
          'org-1',
          '2026-05-01',
          '2026-05-03',
        ),
      ).resolves.toEqual([]);
    });

    it('includes successfully ingested empty user reports in cost-center backfills', async () => {
      await handler.upsertIngestionLog(
        buildIngestionLog({
          day: '2026-05-03',
          components_loaded: '["totals","users"]',
        }),
      );
      await handler.upsertIngestionLog(
        buildIngestionLog({
          day: '2026-05-04',
          components_loaded: '["totals"]',
        }),
      );

      await expect(
        handler.getDaysMissingCostCenterAggregation(
          'organization',
          'org-1',
          '2026-05-03',
          '2026-05-04',
        ),
      ).resolves.toEqual(['2026-05-03']);
    });

    it('requeues refreshed days without hiding their previous unassigned aggregates', async () => {
      const day = '2026-05-05';
      await handler.insertUserMetrics([buildUserMetric({ day })]);
      await knex('copilot_daily_totals').insert({
        ...buildDailyTotal({ day, cost_center_id: '' }),
        without_cost_center: true,
      });
      await handler.markCostCenterAggregationDone(day, 'organization', 'org-1');
      await handler.markCostCenterAggregationDone(day, 'organization', 'org-2');
      await handler.markCostCenterAggregationDone(day, 'enterprise', 'org-1');
      await handler.markCostCenterAggregationDone(
        '2026-05-06',
        'organization',
        'org-1',
      );
      await handler.markCostCenterAggregationPending(
        day,
        'organization',
        'org-1',
      );
      await handler.markCostCenterAggregationPending(
        '2026-05-07',
        'organization',
        'org-1',
      );

      const pendingRows = await knex(
        'copilot_cost_center_aggregation_log',
      ).where('needs_reaggregation', true);
      expect(pendingRows).toHaveLength(1);
      await expect(
        knex('copilot_cost_center_aggregation_log').where({
          day,
          metrics_type: 'organization',
          entity_id: 'org-1',
          needs_reaggregation: true,
        }),
      ).resolves.toHaveLength(1);
      await expect(
        knex('copilot_cost_center_aggregation_log').where({
          day: '2026-05-07',
        }),
      ).resolves.toEqual([]);
      await expect(
        handler.getDaysMissingCostCenterAggregation(
          'organization',
          'org-1',
          day,
          day,
        ),
      ).resolves.toEqual([day]);
      await expect(
        handler.getDaysMissingCostCenterAggregation(
          'organization',
          'org-1',
          '2026-05-06',
          '2026-05-06',
        ),
      ).resolves.toEqual([]);
      await expect(
        handler.getDailyTotals('organization', 'org-1', day, day, undefined, {
          kind: 'noCostCenter',
        }),
      ).resolves.toHaveLength(1);
      await expect(
        handler.getCostCenters('organization', 'org-1', day, day, 1),
      ).resolves.toEqual({ costCenters: [], hasUsersWithoutCostCenter: true });

      await handler.markCostCenterAggregationDone(day, 'organization', 'org-1');
      await expect(
        handler.getDaysMissingCostCenterAggregation(
          'organization',
          'org-1',
          day,
          day,
        ),
      ).resolves.toEqual([]);
      await expect(
        knex('copilot_cost_center_aggregation_log').where(
          'needs_reaggregation',
          true,
        ),
      ).resolves.toEqual([]);
    });

    it('requeues only days marked with an incomplete unassigned snapshot', async () => {
      const day = '2026-05-05';
      await handler.insertUserMetrics([
        buildUserMetric({ day, user_id: 1, user_login: 'octocat' }),
      ]);
      await handler.markCostCenterAggregationDone(
        day,
        'organization',
        'org-1',
        false,
      );

      await expect(
        handler.getDaysMissingCostCenterAggregation(
          'organization',
          'org-1',
          day,
          day,
        ),
      ).resolves.toEqual([]);
      await expect(
        handler.getDaysWithIncompleteCostCenterAggregation(
          'organization',
          'org-1',
          day,
          day,
        ),
      ).resolves.toEqual([day]);

      await handler.markCostCenterAggregationDone(day, 'organization', 'org-1');
      await expect(
        handler.getDaysWithIncompleteCostCenterAggregation(
          'organization',
          'org-1',
          day,
          day,
        ),
      ).resolves.toEqual([]);
    });

    it('atomically replaces memberships and all scoped aggregates when a snapshot changes', async () => {
      const day = '2026-05-10';
      const scope = {
        day,
        metrics_type: 'enterprise' as const,
        entity_id: 'ent-1',
      };
      const memberships = (costCenterForUserSix: string) =>
        Array.from({ length: 6 }, (_, index) => ({
          ...scope,
          user_id: index + 1,
          user_login: `user-${index + 1}`,
          cost_center_id: index === 5 ? costCenterForUserSix : 'cc-a',
        }));

      await handler.insertDailyTotals([
        buildDailyTotal({
          ...scope,
          team_slug: '',
          cost_center_id: '',
          daily_active_users: 88,
        }),
        buildDailyTotal({
          ...scope,
          team_slug: 'alpha',
          cost_center_id: '',
          daily_active_users: 99,
        }),
      ]);

      const firstGroups = makeCostCenterAggregateRows(day, [
        { costCenterId: 'cc-a', teamSlug: '', activeUsers: 6, locAdded: 60 },
      ]);
      await handler.replaceCostCenterAggregates(
        day,
        'enterprise',
        'ent-1',
        memberships('cc-a'),
        firstGroups,
      );

      const updatedGroups = makeCostCenterAggregateRows(day, [
        { costCenterId: 'cc-a', teamSlug: '', activeUsers: 5, locAdded: 50 },
        { costCenterId: 'cc-b', teamSlug: '', activeUsers: 1, locAdded: 10 },
      ]);
      await handler.markCostCenterAggregationPending(
        day,
        'enterprise',
        'ent-1',
      );
      await handler.replaceCostCenterAggregates(
        day,
        'enterprise',
        'ent-1',
        memberships('cc-b'),
        updatedGroups,
      );
      await expect(
        knex('copilot_cost_center_aggregation_log')
          .where(scope)
          .where('needs_reaggregation', true),
      ).resolves.toEqual([]);

      const membershipRows = await knex('copilot_user_cost_centers').where(
        scope,
      );
      expect(membershipRows).toHaveLength(6);
      expect(
        membershipRows.filter(row => row.cost_center_id === 'cc-a'),
      ).toHaveLength(5);
      expect(
        membershipRows.find(row => Number(row.user_id) === 6)?.cost_center_id,
      ).toBe('cc-b');

      const costCenterA = await knex('copilot_daily_totals')
        .where({ ...scope, team_slug: '', cost_center_id: 'cc-a' })
        .first();
      expect(costCenterA.daily_active_users).toBe(5);
      expect(costCenterA.loc_added_sum).toBe(50);

      for (const tableName of costCenterAggregateTables) {
        await expect(
          knex(tableName).where({ ...scope, cost_center_id: 'cc-a' }),
        ).resolves.toEqual(
          expect.arrayContaining([expect.objectContaining({ team_slug: '' })]),
        );
      }

      const unscopedRows = await knex('copilot_daily_totals')
        .where(scope)
        .where('cost_center_id', '')
        .orderBy('team_slug', 'asc');
      expect(unscopedRows).toHaveLength(2);
      expect(unscopedRows.map(row => row.daily_active_users)).toEqual([88, 99]);
      await expect(
        knex('copilot_cost_center_aggregation_log').where(scope),
      ).resolves.toHaveLength(1);
    });

    it('serves unassigned users from the explicit no-cost-center scope', async () => {
      const day = '2026-05-10';
      const metricScope = {
        day,
        metrics_type: 'enterprise' as const,
        entity_id: 'ent-1',
      };
      const aggregateScope = { ...metricScope, team_slug: '' };
      await handler.insertUserMetrics(
        Array.from({ length: 10 }, (_, index) =>
          buildUserMetric({
            ...metricScope,
            user_id: index + 1,
            user_login: `user-${index + 1}`,
            used_agent: index < 5,
          }),
        ),
      );
      const assignedMemberships = Array.from({ length: 5 }, (_, index) => ({
        ...metricScope,
        user_id: index + 6,
        user_login: `user-${index + 6}`,
        cost_center_id: 'cc-a',
      }));
      const assignedTotals = buildDailyTotal({
        ...aggregateScope,
        cost_center_id: 'cc-a',
        daily_active_users: 5,
        loc_added_sum: 50,
      });
      const unassignedTotals = {
        ...buildDailyTotal({
          ...aggregateScope,
          cost_center_id: '',
          daily_active_users: 5,
          loc_added_sum: 50,
        }),
        without_cost_center: true,
      };
      const assignedFeature = {
        ...aggregateScope,
        cost_center_id: 'cc-a',
        feature: 'chat_panel',
        code_acceptance_activity_count: 5,
        code_generation_activity_count: 5,
        loc_added_sum: 50,
        loc_deleted_sum: 0,
        loc_suggested_to_add_sum: 0,
        loc_suggested_to_delete_sum: 0,
        user_initiated_interaction_count: 5,
      };
      const unassignedFeature = {
        ...assignedFeature,
        cost_center_id: '',
        without_cost_center: true,
      };
      const assignedCustomization = {
        ...metricScope,
        cost_center_id: 'cc-a',
        category: 'skill',
        item_name: 'assigned-skill',
        interaction_count: 7,
      };
      const unassignedCustomization = {
        ...assignedCustomization,
        cost_center_id: '',
        without_cost_center: true,
        item_name: 'unassigned-skill',
        interaction_count: 3,
      };

      await handler.replaceCostCenterAggregates(
        day,
        'enterprise',
        'ent-1',
        assignedMemberships,
        {
          dailyTotals: [assignedTotals, unassignedTotals],
          prMetrics: [],
          byFeature: [assignedFeature, unassignedFeature],
          byIde: [],
          byLanguageFeature: [],
          byModelFeature: [],
          byLanguageModel: [],
          byCli: [],
          byVscodeAgent: [],
          customizationMetrics: [
            assignedCustomization,
            unassignedCustomization,
          ],
        },
      );

      const noCostCenterDashboard = await handler.getDashboardData(
        'enterprise',
        'ent-1',
        day,
        day,
        undefined,
        { kind: 'noCostCenter' },
      );
      const assignedDashboard = await handler.getDashboardData(
        'enterprise',
        'ent-1',
        day,
        day,
        undefined,
        { kind: 'costCenter', id: 'cc-a' },
      );

      expect(noCostCenterDashboard.daily).toHaveLength(1);
      expect(
        noCostCenterDashboard.daily[0].weekly_active_users,
      ).toBeUndefined();
      expect(noCostCenterDashboard.daily[0]).not.toHaveProperty(
        'without_cost_center',
      );
      expect(noCostCenterDashboard.byFeature).toHaveLength(1);
      expect(noCostCenterDashboard.prMetrics).toEqual([]);
      expect(noCostCenterDashboard.customizationMetrics).toEqual([
        expect.objectContaining({
          category: 'skill',
          item_name: 'unassigned-skill',
          interaction_count: 3,
        }),
      ]);
      expect(assignedDashboard.daily).toHaveLength(1);
      expect(assignedDashboard.byFeature).toHaveLength(1);
      expect(assignedDashboard.customizationMetrics).toEqual([
        expect.objectContaining({
          category: 'skill',
          item_name: 'assigned-skill',
          interaction_count: 7,
        }),
      ]);
      await expect(
        handler.getPeriodRange('enterprise', 'ent-1', {
          kind: 'noCostCenter',
        }),
      ).resolves.toEqual({ minDate: day, maxDate: day });
    });

    it('treats a real cost center named __none__ as an ordinary filterable center', async () => {
      const day = '2026-05-11';
      const metricScope = {
        day,
        metrics_type: 'organization' as const,
        entity_id: 'org-1',
      };
      const aggregateScope = { ...metricScope, team_slug: '' };
      const userIds = [1, 2, 3, 4, 5];
      await handler.upsertCostCenters([
        {
          metrics_type: 'organization',
          entity_id: 'org-1',
          cost_center_id: '__none__',
          name: '__none__',
        },
      ]);
      await handler.insertUserMetrics(
        userIds.map(userId =>
          buildUserMetric({
            ...metricScope,
            user_id: userId,
            user_login: `user-${userId}`,
          }),
        ),
      );
      const memberships: V2UserCostCenterRow[] = userIds.map(userId => ({
        ...metricScope,
        user_id: userId,
        user_login: `user-${userId}`,
        cost_center_id: '__none__',
      }));
      const totals = buildDailyTotal({
        ...aggregateScope,
        cost_center_id: '__none__',
        daily_active_users: 5,
      });
      const feature = {
        ...aggregateScope,
        cost_center_id: '__none__',
        feature: 'chat_panel',
        code_acceptance_activity_count: 5,
        code_generation_activity_count: 5,
        loc_added_sum: 0,
        loc_deleted_sum: 0,
        loc_suggested_to_add_sum: 0,
        loc_suggested_to_delete_sum: 0,
        user_initiated_interaction_count: 5,
      };
      await handler.replaceCostCenterAggregates(
        day,
        'organization',
        'org-1',
        memberships,
        {
          dailyTotals: [totals],
          prMetrics: [],
          byFeature: [feature],
          byIde: [],
          byLanguageFeature: [],
          byModelFeature: [],
          byLanguageModel: [],
          byCli: [],
          byVscodeAgent: [],
        },
      );

      const listing = await handler.getCostCenters(
        'organization',
        'org-1',
        day,
        day,
      );
      expect(listing.costCenters).toContainEqual({
        id: '__none__',
        name: '__none__',
      });
      expect(listing.hasUsersWithoutCostCenter).toBe(false);
      await expect(
        handler.getDailyTotals(
          'organization',
          'org-1',
          day,
          day,
          undefined,
          '__none__',
        ),
      ).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ daily_active_users: 5 }),
        ]),
      );
      await expect(
        handler.getByFeature(
          'organization',
          'org-1',
          day,
          day,
          undefined,
          '__none__',
        ),
      ).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ feature: 'chat_panel' }),
        ]),
      );
    });

    it('rejects cost-center rows without a cost-center ID', async () => {
      const day = '2026-05-10';

      await expect(
        handler.replaceCostCenterAggregates(
          day,
          'enterprise',
          'ent-1',
          [],
          makeCostCenterAggregateRows(day, [
            {
              costCenterId: '',
              teamSlug: '',
              activeUsers: 1,
              locAdded: 10,
            },
          ]),
        ),
      ).rejects.toThrow(
        'Cost-center replacement rows must match the requested day and scope and must not include a team scope.',
      );

      await expect(
        knex('copilot_daily_totals').where({
          day,
          metrics_type: 'enterprise',
          entity_id: 'ent-1',
        }),
      ).resolves.toEqual([]);
    });

    it('insertDailyTotals is idempotent with conflict ignore', async () => {
      const row = buildDailyTotal({ day: '2026-05-20', team_slug: '' });

      await handler.insertDailyTotals([row]);
      await handler.insertDailyTotals([row]);

      const rows = await knex('copilot_daily_totals').where({
        day: '2026-05-20',
        metrics_type: 'organization',
        entity_id: 'org-1',
        team_slug: '',
      });

      expect(rows).toHaveLength(1);
    });

    it('persists daily_active_vscode_agent_users and backfills it on re-ingestion', async () => {
      const row = buildDailyTotal({
        day: '2026-05-21',
        team_slug: '',
        daily_active_vscode_agent_users: undefined,
      });

      await handler.insertDailyTotals([row]);
      await handler.insertDailyTotals([
        { ...row, daily_active_vscode_agent_users: 9 },
      ]);

      const [stored] = await handler.getDailyTotals(
        'organization',
        'org-1',
        '2026-05-21',
        '2026-05-21',
      );

      expect(stored.daily_active_vscode_agent_users).toBe(9);
    });

    it('insertByVscodeAgent persists team-level session/message totals and merges on re-ingestion', async () => {
      await handler.insertByVscodeAgent([
        {
          day: '2026-05-21',
          metrics_type: 'organization',
          entity_id: 'org-1',
          team_slug: '',
          session_count: 3,
          total_user_messages: 12,
        },
      ]);

      await handler.insertByVscodeAgent([
        {
          day: '2026-05-21',
          metrics_type: 'organization',
          entity_id: 'org-1',
          team_slug: '',
          session_count: 5,
          total_user_messages: 20,
        },
      ]);

      const rows = await knex('copilot_metrics_by_vscode_agent').where({
        day: '2026-05-21',
        metrics_type: 'organization',
        entity_id: 'org-1',
        team_slug: '',
      });

      expect(rows).toHaveLength(1);
      expect(rows[0].session_count).toBe(5);
      expect(rows[0].total_user_messages).toBe(20);
    });

    it('persists used_vscode_agent on per-user metrics and backfills it on re-ingestion', async () => {
      const row = buildUserMetric({
        day: '2026-05-21',
        used_vscode_agent: false,
      });

      await handler.insertUserMetrics([row]);
      await handler.insertUserMetrics([{ ...row, used_vscode_agent: true }]);

      const [stored] = await handler.getUserMetrics(
        'organization',
        'org-1',
        row.user_login,
        '2026-05-21',
        '2026-05-21',
      );

      expect(stored.used_vscode_agent).toBeTruthy();
    });

    it('getDailyTotals filters by date range and team', async () => {
      await handler.insertDailyTotals([
        buildDailyTotal({ day: '2026-05-01', team_slug: 'team-a' }),
        buildDailyTotal({ day: '2026-05-02', team_slug: 'team-a' }),
        buildDailyTotal({ day: '2026-05-02', team_slug: 'team-b' }),
        buildDailyTotal({ day: '2026-05-04', team_slug: 'team-a' }),
      ]);

      const rows = await handler.getDailyTotals(
        'organization',
        'org-1',
        '2026-05-01',
        '2026-05-03',
        'team-a',
      );

      expect(rows).toHaveLength(2);
      expect(rows.every(r => typeof r.day === 'string')).toBe(true);
      expect(rows.map(r => r.day)).toEqual(['2026-05-01', '2026-05-02']);
      expect(rows.every(r => r.team_slug === 'team-a')).toBe(true);
    });

    it('scopes aggregate inserts and reads by team or cost center', async () => {
      const scopes = [
        { team_slug: '', cost_center_id: '' },
        { team_slug: 'team-a', cost_center_id: '' },
        { team_slug: '', cost_center_id: 'cc-a' },
      ].map(scope => ({
        day: '2026-05-01',
        metrics_type: 'organization' as const,
        entity_id: 'org-1',
        ...scope,
      }));

      await handler.insertDailyTotals(
        scopes.map(scope => ({
          ...buildDailyTotal(),
          ...scope,
        })),
      );
      await handler.insertPrMetrics(
        scopes.map(scope => ({
          ...scope,
          total_created: 1,
          total_merged: 1,
          total_reviewed: 1,
          total_created_by_copilot: 1,
          total_merged_created_by_copilot: 1,
          total_merged_reviewed_by_copilot: 1,
          total_reviewed_by_copilot: 1,
          total_suggestions: 1,
          total_applied_suggestions: 1,
          total_copilot_suggestions: 1,
          total_copilot_applied_suggestions: 1,
        })),
      );
      await handler.insertByFeature(
        scopes.map(scope => ({
          ...scope,
          feature: 'chat_panel',
          code_acceptance_activity_count: 1,
          code_generation_activity_count: 1,
          loc_added_sum: 1,
          loc_deleted_sum: 1,
          loc_suggested_to_add_sum: 1,
          loc_suggested_to_delete_sum: 1,
          user_initiated_interaction_count: 1,
        })),
      );
      await handler.insertByIde(
        scopes.map(scope => ({
          ...scope,
          ide: 'vscode',
          code_acceptance_activity_count: 1,
          code_generation_activity_count: 1,
          loc_added_sum: 1,
          loc_deleted_sum: 1,
          loc_suggested_to_add_sum: 1,
          loc_suggested_to_delete_sum: 1,
          user_initiated_interaction_count: 1,
        })),
      );
      await handler.insertByLanguageFeature(
        scopes.map(scope => ({
          ...scope,
          language: 'typescript',
          feature: 'chat_panel',
          code_acceptance_activity_count: 1,
          code_generation_activity_count: 1,
          loc_added_sum: 1,
          loc_deleted_sum: 1,
          loc_suggested_to_add_sum: 1,
          loc_suggested_to_delete_sum: 1,
        })),
      );
      await handler.insertByModelFeature(
        scopes.map(scope => ({
          ...scope,
          model_id: 'gpt-4o',
          feature: 'chat_panel',
          user_initiated_interaction_count: 1,
          code_generation_activity_count: 1,
          code_acceptance_activity_count: 1,
          loc_added_sum: 1,
          loc_deleted_sum: 1,
          loc_suggested_to_add_sum: 1,
          loc_suggested_to_delete_sum: 1,
        })),
      );
      await handler.insertByLanguageModel(
        scopes.map(scope => ({
          ...scope,
          language: 'typescript',
          model_id: 'gpt-4o',
          request_count: 1,
          code_generation_activity_count: 1,
          code_acceptance_activity_count: 1,
          loc_added_sum: 1,
          loc_deleted_sum: 1,
          loc_suggested_to_add_sum: 1,
          loc_suggested_to_delete_sum: 1,
        })),
      );
      await handler.insertByCli(
        scopes.map(scope => ({
          ...scope,
          prompt_count: 1,
          request_count: 1,
          session_count: 1,
          avg_tokens_per_request: 1,
          output_tokens_sum: 1,
          prompt_tokens_sum: 1,
        })),
      );
      await handler.insertByVscodeAgent(
        scopes.map(scope => ({
          ...scope,
          session_count: 1,
          total_user_messages: 1,
        })),
      );

      for (const scope of scopes) {
        const teamSlug = scope.team_slug || undefined;
        const costCenter = scope.cost_center_id || undefined;
        const [
          daily,
          prs,
          byFeature,
          byIde,
          byLanguageFeature,
          byModelFeature,
          byLanguageModel,
        ] = await Promise.all([
          handler.getDailyTotals(
            'organization',
            'org-1',
            '2026-05-01',
            '2026-05-01',
            teamSlug,
            costCenter,
          ),
          handler.getPrMetrics(
            'organization',
            'org-1',
            '2026-05-01',
            '2026-05-01',
            teamSlug,
            costCenter,
          ),
          handler.getByFeature(
            'organization',
            'org-1',
            '2026-05-01',
            '2026-05-01',
            teamSlug,
            costCenter,
          ),
          handler.getByIde(
            'organization',
            'org-1',
            '2026-05-01',
            '2026-05-01',
            teamSlug,
            costCenter,
          ),
          handler.getByLanguageFeature(
            'organization',
            'org-1',
            '2026-05-01',
            '2026-05-01',
            teamSlug,
            undefined,
            costCenter,
          ),
          handler.getByModelFeature(
            'organization',
            'org-1',
            '2026-05-01',
            '2026-05-01',
            teamSlug,
            costCenter,
          ),
          handler.getByLanguageModel(
            'organization',
            'org-1',
            '2026-05-01',
            '2026-05-01',
            teamSlug,
            costCenter,
          ),
        ]);

        expect(daily).toHaveLength(1);
        expect(prs).toHaveLength(1);
        expect(byFeature).toHaveLength(1);
        expect(byIde).toHaveLength(1);
        expect(byLanguageFeature).toHaveLength(1);
        expect(byModelFeature).toHaveLength(1);
        expect(byLanguageModel).toHaveLength(1);
        expect(daily[0].team_slug).toBe(scope.team_slug);
        expect(daily[0].cost_center_id).toBe(scope.cost_center_id);
      }

      const cliRows = await knex('copilot_metrics_by_cli').where({
        day: '2026-05-01',
        metrics_type: 'organization',
        entity_id: 'org-1',
        team_slug: '',
      });
      const vscodeAgentRows = await knex(
        'copilot_metrics_by_vscode_agent',
      ).where({
        day: '2026-05-01',
        metrics_type: 'organization',
        entity_id: 'org-1',
        team_slug: '',
      });
      expect(cliRows).toHaveLength(2);
      expect(vscodeAgentRows).toHaveLength(2);
    });

    it('buckets only cost-center breakdowns into additive top-ten others rows', async () => {
      const day = '2026-05-01';
      const costCenterScope = {
        day,
        metrics_type: 'organization' as const,
        entity_id: 'org-1',
        team_slug: '',
        cost_center_id: 'cc-a',
      };
      const counts = Array.from({ length: 12 }, (_, index) => index + 1);
      const featureRows = counts.map(count => ({
        ...costCenterScope,
        feature: `feature-${count}`,
        code_generation_activity_count: count,
        code_acceptance_activity_count: count,
        loc_added_sum: count * 2,
        loc_deleted_sum: count * 3,
        loc_suggested_to_add_sum: count * 4,
        loc_suggested_to_delete_sum: count * 5,
        user_initiated_interaction_count: count,
      }));
      const ideRows = counts.map(count => ({
        ...costCenterScope,
        ide: `ide-${count}`,
        code_generation_activity_count: count,
        code_acceptance_activity_count: count,
        loc_added_sum: count * 2,
        loc_deleted_sum: count * 3,
        loc_suggested_to_add_sum: count * 4,
        loc_suggested_to_delete_sum: count * 5,
        user_initiated_interaction_count: count,
      }));
      const languageFeatureRows = counts.map(count => ({
        ...costCenterScope,
        language: `language-${count}`,
        feature: `feature-${count}`,
        code_generation_activity_count: count,
        code_acceptance_activity_count: count,
        loc_added_sum: count * 2,
        loc_deleted_sum: count * 3,
        loc_suggested_to_add_sum: count * 4,
        loc_suggested_to_delete_sum: count * 5,
      }));
      const modelFeatureRows = counts.map(count => ({
        ...costCenterScope,
        model_id: `model-${count}`,
        feature: `feature-${count}`,
        user_initiated_interaction_count: count,
        code_generation_activity_count: count,
        code_acceptance_activity_count: count,
        loc_added_sum: count * 2,
        loc_deleted_sum: count * 3,
        loc_suggested_to_add_sum: count * 4,
        loc_suggested_to_delete_sum: count * 5,
      }));
      const languageModelRows = counts.map(count => ({
        ...costCenterScope,
        language: `language-${count}`,
        model_id: `model-${count}`,
        request_count: count,
        code_generation_activity_count: count,
        code_acceptance_activity_count: count,
        loc_added_sum: count * 2,
        loc_deleted_sum: count * 3,
        loc_suggested_to_add_sum: count * 4,
        loc_suggested_to_delete_sum: count * 5,
      }));

      await Promise.all([
        handler.insertByFeature(featureRows),
        handler.insertByIde(ideRows),
        handler.insertByLanguageFeature(languageFeatureRows),
        handler.insertByModelFeature(modelFeatureRows),
        handler.insertByLanguageModel(languageModelRows),
      ]);
      await handler.insertByFeature(
        counts.map(count => ({
          ...featureRows[count - 1],
          cost_center_id: '',
        })),
      );
      await handler.insertByFeature(
        counts.map(count => ({
          ...featureRows[count - 1],
          cost_center_id: '',
          team_slug: 'demo-team',
        })),
      );

      const [
        features,
        ides,
        languageFeatures,
        modelFeatures,
        languageModels,
        dashboard,
        unscopedFeatures,
        teamFeatures,
      ] = await Promise.all([
        handler.getByFeature(
          'organization',
          'org-1',
          day,
          day,
          undefined,
          'cc-a',
        ),
        handler.getByIde('organization', 'org-1', day, day, undefined, 'cc-a'),
        handler.getByLanguageFeature(
          'organization',
          'org-1',
          day,
          day,
          undefined,
          undefined,
          'cc-a',
        ),
        handler.getByModelFeature(
          'organization',
          'org-1',
          day,
          day,
          undefined,
          'cc-a',
        ),
        handler.getByLanguageModel(
          'organization',
          'org-1',
          day,
          day,
          undefined,
          'cc-a',
        ),
        handler.getDashboardData('organization', 'org-1', day, day, undefined, {
          kind: 'costCenter',
          id: 'cc-a',
        }),
        handler.getByFeature('organization', 'org-1', day, day),
        handler.getByFeature('organization', 'org-1', day, day, 'demo-team'),
      ]);

      for (const [rows, dimension] of [
        [features, 'feature'],
        [ides, 'ide'],
        [languageFeatures, 'language'],
        [modelFeatures, 'model_id'],
        [languageModels, 'language'],
      ] as const) {
        expect(rows).toHaveLength(11);
        const others = rows.find(
          row =>
            (row as unknown as Record<string, unknown>)[dimension] === 'others',
        );
        expect(others).toBeDefined();
        expect(others?.code_generation_activity_count).toBe(3);
        expect(others?.loc_added_sum).toBe(6);
      }

      expect(languageFeatures.at(-1)).toEqual(
        expect.objectContaining({ language: 'others', feature: 'others' }),
      );
      expect(modelFeatures.at(-1)).toEqual(
        expect.objectContaining({ model_id: 'others', feature: 'others' }),
      );
      expect(languageModels.at(-1)).toEqual(
        expect.objectContaining({ language: 'others', model_id: 'others' }),
      );
      expect(languageModels.at(-1)?.request_count).toBe(3);
      expect(dashboard.byFeature).toHaveLength(11);
      expect(dashboard.byLanguage).toHaveLength(11);
      expect(dashboard.byModelFeature).toHaveLength(11);
      expect(dashboard.byLanguageModel).toHaveLength(11);
      expect(unscopedFeatures).toHaveLength(12);
      expect(unscopedFeatures.some(row => row.feature === 'others')).toBe(
        false,
      );
      expect(teamFeatures).toHaveLength(12);
      expect(teamFeatures.some(row => row.feature === 'others')).toBe(false);
    });

    it('getDailyTotals always returns day as a plain YYYY-MM-DD string, regardless of database driver (regression test for #9540)', async () => {
      // On Postgres, Knex deserializes a `date` column as a JS Date object.
      // Before the fix, that Date was returned as-is and serialized by
      // res.json() into a full ISO timestamp, breaking the frontend's
      // formatDay() parsing. This test guards against that regression on
      // every database backend the suite runs against, including Postgres.
      await handler.insertDailyTotals([
        buildDailyTotal({ day: '2026-05-26', team_slug: '' }),
      ]);

      const rows = await handler.getDailyTotals(
        'organization',
        'org-1',
        '2026-05-26',
        '2026-05-26',
      );

      expect(rows).toHaveLength(1);
      expect(typeof rows[0].day).toBe('string');
      expect(rows[0].day).toBe('2026-05-26');
    });

    it('getDailyTotals computes rolling weekly/monthly active users for teams', async () => {
      await handler.insertDailyTotals([
        buildDailyTotal({ day: '2026-05-10', team_slug: 'team-a' }),
      ]);

      // user 1: active 05-04 (agent) and again 05-10 — distinct counts once
      // user 2: active 05-08 (chat)
      // user 3: active 05-01 — inside 28-day window, outside 7-day window
      const activity: Array<{
        day: string;
        user_id: number;
        used_agent?: boolean;
        used_chat?: boolean;
      }> = [
        { day: '2026-05-04', user_id: 1, used_agent: true },
        { day: '2026-05-10', user_id: 1 },
        { day: '2026-05-08', user_id: 2, used_chat: true },
        { day: '2026-05-01', user_id: 3 },
      ];

      await handler.insertUserMetrics(
        activity.map(a =>
          buildUserMetric({
            day: a.day,
            user_id: a.user_id,
            user_login: `u${a.user_id}`,
            used_agent: a.used_agent ?? false,
            used_chat: a.used_chat ?? false,
          }),
        ),
      );
      await handler.insertUserTeams(
        activity.map(a =>
          buildUserTeam({
            day: a.day,
            user_id: a.user_id,
            user_login: `u${a.user_id}`,
            team_slug: 'team-a',
            team_id: 1,
          }),
        ),
      );

      const rows = await handler.getDailyTotals(
        'organization',
        'org-1',
        '2026-05-10',
        '2026-05-10',
        'team-a',
      );

      expect(rows).toHaveLength(1);
      expect(rows[0].weekly_active_users).toBe(2);
      expect(rows[0].monthly_active_users).toBe(3);
      expect(rows[0].monthly_active_agent_users).toBe(1);
      expect(rows[0].monthly_active_chat_users).toBe(1);
    });

    it('getDailyTotals anchors rolling windows to each returned day', async () => {
      await handler.insertDailyTotals([
        buildDailyTotal({ day: '2026-05-08', team_slug: 'team-a' }),
        buildDailyTotal({ day: '2026-05-10', team_slug: 'team-a' }),
      ]);

      const activity: Array<{
        day: string;
        user_id: number;
        used_agent?: boolean;
        used_chat?: boolean;
      }> = [
        { day: '2026-05-02', user_id: 1 },
        { day: '2026-05-04', user_id: 2, used_agent: true },
        { day: '2026-05-08', user_id: 3, used_chat: true },
        { day: '2026-05-10', user_id: 4 },
      ];

      await handler.insertUserMetrics(
        activity.map(a =>
          buildUserMetric({
            day: a.day,
            user_id: a.user_id,
            user_login: `u${a.user_id}`,
            used_agent: a.used_agent ?? false,
            used_chat: a.used_chat ?? false,
          }),
        ),
      );
      await handler.insertUserTeams(
        activity.map(a =>
          buildUserTeam({
            day: a.day,
            user_id: a.user_id,
            user_login: `u${a.user_id}`,
            team_slug: 'team-a',
            team_id: 1,
          }),
        ),
      );

      const rows = await handler.getDailyTotals(
        'organization',
        'org-1',
        '2026-05-08',
        '2026-05-10',
        'team-a',
      );

      expect(rows).toHaveLength(2);
      expect(typeof rows[0].day).toBe('string');
      expect(rows[0].day).toBe('2026-05-08');
      expect(rows[0].weekly_active_users).toBe(3);
      expect(rows[0].monthly_active_users).toBe(3);
      expect(rows[0].monthly_active_agent_users).toBe(1);
      expect(rows[0].monthly_active_chat_users).toBe(1);

      expect(typeof rows[1].day).toBe('string');
      expect(rows[1].day).toBe('2026-05-10');
      expect(rows[1].weekly_active_users).toBe(3);
      expect(rows[1].monthly_active_users).toBe(4);
      expect(rows[1].monthly_active_agent_users).toBe(1);
      expect(rows[1].monthly_active_chat_users).toBe(1);
    });

    it('getDailyTotals computes rolling users when dates come back as Date objects', async () => {
      const originalDb = (handler as any).db;
      const fakeActivityRows = [
        {
          day: new Date('2026-05-04T00:00:00.000Z'),
          user_id: 1,
          used_agent: true,
          used_chat: false,
        },
        {
          day: new Date('2026-05-08T00:00:00.000Z'),
          user_id: 2,
          used_agent: false,
          used_chat: true,
        },
        {
          day: new Date('2026-05-10T00:00:00.000Z'),
          user_id: 1,
          used_agent: false,
          used_chat: false,
        },
      ];
      const fakeQuery = {
        join: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        whereBetween: jest.fn().mockReturnThis(),
        whereRaw: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(fakeActivityRows),
      };
      (handler as any).db = jest.fn().mockReturnValue(fakeQuery);

      try {
        const rows = await (handler as any).enrichScopedRollingActiveUsers(
          [
            buildDailyTotal({
              day: new Date('2026-05-10T00:00:00.000Z') as any,
              team_slug: 'team-a',
            }),
          ],
          'organization',
          'org-1',
          '2026-05-10',
          '2026-05-10',
          'team-a',
        );

        expect(rows).toHaveLength(1);
        expect(rows[0].weekly_active_users).toBe(2);
        expect(rows[0].monthly_active_users).toBe(2);
        expect(rows[0].monthly_active_agent_users).toBe(1);
        expect(rows[0].monthly_active_chat_users).toBe(1);
      } finally {
        (handler as any).db = originalDb;
      }
    });

    it('getDailyTotals only counts users active within the selected team', async () => {
      await handler.insertDailyTotals([
        buildDailyTotal({ day: '2026-05-10', team_slug: 'team-a' }),
      ]);

      await handler.insertUserMetrics([
        buildUserMetric({ day: '2026-05-10', user_id: 1, user_login: 'u1' }),
        buildUserMetric({ day: '2026-05-10', user_id: 2, user_login: 'u2' }),
      ]);
      // user 1 is in team-a, user 2 is in team-b
      await handler.insertUserTeams([
        buildUserTeam({
          day: '2026-05-10',
          user_id: 1,
          user_login: 'u1',
          team_slug: 'team-a',
          team_id: 1,
        }),
        buildUserTeam({
          day: '2026-05-10',
          user_id: 2,
          user_login: 'u2',
          team_slug: 'team-b',
          team_id: 2,
        }),
      ]);

      const rows = await handler.getDailyTotals(
        'organization',
        'org-1',
        '2026-05-10',
        '2026-05-10',
        'team-a',
      );

      expect(rows).toHaveLength(1);
      expect(rows[0].weekly_active_users).toBe(1);
      expect(rows[0].monthly_active_users).toBe(1);
    });

    it('computes rolling active users for cost centers and teams independently', async () => {
      await handler.insertDailyTotals([
        buildDailyTotal({
          day: '2026-05-10',
          team_slug: '',
          cost_center_id: 'cc-a',
        }),
        buildDailyTotal({
          day: '2026-05-10',
          team_slug: 'team-a',
        }),
      ]);

      const activity: Array<{
        day: string;
        user_id: number;
        cost_center_id: string;
        team_slug: string;
        used_agent?: boolean;
        used_chat?: boolean;
      }> = [
        {
          day: '2026-05-04',
          user_id: 1,
          cost_center_id: 'cc-a',
          team_slug: 'team-a',
          used_agent: true,
        },
        {
          day: '2026-05-10',
          user_id: 1,
          cost_center_id: 'cc-a',
          team_slug: 'team-a',
        },
        {
          day: '2026-05-08',
          user_id: 2,
          cost_center_id: 'cc-a',
          team_slug: 'team-a',
          used_chat: true,
        },
        {
          day: '2026-05-01',
          user_id: 3,
          cost_center_id: 'cc-a',
          team_slug: 'team-b',
        },
        {
          day: '2026-05-09',
          user_id: 4,
          cost_center_id: 'cc-a',
          team_slug: 'team-b',
        },
        {
          day: '2026-05-10',
          user_id: 5,
          cost_center_id: 'cc-b',
          team_slug: 'team-a',
        },
      ];

      await handler.insertUserMetrics(
        activity.map(row =>
          buildUserMetric({
            day: row.day,
            user_id: row.user_id,
            user_login: `u${row.user_id}`,
            used_agent: row.used_agent ?? false,
            used_chat: row.used_chat ?? false,
          }),
        ),
      );
      await handler.upsertUserCostCenters(
        activity.map(row => ({
          day: row.day,
          metrics_type: 'organization',
          entity_id: 'org-1',
          user_id: row.user_id,
          user_login: `u${row.user_id}`,
          cost_center_id: row.cost_center_id,
        })),
      );
      await handler.insertUserTeams(
        activity.map(row =>
          buildUserTeam({
            day: row.day,
            user_id: row.user_id,
            user_login: `u${row.user_id}`,
            team_slug: row.team_slug,
            team_id: row.team_slug === 'team-a' ? 1 : 2,
          }),
        ),
      );

      const costCenterRows = await handler.getDailyTotals(
        'organization',
        'org-1',
        '2026-05-10',
        '2026-05-10',
        undefined,
        'cc-a',
      );
      const teamRows = await handler.getDailyTotals(
        'organization',
        'org-1',
        '2026-05-10',
        '2026-05-10',
        'team-a',
      );

      expect(costCenterRows[0]).toEqual(
        expect.objectContaining({
          weekly_active_users: 3,
          monthly_active_users: 4,
          monthly_active_agent_users: 1,
          monthly_active_chat_users: 1,
        }),
      );
      expect(teamRows[0]).toEqual(
        expect.objectContaining({
          weekly_active_users: 3,
          monthly_active_users: 3,
          monthly_active_agent_users: 1,
          monthly_active_chat_users: 1,
        }),
      );
    });

    it('getDailyTotals leaves org-level rolling counts untouched', async () => {
      await handler.insertDailyTotals([
        buildDailyTotal({
          day: '2026-05-10',
          team_slug: '',
          weekly_active_users: 42,
          monthly_active_users: 99,
        }),
      ]);

      const rows = await handler.getDailyTotals(
        'organization',
        'org-1',
        '2026-05-10',
        '2026-05-10',
      );

      expect(rows).toHaveLength(1);
      expect(rows[0].weekly_active_users).toBe(42);
      expect(rows[0].monthly_active_users).toBe(99);
    });

    it('getPeriodRange returns min/max day from daily totals', async () => {
      await handler.insertDailyTotals([
        buildDailyTotal({ day: '2026-05-03', team_slug: '' }),
        buildDailyTotal({ day: '2026-05-01', team_slug: '' }),
        buildDailyTotal({ day: '2026-05-02', team_slug: '' }),
      ]);

      const range = await handler.getPeriodRange('organization', 'org-1');

      expect(range).toEqual({
        minDate: '2026-05-01',
        maxDate: '2026-05-03',
      });
    });

    it('getPeriodRange scopes its date range by cost center', async () => {
      await handler.insertDailyTotals([
        buildDailyTotal({ day: '2026-05-01', cost_center_id: '' }),
        buildDailyTotal({ day: '2026-05-03', cost_center_id: 'cc-a' }),
        buildDailyTotal({ day: '2026-05-05', cost_center_id: 'cc-b' }),
      ]);

      await expect(
        handler.getPeriodRange('organization', 'org-1'),
      ).resolves.toEqual({
        minDate: '2026-05-01',
        maxDate: '2026-05-01',
      });
      await expect(
        handler.getPeriodRange('organization', 'org-1', 'cc-a'),
      ).resolves.toEqual({
        minDate: '2026-05-03',
        maxDate: '2026-05-03',
      });
    });

    it('replaces team aggregates without deleting cost-center aggregates', async () => {
      const day = '2026-05-01';
      const scope = {
        day,
        metrics_type: 'enterprise' as const,
        entity_id: 'ent-1',
      };
      await handler.insertUserTeams([
        buildUserTeam({ ...scope, team_slug: 'old-team' }),
      ]);
      await handler.insertDailyTotals([
        buildDailyTotal({
          ...scope,
          team_slug: 'old-team',
          cost_center_id: '',
        }),
        buildDailyTotal({
          ...scope,
          team_slug: 'old-team',
          cost_center_id: 'cc-a',
        }),
      ]);

      const newMembership = buildUserTeam({
        ...scope,
        team_slug: 'new-team',
        user_id: 2,
        user_login: 'user-two',
      });
      await handler.replaceTeamAggregates(
        day,
        'enterprise',
        'ent-1',
        [newMembership],
        {
          dailyTotals: [
            buildDailyTotal({
              ...scope,
              team_slug: 'new-team',
              daily_active_users: 1,
            }),
          ],
          byFeature: [],
          byIde: [],
          byLanguageFeature: [],
          byModelFeature: [],
          byLanguageModel: [],
          customizationMetrics: [],
          costCenterCustomizationMetrics: [],
        },
      );

      const memberships = await knex('copilot_user_teams').where({
        day,
        metrics_type: 'enterprise',
        entity_id: 'ent-1',
      });
      expect(memberships).toHaveLength(1);
      expect(memberships[0].team_slug).toBe('new-team');
      expect(Number(memberships[0].user_id)).toBe(2);
      await expect(
        knex('copilot_daily_totals').where({
          ...scope,
          team_slug: 'old-team',
          cost_center_id: '',
        }),
      ).resolves.toHaveLength(0);
      await expect(
        knex('copilot_daily_totals').where({
          ...scope,
          team_slug: 'old-team',
          cost_center_id: 'cc-a',
        }),
      ).resolves.toHaveLength(1);
      await expect(
        knex('copilot_daily_totals').where({
          ...scope,
          team_slug: 'new-team',
          cost_center_id: '',
        }),
      ).resolves.toHaveLength(1);
    });

    it('getTeams returns only team slugs with 5 or more distinct members', async () => {
      // 'alpha' has 5 members — should be returned
      await handler.insertUserTeams([
        buildUserTeam({ team_slug: 'alpha', user_id: 1, user_login: 'u1' }),
        buildUserTeam({ team_slug: 'alpha', user_id: 2, user_login: 'u2' }),
        buildUserTeam({ team_slug: 'alpha', user_id: 3, user_login: 'u3' }),
        buildUserTeam({ team_slug: 'alpha', user_id: 4, user_login: 'u4' }),
        buildUserTeam({ team_slug: 'alpha', user_id: 5, user_login: 'u5' }),
        // 'beta' has only 4 members — should be excluded
        buildUserTeam({ team_slug: 'beta', user_id: 1, user_login: 'u1' }),
        buildUserTeam({ team_slug: 'beta', user_id: 2, user_login: 'u2' }),
        buildUserTeam({ team_slug: 'beta', user_id: 3, user_login: 'u3' }),
        buildUserTeam({ team_slug: 'beta', user_id: 4, user_login: 'u4' }),
      ]);
      const teams = await handler.getTeams(
        'organization',
        'org-1',
        '2026-05-01',
        '2026-05-03',
      );

      expect(teams).toEqual(['alpha']);
    });

    it('getCostCenters applies the distinct-user threshold and reports unassigned users separately', async () => {
      await handler.upsertCostCenters([
        {
          metrics_type: 'organization',
          entity_id: 'org-1',
          cost_center_id: 'cc-alpha',
          name: 'Alpha',
        },
      ]);

      const membershipRows: V2UserCostCenterRow[] = [];
      const addMemberships = (
        day: string,
        costCenterId: string,
        userIds: number[],
      ) => {
        membershipRows.push(
          ...userIds.map(userId => ({
            day,
            metrics_type: 'organization' as const,
            entity_id: 'org-1',
            user_id: userId,
            user_login: `u${userId}`,
            cost_center_id: costCenterId,
          })),
        );
      };

      addMemberships('2026-05-01', 'cc-alpha', [1, 2, 3, 4, 5]);
      addMemberships('2026-05-02', 'cc-alpha', [1]);
      addMemberships('2026-05-01', 'cc-small', [11, 12, 13, 14]);
      addMemberships('2026-05-01', 'cc-unknown', [31, 32, 33, 34, 35]);
      addMemberships('2026-05-03', 'cc-outside-range', [41, 42, 43, 44, 45]);
      await handler.upsertUserCostCenters(membershipRows);
      await handler.insertUserMetrics([
        ...[1, 2, 3, 4, 5, 21, 22, 23, 24, 25, 31, 32, 33, 34, 35].map(userId =>
          buildUserMetric({ user_id: userId, user_login: `u${userId}` }),
        ),
        ...[11, 12, 13, 14].map(userId =>
          buildUserMetric({ user_id: userId, user_login: `u${userId}` }),
        ),
        ...[41, 42, 43, 44, 45].map(userId =>
          buildUserMetric({
            day: '2026-05-03',
            user_id: userId,
            user_login: `u${userId}`,
          }),
        ),
        buildUserMetric({
          day: '2026-05-02',
          user_id: 1,
          user_login: 'u1',
        }),
      ]);
      await Promise.all(
        ['2026-05-01', '2026-05-02', '2026-05-03'].map(day =>
          handler.markCostCenterAggregationDone(day, 'organization', 'org-1'),
        ),
      );

      const costCenters = await handler.getCostCenters(
        'organization',
        'org-1',
        '2026-05-01',
        '2026-05-02',
      );

      expect(costCenters.costCenters).toEqual(
        expect.arrayContaining([
          { id: 'cc-alpha', name: 'Alpha' },
          { id: 'cc-unknown', name: 'cc-unknown' },
        ]),
      );
      expect(
        costCenters.costCenters.map(costCenter => costCenter.id),
      ).not.toContain('cc-small');
      expect(
        costCenters.costCenters.map(costCenter => costCenter.id),
      ).not.toContain('cc-outside-range');
      expect(costCenters.hasUsersWithoutCostCenter).toBe(true);
      expect(
        costCenters.costCenters
          .filter(costCenter => costCenter.name !== null)
          .map(costCenter => costCenter.name),
      ).toEqual(['Alpha', 'cc-unknown']);
      const lowerThreshold = await handler.getCostCenters(
        'organization',
        'org-1',
        '2026-05-01',
        '2026-05-02',
        4,
      );
      expect(lowerThreshold.costCenters).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'cc-small', name: 'cc-small' }),
        ]),
      );
      expect(lowerThreshold.hasUsersWithoutCostCenter).toBe(true);
    });

    it('omits incomplete unassigned days and withholds rolling windows spanning them', async () => {
      const currentDay = '2026-05-10';
      const incompleteDay = '2026-05-09';
      const scope = {
        metrics_type: 'organization' as const,
        entity_id: 'org-1',
      };

      await handler.insertUserMetrics([
        ...[1, 2, 3, 4].map(userId =>
          buildUserMetric({
            ...scope,
            day: currentDay,
            user_id: userId,
            user_login: `user-${userId}`,
            used_agent: false,
            used_chat: false,
          }),
        ),
        buildUserMetric({
          ...scope,
          day: incompleteDay,
          user_id: 5,
          user_login: 'user-5',
          used_agent: false,
          used_chat: false,
        }),
        buildUserMetric({
          ...scope,
          day: '2026-05-08',
          user_id: 6,
          user_login: 'user-6',
          used_agent: false,
          used_chat: false,
        }),
      ]);
      await knex('copilot_daily_totals').insert(
        [currentDay, incompleteDay, '2026-05-08'].map(day => ({
          ...buildDailyTotal({
            ...scope,
            day,
            team_slug: '',
            cost_center_id: '',
            daily_active_users: day === currentDay ? 4 : 1,
          }),
          without_cost_center: true,
        })),
      );
      await knex('copilot_metrics_by_feature').insert(
        [currentDay, incompleteDay].map(day => ({
          ...scope,
          day,
          team_slug: '',
          cost_center_id: '',
          without_cost_center: true,
          feature: 'completion',
          code_acceptance_activity_count: 1,
          code_generation_activity_count: 1,
          loc_added_sum: 1,
          loc_deleted_sum: 0,
          loc_suggested_to_add_sum: 0,
          loc_suggested_to_delete_sum: 0,
          user_initiated_interaction_count: 1,
        })),
      );
      for (const day of [
        '2026-05-04',
        '2026-05-05',
        '2026-05-06',
        '2026-05-07',
        '2026-05-08',
        currentDay,
      ]) {
        await handler.markCostCenterAggregationDone(
          day,
          'organization',
          'org-1',
        );
      }
      await handler.markCostCenterAggregationDone(
        incompleteDay,
        'organization',
        'org-1',
        false,
      );

      let rows = await handler.getDailyTotals(
        'organization',
        'org-1',
        incompleteDay,
        currentDay,
        undefined,
        { kind: 'noCostCenter' },
      );
      expect(rows.map(row => row.day)).toEqual([currentDay]);
      const byFeatureRequest = handler.getByFeature(
        'organization',
        'org-1',
        incompleteDay,
        currentDay,
        undefined,
        { kind: 'noCostCenter' },
      );
      const byFeature = await byFeatureRequest;
      expect(byFeature.map(row => row.day)).toEqual([currentDay]);
      expect(rows[0].weekly_active_users).toBeUndefined();
      expect(rows[0].monthly_active_users).toBeUndefined();
      await expect(
        handler.getCostCenters(
          'organization',
          'org-1',
          incompleteDay,
          currentDay,
        ),
      ).resolves.toEqual({
        costCenters: [],
        hasUsersWithoutCostCenter: false,
      });
      await expect(
        handler.hasUsersWithoutCostCenterOnDashboard(
          'organization',
          'org-1',
          rows,
        ),
      ).resolves.toBe(false);

      await handler.markCostCenterAggregationDone(
        incompleteDay,
        'organization',
        'org-1',
      );
      rows = await handler.getDailyTotals(
        'organization',
        'org-1',
        currentDay,
        currentDay,
        undefined,
        { kind: 'noCostCenter' },
      );
      expect(rows).toHaveLength(1);
      expect(rows[0].weekly_active_users).toBe(6);
      expect(rows[0].monthly_active_users).toBeUndefined();
      await expect(
        handler.getCostCenters(
          'organization',
          'org-1',
          incompleteDay,
          currentDay,
        ),
      ).resolves.toEqual({
        costCenters: [],
        hasUsersWithoutCostCenter: true,
      });
      await expect(
        handler.hasUsersWithoutCostCenterOnDashboard(
          'organization',
          'org-1',
          rows,
        ),
      ).resolves.toBe(false);
    });

    it('checks no-cost-center eligibility only against returned days, not rolling lookback', async () => {
      const currentDay = '2026-05-10';
      const earlierDays = [
        '2026-05-06',
        '2026-05-07',
        '2026-05-08',
        '2026-05-09',
      ];
      const completeDays = [
        '2026-05-04',
        '2026-05-05',
        ...earlierDays,
        currentDay,
      ];

      await handler.insertUserMetrics([
        buildUserMetric({
          day: currentDay,
          user_id: 1,
          user_login: 'current-user',
          used_agent: false,
          used_chat: false,
        }),
        ...earlierDays.map((day, index) =>
          buildUserMetric({
            day,
            user_id: index + 2,
            user_login: `earlier-user-${index + 1}`,
            used_agent: false,
            used_chat: false,
          }),
        ),
      ]);
      await knex('copilot_daily_totals').insert(
        [currentDay, ...earlierDays].map(day => ({
          ...buildDailyTotal({
            day,
            team_slug: '',
            cost_center_id: '',
            daily_active_users: 1,
          }),
          without_cost_center: true,
        })),
      );
      for (const day of completeDays) {
        await handler.markCostCenterAggregationDone(
          day,
          'organization',
          'org-1',
        );
      }

      const dailyRows = await handler.getDailyTotals(
        'organization',
        'org-1',
        currentDay,
        currentDay,
        undefined,
        { kind: 'noCostCenter' },
      );
      expect(dailyRows).toHaveLength(1);
      expect(dailyRows[0].daily_active_users).toBe(1);
      expect(dailyRows[0].weekly_active_users).toBe(5);
      await expect(
        handler.hasUsersWithoutCostCenterOnDashboard(
          'organization',
          'org-1',
          dailyRows,
        ),
      ).resolves.toBe(false);
    });

    it('withholds no-cost-center data when organization user reports are unavailable', async () => {
      const day = '2026-05-16';
      const scope = {
        day,
        metrics_type: 'organization' as const,
        entity_id: 'org-1',
      };
      await handler.upsertCostCenters([
        {
          metrics_type: 'organization',
          entity_id: 'org-1',
          cost_center_id: 'cc-known',
          name: 'Known center',
        },
      ]);
      await handler.insertUserMetrics(
        Array.from({ length: 10 }, (_, index) =>
          buildUserMetric({
            ...scope,
            user_id: index + 1,
            user_login: `user-${index + 1}`,
          }),
        ),
      );
      await knex('copilot_daily_totals').insert({
        ...buildDailyTotal({
          ...scope,
          team_slug: '',
          cost_center_id: '',
          daily_active_users: 5,
        }),
        without_cost_center: true,
      });

      const memberships: V2UserCostCenterRow[] = Array.from(
        { length: 5 },
        (_, index) => ({
          ...scope,
          user_id: index + 1,
          user_login: `user-${index + 1}`,
          cost_center_id: 'cc-known',
        }),
      );
      await handler.replaceCostCenterAggregates(
        day,
        'organization',
        'org-1',
        memberships,
        makeCostCenterAggregateRows(
          day,
          [
            {
              costCenterId: 'cc-known',
              teamSlug: '',
              activeUsers: 5,
              locAdded: 50,
            },
          ],
          'organization',
          'org-1',
        ),
        false,
      );

      const listing = await handler.getCostCenters(
        'organization',
        'org-1',
        day,
        day,
      );
      const noCostCenterRows = await knex('copilot_daily_totals').where({
        ...scope,
        team_slug: '',
        cost_center_id: '',
        without_cost_center: true,
      });
      const completion = await knex('copilot_cost_center_aggregation_log')
        .where(scope)
        .first();

      expect(listing.costCenters).toEqual([
        { id: 'cc-known', name: 'Known center' },
      ]);
      expect(listing.hasUsersWithoutCostCenter).toBe(false);
      expect(noCostCenterRows).toHaveLength(0);
      expect(Boolean(completion.unassigned_complete)).toBe(false);
    });

    it('keeps cost-center names isolated by metrics scope', async () => {
      await handler.upsertCostCenters([
        {
          metrics_type: 'enterprise',
          entity_id: 'shared',
          cost_center_id: 'cc-shared',
          name: 'Enterprise center',
        },
        {
          metrics_type: 'organization',
          entity_id: 'shared',
          cost_center_id: 'cc-shared',
          name: 'Organization center',
        },
      ]);

      const addScopeRows = (metricsType: 'enterprise' | 'organization') => {
        const members = [1, 2, 3, 4, 5].map(userId => ({
          day: '2026-05-01',
          metrics_type: metricsType,
          entity_id: 'shared',
          user_id: userId,
          user_login: `${metricsType}-${userId}`,
          cost_center_id: 'cc-shared',
        }));
        return {
          members,
          metrics: members.map(member =>
            buildUserMetric({
              metrics_type: metricsType,
              entity_id: 'shared',
              user_id: member.user_id,
              user_login: member.user_login,
            }),
          ),
        };
      };
      const enterpriseRows = addScopeRows('enterprise');
      const organizationRows = addScopeRows('organization');
      await handler.upsertUserCostCenters([
        ...enterpriseRows.members,
        ...organizationRows.members,
      ]);
      await handler.insertUserMetrics([
        ...enterpriseRows.metrics,
        ...organizationRows.metrics,
      ]);

      await expect(
        handler.getCostCenters('enterprise', 'shared'),
      ).resolves.toEqual({
        costCenters: [{ id: 'cc-shared', name: 'Enterprise center' }],
        hasUsersWithoutCostCenter: false,
      });
      await expect(
        handler.getCostCenters('organization', 'shared'),
      ).resolves.toEqual({
        costCenters: [{ id: 'cc-shared', name: 'Organization center' }],
        hasUsersWithoutCostCenter: false,
      });
    });

    it('does not count membership-only users toward the cost-center threshold', async () => {
      await handler.upsertUserCostCenters(
        [1, 2, 3, 4, 5].map(userId => ({
          day: '2026-05-01',
          metrics_type: 'organization' as const,
          entity_id: 'org-1',
          user_id: userId,
          user_login: `u${userId}`,
          cost_center_id: 'cc-membership-only',
        })),
      );
      await handler.insertUserTeams(
        [1, 2, 3, 4, 5].map(userId =>
          buildUserTeam({
            user_id: userId,
            user_login: `u${userId}`,
            team_slug: 'membership-only-team',
          }),
        ),
      );
      await handler.insertUserMetrics(
        [1, 2, 3, 4].map(userId =>
          buildUserMetric({ user_id: userId, user_login: `u${userId}` }),
        ),
      );

      await expect(
        handler.getCostCenters(
          'organization',
          'org-1',
          '2026-05-01',
          '2026-05-01',
        ),
      ).resolves.toEqual({
        costCenters: [],
        hasUsersWithoutCostCenter: false,
      });
    });

    it('getTeams ignores cost-center memberships and keeps its team-only scope', async () => {
      const teamRows = [
        ...[1, 2, 3, 4, 5, 6].map(userId =>
          buildUserTeam({
            day: '2026-05-01',
            user_id: userId,
            user_login: `u${userId}`,
            team_id: 1,
            team_slug: 'alpha',
          }),
        ),
        ...[11, 12, 13, 14, 15, 16].map(userId =>
          buildUserTeam({
            day: '2026-05-01',
            user_id: userId,
            user_login: `u${userId}`,
            team_id: 2,
            team_slug: 'beta',
          }),
        ),
      ];
      await handler.insertUserTeams(teamRows);
      await handler.insertUserMetrics(
        [...[1, 2, 3, 4, 5, 6], ...[11, 12, 13, 14, 15]].map(userId =>
          buildUserMetric({
            day: '2026-05-01',
            user_id: userId,
            user_login: `u${userId}`,
          }),
        ),
      );
      await handler.upsertUserCostCenters([
        ...[1, 2, 3, 4, 5, 11, 12, 13, 14].map(userId => ({
          day: '2026-05-01',
          metrics_type: 'organization' as const,
          entity_id: 'org-1',
          user_id: userId,
          user_login: `u${userId}`,
          cost_center_id: 'cc-a',
        })),
        ...[6, 15].map(userId => ({
          day: '2026-05-01',
          metrics_type: 'organization' as const,
          entity_id: 'org-1',
          user_id: userId,
          user_login: `u${userId}`,
          cost_center_id: 'cc-b',
        })),
      ]);

      await expect(
        handler.getTeams('organization', 'org-1', '2026-05-01', '2026-05-01'),
      ).resolves.toEqual(['alpha', 'beta']);
    });

    it('getTeams counts distinct members across days, not per-day rows', async () => {
      // same user appears on two days in 'gamma' — should still count as 1 member
      await handler.insertUserTeams([
        buildUserTeam({
          team_slug: 'gamma',
          user_id: 1,
          user_login: 'u1',
          day: '2026-05-01',
        }),
        buildUserTeam({
          team_slug: 'gamma',
          user_id: 1,
          user_login: 'u1',
          day: '2026-05-02',
        }),
        buildUserTeam({
          team_slug: 'gamma',
          user_id: 2,
          user_login: 'u2',
          day: '2026-05-01',
        }),
        buildUserTeam({
          team_slug: 'gamma',
          user_id: 3,
          user_login: 'u3',
          day: '2026-05-01',
        }),
        buildUserTeam({
          team_slug: 'gamma',
          user_id: 4,
          user_login: 'u4',
          day: '2026-05-01',
        }),
        // only 4 distinct users — should be excluded
      ]);
      const teams = await handler.getTeams(
        'organization',
        'org-1',
        '2026-05-01',
        '2026-05-02',
      );

      expect(teams).toEqual([]);
    });

    it('getDashboardData returns all chart data in a single call', async () => {
      await handler.insertDailyTotals([
        buildDailyTotal({ day: '2026-05-01', team_slug: '' }),
        buildDailyTotal({ day: '2026-05-02', team_slug: '' }),
      ]);
      await handler.insertCustomizationMetrics([
        {
          day: '2026-05-01',
          metrics_type: 'organization',
          entity_id: 'org-1',
          scope: 'aggregate',
          team_slug: '',
          user_id: 0,
          user_login: '',
          category: 'skill',
          item_name: 'release-checks',
          interaction_count: 7,
        },
      ]);
      await handler.insertCustomizationSummaries([
        {
          day: '2026-05-01',
          metrics_type: 'organization',
          entity_id: 'org-1',
          scope: 'aggregate',
          team_slug: '',
          user_id: 0,
          user_login: '',
          category: 'skill',
          distinct_item_count: 1,
        },
      ]);

      const result = await handler.getDashboardData(
        'organization',
        'org-1',
        '2026-05-01',
        '2026-05-02',
      );

      expect(result).toHaveProperty('daily');
      expect(result).toHaveProperty('byFeature');
      expect(result).toHaveProperty('byLanguage');
      expect(result).toHaveProperty('byModelFeature');
      expect(result).toHaveProperty('byLanguageModel');
      expect(result).toHaveProperty('prMetrics');
      expect(result.daily).toHaveLength(2);
      expect(result.customizationMetrics).toEqual([
        expect.objectContaining({
          category: 'skill',
          item_name: 'release-checks',
          interaction_count: 7,
        }),
      ]);
      expect(result.customizationSummaries).toEqual([
        expect.objectContaining({
          category: 'skill',
          distinct_item_count: 1,
        }),
      ]);
    });

    it('getUserMetrics only returns rows for the requested user login', async () => {
      await handler.insertUserMetrics([
        buildUserMetric({ user_login: 'octocat', day: '2026-05-01' }),
        buildUserMetric({
          user_login: 'octocat',
          user_id: 1,
          day: '2026-05-02',
        }),
        buildUserMetric({
          user_login: 'someone-else',
          user_id: 2,
          day: '2026-05-01',
        }),
      ]);

      const rows = await handler.getUserMetrics(
        'organization',
        'org-1',
        'octocat',
        '2026-05-01',
        '2026-05-03',
      );

      expect(rows).toHaveLength(2);
      expect(rows.every(r => r.user_login === 'octocat')).toBe(true);
    });

    it('getUserMetrics matches user login case-insensitively', async () => {
      await handler.insertUserMetrics([
        buildUserMetric({ user_login: 'OctoCat', day: '2026-05-01' }),
        buildUserMetric({
          user_login: 'someone-else',
          user_id: 2,
          day: '2026-05-01',
        }),
      ]);

      const rows = await handler.getUserMetrics(
        'organization',
        'org-1',
        'octocat',
        '2026-05-01',
        '2026-05-03',
      );

      expect(rows).toHaveLength(1);
      expect(rows[0].user_login).toBe('OctoCat');
    });

    it('hasUserMetrics finds historical data independent of the date range', async () => {
      await handler.insertUserMetrics([
        buildUserMetric({ user_login: 'OctoCat', day: '2026-05-01' }),
      ]);

      await expect(
        handler.hasUserMetrics('organization', 'org-1', 'octocat'),
      ).resolves.toBe(true);
      await expect(
        handler.hasUserMetrics('organization', 'org-1', 'someone-else'),
      ).resolves.toBe(false);
    });

    it('getUserDashboardData scopes every dimension to a single user login', async () => {
      await handler.insertUserMetrics([
        buildUserMetric({ user_login: 'octocat', user_id: 1 }),
        buildUserMetric({ user_login: 'someone-else', user_id: 2 }),
      ]);
      await handler.insertUserMetricsByFeature([
        buildUserMetricsByFeature({ user_login: 'octocat', user_id: 1 }),
        buildUserMetricsByFeature({
          user_login: 'someone-else',
          user_id: 2,
          feature: 'agent',
        }),
      ]);
      await handler.insertUserMetricsByIde([
        buildUserMetricsByIde({ user_login: 'octocat', user_id: 1 }),
      ]);
      await handler.insertUserMetricsByLanguageFeature([
        buildUserMetricsByLanguageFeature({
          user_login: 'octocat',
          user_id: 1,
        }),
      ]);
      await handler.insertUserMetricsByModelFeature([
        buildUserMetricsByModelFeature({ user_login: 'octocat', user_id: 1 }),
      ]);
      await handler.insertUserMetricsByLanguageModel([
        buildUserMetricsByLanguageModel({ user_login: 'octocat', user_id: 1 }),
      ]);
      await handler.insertCustomizationMetrics([
        buildCustomizationMetric({ user_login: 'OctoCat', user_id: 1 }),
        buildCustomizationMetric({
          user_login: 'someone-else',
          user_id: 2,
          item_name: 'other-skill',
        }),
        buildCustomizationMetric({
          scope: 'aggregate',
          user_id: 0,
          user_login: '',
          item_name: 'aggregate-skill',
        }),
        buildCustomizationMetric({
          scope: 'team',
          team_slug: 'alpha',
          user_id: 0,
          user_login: '',
          item_name: 'team-skill',
        }),
      ]);
      await handler.insertCustomizationSummaries([
        buildCustomizationSummary({ user_login: 'OctoCat', user_id: 1 }),
        buildCustomizationSummary({
          user_login: 'someone-else',
          user_id: 2,
          distinct_item_count: 2,
        }),
        buildCustomizationSummary({
          scope: 'aggregate',
          user_id: 0,
          user_login: '',
          distinct_item_count: 3,
        }),
      ]);

      const result = await handler.getUserDashboardData(
        'organization',
        'org-1',
        'OCTOCAT',
        '2026-05-01',
        '2026-05-01',
      );

      expect(result.userLogin).toBe('OCTOCAT');
      expect(result.daily).toHaveLength(1);
      expect(result.daily[0].user_login).toBe('octocat');
      expect(result.byFeature).toHaveLength(1);
      expect(result.byFeature[0].feature).toBe('chat_panel');
      expect(result.byIde).toHaveLength(1);
      expect(result.byLanguage).toHaveLength(1);
      expect(result.byModelFeature).toHaveLength(1);
      expect(result.byLanguageModel).toHaveLength(1);
      expect(result.customizationMetrics).toEqual([
        expect.objectContaining({
          scope: 'user',
          user_login: 'octocat',
          item_name: 'release-checks',
        }),
      ]);
      expect(result.customizationSummaries).toEqual([
        expect.objectContaining({
          scope: 'user',
          user_login: 'octocat',
          distinct_item_count: 1,
        }),
      ]);

      // Never returns another user's rows, even though they exist in the
      // same day/entity/metrics_type scope.
      const otherUser = await handler.getUserDashboardData(
        'organization',
        'org-1',
        'someone-else',
        '2026-05-01',
        '2026-05-01',
      );
      expect(otherUser.byFeature).toEqual([
        expect.objectContaining({ feature: 'agent' }),
      ]);
      expect(otherUser.customizationMetrics).toEqual([
        expect.objectContaining({
          user_login: 'someone-else',
          item_name: 'other-skill',
        }),
      ]);
      expect(otherUser.customizationSummaries).toEqual([
        expect.objectContaining({
          user_login: 'someone-else',
          distinct_item_count: 2,
        }),
      ]);
    });
  });
});

function buildIngestionLog(
  overrides: Partial<V2IngestionLogRow> = {},
): V2IngestionLogRow {
  return {
    day: '2026-05-01',
    metrics_type: 'organization',
    entity_id: 'org-1',
    status: 'success',
    components_loaded: '["totals"]',
    source: 'scheduled',
    ...overrides,
  };
}

function buildDailyTotal(overrides: Partial<V2DailyTotal> = {}): V2DailyTotal {
  return {
    day: '2026-05-01',
    metrics_type: 'organization',
    entity_id: 'org-1',
    team_slug: '',
    daily_active_users: 10,
    weekly_active_users: 20,
    monthly_active_users: 30,
    daily_active_cli_users: 4,
    monthly_active_agent_users: 5,
    monthly_active_chat_users: 6,
    code_acceptance_activity_count: 100,
    code_generation_activity_count: 120,
    loc_added_sum: 1000,
    loc_deleted_sum: 500,
    loc_suggested_to_add_sum: 1400,
    loc_suggested_to_delete_sum: 700,
    user_initiated_interaction_count: 33,
    ...overrides,
  };
}

function makeCostCenterAggregateRows(
  day: string,
  groups: Array<{
    costCenterId: string;
    teamSlug: string;
    activeUsers: number;
    locAdded: number;
  }>,
  metricsType: 'enterprise' | 'organization' = 'enterprise',
  entityId: string = 'ent-1',
): CostCenterAggregateRows {
  const scopes = groups.map(
    ({ costCenterId, teamSlug, activeUsers, locAdded }) => ({
      scope: {
        day,
        metrics_type: metricsType,
        entity_id: entityId,
        team_slug: teamSlug,
        cost_center_id: costCenterId,
      },
      activeUsers,
      locAdded,
    }),
  );

  return {
    dailyTotals: scopes.map(({ activeUsers, locAdded, scope }) =>
      buildDailyTotal({
        ...scope,
        daily_active_users: activeUsers,
        loc_added_sum: locAdded,
      }),
    ),
    prMetrics: scopes.map(({ activeUsers, scope }) => ({
      ...scope,
      total_created: activeUsers,
      total_merged: activeUsers,
      total_reviewed: activeUsers,
      total_created_by_copilot: activeUsers,
      total_merged_created_by_copilot: activeUsers,
      total_merged_reviewed_by_copilot: activeUsers,
      total_reviewed_by_copilot: activeUsers,
      total_suggestions: activeUsers,
      total_applied_suggestions: activeUsers,
      total_copilot_suggestions: activeUsers,
      total_copilot_applied_suggestions: activeUsers,
    })),
    byFeature: scopes.map(({ activeUsers, locAdded, scope }) => ({
      ...scope,
      feature: 'chat_panel',
      code_acceptance_activity_count: activeUsers,
      code_generation_activity_count: activeUsers,
      loc_added_sum: locAdded,
      loc_deleted_sum: 0,
      loc_suggested_to_add_sum: 0,
      loc_suggested_to_delete_sum: 0,
      user_initiated_interaction_count: activeUsers,
    })),
    byIde: scopes.map(({ activeUsers, locAdded, scope }) => ({
      ...scope,
      ide: 'vscode',
      code_acceptance_activity_count: activeUsers,
      code_generation_activity_count: activeUsers,
      loc_added_sum: locAdded,
      loc_deleted_sum: 0,
      loc_suggested_to_add_sum: 0,
      loc_suggested_to_delete_sum: 0,
      user_initiated_interaction_count: activeUsers,
    })),
    byLanguageFeature: scopes.map(({ activeUsers, locAdded, scope }) => ({
      ...scope,
      language: 'typescript',
      feature: 'chat_panel',
      code_acceptance_activity_count: activeUsers,
      code_generation_activity_count: activeUsers,
      loc_added_sum: locAdded,
      loc_deleted_sum: 0,
      loc_suggested_to_add_sum: 0,
      loc_suggested_to_delete_sum: 0,
    })),
    byModelFeature: scopes.map(({ activeUsers, locAdded, scope }) => ({
      ...scope,
      model_id: 'gpt-4o',
      feature: 'chat_panel',
      user_initiated_interaction_count: activeUsers,
      code_generation_activity_count: activeUsers,
      code_acceptance_activity_count: activeUsers,
      loc_added_sum: locAdded,
      loc_deleted_sum: 0,
      loc_suggested_to_add_sum: 0,
      loc_suggested_to_delete_sum: 0,
    })),
    byLanguageModel: scopes.map(({ activeUsers, locAdded, scope }) => ({
      ...scope,
      language: 'typescript',
      model_id: 'gpt-4o',
      request_count: activeUsers,
      code_generation_activity_count: activeUsers,
      code_acceptance_activity_count: activeUsers,
      loc_added_sum: locAdded,
      loc_deleted_sum: 0,
      loc_suggested_to_add_sum: 0,
      loc_suggested_to_delete_sum: 0,
    })),
    byCli: scopes.map(({ activeUsers, scope }) => ({
      ...scope,
      prompt_count: activeUsers,
      request_count: activeUsers,
      session_count: activeUsers,
      avg_tokens_per_request: 1,
      output_tokens_sum: activeUsers,
      prompt_tokens_sum: activeUsers,
    })),
    byVscodeAgent: scopes.map(({ activeUsers, scope }) => ({
      ...scope,
      session_count: activeUsers,
      total_user_messages: activeUsers * 2,
    })),
  };
}

function buildUserTeam(overrides: Partial<V2UserTeamRow> = {}): V2UserTeamRow {
  return {
    day: '2026-05-01',
    metrics_type: 'organization',
    entity_id: 'org-1',
    user_id: 1,
    user_login: 'octocat',
    team_id: 100,
    team_slug: 'alpha',
    ...overrides,
  };
}

function buildUserMetric(
  overrides: Partial<V2UserMetricRow> = {},
): V2UserMetricRow {
  return {
    day: '2026-05-01',
    metrics_type: 'organization',
    entity_id: 'org-1',
    user_id: 1,
    user_login: 'octocat',
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
    ...overrides,
  };
}

function buildUserMetricsByFeature(
  overrides: Partial<V2UserMetricsByFeatureRow> = {},
): V2UserMetricsByFeatureRow {
  return {
    day: '2026-05-01',
    metrics_type: 'organization',
    entity_id: 'org-1',
    user_id: 1,
    user_login: 'octocat',
    feature: 'chat_panel',
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

function buildUserMetricsByIde(
  overrides: Partial<V2UserMetricsByIdeRow> = {},
): V2UserMetricsByIdeRow {
  return {
    day: '2026-05-01',
    metrics_type: 'organization',
    entity_id: 'org-1',
    user_id: 1,
    user_login: 'octocat',
    ide: 'vscode',
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

function buildUserMetricsByLanguageFeature(
  overrides: Partial<V2UserMetricsByLanguageFeatureRow> = {},
): V2UserMetricsByLanguageFeatureRow {
  return {
    day: '2026-05-01',
    metrics_type: 'organization',
    entity_id: 'org-1',
    user_id: 1,
    user_login: 'octocat',
    language: 'typescript',
    feature: 'chat_panel',
    code_acceptance_activity_count: 3,
    code_generation_activity_count: 4,
    loc_added_sum: 10,
    loc_deleted_sum: 2,
    loc_suggested_to_add_sum: 12,
    loc_suggested_to_delete_sum: 3,
    ...overrides,
  };
}

function buildUserMetricsByModelFeature(
  overrides: Partial<V2UserMetricsByModelFeatureRow> = {},
): V2UserMetricsByModelFeatureRow {
  return {
    day: '2026-05-01',
    metrics_type: 'organization',
    entity_id: 'org-1',
    user_id: 1,
    user_login: 'octocat',
    model_id: 'gpt-4o',
    feature: 'chat_panel',
    user_initiated_interaction_count: 7,
    code_generation_activity_count: 4,
    code_acceptance_activity_count: 3,
    loc_added_sum: 10,
    loc_deleted_sum: 2,
    loc_suggested_to_add_sum: 12,
    loc_suggested_to_delete_sum: 3,
    ...overrides,
  };
}

function buildUserMetricsByLanguageModel(
  overrides: Partial<V2UserMetricsByLanguageModelRow> = {},
): V2UserMetricsByLanguageModelRow {
  return {
    day: '2026-05-01',
    metrics_type: 'organization',
    entity_id: 'org-1',
    user_id: 1,
    user_login: 'octocat',
    language: 'typescript',
    model_id: 'gpt-4o',
    request_count: 4,
    code_generation_activity_count: 4,
    code_acceptance_activity_count: 3,
    loc_added_sum: 10,
    loc_deleted_sum: 2,
    loc_suggested_to_add_sum: 12,
    loc_suggested_to_delete_sum: 3,
    ...overrides,
  };
}

function buildCustomizationMetric(
  overrides: Partial<V2CustomizationMetricRow> = {},
): V2CustomizationMetricRow {
  return {
    day: '2026-05-01',
    metrics_type: 'organization',
    entity_id: 'org-1',
    scope: 'user',
    team_slug: '',
    user_id: 1,
    user_login: 'octocat',
    category: 'skill',
    item_name: 'release-checks',
    interaction_count: 7,
    ...overrides,
  };
}

function buildCustomizationSummary(
  overrides: Partial<V2CustomizationSummaryRow> = {},
): V2CustomizationSummaryRow {
  return {
    day: '2026-05-01',
    metrics_type: 'organization',
    entity_id: 'org-1',
    scope: 'user',
    team_slug: '',
    user_id: 1,
    user_login: 'octocat',
    category: 'skill',
    distinct_item_count: 1,
    ...overrides,
  };
}
