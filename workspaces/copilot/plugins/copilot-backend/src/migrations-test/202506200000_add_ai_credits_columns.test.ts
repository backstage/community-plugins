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
const migration = require('../../migrations/202506200000_add_ai_credits_columns');

jest.setTimeout(30_000);

describe('migration 202506200000_add_ai_credits_columns', () => {
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
    });

    it('adds ai_credits columns on up', async () => {
      await migration.up(knex);

      const userMetricsInfo = await knex('copilot_user_metrics').columnInfo();
      expect(Object.keys(userMetricsInfo)).toEqual(
        expect.arrayContaining(['ai_credits_used']),
      );

      const dailyTotalsInfo = await knex('copilot_daily_totals').columnInfo();
      expect(Object.keys(dailyTotalsInfo)).toEqual(
        expect.arrayContaining(['total_ai_credits_used']),
      );
    });

    it('persists ai_credits values', async () => {
      await migration.up(knex);

      await knex('copilot_user_metrics').insert({
        day: '2026-06-19',
        metrics_type: 'enterprise',
        entity_id: 'ent-1',
        user_id: 1,
        user_login: 'octocat',
        ai_credits_used: 12.5,
      });

      const row = await knex('copilot_user_metrics')
        .where({ user_id: 1 })
        .first();
      expect(Number(row.ai_credits_used)).toBe(12.5);
    });
  });
});
