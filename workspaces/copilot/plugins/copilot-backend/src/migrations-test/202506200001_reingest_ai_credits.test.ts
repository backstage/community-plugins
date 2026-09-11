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
const addAiCreditsColumns = require('../../migrations/202506200000_add_ai_credits_columns');
const migration = require('../../migrations/202506200001_reingest_ai_credits');

jest.setTimeout(30_000);

describe('migration 202506200001_reingest_ai_credits', () => {
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
      await addAiCreditsColumns.up(knex);
    });

    async function insertLog(overrides = {}) {
      await knex('copilot_ingestion_log').insert({
        day: '2026-06-19',
        metrics_type: 'organization',
        entity_id: 'org-1',
        status: 'success',
        components_loaded: JSON.stringify(['totals', 'users', 'teams']),
        source: 'scheduled',
        ...overrides,
      });
    }

    it('deletes successful logs on/after the ai-credits cutoff that include the users component', async () => {
      await insertLog({ day: '2026-06-19' });
      await insertLog({ day: '2026-07-01', entity_id: 'org-2' });

      await migration.up(knex);

      const rows = await knex('copilot_ingestion_log').select('*');
      expect(rows).toHaveLength(0);
    });

    it('keeps logs before the cutoff date', async () => {
      await insertLog({ day: '2026-06-18' });

      await migration.up(knex);

      const rows = await knex('copilot_ingestion_log').select('*');
      expect(rows).toHaveLength(1);
    });

    it('keeps logs that never loaded the users component', async () => {
      await insertLog({
        day: '2026-06-20',
        components_loaded: JSON.stringify(['totals']),
      });

      await migration.up(knex);

      const rows = await knex('copilot_ingestion_log').select('*');
      expect(rows).toHaveLength(1);
    });

    it('keeps logs that are not marked success', async () => {
      await insertLog({ day: '2026-06-20', status: 'partial' });
      await insertLog({ day: '2026-06-21', status: 'error' });

      await migration.up(knex);

      const rows = await knex('copilot_ingestion_log').select('*');
      expect(rows).toHaveLength(2);
    });
  });
});
