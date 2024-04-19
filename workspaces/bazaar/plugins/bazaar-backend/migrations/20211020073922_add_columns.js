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
  await knex.schema.alterTable('metadata', table => {
    table
      .text('size')
      .defaultTo('medium')
      .notNullable()
      .comment('The estimated magnitude of the project');
    table
      .text('start_date')
      .comment('Optional start date of the project (ISO 8601 format)');
    table
      .text('end_date')
      .comment('Optional end date of the project (ISO 8601 format)');
    table
      .text('responsible')
      .defaultTo('')
      .notNullable()
      .comment('Contact person of the project');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('metadata', table => {
    table
      .dropColumn('size')
      .dropColumn('start_date')
      .dropColumn('end_date')
      .dropColumn('responsible');
  });
};
