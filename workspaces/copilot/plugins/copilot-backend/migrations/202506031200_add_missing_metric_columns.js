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
 * Adds missing columns to copilot_metrics_by_model_feature and
 * copilot_metrics_by_language_model, and creates copilot_metrics_by_cli.
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  // copilot_metrics_by_model_feature: add missing activity/loc columns
  await knex.schema.alterTable('copilot_metrics_by_model_feature', table => {
    table.integer('code_generation_activity_count');
    table.integer('code_acceptance_activity_count');
    table.integer('loc_suggested_to_add_sum');
    table.integer('loc_suggested_to_delete_sum');
    table.integer('loc_deleted_sum');
  });

  // copilot_metrics_by_language_model: add missing activity/loc columns
  // (request_count is kept for backwards compatibility; it was mapped from
  // code_generation_activity_count so has the same value)
  await knex.schema.alterTable('copilot_metrics_by_language_model', table => {
    table.integer('code_generation_activity_count');
    table.integer('code_acceptance_activity_count');
    table.integer('loc_suggested_to_add_sum');
    table.integer('loc_suggested_to_delete_sum');
    table.integer('loc_added_sum');
    table.integer('loc_deleted_sum');
  });

  // copilot_metrics_by_cli: new table for CLI usage breakdown per day/entity
  await knex.schema.createTable('copilot_metrics_by_cli', table => {
    table.increments('id').primary();
    table.date('day').notNullable();
    table.string('metrics_type').notNullable();
    table.string('entity_id').notNullable();
    table.string('team_slug').notNullable().defaultTo('');
    table.integer('prompt_count');
    table.integer('request_count');
    table.integer('session_count');
    table.float('avg_tokens_per_request');
    table.integer('output_tokens_sum');
    table.integer('prompt_tokens_sum');
    table.unique(['day', 'metrics_type', 'entity_id', 'team_slug']);
  });

  await knex.schema.alterTable('copilot_metrics_by_cli', table => {
    table.index(
      ['metrics_type', 'entity_id', 'team_slug', 'day'],
      'idx_copilot_metrics_by_cli_type_entity_team_day',
    );
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('copilot_metrics_by_cli');

  // SQLite does not support DROP COLUMN — recreate tables to remove added columns
  const client = knex.client.config.client;
  if (client === 'sqlite3' || client === 'better-sqlite3') {
    // For SQLite we leave the columns in place on down (safe to ignore extras)
    return;
  }

  await knex.schema.alterTable('copilot_metrics_by_model_feature', table => {
    table.dropColumn('code_generation_activity_count');
    table.dropColumn('code_acceptance_activity_count');
    table.dropColumn('loc_suggested_to_add_sum');
    table.dropColumn('loc_suggested_to_delete_sum');
    table.dropColumn('loc_deleted_sum');
  });

  await knex.schema.alterTable('copilot_metrics_by_language_model', table => {
    table.dropColumn('code_generation_activity_count');
    table.dropColumn('code_acceptance_activity_count');
    table.dropColumn('loc_suggested_to_add_sum');
    table.dropColumn('loc_suggested_to_delete_sum');
    table.dropColumn('loc_added_sum');
    table.dropColumn('loc_deleted_sum');
  });
};
