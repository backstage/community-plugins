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

import { TestDatabases } from '@backstage/backend-test-utils';
import { Knex } from 'knex';

const baseMigration = require('../../migrations/202506010000_add_v2_metrics_tables');
const migration = require('../../migrations/202608200000_add_user_metrics_breakdown_tables');

jest.setTimeout(30_000);

const TABLES = [
  'copilot_user_metrics_by_feature',
  'copilot_user_metrics_by_ide',
  'copilot_user_metrics_by_language_feature',
  'copilot_user_metrics_by_model_feature',
  'copilot_user_metrics_by_language_model',
];

describe('migration 202608200000_add_user_metrics_breakdown_tables', () => {
  const databases = TestDatabases.create();
  let knex: Knex;

  afterEach(async () => {
    await knex?.destroy();
    jest.resetAllMocks();
  });

  describe.each(databases.eachSupportedId())('database: %s', databaseId => {
    if (databaseId.startsWith('MYSQL')) {
      // eslint-disable-next-line jest/no-disabled-tests, jest/expect-expect
      it.skip('tests for MySQL due to pre-existing migration issue', () => {});
      return;
    }

    beforeEach(async () => {
      knex = await databases.init(databaseId);
      await baseMigration.up(knex);
      await migration.up(knex);
    });

    it('creates all per-user breakdown tables', async () => {
      for (const table of TABLES) {
        expect(await knex.schema.hasTable(table)).toBe(true);
      }
    });

    it('persists and enforces uniqueness for copilot_user_metrics_by_feature', async () => {
      await knex('copilot_user_metrics_by_feature').insert({
        day: '2026-08-20',
        metrics_type: 'organization',
        entity_id: 'my-org',
        user_id: 1,
        user_login: 'octocat',
        feature: 'chat_panel',
        code_acceptance_activity_count: 3,
        code_generation_activity_count: 5,
        loc_added_sum: 10,
        loc_deleted_sum: 2,
        loc_suggested_to_add_sum: 12,
        loc_suggested_to_delete_sum: 3,
        user_initiated_interaction_count: 8,
      });

      const row = await knex('copilot_user_metrics_by_feature')
        .where({ user_login: 'octocat' })
        .first();
      expect(row.feature).toBe('chat_panel');
      expect(Number(row.loc_added_sum)).toBe(10);

      await expect(
        knex('copilot_user_metrics_by_feature').insert({
          day: '2026-08-20',
          metrics_type: 'organization',
          entity_id: 'my-org',
          user_id: 1,
          user_login: 'octocat',
          feature: 'chat_panel',
        }),
      ).rejects.toThrow();
    });

    it('scopes rows by day, metrics_type, entity_id and user_login', async () => {
      await knex('copilot_user_metrics_by_ide').insert([
        {
          day: '2026-08-20',
          metrics_type: 'organization',
          entity_id: 'my-org',
          user_id: 1,
          user_login: 'octocat',
          ide: 'vscode',
        },
        {
          day: '2026-08-20',
          metrics_type: 'organization',
          entity_id: 'my-org',
          user_id: 2,
          user_login: 'other-user',
          ide: 'jetbrains',
        },
      ]);

      const rows = await knex('copilot_user_metrics_by_ide').where({
        metrics_type: 'organization',
        entity_id: 'my-org',
        user_login: 'octocat',
      });

      expect(rows).toHaveLength(1);
      expect(rows[0].ide).toBe('vscode');
    });
  });
});
