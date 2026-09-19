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
const baseMigration = require('../../migrations/202506031200_add_missing_metric_columns');
const migration = require('../../migrations/202608240000_widen_cli_token_sum_columns');

jest.setTimeout(30_000);

describe('migration 202608240000_widen_cli_token_sum_columns', () => {
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
      await modelTablesMigration.up(knex);
      await baseMigration.up(knex);
    });

    it('persists token sums beyond the 32-bit integer range', async () => {
      await migration.up(knex);

      const overInt4Value = 3081765775; // > 2,147,483,647

      await knex('copilot_metrics_by_cli').insert({
        day: '2026-08-24',
        metrics_type: 'enterprise',
        entity_id: 'ent-1',
        team_slug: '',
        prompt_count: 10,
        request_count: 10,
        session_count: 5,
        avg_tokens_per_request: 100.5,
        output_tokens_sum: overInt4Value,
        prompt_tokens_sum: overInt4Value,
      });

      const row = await knex('copilot_metrics_by_cli')
        .where({ entity_id: 'ent-1', day: '2026-08-24' })
        .first();

      expect(Number(row.output_tokens_sum)).toBe(overInt4Value);
      expect(Number(row.prompt_tokens_sum)).toBe(overInt4Value);
    });

    it('reverts to integer columns on down', async () => {
      await migration.up(knex);
      await migration.down(knex);

      const columnInfo = await knex('copilot_metrics_by_cli').columnInfo();
      expect(columnInfo.output_tokens_sum.type).not.toBe('bigint');
      expect(columnInfo.prompt_tokens_sum.type).not.toBe('bigint');
    });
  });
});
