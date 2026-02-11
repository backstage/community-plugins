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
import { ConflictError } from '@backstage/errors';

import {
  Role,
  RoleBasedPolicy,
  isValidPermissionAction,
} from '@backstage-community/plugin-rbac-common';

import type {
  RoleMetadataDao,
  RoleMetadataStorage,
} from '../database/role-metadata';
import type { EnforcerDelegate } from '../service/enforcer-delegate';
import { ADMIN_ROLE_AUTHOR } from '../admin-permissions/admin-creation';

/**
 * Default role and its permission policies from configuration.
 * When no default role is configured, both `role` and `policies` are undefined.
 */
export type DefaultRoleAndPolicies = {
  role: Role;
  policies: RoleBasedPolicy[];
};

const DEFAULT_ROLE_DESCRIPTION =
  'Role with default permissions for all users and groups.';

function buildDefaultRole(defaultRoleRef: string): Role {
  return {
    memberReferences: [],
    name: defaultRoleRef,
    metadata: {
      source: 'configuration',
      isDefault: true,
      description: DEFAULT_ROLE_DESCRIPTION,
      modifiedBy: ADMIN_ROLE_AUTHOR,
      lastModified: new Date().toUTCString(),
    },
  };
}

async function ensureNoExistingRoleForDefaultRole(
  defaultRoleRef: string,
  roleMetadataStorage: RoleMetadataStorage,
): Promise<void> {
  const existing: RoleMetadataDao | undefined =
    await roleMetadataStorage.findRoleMetadata(defaultRoleRef);
  if (existing) {
    throw new ConflictError(
      `A role with name '${defaultRoleRef}' already exists. The default role must not conflict with an existing role.`,
    );
  }
}

async function ensureNoPoliciesForDefaultRole(
  defaultRoleRef: string,
  enforcerDelegate: EnforcerDelegate,
): Promise<void> {
  const policies = await enforcerDelegate.getFilteredPolicy(0, defaultRoleRef);
  if (policies.length > 0) {
    throw new ConflictError(
      `Permission policies already exist for role '${defaultRoleRef}'. The default role must not conflict with existing policies.`,
    );
  }
}

/**
 * Returns the default role object and its permission policies from configuration.
 * Validates that no role with the same name exists and no policies are stored for it.
 * Returns undefined when no default role or basicPermissions are configured.
 */
export async function getDefaultRoleAndPolicies(
  config: Config,
  roleMetadataStorage: RoleMetadataStorage,
  enforcerDelegate: EnforcerDelegate,
): Promise<DefaultRoleAndPolicies | undefined> {
  const defaultRoleRef = config.getOptionalString(
    'permission.rbac.defaultPermissions.defaultRole',
  );
  if (defaultRoleRef === '') {
    throw new Error(
      'Ignoring default role as it is empty. Please set a valid default role in the configuration.',
    );
  }

  if (!defaultRoleRef) {
    return undefined;
  }

  const basicPermissions = config.getOptionalConfigArray(
    'permission.rbac.defaultPermissions.basicPermissions',
  );

  if (!basicPermissions) {
    return undefined;
  }

  await ensureNoExistingRoleForDefaultRole(defaultRoleRef, roleMetadataStorage);
  await ensureNoPoliciesForDefaultRole(defaultRoleRef, enforcerDelegate);

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
      entityReference: defaultRoleRef,
      permission: permissionName,
      policy: action || 'use',
      effect: effect || 'allow',
      metadata: {
        source: 'configuration',
      },
    };
  });

  return {
    role: buildDefaultRole(defaultRoleRef),
    policies,
  };
}
