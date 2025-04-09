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
  const roleMetaDataExist = await knex.schema.hasTable('role-metadata');
  const casbinExists = await knex.schema.hasTable('casbin_rule');
  if (roleMetaDataExist) {
    // Add the owner field to the role-metadata field
    await knex.schema.alterTable('role-metadata', table => {
      table.string('owner');
    });
  }

  if (casbinExists && roleMetaDataExist) {
    // Get the policies for resource type policy-entity and action create
    const policyEntityCreateRoles = await knex
      .from('casbin_rule')
      .where('v1', 'policy-entity')
      .where('v2', 'create')
      .pluck('v0');

    // Ensure that we are only updating the rest api and configuration policies only
    const rolesFromConfigAndRest = await knex
      .from('role-metadata')
      .whereNot('source', 'csv-file')
      .whereIn('roleEntityRef', policyEntityCreateRoles)
      .pluck('roleEntityRef');

    // Update the polices from the config and rest from resource type policy-entity and action create
    // to policy.entity.create and action create
    await knex
      .from('casbin_rule')
      .whereIn('v0', rolesFromConfigAndRest)
      .where('v2', 'create')
      .update({ v1: 'policy.entity.create' });

    const rolesFromCSV = await knex
      .from('role-metadata')
      .where('source', 'csv-file')
      .whereIn('roleEntityRef', policyEntityCreateRoles)
      .pluck('roleEntityRef');

    console.log(
      `The following roles: ${rolesFromCSV} have the permission policy 'policy-entity, create' and will need to be updated within the CSV file to 'policy.entity.create, create'`,
    );
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
  const isRoleMetaDataExist = await knex.schema.hasTable('role-metadata');
  if (isRoleMetaDataExist) {
    await knex.schema.alterTable('role-metadata', table => {
      table.dropColumn('owner');
    });
  }
};
