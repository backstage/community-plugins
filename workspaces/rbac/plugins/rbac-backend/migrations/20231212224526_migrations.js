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
  const policyMetadataDoesExist = await knex.schema.hasTable('policy-metadata');
  let policies = [];
  let groupPolicies = [];

  if (casbinDoesExist) {
    policies = await knex
      .select('*')
      .from('casbin_rule')
      .where('ptype', 'p')
      .then(listPolicies => {
        const allPolicies = [];
        for (const policy of listPolicies) {
          const { v0, v1, v2, v3 } = policy;
          allPolicies.push(`[${v0}, ${v1}, ${v2}, ${v3}]`);
        }
        return allPolicies;
      });
    groupPolicies = await knex
      .select('*')
      .from('casbin_rule')
      .where('ptype', 'g')
      .then(listGroupPolicies => {
        const allGroupPolicies = [];
        for (const groupPolicy of listGroupPolicies) {
          const { v0, v1 } = groupPolicy;
          allGroupPolicies.push(`[${v0}, ${v1}]`);
        }
        return allGroupPolicies;
      });
  }

  if (!policyMetadataDoesExist) {
    await knex.schema
      .createTable('policy-metadata', table => {
        table.increments('id').primary();
        table.string('policy').primary();
        table.string('source');
      })
      .then(async () => {
        const metadata = [];
        for (const policy of policies) {
          metadata.push({ source: 'legacy', policy: policy });
        }
        if (metadata.length > 0) {
          await knex.table('policy-metadata').insert(metadata);
        }
      })
      .then(async () => {
        const metadata = [];
        for (const groupPolicy of groupPolicies) {
          metadata.push({ source: 'legacy', policy: groupPolicy });
        }
        if (metadata.length > 0) {
          await knex.table('policy-metadata').insert(metadata);
        }
      });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('policy-metadata');
};
