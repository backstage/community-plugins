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
  // Delete duplicate rows keeping the one with highest total_engaged_users
  // Using a database-agnostic approach with correlated subqueries

  // copilot_metrics
  await knex.raw(`
    DELETE FROM copilot_metrics 
    WHERE team_name IS NULL
      AND total_engaged_users < (
        SELECT MAX(total_engaged_users) 
        FROM copilot_metrics t2 
        WHERE t2.day = copilot_metrics.day 
          AND t2.type = copilot_metrics.type 
          AND t2.team_name IS NULL
      )
  `);

  // ide_completions
  await knex.raw(`
    DELETE FROM ide_completions 
    WHERE team_name IS NULL
      AND total_engaged_users < (
        SELECT MAX(total_engaged_users) 
        FROM ide_completions t2 
        WHERE t2.day = ide_completions.day 
          AND t2.type = ide_completions.type 
          AND t2.team_name IS NULL
      )
  `);

  // ide_completions_language_users
  await knex.raw(`
    DELETE FROM ide_completions_language_users 
    WHERE team_name IS NULL
      AND total_engaged_users < (
        SELECT MAX(total_engaged_users) 
        FROM ide_completions_language_users t2 
        WHERE t2.day = ide_completions_language_users.day 
          AND t2.language = ide_completions_language_users.language 
          AND t2.type = ide_completions_language_users.type 
          AND t2.team_name IS NULL
      )
  `);

  // ide_completions_language_editors
  await knex.raw(`
    DELETE FROM ide_completions_language_editors 
    WHERE team_name IS NULL
      AND total_engaged_users < (
        SELECT MAX(total_engaged_users) 
        FROM ide_completions_language_editors t2 
        WHERE t2.day = ide_completions_language_editors.day 
          AND t2.editor = ide_completions_language_editors.editor 
          AND t2.type = ide_completions_language_editors.type 
          AND t2.team_name IS NULL
      )
  `);

  // ide_completions_language_editors_model
  await knex.raw(`
    DELETE FROM ide_completions_language_editors_model 
    WHERE team_name IS NULL
      AND total_engaged_users < (
        SELECT MAX(total_engaged_users) 
        FROM ide_completions_language_editors_model t2 
        WHERE t2.day = ide_completions_language_editors_model.day 
          AND t2.editor = ide_completions_language_editors_model.editor 
          AND t2.model = ide_completions_language_editors_model.model 
          AND t2.type = ide_completions_language_editors_model.type 
          AND t2.team_name IS NULL
      )
  `);

  // ide_completions_language_editors_model_language
  await knex.raw(`
    DELETE FROM ide_completions_language_editors_model_language 
    WHERE team_name IS NULL
      AND total_engaged_users < (
        SELECT MAX(total_engaged_users) 
        FROM ide_completions_language_editors_model_language t2 
        WHERE t2.day = ide_completions_language_editors_model_language.day 
          AND t2.editor = ide_completions_language_editors_model_language.editor 
          AND t2.model = ide_completions_language_editors_model_language.model 
          AND t2.language = ide_completions_language_editors_model_language.language 
          AND t2.type = ide_completions_language_editors_model_language.type 
          AND t2.team_name IS NULL
      )
  `);

  // ide_chats
  await knex.raw(`
    DELETE FROM ide_chats 
    WHERE team_name IS NULL
      AND total_engaged_users < (
        SELECT MAX(total_engaged_users) 
        FROM ide_chats t2 
        WHERE t2.day = ide_chats.day 
          AND t2.type = ide_chats.type 
          AND t2.team_name IS NULL
      )
  `);

  // ide_chat_editors
  await knex.raw(`
    DELETE FROM ide_chat_editors 
    WHERE team_name IS NULL
      AND total_engaged_users < (
        SELECT MAX(total_engaged_users) 
        FROM ide_chat_editors t2 
        WHERE t2.day = ide_chat_editors.day 
          AND t2.editor = ide_chat_editors.editor 
          AND t2.type = ide_chat_editors.type 
          AND t2.team_name IS NULL
      )
  `);

  // ide_chat_editors_model
  await knex.raw(`
    DELETE FROM ide_chat_editors_model 
    WHERE team_name IS NULL
      AND total_engaged_users < (
        SELECT MAX(total_engaged_users) 
        FROM ide_chat_editors_model t2 
        WHERE t2.day = ide_chat_editors_model.day 
          AND t2.editor = ide_chat_editors_model.editor 
          AND t2.model = ide_chat_editors_model.model 
          AND t2.type = ide_chat_editors_model.type 
          AND t2.team_name IS NULL
      )
  `);

  // dotcom_chats
  await knex.raw(`
    DELETE FROM dotcom_chats 
    WHERE team_name IS NULL
      AND total_engaged_users < (
        SELECT MAX(total_engaged_users) 
        FROM dotcom_chats t2 
        WHERE t2.day = dotcom_chats.day 
          AND t2.type = dotcom_chats.type 
          AND t2.team_name IS NULL
      )
  `);

  // dotcom_chat_models
  await knex.raw(`
    DELETE FROM dotcom_chat_models 
    WHERE team_name IS NULL
      AND total_engaged_users < (
        SELECT MAX(total_engaged_users) 
        FROM dotcom_chat_models t2 
        WHERE t2.day = dotcom_chat_models.day 
          AND t2.model = dotcom_chat_models.model 
          AND t2.type = dotcom_chat_models.type 
          AND t2.team_name IS NULL
      )
  `);

  // dotcom_prs
  await knex.raw(`
    DELETE FROM dotcom_prs 
    WHERE team_name IS NULL
      AND total_engaged_users < (
        SELECT MAX(total_engaged_users) 
        FROM dotcom_prs t2 
        WHERE t2.day = dotcom_prs.day 
          AND t2.type = dotcom_prs.type 
          AND t2.team_name IS NULL
      )
  `);

  // dotcom_pr_repositories
  await knex.raw(`
    DELETE FROM dotcom_pr_repositories 
    WHERE team_name IS NULL
      AND total_engaged_users < (
        SELECT MAX(total_engaged_users) 
        FROM dotcom_pr_repositories t2 
        WHERE t2.day = dotcom_pr_repositories.day 
          AND t2.repository = dotcom_pr_repositories.repository 
          AND t2.type = dotcom_pr_repositories.type 
          AND t2.team_name IS NULL
      )
  `);

  // dotcom_pr_repositories_models
  await knex.raw(`
    DELETE FROM dotcom_pr_repositories_models 
    WHERE team_name IS NULL
      AND total_engaged_users < (
        SELECT MAX(total_engaged_users) 
        FROM dotcom_pr_repositories_models t2 
        WHERE t2.day = dotcom_pr_repositories_models.day 
          AND t2.repository = dotcom_pr_repositories_models.repository 
          AND t2.model = dotcom_pr_repositories_models.model 
          AND t2.type = dotcom_pr_repositories_models.type 
          AND t2.team_name IS NULL
      )
  `);

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
