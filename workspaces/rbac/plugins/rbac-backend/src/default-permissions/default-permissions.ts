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
import { Config } from '@backstage/config';

import {
  RoleBasedPolicy,
  isValidPermissionAction,
} from '@backstage-community/plugin-rbac-common';

import type {
  RoleMetadataDao,
  RoleMetadataStorage,
} from '../database/role-metadata';
import type { EnforcerDelegate } from '../service/enforcer-delegate';
import { syncRolePolicies } from '../helper';
import { ADMIN_ROLE_AUTHOR } from '../admin-permissions/admin-creation';

const DEFAULT_ROLE_DESCRIPTION =
  'Role with default permissions for all users and groups.';

export function buildDefaultRoleMetadata(
  defaultRoleRef: string,
): RoleMetadataDao {
  return {
    roleEntityRef: defaultRoleRef,
    author: ADMIN_ROLE_AUTHOR,
    source: 'configuration',
    isDefault: true,
    description: DEFAULT_ROLE_DESCRIPTION,
    modifiedBy: ADMIN_ROLE_AUTHOR,
    lastModified: new Date().toUTCString(),
    createdAt: new Date().toUTCString(),
  };
}

/**
 * Syncs default role metadata (role-metadata) and persists default permission policies in the database (casbin via enforcer-delegate).
 */
export async function syncDefaultRoleAndPolicies(
  config: Config,
  enforcerDelegate: EnforcerDelegate,
  roleMetadataStorage: RoleMetadataStorage,
): Promise<void> {
  const roleEntityRef = config.getOptionalString(
    'permission.rbac.defaultPermissions.defaultRole',
  );
  if (roleEntityRef === '') {
    throw new Error(
      'Ignoring default role as it is empty. Please set a valid default role in the configuration.',
    );
  }

  if (!roleEntityRef) {
    const previousDefault = await roleMetadataStorage.getDefaultRole();
    if (previousDefault) {
      const policiesToRemove = await enforcerDelegate.getFilteredPolicy(
        0,
        previousDefault.roleEntityRef,
      );
      if (policiesToRemove.length > 0) {
        await enforcerDelegate.removePolicies(policiesToRemove);
      }
    }
    await roleMetadataStorage.syncDefaultRoleMetadata(roleEntityRef);
    return;
  }

  const basicPermissions = config.getOptionalConfigArray(
    'permission.rbac.defaultPermissions.basicPermissions',
  );
  if (!basicPermissions || basicPermissions.length === 0) {
    throw new Error(
      `The default role '${roleEntityRef}' requires at least one entry in permission.rbac.defaultPermissions.basicPermissions.`,
    );
  }

  const policies: RoleBasedPolicy[] = basicPermissions.map(permission => {
    const permissionName = permission.getString('permission');
    const action = permission.getOptionalString('action');
    const effect = permission.getOptionalString('effect');

    if (action && !isValidPermissionAction(action)) {
      throw new Error(
        `Invalid action '${action}' for permission '${permissionName}'.`,
      );
    }

    if (effect && effect !== 'allow' && effect !== 'deny') {
      throw new Error(
        `Invalid effect '${effect}' for permission '${permissionName}'. It must be 'allow' or 'deny'.`,
      );
    }

    return {
      entityReference: roleEntityRef,
      permission: permissionName,
      policy: action || 'use',
      effect: effect || 'allow',
    };
  });

  const casbinPolicies: string[][] = policies.map(p => [
    p.entityReference!,
    p.permission!,
    p.policy!,
    p.effect!,
  ]);

  await roleMetadataStorage.syncDefaultRoleMetadata(roleEntityRef);
  await syncRolePolicies(enforcerDelegate, roleEntityRef, casbinPolicies);
}
