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
 * Creates the casbin_rule table if it does not already exist.
 * For existing installations, the TypeORM adapter created this table.
 * For new installations, this migration creates it.
 *
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
exports.up = async function up(knex) {
  const exists = await knex.schema.hasTable('casbin_rule');
  if (!exists) {
    await knex.schema.createTable('casbin_rule', table => {
      table.increments('id').primary();
      table.string('ptype').nullable();
      table.string('v0').nullable();
      table.string('v1').nullable();
      table.string('v2').nullable();
      table.string('v3').nullable();
      table.string('v4').nullable();
      table.string('v5').nullable();
    });
  }
};

/**
 * @param {import('knex').Knex} _knex
 * @returns {Promise<void>}
 */
exports.down = async function down(_knex) {
  // Intentionally empty — casbin_rule contains live policy data.
};
