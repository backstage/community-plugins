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
  await knex.schema.createTable('settings', table => {
    table.comment('The table for announcement settings.');
    table
      .string('id')
      .notNullable()
      .primary()
      .defaultTo('default')
      .comment('Settings ID');
    table
      .integer('maxPerPage')
      .notNullable()
      .defaultTo(10)
      .comment('Maximum announcements per page');
    table
      .boolean('showInactiveAnnouncements')
      .notNullable()
      .defaultTo(false)
      .comment('Whether to show inactive announcements');
  });

  // Insert default settings
  await knex('settings').insert({
    id: 'default',
    maxPerPage: 10,
    showInactiveAnnouncements: false,
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('settings');
};
