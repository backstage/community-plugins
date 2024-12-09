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
  const casbinDoesExist = await knex.schema.hasTable('casbin_rule');
  const roleMetadataDoesExist = await knex.schema.hasTable('role-metadata');
  const groupPolicies = new Set();

  if (casbinDoesExist) {
    await knex
      .select('*')
      .from('casbin_rule')
      .where('ptype', 'g')
      .then(listGroupPolicies => {
        for (const groupPolicy of listGroupPolicies) {
          const { v1 } = groupPolicy;
          groupPolicies.add(v1);
        }
      });
  }

  if (!roleMetadataDoesExist) {
    await knex.schema
      .createTable('role-metadata', table => {
        table.increments('id').primary();
        table.string('roleEntityRef').primary();
        table.string('source');
      })
      .then(async () => {
        const metadata = [];
        for (const groupPolicy of groupPolicies) {
          metadata.push({ source: 'legacy', roleEntityRef: groupPolicy });
        }
        if (metadata.length > 0) {
          await knex.table('role-metadata').insert(metadata);
        }
      });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('role-metadata');
};
