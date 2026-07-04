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
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  // copilot_metrics_by_model_feature
  await knex.schema.createTable('copilot_metrics_by_model_feature', table => {
    table.increments('id').primary();
    table.date('day').notNullable();
    table.string('metrics_type').notNullable();
    table.string('entity_id').notNullable();
    table.string('team_slug').notNullable().defaultTo('');
    table.string('model_id').notNullable();
    table.string('feature').notNullable();
    table.integer('user_initiated_interaction_count');
    table.integer('loc_added_sum');
    table.unique([
      'day',
      'metrics_type',
      'entity_id',
      'team_slug',
      'model_id',
      'feature',
    ]);
  });

  // copilot_metrics_by_language_model
  await knex.schema.createTable('copilot_metrics_by_language_model', table => {
    table.increments('id').primary();
    table.date('day').notNullable();
    table.string('metrics_type').notNullable();
    table.string('entity_id').notNullable();
    table.string('team_slug').notNullable().defaultTo('');
    table.string('language').notNullable();
    table.string('model_id').notNullable();
    table.integer('request_count');
    table.unique([
      'day',
      'metrics_type',
      'entity_id',
      'team_slug',
      'language',
      'model_id',
    ]);
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('copilot_metrics_by_language_model');
  await knex.schema.dropTableIfExists('copilot_metrics_by_model_feature');
};
