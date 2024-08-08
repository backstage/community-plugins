/*
 * Copyright 2021 The Backstage Authors
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

// @ts-check

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('metrics', table => {
    table.comment('Table for storing metrics');
    table
      .date('day')
      .notNullable()
      .primary()
      .comment('Date of the metrics data');
    table
      .integer('total_suggestions_count')
      .notNullable()
      .comment('Total suggestions count for the day');
    table
      .integer('total_acceptances_count')
      .notNullable()
      .comment('Total acceptances count for the day');
    table
      .integer('total_lines_suggested')
      .notNullable()
      .comment('Total lines suggested for the day');
    table
      .integer('total_lines_accepted')
      .notNullable()
      .comment('Total lines accepted for the day');
    table
      .integer('total_active_users')
      .notNullable()
      .comment('Total active users for the day');
    table
      .integer('total_chat_acceptances')
      .notNullable()
      .comment('Total chat acceptances for the day');
    table
      .integer('total_chat_turns')
      .notNullable()
      .comment('Total chat turns for the day');
    table
      .integer('total_active_chat_users')
      .notNullable()
      .comment('Total active chat users for the day');
    table.text('breakdown').notNullable().comment('Breakdown information');
  });

  await knex.schema.alterTable('metrics', table => {
    table.index('day', 'idx_metrics_day');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('metrics');
};
