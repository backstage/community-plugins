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
import type { Config } from '@backstage/config';

import { Knex } from 'knex';

import { ActionType, PermissionEvents, RoleEvents } from '../auditor/auditor';

import {
  RoleMetadataDao,
  RoleMetadataStorage,
} from '../database/role-metadata';
import { removeTheDifference } from '../helper';
import { EnforcerDelegate } from '../service/enforcer-delegate';
import { validateEntityReference } from '../validation/policies-validation';
import { AuditorService } from '@backstage/backend-plugin-api';

export const ADMIN_ROLE_NAME = 'role:default/rbac_admin';
export const ADMIN_ROLE_AUTHOR = 'application configuration';
const DEF_ADMIN_ROLE_DESCRIPTION =
  'The default permission policy for the admin role allows for the creation, deletion, updating, and reading of roles and permission policies.';

const getAdminRoleMetadata = (): RoleMetadataDao => {
  const currentDate: Date = new Date();
  return {
    source: 'configuration',
    roleEntityRef: ADMIN_ROLE_NAME,
    description: DEF_ADMIN_ROLE_DESCRIPTION,
    author: ADMIN_ROLE_AUTHOR,
    modifiedBy: ADMIN_ROLE_AUTHOR,
    lastModified: currentDate.toUTCString(),
    createdAt: currentDate.toUTCString(),
  };
};

export const useAdminsFromConfig = async (
  admins: Config[],
  enf: EnforcerDelegate,
  auditor: AuditorService,
  roleMetadataStorage: RoleMetadataStorage,
  knex: Knex,
) => {
  const addedGroupPolicies = new Map<string, string>();
  const newGroupPolicies = new Map<string, string>();

  for (const admin of admins) {
    const entityRef = admin.getString('name').toLocaleLowerCase('en-US');
    validateEntityReference(entityRef);

    addedGroupPolicies.set(entityRef, ADMIN_ROLE_NAME);

    if (!(await enf.hasGroupingPolicy(...[entityRef, ADMIN_ROLE_NAME]))) {
      newGroupPolicies.set(entityRef, ADMIN_ROLE_NAME);
    }
  }

  const adminRoleMeta =
    await roleMetadataStorage.findRoleMetadata(ADMIN_ROLE_NAME);
  const addedRoleMembers = Array.from<string[]>(newGroupPolicies.entries());
  const meta = {
    ...getAdminRoleMetadata(),
    members: addedRoleMembers.map(gp => gp[0]),
  };
  const auditorEvent = await auditor.createEvent({
    eventId: RoleEvents.ROLE_WRITE,
    severityLevel: 'medium',
    meta: {
      actionType: adminRoleMeta ? ActionType.UPDATE : ActionType.CREATE,
      source: meta.source,
    },
  });

  const trx = await knex.transaction();
  try {
    if (!adminRoleMeta) {
      // even if there are no user, we still create default role metadata for admins
      await roleMetadataStorage.createRoleMetadata(getAdminRoleMetadata(), trx);
    } else if (adminRoleMeta.source === 'legacy') {
      await roleMetadataStorage.updateRoleMetadata(
        getAdminRoleMetadata(),
        ADMIN_ROLE_NAME,
        trx,
      );
    }

    await enf.addGroupingPolicies(
      addedRoleMembers,
      getAdminRoleMetadata(),
      undefined,
      trx,
    );

    await trx.commit();
    await auditorEvent.success({
      meta,
    });
  } catch (error) {
    await trx.rollback(error);
    await auditorEvent.fail({
      error,
      meta,
    });
    throw error;
  }

  const configGroupPolicies = await enf.getFilteredGroupingPolicy(
    1,
    ADMIN_ROLE_NAME,
  );

  await removeTheDifference(
    configGroupPolicies.map(gp => gp[0]),
    Array.from<string>(addedGroupPolicies.keys()),
    'configuration',
    ADMIN_ROLE_NAME,
    enf,
    auditor,
    ADMIN_ROLE_AUTHOR,
  );
};

const addAdminPermissions = async (
  policies: string[][],
  enf: EnforcerDelegate,
  auditor: AuditorService,
) => {
  const policiesToAdd: string[][] = [];
  for (const policy of policies) {
    if (!(await enf.hasPolicy(...policy))) {
      policiesToAdd.push(policy);
    }
  }

  const auditorEvent = await auditor.createEvent({
    eventId: PermissionEvents.POLICY_WRITE,
    severityLevel: 'medium',
    meta: { actionType: ActionType.CREATE, source: 'configuration' },
  });

  try {
    await enf.addPolicies(policiesToAdd);
    await auditorEvent.success({
      meta: { policies: policiesToAdd },
    });
  } catch (error) {
    await auditorEvent.fail({
      error,
      meta: { policies: policiesToAdd },
    });
  }
};

const removeOldCreateAdminPermissions = async (
  enf: EnforcerDelegate,
  auditor: AuditorService,
) => {
  const policyEntityCreate = [
    'role:default/rbac_admin',
    'policy-entity',
    'create',
    'allow',
  ];
  if (await enf.hasPolicy(...policyEntityCreate)) {
    const auditorEvent = await auditor.createEvent({
      eventId: PermissionEvents.POLICY_WRITE,
      severityLevel: 'medium',
      meta: { actionType: ActionType.DELETE, source: 'configuration' },
    });

    try {
      await enf.removePolicy(policyEntityCreate);
      await auditorEvent.success({
        meta: { policy: policyEntityCreate },
      });
    } catch (error) {
      await auditorEvent.fail({
        error,
        meta: { policy: policyEntityCreate },
      });
    }
  }
};

export const setAdminPermissions = async (
  enf: EnforcerDelegate,
  auditor: AuditorService,
) => {
  // TODO: Temporary workaround to prevent breakages after the removal of the resource type `policy-entity` from the permission `policy.entity.create`
  await removeOldCreateAdminPermissions(enf, auditor);
  const adminPermissions = [
    [ADMIN_ROLE_NAME, 'policy-entity', 'read', 'allow'],
    [ADMIN_ROLE_NAME, 'policy.entity.create', 'create', 'allow'],
    [ADMIN_ROLE_NAME, 'policy-entity', 'delete', 'allow'],
    [ADMIN_ROLE_NAME, 'policy-entity', 'update', 'allow'],
    // Needed for the RBAC frontend plugin.
    [ADMIN_ROLE_NAME, 'catalog-entity', 'read', 'allow'],
  ];
  await addAdminPermissions(adminPermissions, enf, auditor);
};
