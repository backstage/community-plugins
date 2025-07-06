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
  await knex.schema.createTable('categories', table => {
    table.comment('The table for announcement categories.');
    table.string('slug').notNullable().primary().comment('Category slug');
    table.string('title').notNullable().comment('Title of the category.');
  });

  await knex.schema.alterTable('announcements', table => {
    table.string('category').comment('Announcement category');

    table
      .foreign('category', 'category_fk')
      .references('slug')
      .inTable('categories')
      .onDelete('SET NULL');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('announcements', table => {
    table.dropForeign('category', 'category_fk');
    table.dropColumn('category');
  });

  await knex.schema.dropTable('categories');
};
