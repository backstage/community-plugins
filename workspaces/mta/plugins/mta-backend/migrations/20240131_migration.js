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
 * up - runs migration.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('oauth-mapping', table => {
    table.string('backstageID').primary();
    table.text('mtaOAuthRefreshToken'); // Changed from string to text
  });
  await knex.schema.createTable('entity-application-mapping', table => {
    table.string('entityUID').primary();
    table.integer('mtaApplication');
  });
};

/**
 * down - reverts(undo) migration.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('oauth-mapping');
  await knex.schema.dropTable('entity-application-mapping');
};
