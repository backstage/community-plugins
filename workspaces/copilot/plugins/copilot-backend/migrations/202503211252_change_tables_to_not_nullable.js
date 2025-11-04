/*
 * Copyright 2024 The Backstage Authors
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
/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await deleteDuplicates('copilot_metrics', ['day', 'type']);

  await deleteDuplicates('ide_completions', ['day', 'type']);

  await deleteDuplicates('ide_completions_language_users', [
    'day',
    'language',
    'type',
  ]);

  await deleteDuplicates('ide_completions_language_editors', [
    'day',
    'editor',
    'type',
  ]);

  await deleteDuplicates('ide_completions_language_editors_model', [
    'day',
    'editor',
    'model',
    'type',
  ]);

  await deleteDuplicates('ide_completions_language_editors_model_language', [
    'day',
    'editor',
    'model',
    'language',
    'type',
  ]);

  await deleteDuplicates('ide_chats', ['day', 'type']);

  await deleteDuplicates('ide_chat_editors', ['day', 'editor', 'type']);

  await deleteDuplicates('ide_chat_editors_model', [
    'day',
    'editor',
    'model',
    'type',
  ]);

  await deleteDuplicates('dotcom_chats', ['day', 'type']);

  await deleteDuplicates('dotcom_chat_models', ['day', 'model', 'type']);

  await deleteDuplicates('dotcom_prs', ['day', 'type']);

  await deleteDuplicates('dotcom_pr_repositories', [
    'day',
    'repository',
    'type',
  ]);

  await deleteDuplicates('dotcom_pr_repositories_models', [
    'day',
    'repository',
    'model',
    'type',
  ]);

  // Update all remaining null team_name values to empty strings
  await knex('copilot_metrics')
    .where('team_name', null)
    .update({ team_name: '' });

  await knex('ide_completions')
    .where('team_name', null)
    .update({ team_name: '' });

  await knex('ide_completions_language_users')
    .where('team_name', null)
    .update({ team_name: '' });

  await knex('ide_completions_language_editors')
    .where('team_name', null)
    .update({ team_name: '' });

  await knex('ide_completions_language_editors_model')
    .where('team_name', null)
    .update({ team_name: '' });

  await knex('ide_completions_language_editors_model_language')
    .where('team_name', null)
    .update({ team_name: '' });

  await knex('ide_chats').where('team_name', null).update({ team_name: '' });

  await knex('ide_chat_editors')
    .where('team_name', null)
    .update({ team_name: '' });

  await knex('ide_chat_editors_model')
    .where('team_name', null)
    .update({ team_name: '' });

  await knex('dotcom_chats').where('team_name', null).update({ team_name: '' });

  await knex('dotcom_chat_models')
    .where('team_name', null)
    .update({ team_name: '' });

  await knex('dotcom_prs').where('team_name', null).update({ team_name: '' });

  await knex('dotcom_pr_repositories')
    .where('team_name', null)
    .update({ team_name: '' });

  await knex('dotcom_pr_repositories_models')
    .where('team_name', null)
    .update({ team_name: '' });

  // Finally, update all the team_name columns to not null
  await knex.schema.table('copilot_metrics', table => {
    table.string('team_name').notNullable().alter();
  });
  await knex.schema.table('ide_completions', table => {
    table.string('team_name').notNullable().alter();
  });
  await knex.schema.table('ide_completions_language_users', table => {
    table.string('team_name').notNullable().alter();
  });
  await knex.schema.table('ide_completions_language_editors', table => {
    table.string('team_name').notNullable().alter();
  });
  await knex.schema.table('ide_completions_language_editors_model', table => {
    table.string('team_name').notNullable().alter();
  });
  await knex.schema.table(
    'ide_completions_language_editors_model_language',
    table => {
      table.string('team_name').notNullable().alter();
    },
  );
  await knex.schema.table('ide_chats', table => {
    table.string('team_name').notNullable().alter();
  });
  await knex.schema.table('ide_chat_editors', table => {
    table.string('team_name').notNullable().alter();
  });
  await knex.schema.table('ide_chat_editors_model', table => {
    table.string('team_name').notNullable().alter();
  });
  await knex.schema.table('dotcom_chats', table => {
    table.string('team_name').notNullable().alter();
  });
  await knex.schema.table('dotcom_chat_models', table => {
    table.string('team_name').notNullable().alter();
  });
  await knex.schema.table('dotcom_prs', table => {
    table.string('team_name').notNullable().alter();
  });
  await knex.schema.table('dotcom_pr_repositories', table => {
    table.string('team_name').notNullable().alter();
  });
  await knex.schema.table('dotcom_pr_repositories_models', table => {
    table.string('team_name').notNullable().alter();
  });

  // Delete duplicate rows keeping the one with highest total_engaged_users
  // When there are ties (same total_engaged_users), keep only one row
  async function deleteDuplicates(tableName, partitionColumns) {
    const isSqlite = knex.client.config.client.includes('sqlite3');
    const rowIdColumn = isSqlite ? 'rowid' : 'ctid';

    const partitionBy = partitionColumns.join(', ');

    await knex.raw(`
      DELETE FROM ${tableName}
      WHERE ${rowIdColumn} IN (
        SELECT ${rowIdColumn}
        FROM (
          SELECT ${rowIdColumn},
                 ROW_NUMBER() OVER (
                   PARTITION BY ${partitionBy}
                   ORDER BY total_engaged_users DESC, ${rowIdColumn}
                 ) as row_num
          FROM ${tableName}
          WHERE team_name IS NULL
        ) ranked
        WHERE row_num > 1
      )
    `);
  }
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  // a reverse migration is to update all the team_name columns to nullable
  await knex.schema.table('copilot_metrics', table => {
    table.string('team_name').nullable().alter();
  });
  await knex.schema.table('ide_completions', table => {
    table.string('team_name').nullable().alter();
  });
  await knex.schema.table('ide_completions_language_users', table => {
    table.string('team_name').nullable().alter();
  });
  await knex.schema.table('ide_completions_language_editors', table => {
    table.string('team_name').nullable().alter();
  });
  await knex.schema.table('ide_completions_language_editors_model', table => {
    table.string('team_name').nullable().alter();
  });
  await knex.schema.table(
    'ide_completions_language_editors_model_language',
    table => {
      table.string('team_name').nullable().alter();
    },
  );
  await knex.schema.table('ide_chats', table => {
    table.string('team_name').nullable().alter();
  });
  await knex.schema.table('ide_chat_editors', table => {
    table.string('team_name').nullable().alter();
  });
  await knex.schema.table('ide_chat_editors_model', table => {
    table.string('team_name').nullable().alter();
  });
  await knex.schema.table('dotcom_chats', table => {
    table.string('team_name').nullable().alter();
  });
  await knex.schema.table('dotcom_chat_models', table => {
    table.string('team_name').nullable().alter();
  });
  await knex.schema.table('dotcom_prs', table => {
    table.string('team_name').nullable().alter();
  });
  await knex.schema.table('dotcom_pr_repositories', table => {
    table.string('team_name').nullable().alter();
  });
  await knex.schema.table('dotcom_pr_repositories_models', table => {
    table.string('team_name').nullable().alter();
  });

  // Then update all the rows with team_name = '' to null
  // This makes all duplicates gone, but the possibillity of having
  // more duplicates until the next migration
  await knex('copilot_metrics')
    .where('team_name', '')
    .update({ team_name: null });
  await knex('ide_completions')
    .where('team_name', '')
    .update({ team_name: null });
  await knex('ide_completions_language_users')
    .where('team_name', '')
    .update({ team_name: null });
  await knex('ide_completions_language_editors')
    .where('team_name', '')
    .update({ team_name: null });
  await knex('ide_completions_language_editors_model')
    .where('team_name', '')
    .update({ team_name: null });
  await knex('ide_completions_language_editors_model_language')
    .where('team_name', '')
    .update({ team_name: null });
  await knex('ide_chats').where('team_name', '').update({ team_name: null });
  await knex('ide_chat_editors')
    .where('team_name', '')
    .update({ team_name: null });
  await knex('ide_chat_editors_model')
    .where('team_name', '')
    .update({ team_name: null });
  await knex('dotcom_chats').where('team_name', '').update({ team_name: null });
  await knex('dotcom_chat_models')
    .where('team_name', '')
    .update({ team_name: null });
  await knex('dotcom_prs').where('team_name', '').update({ team_name: null });
  await knex('dotcom_pr_repositories')
    .where('team_name', '')
    .update({ team_name: null });
  await knex('dotcom_pr_repositories_models')
    .where('team_name', '')
    .update({ team_name: null });
};
