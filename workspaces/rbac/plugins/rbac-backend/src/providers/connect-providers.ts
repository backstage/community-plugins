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
import type {
  AuditorService,
  LoggerService,
} from '@backstage/backend-plugin-api';

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

import { PermissionEvents, RoleEvents } from '../auditor/auditor';
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
    private readonly auditor: AuditorService,
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
          ? RoleEvents.ROLE_UPDATE
          : RoleEvents.ROLE_CREATE;

        // role does not exist in rbac, create the metadata for it
        if (!roleMeta) {
          roleMeta = {
            modifiedBy: this.id,
            source: this.id,
            roleEntityRef: role[1],
          };
        }

        const auditorMeta = {
          ...roleMeta,
          members: [role[0]],
        };
        const auditorEvent = await this.auditor.createEvent({
          eventId: eventName,
          severityLevel: 'medium',
          meta: { source: auditorMeta.source },
        });

        try {
          await this.enforcer.addGroupingPolicy(role, roleMeta);
          await auditorEvent.success({ meta: auditorMeta });
        } catch (error) {
          await auditorEvent.fail({
            error,
            meta: auditorMeta,
          });
        }
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
        let eventName: (typeof RoleEvents)[keyof typeof RoleEvents] =
          RoleEvents.ROLE_UPDATE;

        // Only one role exists in rbac remove role metadata as well
        if (singleRole) {
          eventName = RoleEvents.ROLE_DELETE;
        }

        const auditorMeta = { ...roleMeta, members: [role[0]] };
        const auditorEvent = await this.auditor?.createEvent({
          eventId: eventName,
          severityLevel: 'medium',
          meta: { source: roleMeta.source },
        });

        try {
          await this.enforcer.removeGroupingPolicy(
            role,
            roleMeta,
            eventName === RoleEvents.ROLE_UPDATE,
          );
          await auditorEvent.success({ meta: auditorMeta });
        } catch (error) {
          await auditorEvent.fail({
            error,
            meta: auditorMeta,
          });
        }
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

        const auditorMeta = {
          policies: [permission],
          source: this.id,
        };
        const auditorEvent = await this.auditor.createEvent({
          eventId: PermissionEvents.POLICY_CREATE,
          severityLevel: 'medium',
          meta: { source: auditorMeta.source },
        });

        let err = validatePolicy(transformedPolicy);
        if (err) {
          auditorEvent.fail({ error: err, meta: auditorMeta });
          continue; // Skip this invalid permission policy
        }

        err = await validateSource(this.id, metadata);
        if (err) {
          auditorEvent.fail({ error: err, meta: auditorMeta });
          continue;
        }

        try {
          await this.enforcer.addPolicy(permission);
          await auditorEvent.success({ meta: auditorMeta });
        } catch (error) {
          await auditorEvent.fail({ error, meta: auditorMeta });
        }
      }
    }
  }

  private async removePermissions(
    providerPermissions: string[][],
    tempEnforcer: Enforcer,
  ): Promise<void> {
    for (const permission of providerPermissions) {
      if (!(await tempEnforcer.hasPolicy(...permission))) {
        const auditorMeta = {
          policies: [permission],
          source: this.id,
        };
        const auditorEvent = await this.auditor?.createEvent({
          eventId: PermissionEvents.POLICY_DELETE,
          severityLevel: 'medium',
          meta: { source: this.id },
        });

        try {
          await this.enforcer.removePolicy(permission);
          await auditorEvent.success({ meta: auditorMeta });
        } catch (error) {
          await auditorEvent.fail({
            error,
            meta: auditorMeta,
          });
        }
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
  auditor: AuditorService,
) {
  await Promise.all(
    providers.map(async provider => {
      try {
        const connection = new Connection(
          provider.getProviderName(),
          enforcer,
          roleMetadataStorage,
          logger,
          auditor,
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
