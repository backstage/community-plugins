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
  await knex.schema.createTable('seats', table => {
    table.comment('Table for storing metrics for CoPilot seat metrics');
    table.date('day').notNullable().comment('Date of the metrics data');
    table
      .string('type')
      .notNullable()
      .defaultTo('organization')
      .comment('The type of metric');
    table.string('team_name', 255).nullable().comment('Name of the team');
    table.integer('total_seats').notNullable().comment('Total seats');
    table
      .integer('seats_never_used')
      .notNullable()
      .comment('Total seats never used');
    table
      .integer('seats_inactive_7_days')
      .notNullable()
      .comment('Total seats inactive for 7 days');
    table
      .integer('seats_inactive_14_days')
      .notNullable()
      .comment('Total seats inactive for 14 days');
    table
      .integer('seats_inactive_28_days')
      .notNullable()
      .comment('Total seats inactive for 28 days');
    table.unique(['day', 'type', 'team_name'], { indexName: 'uk_seat_day' });
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('seats');
};
