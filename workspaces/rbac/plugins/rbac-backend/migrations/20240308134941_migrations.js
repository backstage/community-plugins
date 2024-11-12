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

exports.up = async function up(knex) {
  await knex.schema.createTable('role-condition-policies', table => {
    table.increments('id').primary();
    table.string('roleEntityRef');
    table.string('result');
    table.string('pluginId');
    table.string('resourceType');
    table.string('permissions');
    // Conditions is potentially long json.
    // In the future maybe we can use `json` or `jsonb` type instead of `text`:
    // table.json('conditions') or table.jsonb('conditions').
    // But let's start with text type.
    // Data type "text" can be unlimited by size for Postgres.
    // Also postgres has a lot of build in features for this data type.
    table.text('conditionsJson');
  });
};

/**
 * down - reverts(undo) migration.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('policy-conditions');
};
