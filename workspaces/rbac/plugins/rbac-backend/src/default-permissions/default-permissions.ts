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
import { validateSource } from '../validation/policies-validation';

const DEFAULT_ROLE_DESCRIPTION =
  'Role with default permissions for all users and groups.';

const DEFAULT_PERMISSIONS_CONF = 'permission.rbac.defaultPermissions';

export class DefaultPermissionsReader {
  constructor(private readonly config: Config) {}

  readRole(): string | undefined {
    const defPermissionsConfig = this.config.getOptionalConfig(
      DEFAULT_PERMISSIONS_CONF,
    );
    let role: string | undefined;

    if (defPermissionsConfig) {
      role = defPermissionsConfig.getOptionalString('defaultRole');

      if (role === '') {
        throw new Error(
          'Ignoring default role as it is empty. Please set a valid default role in the configuration.',
        );
      }
    }

    return role;
  }

  readPolicies(): RoleBasedPolicy[] {
    const defPermissionsConfig = this.config.getOptionalConfig(
      DEFAULT_PERMISSIONS_CONF,
    );
    const role = this.readRole();

    let policies: RoleBasedPolicy[] = [];
    if (defPermissionsConfig) {
      const basicPermissions =
        defPermissionsConfig.getOptionalConfigArray('basicPermissions');
      if (!basicPermissions || basicPermissions.length === 0) {
        throw new Error(
          `The default role '${role}' requires at least one entry in permission.rbac.defaultPermissions.basicPermissions.`,
        );
      }

      policies = basicPermissions.map(permission => {
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
          entityReference: role,
          permission: permissionName,
          policy: action || 'use',
          effect: effect || 'allow',
        };
      });
    }

    return policies;
  }
}

export class DefaultPermissionsSyncher {
  constructor(
    private readonly roleMetadataStorage: RoleMetadataStorage,
    private readonly enforcer: EnforcerDelegate,
    private readonly defaultPermissionsReader: DefaultPermissionsReader,
  ) {}

  public async sync() {
    const policies = this.defaultPermissionsReader.readPolicies();
    const roleEntityRef = this.defaultPermissionsReader.readRole();

    const prevDefRole = await this.roleMetadataStorage.getDefaultRole();

    const err = await validateSource('configuration', prevDefRole);
    if (err) {
      throw new Error(
        `Detected previous default role with incompatible source: ${err.message}`,
      );
    }

    if (!roleEntityRef) {
      if (prevDefRole) {
        const pls = await this.enforcer.getFilteredPolicy(
          0,
          prevDefRole.roleEntityRef,
        );
        if (pls.length > 0) {
          await this.enforcer.removePolicies(pls);
        }
        await this.roleMetadataStorage.removeRoleMetadata(
          prevDefRole.roleEntityRef,
        );
      }

      return;
    }

    const casbinPolicies: string[][] = policies.map(p => [
      p.entityReference!,
      p.permission!,
      p.policy!,
      p.effect!,
    ]);

    await this.roleMetadataStorage.syncDefaultRoleMetadata(roleEntityRef);
    await syncRolePolicies(this.enforcer, roleEntityRef, casbinPolicies);
  }
}

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
