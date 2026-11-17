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
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable(
    'copilot_enterprise_organization_directory',
    table => {
      table.string('enterprise_id').primary();
      table.boolean('is_complete').notNullable().defaultTo(false);
      table.timestamp('last_synced_at').nullable();
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    },
  );

  await knex.schema.createTable('copilot_enterprise_organizations', table => {
    table.string('enterprise_id').notNullable();
    table.string('organization_key').notNullable();
    table.string('organization_login').notNullable();
    table.boolean('is_current').notNullable().defaultTo(true);
    table.string('access_state', 32).notNullable().defaultTo('pending');
    table.boolean('reports_ready').notNullable().defaultTo(false);
    table.timestamp('last_attempted_at').nullable();
    table.timestamp('next_attempt_at').nullable();
    table.string('lease_owner', 64).nullable();
    table.timestamp('lease_expires_at').nullable();
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.primary(
      ['enterprise_id', 'organization_key'],
      'pk_copilot_enterprise_organizations',
    );
    table.index(
      ['enterprise_id', 'is_current', 'last_attempted_at'],
      'idx_copilot_enterprise_org_work',
    );
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('copilot_enterprise_organizations');
  await knex.schema.dropTableIfExists(
    'copilot_enterprise_organization_directory',
  );
};
