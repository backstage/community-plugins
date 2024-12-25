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
  await knex.schema.createTable('announcements', table => {
    table.comment('The table for announcements.');
    table.text('id').notNullable().primary().comment('Announcement ID');
    table
      .string('publisher')
      .notNullable()
      .comment('A catalog reference to the team publishing the announcement.');
    table.text('title').notNullable().comment('Title of the announcement.');
    table.text('excerpt').notNullable().comment('Short summary (one-liner).');
    table.text('body').notNullable();
    table
      .timestamp('created_at')
      .notNullable()
      .index('announcements_created_at_idx');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('announcements', table => {
    table.dropIndex([], 'announcements_created_at_idx');
  });

  await knex.schema.dropTable('announcements');
};
