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
  const policyMetadataExist = await knex.schema.hasTable('policy-metadata');
  const roleMetadataExist = await knex.schema.hasTable('role-metadata');

  if (casbinDoesExist && policyMetadataExist) {
    const policyMetadataColumns = await knex('policy-metadata').select(
      'id',
      'policy',
    );

    const policiesToCheck = policyMetadataColumns.map(metadataColumn => {
      const policy = metadataColumn.policy
        .replace(/\[/g, '')
        .replace(/\]/g, '')
        .split(',')
        .map(str => str.trim());
      return { policy, id: metadataColumn.id };
    });

    const existingPolicies = await knex('casbin_rule')
      .whereIn(
        'v0',
        policiesToCheck.map(policyToCheck => policyToCheck.policy[0]),
      )
      .whereIn(
        'v1',
        policiesToCheck.map(policyToCheck => policyToCheck.policy[1]),
      )
      .andWhere(query => {
        query
          .where(innerQuery => {
            innerQuery.whereNotNull('v2').whereIn(
              'v2',
              policiesToCheck
                .filter(policy => policy.policy.length === 4)
                .map(policy => policy.policy[2]),
            );
          })
          .orWhereNull('v2');
      })
      .andWhere(query => {
        query
          .where(innerQuery => {
            innerQuery.whereNotNull('v3').whereIn(
              'v3',
              policiesToCheck
                .filter(policy => policy.policy.length === 4)
                .map(policy => policy.policy[3]),
            );
          })
          .orWhereNull('v3');
      })
      .select('v0', 'v1', 'v2', 'v3');

    const existingPoliciesSet = new Set(
      existingPolicies.map(policy =>
        policy.v2
          ? `${policy.v0},${policy.v1},${policy.v2},${policy.v3}`
          : `${policy.v0},${policy.v1}`,
      ),
    );

    const policiesToDelete = policiesToCheck.filter(
      policyToCheck => !existingPoliciesSet.has(policyToCheck.policy.join(',')),
    );

    if (policiesToDelete.length > 0) {
      await knex('policy-metadata')
        .whereIn(
          'id',
          policiesToDelete.map(policyToDel => policyToDel.id),
        )
        .del();
      console.log(
        `Deleted inconsistent policy metadata ${JSON.stringify(
          policiesToDelete,
        )} from 'policy-metadata' table.`,
      );
    }
  }

  if (casbinDoesExist && roleMetadataExist) {
    const roleMetadataColumns = await knex('role-metadata').select(
      'id',
      'roleEntityRef',
    );
    const roleMetadata = roleMetadataColumns.map(rm => {
      return { roleEntityRef: rm.roleEntityRef, id: rm.id };
    });
    const existingPoliciesForRoles = await knex('casbin_rule')
      .orWhereIn(
        'v1',
        roleMetadata.map(rm => rm.roleEntityRef),
      )
      .select('v1');

    const existingRoles = new Set(
      existingPoliciesForRoles.map(policy => policy.v1),
    );
    const rolesMetadataToDelete = roleMetadata.filter(
      rm => !existingRoles.has(rm.roleEntityRef),
    );

    if (rolesMetadataToDelete.length > 0) {
      await knex('role-metadata')
        .whereIn(
          'id',
          rolesMetadataToDelete.map(rm => rm.id),
        )
        .del();
      console.log(
        `Deleted inconsistent role metadata ${JSON.stringify(
          rolesMetadataToDelete,
        )} from 'role-metadata' table.`,
      );
    }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function down(_knex) {
  // do nothing
};
