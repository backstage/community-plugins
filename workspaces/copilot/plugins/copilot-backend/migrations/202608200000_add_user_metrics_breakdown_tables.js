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

/**
 * Adds per-user breakdown tables mirroring the existing team-level breakdown
 * tables (copilot_metrics_by_feature/by_ide/by_language_feature/
 * by_model_feature/by_language_model), but keyed by user instead of team.
 *
 * This data was already being parsed from the users-1-day report into the
 * in-memory `UserBreakdownData` structure (see reportParser.ts), but was
 * previously discarded after being folded into team-level aggregates. These
 * tables persist it per-user so that a privacy-safe, self-service "my
 * metrics" view can offer the same breakdown charts (by feature/IDE/
 * language/model) that the team/org dashboard offers, scoped to a single
 * resolved user.
 *
 * Every table is keyed on (day, metrics_type, entity_id, user_id, ...dims)
 * and also stores user_login for convenient lookups, since the "me" API
 * resolves callers by GitHub login rather than numeric user id.
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  // copilot_user_metrics_by_feature
  await knex.schema.createTable('copilot_user_metrics_by_feature', table => {
    table.increments('id').primary();
    table.date('day').notNullable();
    table.string('metrics_type').notNullable();
    table.string('entity_id').notNullable();
    table.integer('user_id').notNullable();
    table.string('user_login').notNullable();
    table.string('feature').notNullable();
    table.integer('code_acceptance_activity_count');
    table.integer('code_generation_activity_count');
    table.integer('loc_added_sum');
    table.integer('loc_deleted_sum');
    table.integer('loc_suggested_to_add_sum');
    table.integer('loc_suggested_to_delete_sum');
    table.integer('user_initiated_interaction_count');
    table.unique(['day', 'metrics_type', 'entity_id', 'user_id', 'feature']);
    table.index(
      ['metrics_type', 'entity_id', 'user_login', 'day'],
      'idx_copilot_user_metrics_by_feature_login_day',
    );
  });

  // copilot_user_metrics_by_ide
  await knex.schema.createTable('copilot_user_metrics_by_ide', table => {
    table.increments('id').primary();
    table.date('day').notNullable();
    table.string('metrics_type').notNullable();
    table.string('entity_id').notNullable();
    table.integer('user_id').notNullable();
    table.string('user_login').notNullable();
    table.string('ide').notNullable();
    table.integer('code_acceptance_activity_count');
    table.integer('code_generation_activity_count');
    table.integer('loc_added_sum');
    table.integer('loc_deleted_sum');
    table.integer('loc_suggested_to_add_sum');
    table.integer('loc_suggested_to_delete_sum');
    table.integer('user_initiated_interaction_count');
    table.unique(['day', 'metrics_type', 'entity_id', 'user_id', 'ide']);
    table.index(
      ['metrics_type', 'entity_id', 'user_login', 'day'],
      'idx_copilot_user_metrics_by_ide_login_day',
    );
  });

  // copilot_user_metrics_by_language_feature
  await knex.schema.createTable(
    'copilot_user_metrics_by_language_feature',
    table => {
      table.increments('id').primary();
      table.date('day').notNullable();
      table.string('metrics_type').notNullable();
      table.string('entity_id').notNullable();
      table.integer('user_id').notNullable();
      table.string('user_login').notNullable();
      table.string('language').notNullable();
      table.string('feature').notNullable();
      table.integer('code_acceptance_activity_count');
      table.integer('code_generation_activity_count');
      table.integer('loc_added_sum');
      table.integer('loc_deleted_sum');
      table.integer('loc_suggested_to_add_sum');
      table.integer('loc_suggested_to_delete_sum');
      table.unique([
        'day',
        'metrics_type',
        'entity_id',
        'user_id',
        'language',
        'feature',
      ]);
      table.index(
        ['metrics_type', 'entity_id', 'user_login', 'day'],
        'idx_copilot_user_metrics_by_lang_feature_login_day',
      );
    },
  );

  // copilot_user_metrics_by_model_feature
  await knex.schema.createTable(
    'copilot_user_metrics_by_model_feature',
    table => {
      table.increments('id').primary();
      table.date('day').notNullable();
      table.string('metrics_type').notNullable();
      table.string('entity_id').notNullable();
      table.integer('user_id').notNullable();
      table.string('user_login').notNullable();
      table.string('model_id').notNullable();
      table.string('feature').notNullable();
      table.integer('user_initiated_interaction_count');
      table.integer('code_generation_activity_count');
      table.integer('code_acceptance_activity_count');
      table.integer('loc_added_sum');
      table.integer('loc_deleted_sum');
      table.integer('loc_suggested_to_add_sum');
      table.integer('loc_suggested_to_delete_sum');
      table.unique([
        'day',
        'metrics_type',
        'entity_id',
        'user_id',
        'model_id',
        'feature',
      ]);
      table.index(
        ['metrics_type', 'entity_id', 'user_login', 'day'],
        'idx_copilot_user_metrics_by_model_feature_login_day',
      );
    },
  );

  // copilot_user_metrics_by_language_model
  await knex.schema.createTable(
    'copilot_user_metrics_by_language_model',
    table => {
      table.increments('id').primary();
      table.date('day').notNullable();
      table.string('metrics_type').notNullable();
      table.string('entity_id').notNullable();
      table.integer('user_id').notNullable();
      table.string('user_login').notNullable();
      table.string('language').notNullable();
      table.string('model_id').notNullable();
      table.integer('request_count');
      table.integer('code_generation_activity_count');
      table.integer('code_acceptance_activity_count');
      table.integer('loc_added_sum');
      table.integer('loc_deleted_sum');
      table.integer('loc_suggested_to_add_sum');
      table.integer('loc_suggested_to_delete_sum');
      table.unique([
        'day',
        'metrics_type',
        'entity_id',
        'user_id',
        'language',
        'model_id',
      ]);
      table.index(
        ['metrics_type', 'entity_id', 'user_login', 'day'],
        'idx_copilot_user_metrics_by_lang_model_login_day',
      );
    },
  );
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('copilot_user_metrics_by_language_model');
  await knex.schema.dropTableIfExists('copilot_user_metrics_by_model_feature');
  await knex.schema.dropTableIfExists(
    'copilot_user_metrics_by_language_feature',
  );
  await knex.schema.dropTableIfExists('copilot_user_metrics_by_ide');
  await knex.schema.dropTableIfExists('copilot_user_metrics_by_feature');
};
