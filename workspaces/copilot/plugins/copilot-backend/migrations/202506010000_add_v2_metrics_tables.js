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
  // copilot_daily_totals
  await knex.schema.createTable('copilot_daily_totals', table => {
    table.increments('id').primary();
    table.date('day').notNullable();
    table.string('metrics_type').notNullable();
    table.string('entity_id').notNullable();
    table.string('team_slug').notNullable().defaultTo('');
    table.integer('daily_active_users');
    table.integer('weekly_active_users');
    table.integer('monthly_active_users');
    table.integer('daily_active_cli_users');
    table.integer('monthly_active_agent_users');
    table.integer('monthly_active_chat_users');
    table.integer('code_acceptance_activity_count');
    table.integer('code_generation_activity_count');
    table.integer('loc_added_sum');
    table.integer('loc_deleted_sum');
    table.integer('loc_suggested_to_add_sum');
    table.integer('loc_suggested_to_delete_sum');
    table.integer('user_initiated_interaction_count');
    table.unique(['day', 'metrics_type', 'entity_id', 'team_slug']);
  });

  // copilot_pr_metrics
  await knex.schema.createTable('copilot_pr_metrics', table => {
    table.increments('id').primary();
    table.date('day').notNullable();
    table.string('metrics_type').notNullable();
    table.string('entity_id').notNullable();
    table.string('team_slug').notNullable().defaultTo('');
    table.integer('total_created');
    table.integer('total_merged');
    table.integer('total_reviewed');
    table.integer('total_created_by_copilot');
    table.integer('total_merged_created_by_copilot');
    table.integer('total_merged_reviewed_by_copilot');
    table.integer('total_reviewed_by_copilot');
    table.integer('total_suggestions');
    table.integer('total_applied_suggestions');
    table.integer('total_copilot_suggestions');
    table.integer('total_copilot_applied_suggestions');
    table.float('median_minutes_to_merge');
    table.float('median_minutes_to_merge_copilot_authored');
    table.float('median_minutes_to_merge_copilot_reviewed');
    table.unique(['day', 'metrics_type', 'entity_id', 'team_slug']);
  });

  // copilot_metrics_by_feature
  await knex.schema.createTable('copilot_metrics_by_feature', table => {
    table.increments('id').primary();
    table.date('day').notNullable();
    table.string('metrics_type').notNullable();
    table.string('entity_id').notNullable();
    table.string('team_slug').notNullable().defaultTo('');
    table.string('feature').notNullable();
    table.integer('code_acceptance_activity_count');
    table.integer('code_generation_activity_count');
    table.integer('loc_added_sum');
    table.integer('loc_deleted_sum');
    table.integer('loc_suggested_to_add_sum');
    table.integer('loc_suggested_to_delete_sum');
    table.integer('user_initiated_interaction_count');
    table.unique(['day', 'metrics_type', 'entity_id', 'team_slug', 'feature']);
  });

  // copilot_metrics_by_ide
  await knex.schema.createTable('copilot_metrics_by_ide', table => {
    table.increments('id').primary();
    table.date('day').notNullable();
    table.string('metrics_type').notNullable();
    table.string('entity_id').notNullable();
    table.string('team_slug').notNullable().defaultTo('');
    table.string('ide').notNullable();
    table.integer('code_acceptance_activity_count');
    table.integer('code_generation_activity_count');
    table.integer('loc_added_sum');
    table.integer('loc_deleted_sum');
    table.integer('loc_suggested_to_add_sum');
    table.integer('loc_suggested_to_delete_sum');
    table.integer('user_initiated_interaction_count');
    table.unique(['day', 'metrics_type', 'entity_id', 'team_slug', 'ide']);
  });

  // copilot_metrics_by_language_feature
  await knex.schema.createTable(
    'copilot_metrics_by_language_feature',
    table => {
      table.increments('id').primary();
      table.date('day').notNullable();
      table.string('metrics_type').notNullable();
      table.string('entity_id').notNullable();
      table.string('team_slug').notNullable().defaultTo('');
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
        'team_slug',
        'language',
        'feature',
      ]);
    },
  );

  // copilot_user_metrics
  await knex.schema.createTable('copilot_user_metrics', table => {
    table.increments('id').primary();
    table.date('day').notNullable();
    table.string('metrics_type').notNullable();
    table.string('entity_id').notNullable();
    table.bigInteger('user_id').notNullable();
    table.string('user_login').notNullable();
    table.boolean('used_agent');
    table.boolean('used_chat');
    table.boolean('used_cli');
    table.integer('code_acceptance_activity_count');
    table.integer('code_generation_activity_count');
    table.integer('loc_added_sum');
    table.integer('loc_deleted_sum');
    table.integer('loc_suggested_to_add_sum');
    table.integer('loc_suggested_to_delete_sum');
    table.integer('user_initiated_interaction_count');
    table.unique(['day', 'metrics_type', 'entity_id', 'user_id']);
  });

  // copilot_user_teams
  await knex.schema.createTable('copilot_user_teams', table => {
    table.increments('id').primary();
    table.date('day').notNullable();
    table.string('metrics_type').notNullable();
    table.string('entity_id').notNullable();
    table.bigInteger('user_id').notNullable();
    table.string('user_login').notNullable();
    table.bigInteger('team_id').notNullable();
    table.string('team_slug').notNullable();
    table.unique(['day', 'metrics_type', 'entity_id', 'user_id', 'team_id']);
  });

  // copilot_ingestion_log
  await knex.schema.createTable('copilot_ingestion_log', table => {
    table.increments('id').primary();
    table.date('day').notNullable();
    table.string('metrics_type').notNullable();
    table.string('entity_id').notNullable();
    table.timestamp('ingested_at').defaultTo(knex.fn.now());
    table.string('status').notNullable();
    table.text('components_loaded').notNullable().defaultTo('[]');
    table.text('error_message').nullable();
    table.string('source').notNullable().defaultTo('scheduled');
    table.unique(['day', 'metrics_type', 'entity_id']);
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('copilot_ingestion_log');
  await knex.schema.dropTableIfExists('copilot_user_teams');
  await knex.schema.dropTableIfExists('copilot_user_metrics');
  await knex.schema.dropTableIfExists('copilot_metrics_by_language_feature');
  await knex.schema.dropTableIfExists('copilot_metrics_by_ide');
  await knex.schema.dropTableIfExists('copilot_metrics_by_feature');
  await knex.schema.dropTableIfExists('copilot_pr_metrics');
  await knex.schema.dropTableIfExists('copilot_daily_totals');
};
