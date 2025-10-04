/*
 * Copyright 2025 The Backstage Authors
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
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
  // Add the new column as nullable initially
  await knex.schema.alterTable('announcements', table => {
    table.timestamp('updated_at').nullable();
  });

  // Backfill the updated_at column with values from created_at
  await knex('announcements').update({
    updated_at: knex.raw('created_at'),
  });

  // Alter the column to be not nullable
  await knex.schema.alterTable('announcements', table => {
    table.timestamp('updated_at').notNullable().alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('announcements', table => {
    table.dropColumn('updated_at');
  });
};
