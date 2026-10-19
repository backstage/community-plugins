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
const migration = require('../../migrations/202609140000_add_vscode_agent_metrics');

jest.setTimeout(30_000);

describe('migration 202609140000_add_vscode_agent_metrics', () => {
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

    it('adds VS Code agent fields and the aggregate table', async () => {
      const dailyTotalsColumns = await knex(
        'copilot_daily_totals',
      ).columnInfo();
      const userMetricsColumns = await knex(
        'copilot_user_metrics',
      ).columnInfo();

      expect(dailyTotalsColumns.daily_active_vscode_agent_users).toBeDefined();
      expect(userMetricsColumns.used_vscode_agent).toBeDefined();
      expect(
        await knex.schema.hasTable('copilot_metrics_by_vscode_agent'),
      ).toBe(true);
    });

    it('persists aggregate rows by day, scope, and team', async () => {
      const row = {
        day: '2026-09-14',
        metrics_type: 'organization',
        entity_id: 'my-org',
        team_slug: 'platform',
        session_count: 3,
        total_user_messages: 12,
      };

      await knex('copilot_metrics_by_vscode_agent').insert(row);
      const stored = await knex('copilot_metrics_by_vscode_agent')
        .where(row)
        .first();

      expect(stored).toMatchObject({
        ...row,
        day: expect.anything(),
      });
      expect(new Date(stored.day).toISOString()).toBe(
        '2026-09-14T00:00:00.000Z',
      );
    });
  });
});
