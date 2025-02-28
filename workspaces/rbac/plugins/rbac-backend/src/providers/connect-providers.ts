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
import type { LoggerService } from '@backstage/backend-plugin-api';

import type { AuditLogger } from '@janus-idp/backstage-plugin-audit-log-node';
import {
  Enforcer,
  newEnforcer,
  newModelFromString,
  StringAdapter,
} from 'casbin';

import type {
  RBACProvider,
  RBACProviderConnection,
} from '@backstage-community/plugin-rbac-node';

import {
  HANDLE_RBAC_DATA_STAGE,
  PermissionAuditInfo,
  PermissionEvents,
  RBAC_BACKEND,
  RoleAuditInfo,
  RoleEvents,
} from '../audit-log/audit-logger';
import { RoleMetadataStorage } from '../database/role-metadata';
import {
  transformArrayToPolicy,
  transformRolesGroupToLowercase,
  typedPoliciesToString,
} from '../helper';
import { EnforcerDelegate } from '../service/enforcer-delegate';
import { MODEL } from '../service/permission-model';
import {
  validateGroupingPolicy,
  validatePolicy,
  validateSource,
} from '../validation/policies-validation';

export class Connection implements RBACProviderConnection {
  constructor(
    private readonly id: string,
    private readonly enforcer: EnforcerDelegate,
    private readonly roleMetadataStorage: RoleMetadataStorage,
    private readonly logger: LoggerService,
    private readonly auditLogger: AuditLogger,
  ) {}

  async applyRoles(roles: string[][]): Promise<void> {
    const lowercasedRoles = transformRolesGroupToLowercase(roles);
    const stringPolicy = typedPoliciesToString(lowercasedRoles, 'g');
    const providerRolesforRemoval: string[][] = [];

    const tempEnforcer = await newEnforcer(
      newModelFromString(MODEL),
      new StringAdapter(stringPolicy),
    );

    const providerRoles = await this.getProviderRoles();

    await this.enforcer.loadPolicy();
    // Get the roles for this provider coming from rbac plugin
    for (const providerRole of providerRoles) {
      providerRolesforRemoval.push(
        ...(await this.enforcer.getFilteredGroupingPolicy(1, providerRole)),
      );
    }

    // Remove role
    // role exists in rbac but does not exist in provider
    await this.removeRoles(providerRolesforRemoval, tempEnforcer);

    // Add the role
    // role exists in provider but does not exist in rbac
    await this.addRoles(lowercasedRoles);
  }

  async applyPermissions(permissions: string[][]): Promise<void> {
    const stringPolicy = typedPoliciesToString(permissions, 'p');

    const providerPermissions: string[][] = [];

    const tempEnforcer = await newEnforcer(
      newModelFromString(MODEL),
      new StringAdapter(stringPolicy),
    );

    const providerRoles = await this.getProviderRoles();

    await this.enforcer.loadPolicy();
    // Get the roles for this provider coming from rbac plugin
    for (const providerRole of providerRoles) {
      providerPermissions.push(
        ...(await this.enforcer.getFilteredPolicy(0, providerRole)),
      );
    }

    await this.removePermissions(providerPermissions, tempEnforcer);

    await this.addPermissions(permissions);
  }

  private async addRoles(roles: string[][]): Promise<void> {
    for (const role of roles) {
      if (!(await this.enforcer.hasGroupingPolicy(...role))) {
        const metadata = await this.roleMetadataStorage.findRoleMetadata(
          role[1],
        );
        const err = await validateGroupingPolicy(role, metadata, this.id);

        if (err) {
          this.logger.warn(err.message);
          continue; // Skip adding this role as there was an error
        }

        let roleMeta = await this.roleMetadataStorage.findRoleMetadata(role[1]);

        const eventName = roleMeta
          ? RoleEvents.UPDATE_ROLE
          : RoleEvents.CREATE_ROLE;
        const message = roleMeta ? 'Updated role' : 'Created role';

        // role does not exist in rbac, create the metadata for it
        if (!roleMeta) {
          roleMeta = {
            modifiedBy: this.id,
            source: this.id,
            roleEntityRef: role[1],
          };
        }

        await this.enforcer.addGroupingPolicy(role, roleMeta);

        await this.auditLogger.auditLog<RoleAuditInfo>({
          actorId: RBAC_BACKEND,
          message,
          eventName,
          metadata: { ...roleMeta, members: [role[0]] },
          stage: HANDLE_RBAC_DATA_STAGE,
          status: 'succeeded',
        });
      }
    }
  }

  private async removeRoles(
    providerRoles: string[][],
    tempEnforcer: Enforcer,
  ): Promise<void> {
    // Remove role
    // role exists in rbac but does not exist in provider
    const lowercasedProviderRoles =
      transformRolesGroupToLowercase(providerRoles);
    for (const role of lowercasedProviderRoles) {
      if (!(await tempEnforcer.hasGroupingPolicy(...role))) {
        const roleMeta = await this.roleMetadataStorage.findRoleMetadata(
          role[1],
        );

        const currentRole = await this.enforcer.getFilteredGroupingPolicy(
          1,
          role[1],
        );

        if (!roleMeta) {
          this.logger.warn('role does not exist');
          continue;
        }

        const singleRole = roleMeta && currentRole.length === 1;

        let eventName: string;
        let message: string;

        // Only one role exists in rbac remove role metadata as well
        if (singleRole) {
          eventName = RoleEvents.DELETE_ROLE;
          message = 'Deleted role';
          await this.enforcer.removeGroupingPolicy(role, roleMeta);

          await this.auditLogger.auditLog<RoleAuditInfo>({
            actorId: RBAC_BACKEND,
            message,
            eventName,
            metadata: { ...roleMeta, members: [role[0]] },
            stage: HANDLE_RBAC_DATA_STAGE,
            status: 'succeeded',
          });
          continue; // Move on to the next role
        }

        eventName = RoleEvents.UPDATE_ROLE;
        message = 'Updated role: deleted members';
        await this.enforcer.removeGroupingPolicy(role, roleMeta, true);

        await this.auditLogger.auditLog<RoleAuditInfo>({
          actorId: RBAC_BACKEND,
          message,
          eventName,
          metadata: { ...roleMeta, members: [role[0]] },
          stage: HANDLE_RBAC_DATA_STAGE,
          status: 'succeeded',
        });
      }
    }
  }

  private async addPermissions(permissions: string[][]): Promise<void> {
    for (const permission of permissions) {
      if (!(await this.enforcer.hasPolicy(...permission))) {
        const transformedPolicy = transformArrayToPolicy(permission);
        const metadata = await this.roleMetadataStorage.findRoleMetadata(
          permission[0],
        );

        let err = validatePolicy(transformedPolicy);
        if (err) {
          this.logger.warn(`Invalid permission policy, ${err}`);
          continue; // Skip this invalid permission policy
        }

        err = await validateSource(this.id, metadata);
        if (err) {
          this.logger.warn(
            `Unable to add policy ${permission}. Cause: ${err.message}`,
          );
          continue;
        }

        await this.enforcer.addPolicy(permission);

        await this.auditLogger.auditLog<PermissionAuditInfo>({
          actorId: RBAC_BACKEND,
          message: `Created policy`,
          eventName: PermissionEvents.CREATE_POLICY,
          metadata: { policies: [permission], source: this.id },
          stage: HANDLE_RBAC_DATA_STAGE,
          status: 'succeeded',
        });
      }
    }
  }

  private async removePermissions(
    providerPermissions: string[][],
    tempEnforcer: Enforcer,
  ): Promise<void> {
    const removedPermissions: string[][] = [];
    for (const permission of providerPermissions) {
      if (!(await tempEnforcer.hasPolicy(...permission))) {
        await this.enforcer.removePolicy(permission);
        removedPermissions.push(permission);
      }

      if (removedPermissions.length > 0) {
        await this.auditLogger.auditLog<PermissionAuditInfo>({
          actorId: RBAC_BACKEND,
          message: `Deleted policies`,
          eventName: PermissionEvents.DELETE_POLICY,
          metadata: {
            policies: removedPermissions,
            source: this.id,
          },
          stage: HANDLE_RBAC_DATA_STAGE,
          status: 'succeeded',
        });
      }
    }
  }

  private async getProviderRoles(): Promise<string[]> {
    const currentRoles = await this.roleMetadataStorage.filterRoleMetadata(
      this.id,
    );
    return currentRoles.map(meta => meta.roleEntityRef);
  }
}

export async function connectRBACProviders(
  providers: RBACProvider[],
  enforcer: EnforcerDelegate,
  roleMetadataStorage: RoleMetadataStorage,
  logger: LoggerService,
  auditLogger: AuditLogger,
) {
  await Promise.all(
    providers.map(async provider => {
      try {
        const connection = new Connection(
          provider.getProviderName(),
          enforcer,
          roleMetadataStorage,
          logger,
          auditLogger,
        );
        return provider.connect(connection);
      } catch (error) {
        throw new Error(
          `Unable to connect provider ${provider.getProviderName()}, ${error}`,
        );
      }
    }),
  );
}
