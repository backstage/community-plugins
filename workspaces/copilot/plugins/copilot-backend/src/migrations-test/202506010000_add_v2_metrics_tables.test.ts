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

const migration = require('../../migrations/202506010000_add_v2_metrics_tables');

jest.setTimeout(30_000);

describe('migration 202506010000_add_v2_metrics_tables', () => {
  const databases = TestDatabases.create();
  let knex: Knex;

  const tableNames = [
    'copilot_daily_totals',
    'copilot_pr_metrics',
    'copilot_metrics_by_feature',
    'copilot_metrics_by_ide',
    'copilot_metrics_by_language_feature',
    'copilot_user_metrics',
    'copilot_user_teams',
    'copilot_ingestion_log',
  ];

  afterEach(async () => {
    await knex?.destroy();
    jest.resetAllMocks();
  });

  describe.each(databases.eachSupportedId())('database: %s', databaseId => {
    // Keep behavior aligned with existing migration tests.
    if (databaseId.startsWith('MYSQL')) {
      // eslint-disable-next-line jest/no-disabled-tests, jest/expect-expect
      it.skip('tests for MySQL due to pre-existing migration issue', () => {});
      return;
    }

    beforeEach(async () => {
      knex = await createDatabase(databaseId);
    });

    it('creates all v2 tables on up', async () => {
      await migration.up(knex);

      for (const tableName of tableNames) {
        await expect(knex.schema.hasTable(tableName)).resolves.toBe(true);
      }
    });

    it('drops all v2 tables on down', async () => {
      await migration.up(knex);
      await migration.down(knex);

      for (const tableName of tableNames) {
        await expect(knex.schema.hasTable(tableName)).resolves.toBe(false);
      }
    });

    it('creates expected schema for key tables', async () => {
      await migration.up(knex);

      const dailyTotalsInfo = await knex('copilot_daily_totals').columnInfo();
      expect(Object.keys(dailyTotalsInfo)).toEqual(
        expect.arrayContaining([
          'id',
          'day',
          'metrics_type',
          'entity_id',
          'team_slug',
          'daily_active_users',
          'weekly_active_users',
          'monthly_active_users',
          'daily_active_cli_users',
          'monthly_active_agent_users',
          'monthly_active_chat_users',
          'code_acceptance_activity_count',
          'code_generation_activity_count',
          'loc_added_sum',
          'loc_deleted_sum',
          'loc_suggested_to_add_sum',
          'loc_suggested_to_delete_sum',
          'user_initiated_interaction_count',
        ]),
      );

      const ingestionInfo = await knex('copilot_ingestion_log').columnInfo();
      expect(Object.keys(ingestionInfo)).toEqual(
        expect.arrayContaining([
          'id',
          'day',
          'metrics_type',
          'entity_id',
          'ingested_at',
          'status',
          'components_loaded',
          'error_message',
          'source',
        ]),
      );
    });
  });

  async function createDatabase(databaseId: TestDatabaseId) {
    return databases.init(databaseId);
  }
});
