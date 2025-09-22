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
  // Delete duplicate rows keeping the one with highest total_engaged_users (PostgreSQL only)
  if (!knex.client.config.client.includes('sqlite3')) {
    // copilot_metrics
    await knex.raw(`
      DELETE FROM copilot_metrics 
      WHERE ctid IN (
          SELECT ctid
          FROM (
              SELECT ctid,
                     ROW_NUMBER() OVER (
                         PARTITION BY day, type 
                         ORDER BY total_engaged_users DESC
                     ) as row_num
              FROM copilot_metrics
              WHERE team_name IS NULL
          ) ranked
          WHERE row_num > 1
      )
    `);

    // ide_completions
    await knex.raw(`
      DELETE FROM ide_completions 
      WHERE ctid IN (
          SELECT ctid
          FROM (
              SELECT ctid,
                     ROW_NUMBER() OVER (
                         PARTITION BY day, type 
                         ORDER BY total_engaged_users DESC
                     ) as row_num
              FROM ide_completions
              WHERE team_name IS NULL
          ) ranked
          WHERE row_num > 1
      )
    `);

    // ide_completions_language_users
    await knex.raw(`
      DELETE FROM ide_completions_language_users 
      WHERE ctid IN (
          SELECT ctid
          FROM (
              SELECT ctid,
                     ROW_NUMBER() OVER (
                         PARTITION BY day, language, type 
                         ORDER BY total_engaged_users DESC
                     ) as row_num
              FROM ide_completions_language_users
              WHERE team_name IS NULL
          ) ranked
          WHERE row_num > 1
      )
    `);

    // ide_completions_language_editors
    await knex.raw(`
      DELETE FROM ide_completions_language_editors 
      WHERE ctid IN (
          SELECT ctid
          FROM (
              SELECT ctid,
                     ROW_NUMBER() OVER (
                         PARTITION BY day, editor, type 
                         ORDER BY total_engaged_users DESC
                     ) as row_num
              FROM ide_completions_language_editors
              WHERE team_name IS NULL
          ) ranked
          WHERE row_num > 1
      )
    `);

    // ide_completions_language_editors_model
    await knex.raw(`
      DELETE FROM ide_completions_language_editors_model 
      WHERE ctid IN (
          SELECT ctid
          FROM (
              SELECT ctid,
                     ROW_NUMBER() OVER (
                         PARTITION BY day, editor, model, type 
                         ORDER BY total_engaged_users DESC
                     ) as row_num
              FROM ide_completions_language_editors_model
              WHERE team_name IS NULL
          ) ranked
          WHERE row_num > 1
      )
    `);

    // ide_completions_language_editors_model_language
    await knex.raw(`
      DELETE FROM ide_completions_language_editors_model_language 
      WHERE ctid IN (
          SELECT ctid
          FROM (
              SELECT ctid,
                     ROW_NUMBER() OVER (
                         PARTITION BY day, editor, model, language, type 
                         ORDER BY total_engaged_users DESC
                     ) as row_num
              FROM ide_completions_language_editors_model_language
              WHERE team_name IS NULL
          ) ranked
          WHERE row_num > 1
      )
    `);

    // ide_chats
    await knex.raw(`
      DELETE FROM ide_chats 
      WHERE ctid IN (
          SELECT ctid
          FROM (
              SELECT ctid,
                     ROW_NUMBER() OVER (
                         PARTITION BY day, type 
                         ORDER BY total_engaged_users DESC
                     ) as row_num
              FROM ide_chats
              WHERE team_name IS NULL
          ) ranked
          WHERE row_num > 1
      )
    `);

    // ide_chat_editors
    await knex.raw(`
      DELETE FROM ide_chat_editors 
      WHERE ctid IN (
          SELECT ctid
          FROM (
              SELECT ctid,
                     ROW_NUMBER() OVER (
                         PARTITION BY day, editor, type 
                         ORDER BY total_engaged_users DESC
                     ) as row_num
              FROM ide_chat_editors
              WHERE team_name IS NULL
          ) ranked
          WHERE row_num > 1
      )
    `);

    // ide_chat_editors_model
    await knex.raw(`
      DELETE FROM ide_chat_editors_model 
      WHERE ctid IN (
          SELECT ctid
          FROM (
              SELECT ctid,
                     ROW_NUMBER() OVER (
                         PARTITION BY day, editor, model, type 
                         ORDER BY total_engaged_users DESC
                     ) as row_num
              FROM ide_chat_editors_model
              WHERE team_name IS NULL
          ) ranked
          WHERE row_num > 1
      )
    `);

    // dotcom_chats
    await knex.raw(`
      DELETE FROM dotcom_chats 
      WHERE ctid IN (
          SELECT ctid
          FROM (
              SELECT ctid,
                     ROW_NUMBER() OVER (
                         PARTITION BY day, type 
                         ORDER BY total_engaged_users DESC
                     ) as row_num
              FROM dotcom_chats
              WHERE team_name IS NULL
          ) ranked
          WHERE row_num > 1
      )
    `);

    // dotcom_chat_models
    await knex.raw(`
      DELETE FROM dotcom_chat_models 
      WHERE ctid IN (
          SELECT ctid
          FROM (
              SELECT ctid,
                     ROW_NUMBER() OVER (
                         PARTITION BY day, model, type 
                         ORDER BY total_engaged_users DESC
                     ) as row_num
              FROM dotcom_chat_models
              WHERE team_name IS NULL
          ) ranked
          WHERE row_num > 1
      )
    `);

    // dotcom_prs
    await knex.raw(`
      DELETE FROM dotcom_prs 
      WHERE ctid IN (
          SELECT ctid
          FROM (
              SELECT ctid,
                     ROW_NUMBER() OVER (
                         PARTITION BY day, type 
                         ORDER BY total_engaged_users DESC
                     ) as row_num
              FROM dotcom_prs
              WHERE team_name IS NULL
          ) ranked
          WHERE row_num > 1
      )
    `);

    // dotcom_pr_repositories
    await knex.raw(`
      DELETE FROM dotcom_pr_repositories 
      WHERE ctid IN (
          SELECT ctid
          FROM (
              SELECT ctid,
                     ROW_NUMBER() OVER (
                         PARTITION BY day, repository, type 
                         ORDER BY total_engaged_users DESC
                     ) as row_num
              FROM dotcom_pr_repositories
              WHERE team_name IS NULL
          ) ranked
          WHERE row_num > 1
      )
    `);

    // dotcom_pr_repositories_models
    await knex.raw(`
      DELETE FROM dotcom_pr_repositories_models 
      WHERE ctid IN (
          SELECT ctid
          FROM (
              SELECT ctid,
                     ROW_NUMBER() OVER (
                         PARTITION BY day, repository, model, type 
                         ORDER BY total_engaged_users DESC
                     ) as row_num
              FROM dotcom_pr_repositories_models
              WHERE team_name IS NULL
          ) ranked
          WHERE row_num > 1
      )
    `);
  }

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
