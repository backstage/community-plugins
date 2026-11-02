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
 * Stores named customization activity from GitHub's dynamic `totals_by_*`
 * report fields. The category is data rather than a schema column so future
 * customization types do not require another migration.
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('copilot_customization_metrics', table => {
    table.increments('id').primary();
    table.date('day').notNullable();
    table.string('metrics_type').notNullable();
    table.string('entity_id').notNullable();
    table.string('scope').notNullable();
    table.string('team_slug').notNullable().defaultTo('');
    table.bigInteger('user_id').notNullable().defaultTo(0);
    table.string('user_login').notNullable().defaultTo('');
    table.string('category', 64).notNullable();
    table.string('item_name', 128).notNullable();
    table.integer('interaction_count').notNullable();
    table.unique([
      'day',
      'metrics_type',
      'entity_id',
      'scope',
      'team_slug',
      'user_id',
      'category',
      'item_name',
    ]);
    table.index(
      ['metrics_type', 'entity_id', 'scope', 'team_slug', 'day'],
      'idx_copilot_customization_metrics_scope_day',
    );
    table.index(
      ['metrics_type', 'entity_id', 'scope', 'user_login', 'day'],
      'idx_copilot_customization_metrics_user_day',
    );
  });

  await knex.schema.createTable('copilot_customization_summaries', table => {
    table.increments('id').primary();
    table.date('day').notNullable();
    table.string('metrics_type').notNullable();
    table.string('entity_id').notNullable();
    table.string('scope').notNullable();
    table.string('team_slug').notNullable().defaultTo('');
    table.bigInteger('user_id').notNullable().defaultTo(0);
    table.string('user_login').notNullable().defaultTo('');
    table.string('category', 64).notNullable();
    table.integer('distinct_item_count').notNullable();
    table.unique([
      'day',
      'metrics_type',
      'entity_id',
      'scope',
      'team_slug',
      'user_id',
      'category',
    ]);
    table.index(
      ['metrics_type', 'entity_id', 'scope', 'team_slug', 'day'],
      'idx_copilot_customization_summaries_scope_day',
    );
    table.index(
      ['metrics_type', 'entity_id', 'scope', 'user_login', 'day'],
      'idx_copilot_customization_summaries_user_day',
    );
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('copilot_customization_summaries');
  await knex.schema.dropTableIfExists('copilot_customization_metrics');
};
