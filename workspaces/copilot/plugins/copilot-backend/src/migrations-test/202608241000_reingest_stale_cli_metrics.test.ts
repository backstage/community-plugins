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

const modelTablesMigration = require('../../migrations/202506020000_add_model_tables');
const v2MetricsTablesMigration = require('../../migrations/202506010000_add_v2_metrics_tables');
const baseMigration = require('../../migrations/202506031200_add_missing_metric_columns');
const widenMigration = require('../../migrations/202608240000_widen_cli_token_sum_columns');
const migration = require('../../migrations/202608241000_reingest_stale_cli_metrics');

jest.setTimeout(30_000);

describe('migration 202608241000_reingest_stale_cli_metrics', () => {
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
      await v2MetricsTablesMigration.up(knex);
      await modelTablesMigration.up(knex);
      await baseMigration.up(knex);
      await widenMigration.up(knex);
    });

    async function insertIngestionLog(overrides = {}) {
      await knex('copilot_ingestion_log').insert({
        day: '2026-08-01',
        metrics_type: 'enterprise',
        entity_id: 'ent-1',
        status: 'success',
        components_loaded: JSON.stringify(['totals']),
        source: 'scheduled',
        ...overrides,
      });
    }

    it('deletes the ingestion log row for a day with stale zeroed token sums', async () => {
      await knex('copilot_metrics_by_cli').insert({
        day: '2026-08-01',
        metrics_type: 'enterprise',
        entity_id: 'ent-1',
        team_slug: '',
        prompt_count: 42,
        request_count: 42,
        session_count: 10,
        avg_tokens_per_request: 0,
        output_tokens_sum: 0,
        prompt_tokens_sum: 0,
      });
      await insertIngestionLog();

      await migration.up(knex);

      const log = await knex('copilot_ingestion_log')
        .where({
          day: '2026-08-01',
          metrics_type: 'enterprise',
          entity_id: 'ent-1',
        })
        .first();
      expect(log).toBeUndefined();
    });

    it('leaves the ingestion log alone when token sums are legitimately non-zero', async () => {
      await knex('copilot_metrics_by_cli').insert({
        day: '2026-08-02',
        metrics_type: 'enterprise',
        entity_id: 'ent-2',
        team_slug: '',
        prompt_count: 42,
        request_count: 42,
        session_count: 10,
        avg_tokens_per_request: 12.5,
        output_tokens_sum: 500,
        prompt_tokens_sum: 500,
      });
      await insertIngestionLog({ day: '2026-08-02', entity_id: 'ent-2' });

      await migration.up(knex);

      const log = await knex('copilot_ingestion_log')
        .where({
          day: '2026-08-02',
          metrics_type: 'enterprise',
          entity_id: 'ent-2',
        })
        .first();
      expect(log).toBeDefined();
    });

    it('leaves the ingestion log alone when a day genuinely had no CLI activity', async () => {
      await knex('copilot_metrics_by_cli').insert({
        day: '2026-08-03',
        metrics_type: 'enterprise',
        entity_id: 'ent-3',
        team_slug: '',
        prompt_count: 0,
        request_count: 0,
        session_count: 0,
        avg_tokens_per_request: 0,
        output_tokens_sum: 0,
        prompt_tokens_sum: 0,
      });
      await insertIngestionLog({ day: '2026-08-03', entity_id: 'ent-3' });

      await migration.up(knex);

      const log = await knex('copilot_ingestion_log')
        .where({
          day: '2026-08-03',
          metrics_type: 'enterprise',
          entity_id: 'ent-3',
        })
        .first();
      expect(log).toBeDefined();
    });
  });
});
