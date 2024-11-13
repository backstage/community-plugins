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
import { Enforcer, newModelFromString } from 'casbin';
import { Knex } from 'knex';

import EventEmitter from 'events';

import { ADMIN_ROLE_NAME } from '../admin-permissions/admin-creation';
import {
  RoleMetadataDao,
  RoleMetadataStorage,
} from '../database/role-metadata';
import { mergeRoleMetadata, policiesToString, policyToString } from '../helper';
import { MODEL } from './permission-model';

export type RoleEvents = 'roleAdded';
export interface RoleEventEmitter<T extends RoleEvents> {
  on(event: T, listener: (roleEntityRef: string | string[]) => void): this;
}

type EventMap = {
  [event in RoleEvents]: any[];
};

export class EnforcerDelegate implements RoleEventEmitter<RoleEvents> {
  private readonly roleEventEmitter = new EventEmitter<EventMap>();

  constructor(
    private readonly enforcer: Enforcer,
    private readonly roleMetadataStorage: RoleMetadataStorage,
    private readonly knex: Knex,
  ) {}

  on(event: RoleEvents, listener: (role: string) => void): this {
    this.roleEventEmitter.on(event, listener);
    return this;
  }

  async hasPolicy(...policy: string[]): Promise<boolean> {
    return await this.enforcer.hasPolicy(...policy);
  }

  async hasGroupingPolicy(...policy: string[]): Promise<boolean> {
    return await this.enforcer.hasGroupingPolicy(...policy);
  }

  async getPolicy(): Promise<string[][]> {
    return await this.enforcer.getPolicy();
  }

  async getGroupingPolicy(): Promise<string[][]> {
    return await this.enforcer.getGroupingPolicy();
  }

  async getRolesForUser(userEntityRef: string): Promise<string[]> {
    return await this.enforcer.getRolesForUser(userEntityRef);
  }

  async getFilteredPolicy(
    fieldIndex: number,
    ...filter: string[]
  ): Promise<string[][]> {
    return await this.enforcer.getFilteredPolicy(fieldIndex, ...filter);
  }

  async getFilteredGroupingPolicy(
    fieldIndex: number,
    ...filter: string[]
  ): Promise<string[][]> {
    return await this.enforcer.getFilteredGroupingPolicy(fieldIndex, ...filter);
  }

  async addPolicy(
    policy: string[],
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());

    if (await this.enforcer.hasPolicy(...policy)) {
      return;
    }
    try {
      const ok = await this.enforcer.addPolicy(...policy);
      if (!ok) {
        throw new Error(`failed to create policy ${policyToString(policy)}`);
      }
      if (!externalTrx) {
        await trx.commit();
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);
      }
      throw err;
    }
  }

  async addPolicies(
    policies: string[][],
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    if (policies.length === 0) {
      return;
    }

    const trx = externalTrx || (await this.knex.transaction());

    try {
      const ok = await this.enforcer.addPolicies(policies);
      if (!ok) {
        throw new Error(
          `Failed to store policies ${policiesToString(policies)}`,
        );
      }
      if (!externalTrx) {
        await trx.commit();
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);
      }
      throw err;
    }
  }

  async addGroupingPolicy(
    policy: string[],
    roleMetadata: RoleMetadataDao,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());
    const entityRef = roleMetadata.roleEntityRef;

    if (await this.enforcer.hasGroupingPolicy(...policy)) {
      return;
    }
    try {
      let currentMetadata;
      if (entityRef.startsWith(`role:`)) {
        currentMetadata = await this.roleMetadataStorage.findRoleMetadata(
          entityRef,
          trx,
        );
      }

      if (currentMetadata) {
        await this.roleMetadataStorage.updateRoleMetadata(
          mergeRoleMetadata(currentMetadata, roleMetadata),
          entityRef,
          trx,
        );
      } else {
        const currentDate: Date = new Date();
        roleMetadata.createdAt = currentDate.toUTCString();
        roleMetadata.lastModified = currentDate.toUTCString();
        await this.roleMetadataStorage.createRoleMetadata(roleMetadata, trx);
      }

      const ok = await this.enforcer.addGroupingPolicy(...policy);
      if (!ok) {
        throw new Error(`failed to create policy ${policyToString(policy)}`);
      }
      if (!externalTrx) {
        await trx.commit();
      }
      if (!currentMetadata) {
        this.roleEventEmitter.emit('roleAdded', roleMetadata.roleEntityRef);
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);
      }
      throw err;
    }
  }

  async addGroupingPolicies(
    policies: string[][],
    roleMetadata: RoleMetadataDao,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    if (policies.length === 0) {
      return;
    }

    const trx = externalTrx ?? (await this.knex.transaction());

    try {
      const currentRoleMetadata =
        await this.roleMetadataStorage.findRoleMetadata(
          roleMetadata.roleEntityRef,
          trx,
        );
      if (currentRoleMetadata) {
        await this.roleMetadataStorage.updateRoleMetadata(
          mergeRoleMetadata(currentRoleMetadata, roleMetadata),
          roleMetadata.roleEntityRef,
          trx,
        );
      } else {
        const currentDate: Date = new Date();
        roleMetadata.createdAt = currentDate.toUTCString();
        roleMetadata.lastModified = currentDate.toUTCString();
        await this.roleMetadataStorage.createRoleMetadata(roleMetadata, trx);
      }

      const ok = await this.enforcer.addGroupingPolicies(policies);
      if (!ok) {
        throw new Error(
          `Failed to store policies ${policiesToString(policies)}`,
        );
      }

      if (!externalTrx) {
        await trx.commit();
      }
      if (!currentRoleMetadata) {
        this.roleEventEmitter.emit('roleAdded', roleMetadata.roleEntityRef);
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);
      }
      throw err;
    }
  }

  async updateGroupingPolicies(
    oldRole: string[][],
    newRole: string[][],
    newRoleMetadata: RoleMetadataDao,
  ): Promise<void> {
    const oldRoleName = oldRole.at(0)?.at(1)!;

    const trx = await this.knex.transaction();
    try {
      const currentMetadata = await this.roleMetadataStorage.findRoleMetadata(
        oldRoleName,
        trx,
      );
      if (!currentMetadata) {
        throw new Error(`Role metadata ${oldRoleName} was not found`);
      }

      await this.removeGroupingPolicies(oldRole, currentMetadata, true, trx);
      await this.addGroupingPolicies(newRole, newRoleMetadata, trx);
      await trx.commit();
    } catch (err) {
      await trx.rollback(err);
      throw err;
    }
  }

  async updatePolicies(
    oldPolicies: string[][],
    newPolicies: string[][],
  ): Promise<void> {
    const trx = await this.knex.transaction();

    try {
      await this.removePolicies(oldPolicies, trx);
      await this.addPolicies(newPolicies, trx);
      await trx.commit();
    } catch (err) {
      await trx.rollback(err);
      throw err;
    }
  }

  async removePolicy(policy: string[], externalTrx?: Knex.Transaction) {
    const trx = externalTrx ?? (await this.knex.transaction());

    try {
      const ok = await this.enforcer.removePolicy(...policy);
      if (!ok) {
        throw new Error(`fail to delete policy ${policy}`);
      }
      if (!externalTrx) {
        await trx.commit();
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);
      }
      throw err;
    }
  }

  async removePolicies(
    policies: string[][],
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());

    try {
      const ok = await this.enforcer.removePolicies(policies);
      if (!ok) {
        throw new Error(
          `Failed to delete policies ${policiesToString(policies)}`,
        );
      }

      if (!externalTrx) {
        await trx.commit();
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);
      }
      throw err;
    }
  }

  async removeGroupingPolicy(
    policy: string[],
    roleMetadata: RoleMetadataDao,
    isUpdate?: boolean,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());
    const roleEntity = policy[1];

    try {
      const ok = await this.enforcer.removeGroupingPolicy(...policy);
      if (!ok) {
        throw new Error(`Failed to delete policy ${policyToString(policy)}`);
      }

      if (!isUpdate) {
        const currentRoleMetadata =
          await this.roleMetadataStorage.findRoleMetadata(roleEntity, trx);
        const remainingGroupPolicies =
          await this.enforcer.getFilteredGroupingPolicy(1, roleEntity);
        if (
          currentRoleMetadata &&
          remainingGroupPolicies.length === 0 &&
          roleEntity !== ADMIN_ROLE_NAME
        ) {
          await this.roleMetadataStorage.removeRoleMetadata(roleEntity, trx);
        } else if (currentRoleMetadata) {
          await this.roleMetadataStorage.updateRoleMetadata(
            mergeRoleMetadata(currentRoleMetadata, roleMetadata),
            roleEntity,
            trx,
          );
        }
      }

      if (!externalTrx) {
        await trx.commit();
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);
      }
      throw err;
    }
  }

  async removeGroupingPolicies(
    policies: string[][],
    roleMetadata: RoleMetadataDao,
    isUpdate?: boolean,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());

    const roleEntity = roleMetadata.roleEntityRef;
    try {
      const ok = await this.enforcer.removeGroupingPolicies(policies);
      if (!ok) {
        throw new Error(
          `Failed to delete grouping policies: ${policiesToString(policies)}`,
        );
      }

      if (!isUpdate) {
        const currentRoleMetadata =
          await this.roleMetadataStorage.findRoleMetadata(roleEntity, trx);
        const remainingGroupPolicies =
          await this.enforcer.getFilteredGroupingPolicy(1, roleEntity);
        if (
          currentRoleMetadata &&
          remainingGroupPolicies.length === 0 &&
          roleEntity !== ADMIN_ROLE_NAME
        ) {
          await this.roleMetadataStorage.removeRoleMetadata(roleEntity, trx);
        } else if (currentRoleMetadata) {
          await this.roleMetadataStorage.updateRoleMetadata(
            mergeRoleMetadata(currentRoleMetadata, roleMetadata),
            roleEntity,
            trx,
          );
        }
      }

      if (!externalTrx) {
        await trx.commit();
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);
      }
      throw err;
    }
  }

  /**
   * enforce aims to enforce a particular permission policy based on the user that it receives.
   * Under the hood, enforce uses the `enforce` method from the enforcer`.
   *
   * Before enforcement, a filter is set up to reduce the number of permission policies that will
   * be loaded in.
   * This will reduce the amount of checks that need to be made to determine if a user is authorize
   * to perform an action
   *
   * A temporary enforcer will also be used while enforcing.
   * This is to ensure that the filter does not interact with the base enforcer.
   * The temporary enforcer has lazy loading of the permission policies enabled to reduce the amount
   * of time it takes to initialize the temporary enforcer.
   * The justification for lazy loading is because permission policies are already present in the
   * role manager / database and it will be filtered and loaded whenever `loadFilteredPolicy` is called.
   * @param entityRef The user to enforce
   * @param resourceType The resource type / name of the permission policy
   * @param action The action of the permission policy
   * @param roles Any roles that the user is directly or indirectly attached to.
   * Used for filtering permission policies.
   * @returns True if the user is allowed based on the particular permission
   */
  async enforce(
    entityRef: string,
    resourceType: string,
    action: string,
    roles: string[],
  ): Promise<boolean> {
    const filter = [];
    if (roles.length > 0) {
      roles.forEach(role => {
        filter.push({ ptype: 'p', v0: role, v1: resourceType, v2: action });
      });
    } else {
      filter.push({ ptype: 'p', v1: resourceType, v2: action });
    }

    const adapt = this.enforcer.getAdapter();
    const roleManager = this.enforcer.getRoleManager();
    const tempEnforcer = new Enforcer();
    await tempEnforcer.initWithModelAndAdapter(
      newModelFromString(MODEL),
      adapt,
      true,
    );
    tempEnforcer.setRoleManager(roleManager);

    await tempEnforcer.loadFilteredPolicy(filter);

    return await tempEnforcer.enforce(entityRef, resourceType, action);
  }

  async getImplicitPermissionsForUser(user: string): Promise<string[][]> {
    return this.enforcer.getImplicitPermissionsForUser(user);
  }

  async getAllRoles(): Promise<string[]> {
    return this.enforcer.getAllRoles();
  }
}
