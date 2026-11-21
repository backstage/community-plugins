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

// @ts-check

/**
 * @param { import("knex").Knex } knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('mdx_card_templates', table => {
    table.comment('MDX card templates');
    table
      .string('id')
      .primary()
      .comment('Identifier used to reference the template');
    table.text('title').nullable().comment('Card title');
    table.text('template').notNullable().comment('MDX template');
    table
      .text('data_fetchers')
      .notNullable()
      .comment('JSON array of data fetchers');
    table.string('created_by').notNullable().comment('Creator entity ref');
    table.timestamp('created_at', { useTz: true }).notNullable();
    table.string('updated_by').notNullable().comment('Last editor entity ref');
    table.timestamp('updated_at', { useTz: true }).notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('mdx_card_templates');
};
