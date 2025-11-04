/*
 * Copyright 2025 The Backstage Authors
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
import { migrationsDir } from '../db';

jest.setTimeout(30_000);

describe('migration 202503211252_change_tables_to_not_nullable', () => {
  let knex: Knex;
  const databases = TestDatabases.create();

  afterEach(async () => {
    await knex?.destroy();
    jest.resetAllMocks();
  });

  describe.each(databases.eachSupportedId())(
    'should convert NULL team_name to empty string - database: %s',
    databaseId => {
      const testDate = '2025-03-01';
      const testDate2 = '2025-03-02';

      // Skip MySQL tests due to a known issue in migration 202502200818
      // That migration creates unique indexes that exceed MySQL's 3072 byte limit
      if (databaseId.startsWith('MYSQL')) {
        // eslint-disable-next-line jest/no-disabled-tests, jest/expect-expect
        it.skip('tests for MySQL due to pre-existing migration issue', () => {});
        return;
      }

      beforeEach(async () => {
        await createDatabase(databaseId);
      });

      it('for copilot_metrics table (with duplicate removal)', async () => {
        const elementsToBeDeleted = [
          {
            day: testDate2,
            type: 'organization',
            team_name: null,
            total_engaged_users: 20,
            total_active_users: 15,
          },
        ];

        const elementsToBeKept = [
          {
            day: testDate,
            type: 'organization',
            team_name: null,
            total_engaged_users: 10,
            total_active_users: 8,
          },
          {
            day: testDate2,
            type: 'organization',
            team_name: null,
            total_engaged_users: 25,
            total_active_users: 18,
          },
          {
            day: testDate,
            type: 'organization',
            team_name: 'team-alpha',
            total_engaged_users: 30,
            total_active_users: 25,
          },
        ];
        await knex('copilot_metrics').insert([
          ...elementsToBeKept,
          ...elementsToBeDeleted,
        ]);

        await runMigration();

        const copilotMetrics = await knex('copilot_metrics')
          .select('*')
          .orderBy(['day', 'total_engaged_users']);

        expect(copilotMetrics).toHaveLength(elementsToBeKept.length);
        for (const element of elementsToBeKept) {
          expect(copilotMetrics.map(normalizeRecord)).toContainEqual({
            ...element,
            team_name: element.team_name === null ? '' : element.team_name,
          });
        }
      });

      it('for ide_completions table (with duplicate removal)', async () => {
        const elementsToBeDeleted = [
          {
            day: testDate,
            type: 'organization',
            team_name: null,
            total_engaged_users: 5,
          },
        ];

        const elementsToBeKept = [
          {
            day: testDate,
            type: 'organization',
            team_name: null,
            total_engaged_users: 15,
          },
          {
            day: testDate,
            type: 'organization',
            team_name: 'team-beta',
            total_engaged_users: 20,
          },
        ];

        await knex('ide_completions').insert([
          ...elementsToBeKept,
          ...elementsToBeDeleted,
        ]);

        await runMigration();

        const ideCompletions = await knex('ide_completions')
          .select('*')
          .orderBy('total_engaged_users');

        expect(ideCompletions).toHaveLength(elementsToBeKept.length);
        for (const element of elementsToBeKept) {
          expect(ideCompletions.map(normalizeRecord)).toContainEqual({
            ...element,
            team_name: element.team_name === null ? '' : element.team_name,
          });
        }
      });

      it('for ide_completions_language_users table (with duplicate removal)', async () => {
        const elementsToBeDeleted = [
          {
            day: testDate,
            language: 'typescript',
            type: 'organization',
            team_name: null,
            total_engaged_users: 10,
          },
        ];

        const elementsToBeKept = [
          {
            day: testDate,
            language: 'typescript',
            type: 'organization',
            team_name: null,
            total_engaged_users: 12,
          },
          {
            day: testDate2,
            language: 'python',
            type: 'organization',
            team_name: 'team-gamma',
            total_engaged_users: 18,
          },
        ];

        await knex('ide_completions_language_users').insert([
          ...elementsToBeKept,
          ...elementsToBeDeleted,
        ]);

        await runMigration();

        const records = await knex('ide_completions_language_users').select(
          '*',
        );
        expect(records).toHaveLength(elementsToBeKept.length);
        for (const element of elementsToBeKept) {
          expect(records.map(normalizeRecord)).toContainEqual({
            ...element,
            team_name: element.team_name === null ? '' : element.team_name,
          });
        }
      });

      it('for ide_completions_language_editors table (with duplicate removal)', async () => {
        const elementsToBeDeleted = [
          {
            day: testDate,
            editor: 'vscode',
            type: 'organization',
            team_name: null,
            total_engaged_users: 20,
          },
        ];

        const elementsToBeKept = [
          {
            day: testDate,
            editor: 'vscode',
            type: 'organization',
            team_name: null,
            total_engaged_users: 22,
          },
          {
            day: testDate,
            editor: 'intellij',
            type: 'organization',
            team_name: 'team-delta',
            total_engaged_users: 14,
          },
        ];

        await knex('ide_completions_language_editors').insert([
          ...elementsToBeKept,
          ...elementsToBeDeleted,
        ]);

        await runMigration();

        const records = await knex('ide_completions_language_editors').select(
          '*',
        );
        expect(records).toHaveLength(elementsToBeKept.length);
        for (const element of elementsToBeKept) {
          expect(records.map(normalizeRecord)).toContainEqual({
            ...element,
            team_name: element.team_name === null ? '' : element.team_name,
          });
        }
      });

      it('for ide_completions_language_editors_model table (with duplicate removal)', async () => {
        const elementsToBeDeleted = [
          {
            day: testDate,
            editor: 'vscode',
            model: 'gpt-4',
            type: 'organization',
            team_name: null,
            total_engaged_users: 6,
          },
        ];

        const elementsToBeKept = [
          {
            day: testDate,
            editor: 'vscode',
            model: 'gpt-4',
            type: 'organization',
            team_name: null,
            total_engaged_users: 8,
          },
          {
            day: testDate,
            editor: 'vscode',
            model: 'gpt-3.5',
            type: 'organization',
            team_name: 'team-epsilon',
            total_engaged_users: 11,
          },
        ];

        await knex('ide_completions_language_editors_model').insert([
          ...elementsToBeKept,
          ...elementsToBeDeleted,
        ]);

        await runMigration();

        const records = await knex(
          'ide_completions_language_editors_model',
        ).select('*');
        expect(records).toHaveLength(elementsToBeKept.length);
        for (const element of elementsToBeKept) {
          expect(records.map(normalizeRecord)).toContainEqual({
            ...element,
            team_name: element.team_name === null ? '' : element.team_name,
          });
        }
      });

      it('for ide_completions_language_editors_model_language table (with duplicate removal)', async () => {
        const elementsToBeDeleted = [
          {
            day: testDate,
            editor: 'vscode',
            model: 'gpt-4',
            language: 'javascript',
            type: 'organization',
            team_name: null,
            total_engaged_users: 14,
            total_code_acceptances: 80,
            total_code_suggestions: 150,
            total_code_lines_accepted: 120,
            total_code_lines_suggested: 250,
          },
        ];

        const elementsToBeKept = [
          {
            day: testDate,
            editor: 'vscode',
            model: 'gpt-4',
            language: 'javascript',
            type: 'organization',
            team_name: null,
            total_engaged_users: 16,
            total_code_acceptances: 100,
            total_code_suggestions: 200,
            total_code_lines_accepted: 150,
            total_code_lines_suggested: 300,
          },
        ];

        await knex('ide_completions_language_editors_model_language').insert([
          ...elementsToBeKept,
          ...elementsToBeDeleted,
        ]);

        await runMigration();

        const records = await knex(
          'ide_completions_language_editors_model_language',
        ).select('*');
        expect(records).toHaveLength(elementsToBeKept.length);
        for (const element of elementsToBeKept) {
          expect(records.map(normalizeRecord)).toContainEqual({
            ...element,
            team_name: element.team_name === null ? '' : element.team_name,
          });
        }
      });

      it('for ide_chats table (with duplicate removal)', async () => {
        const elementsToBeDeleted = [
          {
            day: testDate,
            type: 'organization',
            team_name: null,
            total_engaged_users: 7,
          },
        ];

        const elementsToBeKept = [
          {
            day: testDate,
            type: 'organization',
            team_name: null,
            total_engaged_users: 9,
          },
          {
            day: testDate2,
            type: 'organization',
            team_name: 'team-zeta',
            total_engaged_users: 13,
          },
        ];

        await knex('ide_chats').insert([
          ...elementsToBeKept,
          ...elementsToBeDeleted,
        ]);

        await runMigration();

        const records = await knex('ide_chats').select('*');
        expect(records).toHaveLength(elementsToBeKept.length);
        for (const element of elementsToBeKept) {
          expect(records.map(normalizeRecord)).toContainEqual({
            ...element,
            team_name: element.team_name === null ? '' : element.team_name,
          });
        }
      });

      it('for ide_chat_editors table (with duplicate removal)', async () => {
        const elementsToBeDeleted = [
          {
            day: testDate,
            editor: 'vscode',
            type: 'organization',
            team_name: null,
            total_engaged_users: 5,
          },
        ];

        const elementsToBeKept = [
          {
            day: testDate,
            editor: 'vscode',
            type: 'organization',
            team_name: null,
            total_engaged_users: 7,
          },
        ];

        await knex('ide_chat_editors').insert([
          ...elementsToBeKept,
          ...elementsToBeDeleted,
        ]);

        await runMigration();

        const records = await knex('ide_chat_editors').select('*');
        expect(records).toHaveLength(elementsToBeKept.length);
        for (const element of elementsToBeKept) {
          expect(records.map(normalizeRecord)).toContainEqual({
            ...element,
            team_name: element.team_name === null ? '' : element.team_name,
          });
        }
      });

      it('for ide_chat_editors_model table (with duplicate removal)', async () => {
        const elementsToBeDeleted = [
          {
            day: testDate,
            editor: 'vscode',
            model: 'gpt-4',
            type: 'organization',
            team_name: null,
            total_engaged_users: 4,
            total_chat_copy_events: 8,
            total_chat_insertion_events: 12,
            total_chats: 20,
          },
        ];

        const elementsToBeKept = [
          {
            day: testDate,
            editor: 'vscode',
            model: 'gpt-4',
            type: 'organization',
            team_name: null,
            total_engaged_users: 6,
            total_chat_copy_events: 10,
            total_chat_insertion_events: 15,
            total_chats: 25,
          },
        ];

        await knex('ide_chat_editors_model').insert([
          ...elementsToBeKept,
          ...elementsToBeDeleted,
        ]);

        await runMigration();

        const records = await knex('ide_chat_editors_model').select('*');
        expect(records).toHaveLength(elementsToBeKept.length);
        for (const element of elementsToBeKept) {
          expect(records.map(normalizeRecord)).toContainEqual({
            ...element,
            team_name: element.team_name === null ? '' : element.team_name,
          });
        }
      });

      it('for dotcom_chats table (with duplicate removal)', async () => {
        const elementsToBeDeleted = [
          {
            day: testDate,
            type: 'organization',
            team_name: null,
            total_engaged_users: 17,
          },
        ];

        const elementsToBeKept = [
          {
            day: testDate,
            type: 'organization',
            team_name: null,
            total_engaged_users: 19,
          },
        ];

        await knex('dotcom_chats').insert([
          ...elementsToBeKept,
          ...elementsToBeDeleted,
        ]);

        await runMigration();

        const records = await knex('dotcom_chats').select('*');
        expect(records).toHaveLength(elementsToBeKept.length);
        for (const element of elementsToBeKept) {
          expect(records.map(normalizeRecord)).toContainEqual({
            ...element,
            team_name: element.team_name === null ? '' : element.team_name,
          });
        }
      });

      it('for dotcom_chat_models table (with duplicate removal)', async () => {
        const elementsToBeDeleted = [
          {
            day: testDate,
            model: 'gpt-4',
            type: 'organization',
            team_name: null,
            total_engaged_users: 19,
            total_chats: 40,
          },
        ];

        const elementsToBeKept = [
          {
            day: testDate,
            model: 'gpt-4',
            type: 'organization',
            team_name: null,
            total_engaged_users: 21,
            total_chats: 50,
          },
        ];

        await knex('dotcom_chat_models').insert([
          ...elementsToBeKept,
          ...elementsToBeDeleted,
        ]);

        await runMigration();

        const records = await knex('dotcom_chat_models').select('*');
        expect(records).toHaveLength(elementsToBeKept.length);
        for (const element of elementsToBeKept) {
          expect(records.map(normalizeRecord)).toContainEqual({
            ...element,
            team_name: element.team_name === null ? '' : element.team_name,
          });
        }
      });

      it('for dotcom_prs table (with duplicate removal)', async () => {
        const elementsToBeDeleted = [
          {
            day: testDate,
            type: 'organization',
            team_name: null,
            total_engaged_users: 15,
          },
        ];

        const elementsToBeKept = [
          {
            day: testDate,
            type: 'organization',
            team_name: null,
            total_engaged_users: 17,
          },
        ];

        await knex('dotcom_prs').insert([
          ...elementsToBeKept,
          ...elementsToBeDeleted,
        ]);

        await runMigration();

        const records = await knex('dotcom_prs').select('*');
        expect(records).toHaveLength(elementsToBeKept.length);
        for (const element of elementsToBeKept) {
          expect(records.map(normalizeRecord)).toContainEqual({
            ...element,
            team_name: element.team_name === null ? '' : element.team_name,
          });
        }
      });

      it('for dotcom_pr_repositories table (with duplicate removal)', async () => {
        const elementsToBeDeleted = [
          {
            day: testDate,
            repository: 'backstage/backstage',
            type: 'organization',
            team_name: null,
            total_engaged_users: 21,
          },
        ];

        const elementsToBeKept = [
          {
            day: testDate,
            repository: 'backstage/backstage',
            type: 'organization',
            team_name: null,
            total_engaged_users: 23,
          },
        ];

        await knex('dotcom_pr_repositories').insert([
          ...elementsToBeKept,
          ...elementsToBeDeleted,
        ]);

        await runMigration();

        const records = await knex('dotcom_pr_repositories').select('*');
        expect(records).toHaveLength(elementsToBeKept.length);
        for (const element of elementsToBeKept) {
          expect(records.map(normalizeRecord)).toContainEqual({
            ...element,
            team_name: element.team_name === null ? '' : element.team_name,
          });
        }
      });

      it('for dotcom_pr_repositories_models table (with duplicate removal)', async () => {
        const elementsToBeDeleted = [
          {
            day: testDate,
            repository: 'backstage/backstage',
            model: 'gpt-4',
            type: 'organization',
            team_name: null,
            total_engaged_users: 22,
            total_pr_summaries: 25,
          },
        ];

        const elementsToBeKept = [
          {
            day: testDate,
            repository: 'backstage/backstage',
            model: 'gpt-4',
            type: 'organization',
            team_name: null,
            total_engaged_users: 24,
            total_pr_summaries: 30,
          },
        ];

        await knex('dotcom_pr_repositories_models').insert([
          ...elementsToBeKept,
          ...elementsToBeDeleted,
        ]);

        await runMigration();

        const records = await knex('dotcom_pr_repositories_models').select('*');
        expect(records).toHaveLength(elementsToBeKept.length);
        for (const element of elementsToBeKept) {
          expect(records.map(normalizeRecord)).toContainEqual({
            ...element,
            team_name: element.team_name === null ? '' : element.team_name,
          });
        }
      });

      it('and makes team_name column NOT NULL', async () => {
        await knex('copilot_metrics').insert({
          day: testDate,
          type: 'organization',
          team_name: null,
          total_engaged_users: 10,
          total_active_users: 8,
        });

        await runMigration();

        await expect(
          knex('copilot_metrics').insert({
            day: testDate2,
            type: 'organization',
            team_name: null,
            total_engaged_users: 1,
            total_active_users: 1,
          }),
        ).rejects.toThrow();
      });
    },
  );

  async function createDatabase(databaseId: TestDatabaseId) {
    knex = await databases.init(databaseId);

    for (let i = 0; i < 4; i++) {
      await knex.migrate.up({ directory: migrationsDir });
    }
  }

  function runMigration() {
    return knex.migrate.up({ directory: migrationsDir });
  }

  function normalizeDate(date: string | Date): string {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date;
  }

  function normalizeRecord(record: any): any {
    const normalized = { ...record };
    if (normalized.day) {
      normalized.day = normalizeDate(normalized.day);
    }
    return normalized;
  }
});
