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
  await knex.schema.createTable('copilot_metrics', table => {
    table.comment('Table for storing metrics for CoPilot in general');
    table.date('day').notNullable().comment('Date of the metrics data');
    table
      .string('type')
      .notNullable()
      .defaultTo('organization')
      .comment('The type of metric');
    table.string('team_name', 255).nullable().comment('Name of the team');
    table
      .integer('total_engaged_users')
      .notNullable()
      .comment('Total engaged users for the day');
    table
      .integer('total_active_users')
      .notNullable()
      .comment('Total active users for the day');
    table.unique(['day', 'type', 'team_name'], { indexName: 'uk_day' });
  });

  await knex.schema.createTable('ide_completions', table => {
    table.comment('Table for storing metrics for IDE completions');
    table.date('day').notNullable().comment('Date of the metrics data');
    table
      .string('type')
      .notNullable()
      .defaultTo('organization')
      .comment('The type of metric');
    table.string('team_name', 255).nullable().comment('Name of the team');
    table
      .integer('total_engaged_users')
      .notNullable()
      .comment('Total engaged users for the day');
    table.unique(['day', 'type', 'team_name'], {
      indexName: 'uk_ide_comp_day_type_team',
    });
  });

  await knex.schema.createTable('ide_completions_language_users', table => {
    table.comment('Table for storing metrics for IDE completions per language');
    table.date('day').notNullable().comment('Date of the metrics data');
    table
      .string('language')
      .notNullable()
      .comment('The language of the IDE completion');
    table
      .string('type')
      .notNullable()
      .defaultTo('organization')
      .comment('The type of metric');
    table.string('team_name', 255).nullable().comment('Name of the team');
    table
      .integer('total_engaged_users')
      .notNullable()
      .comment('Total engaged users for the day');
    table.unique(['day', 'language', 'type', 'team_name'], {
      indexName: 'uk_ide_comp_day_lang_type_team',
    });
  });

  await knex.schema.createTable('ide_completions_language_editors', table => {
    table.comment('Table for storing metrics for IDE completions per editor');
    table.date('day').notNullable().comment('Date of the metrics data');
    table
      .string('editor')
      .notNullable()
      .comment('The editor of the IDE completion');
    table
      .string('type')
      .notNullable()
      .defaultTo('organization')
      .comment('The type of metric');
    table.string('team_name', 255).nullable().comment('Name of the team');
    table
      .integer('total_engaged_users')
      .notNullable()
      .comment('Total engaged users for the day');
    table.unique(['day', 'editor', 'type', 'team_name'], {
      indexName: 'uk_ide_comp_day_editor_type_team',
    });
  });

  await knex.schema.createTable(
    'ide_completions_language_editors_model',
    table => {
      table.comment(
        'Table for storing metrics for IDE completions per editor per model',
      );
      table.date('day').notNullable().comment('Date of the metrics data');
      table
        .string('type')
        .notNullable()
        .defaultTo('organization')
        .comment('The type of metric');
      table.string('team_name', 255).nullable().comment('Name of the team');
      table
        .string('editor')
        .notNullable()
        .comment('The editor of the IDE completion');
      table
        .string('model')
        .notNullable()
        .comment('The model of the editor of the IDE completion');
      table
        .integer('total_engaged_users')
        .notNullable()
        .comment('Total engaged users for the day');
      table.unique(['day', 'editor', 'model', 'type', 'team_name'], {
        indexName: 'uk_ide_comp_day_editor_model_type_team',
      });
    },
  );

  await knex.schema.createTable(
    'ide_completions_language_editors_model_language',
    table => {
      table.comment(
        'Table for storing metrics for IDE completions per editor per model per language',
      );
      table.date('day').notNullable().comment('Date of the metrics data');
      table
        .string('type')
        .notNullable()
        .defaultTo('organization')
        .comment('The type of metric');
      table.string('team_name', 255).nullable().comment('Name of the team');
      table
        .string('editor')
        .notNullable()
        .comment('The editor of the IDE completion');
      table
        .string('model')
        .notNullable()
        .comment('The model of the editor of the IDE completion');
      table
        .string('language')
        .notNullable()
        .comment('The model of the editor of the IDE completion');
      table
        .integer('total_engaged_users')
        .notNullable()
        .comment('Total engaged users for the day');
      table
        .integer('total_code_acceptances')
        .notNullable()
        .comment('Total acceptances for the day');
      table
        .integer('total_code_suggestions')
        .notNullable()
        .comment('Total code suggestions for the day');
      table
        .integer('total_code_lines_accepted')
        .notNullable()
        .comment('Total code lines accepted for the day');
      table
        .integer('total_code_lines_suggested')
        .notNullable()
        .comment('The total code lines suggested for the day');
      table.unique(
        ['day', 'editor', 'model', 'language', 'type', 'team_name'],
        {
          indexName: 'uk_ide_comp_day_editor_model_language_type_team',
        },
      );
    },
  );

  // IDE chats
  await knex.schema.createTable('ide_chats', table => {
    table.comment('Table for storing metrics for IDE completions');
    table.date('day').notNullable().comment('Date of the metrics data');
    table
      .string('type')
      .notNullable()
      .defaultTo('organization')
      .comment('The type of metric');
    table.string('team_name', 255).nullable().comment('Name of the team');
    table
      .integer('total_engaged_users')
      .notNullable()
      .comment('Total engaged users for the day');
    table.unique(['day', 'type', 'team_name'], {
      indexName: 'uk_ide_chats_day_type_team',
    });
  });

  await knex.schema.createTable('ide_chat_editors', table => {
    table.comment('Table for storing metrics for IDE chats per editor');
    table.date('day').notNullable().comment('Date of the metrics data');
    table
      .string('type')
      .notNullable()
      .defaultTo('organization')
      .comment('The type of metric');
    table.string('team_name', 255).nullable().comment('Name of the team');
    table.string('editor').notNullable().comment('The editor of the IDE chat');
    table
      .integer('total_engaged_users')
      .notNullable()
      .comment('Total engaged users for the day');
    table.unique(['day', 'editor', 'type', 'team_name'], {
      indexName: 'uk_ide_chat_day_editor_type_team',
    });
  });

  await knex.schema.createTable('ide_chat_editors_model', table => {
    table.comment(
      'Table for storing metrics for IDE chats per editor per model',
    );
    table.date('day').notNullable().comment('Date of the metrics data');
    table
      .string('type')
      .notNullable()
      .defaultTo('organization')
      .comment('The type of metric');
    table.string('team_name', 255).nullable().comment('Name of the team');
    table.string('editor').notNullable().comment('The editor of the IDE chat');
    table.string('model').notNullable().comment('The model of the IDE chat');
    table
      .integer('total_engaged_users')
      .notNullable()
      .comment('Total engaged users for the day');
    table
      .integer('total_chat_copy_events')
      .notNullable()
      .comment('Total copy events for the day');
    table
      .integer('total_chat_insertion_events')
      .notNullable()
      .comment('Total insertions for the day');
    table
      .integer('total_chats')
      .notNullable()
      .comment('Total chats for the day');
    table.unique(['day', 'editor', 'model', 'type', 'team_name'], {
      indexName: 'uk_ide_chat_day_editor_model_type_team',
    });
  });

  // github.com chats
  // chats
  await knex.schema.createTable('dotcom_chats', table => {
    table.comment('Table for storing metrics for IDE completions');
    table.date('day').notNullable().comment('Date of the metrics data');
    table
      .string('type')
      .notNullable()
      .defaultTo('organization')
      .comment('The type of metric');
    table.string('team_name', 255).nullable().comment('Name of the team');
    table
      .integer('total_engaged_users')
      .notNullable()
      .comment('Total engaged users for the day');
    table.unique(['day', 'type', 'team_name'], {
      indexName: 'uk_day_type_team',
    });
  });

  await knex.schema.createTable('dotcom_chat_models', table => {
    table.comment('Table for storing metrics for IDE chats per editor');
    table.date('day').notNullable().comment('Date of the metrics data');
    table.string('model').notNullable().comment('The model of chat');
    table
      .string('type')
      .notNullable()
      .defaultTo('organization')
      .comment('The type of metric');
    table.string('team_name', 255).nullable().comment('Name of the team');
    table
      .integer('total_engaged_users')
      .notNullable()
      .comment('Total engaged users for the day');
    table
      .integer('total_chats')
      .notNullable()
      .comment('Total chats for the day');
    table.unique(['day', 'model', 'type', 'team_name'], {
      indexName: 'uk_day_model_type_team',
    });
  });

  // dotcom pull requests
  await knex.schema.createTable('dotcom_prs', table => {
    table.comment('Table for storing metrics for IDE completions');
    table.date('day').notNullable().comment('Date of the metrics data');
    table
      .string('type')
      .notNullable()
      .defaultTo('organization')
      .comment('The type of metric');
    table.string('team_name', 255).nullable().comment('Name of the team');
    table
      .integer('total_engaged_users')
      .notNullable()
      .comment('Total engaged users for the day');
    table.unique(['day', 'type', 'team_name'], {
      indexName: 'uk_pr_day_type_team',
    });
  });

  await knex.schema.createTable('dotcom_pr_repositories', table => {
    table.comment('Table for storing metrics for IDE completions');
    table.date('day').notNullable().comment('Date of the metrics data');
    table
      .string('type')
      .notNullable()
      .defaultTo('organization')
      .comment('The type of metric');
    table.string('team_name', 255).nullable().comment('Name of the team');
    table
      .string('repository')
      .notNullable()
      .comment('The repository of the pull request');
    table
      .integer('total_engaged_users')
      .notNullable()
      .comment('Total engaged users for the day');
    table.unique(['day', 'type', 'team_name', 'repository'], {
      indexName: 'uk_day_type_team_repo',
    });
  });

  await knex.schema.createTable('dotcom_pr_repositories_models', table => {
    table.comment('Table for storing metrics for IDE completions');
    table.date('day').notNullable().comment('Date of the metrics data');
    table
      .string('type')
      .notNullable()
      .defaultTo('organization')
      .comment('The type of metric');
    table.string('team_name', 255).nullable().comment('Name of the team');
    table
      .string('repository')
      .notNullable()
      .comment('The repository of the pull request');
    table
      .string('model')
      .notNullable()
      .comment('The model of the pull request');
    table
      .integer('total_engaged_users')
      .notNullable()
      .comment('Total engaged users for the day');
    table
      .integer('total_pr_summaries')
      .notNullable()
      .comment('Total pull request summaries for the day');
    table.unique(['day', 'type', 'team_name', 'repository', 'model'], {
      indexName: 'uk_day_type_team_repo_model',
    });
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('dotcom_pr_repositories_models');
  await knex.schema.dropTable('dotcom_pr_repositories');
  await knex.schema.dropTable('dotcom_prs');
  await knex.schema.dropTable('dotcom_chat_models');
  await knex.schema.dropTable('dotcom_chats');
  await knex.schema.dropTable('ide_chat_editors_model');
  await knex.schema.dropTable('ide_chat_editors');
  await knex.schema.dropTable('ide_chats');
  await knex.schema.dropTable(
    'ide_completions_language_editors_model_language',
  );
  await knex.schema.dropTable('ide_completions_language_editors_model');
  await knex.schema.dropTable('ide_completions_language_editors');
  await knex.schema.dropTable('ide_completions_language_users');
  await knex.schema.dropTable('ide_completions');
  await knex.schema.dropTable('copilot_metrics');
};
