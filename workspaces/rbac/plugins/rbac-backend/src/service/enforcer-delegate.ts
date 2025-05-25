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
import { Enforcer, FilteredAdapter, newModelFromString } from 'casbin';
import { Knex } from 'knex';

import EventEmitter from 'events';

import { ADMIN_ROLE_NAME } from '../admin-permissions/admin-creation';
import {
  RoleMetadataDao,
  RoleMetadataStorage,
} from '../database/role-metadata';
import { mergeRoleMetadata, policiesToString, policyToString } from '../helper';
import { MODEL } from './permission-model';
import { PoliciesData } from '../auditor/auditor';
import { AuditorService } from '@backstage/backend-plugin-api';
import { ConditionalStorage } from '../database/conditional-storage';

export type RoleEvents = 'roleAdded';
export interface RoleEventEmitter<T extends RoleEvents> {
  on(event: T, listener: (roleEntityRef: string | string[]) => void): this;
}

type EventMap = {
  [event in RoleEvents]: any[];
};

export class EnforcerDelegate implements RoleEventEmitter<RoleEvents> {
  private readonly roleEventEmitter = new EventEmitter<EventMap>();

  private loadPolicyPromise: Promise<void> | null = null;
  private editOperationsQueue: Promise<any>[] = []; // Queue to track edit operations

  constructor(
    private readonly enforcer: Enforcer,
    private readonly auditor: AuditorService,
    private readonly conditionalStorage: ConditionalStorage,
    private readonly roleMetadataStorage: RoleMetadataStorage,
    private readonly knex: Knex,
  ) {}

  async loadPolicy(): Promise<void> {
    if (this.loadPolicyPromise) {
      // If a load operation is already in progress, return the cached promise
      return this.loadPolicyPromise;
    }

    this.loadPolicyPromise = (async () => {
      try {
        await this.waitForEditOperationsToFinish();

        await this.enforcer.loadPolicy();
      } catch (error) {
        const auditorEvent = await this.auditor.createEvent({
          eventId: PoliciesData.PERMISSIONS_READ,
          severityLevel: 'medium',
        });
        await auditorEvent.fail({ error });
      } finally {
        this.loadPolicyPromise = null;
      }
    })();

    return this.loadPolicyPromise;
  }

  private async waitForEditOperationsToFinish(): Promise<void> {
    await Promise.all(this.editOperationsQueue);
  }

  async execOperation<T>(operation: Promise<T>): Promise<T> {
    this.editOperationsQueue.push(operation);

    let result;
    try {
      result = await operation;
    } catch (err) {
      throw err;
    } finally {
      const index = this.editOperationsQueue.indexOf(operation);
      if (index !== -1) {
        this.editOperationsQueue.splice(index, 1);
      }
    }

    return result;
  }

  on(event: RoleEvents, listener: (role: string) => void): this {
    this.roleEventEmitter.on(event, listener);
    return this;
  }

  async hasPolicy(...policy: string[]): Promise<boolean> {
    const tempModel = newModelFromString(MODEL);
    await (this.enforcer.getAdapter() as FilteredAdapter).loadFilteredPolicy(
      tempModel,
      [
        {
          ptype: 'p',
          v0: policy[0],
          v1: policy[1],
          v2: policy[2],
          v3: policy[3],
        },
      ],
    );
    return tempModel.hasPolicy('p', 'p', policy);
  }

  async hasGroupingPolicy(...policy: string[]): Promise<boolean> {
    const tempModel = newModelFromString(MODEL);
    await (this.enforcer.getAdapter() as FilteredAdapter).loadFilteredPolicy(
      tempModel,
      [
        {
          ptype: 'g',
          v0: policy[0],
          v1: policy[1],
        },
      ],
    );
    return tempModel.hasPolicy('g', 'g', policy);
  }

  async getPolicy(): Promise<string[][]> {
    const tempModel = newModelFromString(MODEL);
    await (this.enforcer.getAdapter() as FilteredAdapter).loadFilteredPolicy(
      tempModel,
      [{ ptype: 'p' }],
    );
    return await tempModel.getPolicy('p', 'p');
  }

  async getGroupingPolicy(): Promise<string[][]> {
    const tempModel = newModelFromString(MODEL);
    await (this.enforcer.getAdapter() as FilteredAdapter).loadFilteredPolicy(
      tempModel,
      [{ ptype: 'g' }],
    );
    return await tempModel.getPolicy('g', 'g');
  }

  async getRolesForUser(userEntityRef: string): Promise<string[]> {
    return await this.enforcer.getRolesForUser(userEntityRef);
  }

  async getFilteredPolicy(
    fieldIndex: number,
    ...filter: string[]
  ): Promise<string[][]> {
    const tempModel = newModelFromString(MODEL);

    const filterObj: Record<string, string> = { ptype: 'p' };
    for (let i = 0; i < filter.length; i++) {
      if (filter[i]) {
        filterObj[`v${i + fieldIndex}`] = filter[i];
      }
    }

    await (this.enforcer.getAdapter() as FilteredAdapter).loadFilteredPolicy(
      tempModel,
      [filterObj],
    );

    return await tempModel.getPolicy('p', 'p');
  }

  async getFilteredGroupingPolicy(
    fieldIndex: number,
    ...filter: string[]
  ): Promise<string[][]> {
    const tempModel = newModelFromString(MODEL);

    const filterObj: Record<string, string> = { ptype: 'g' };
    for (let i = 0; i < filter.length; i++) {
      if (filter[i]) {
        filterObj[`v${i + fieldIndex}`] = filter[i];
      }
    }

    await (this.enforcer.getAdapter() as FilteredAdapter).loadFilteredPolicy(
      tempModel,
      [filterObj],
    );

    return await tempModel.getPolicy('g', 'g');
  }

  async addPolicy(
    policy: string[],
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());

    if (await this.hasPolicy(...policy)) {
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
    if (this.loadPolicyPromise) {
      await this.loadPolicyPromise;
    } else {
      await this.loadPolicy();
    }

    const addPoliciesOperation = (async () => {
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
    })();
    await this.execOperation(addPoliciesOperation);
  }

  async addGroupingPolicy(
    policy: string[],
    roleMetadata: RoleMetadataDao,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    if (this.loadPolicyPromise) {
      await this.loadPolicyPromise;
    } else {
      await this.loadPolicy();
    }

    const addGroupingPolicyOperation = (async () => {
      const trx = externalTrx ?? (await this.knex.transaction());
      const entityRef = roleMetadata.roleEntityRef;

      if (await this.hasGroupingPolicy(...policy)) {
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
    })();
    await this.execOperation(addGroupingPolicyOperation);
  }

  async addGroupingPolicies(
    policies: string[][],
    roleMetadata: RoleMetadataDao,
    oldRoleEntityRef?: string,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    if (this.loadPolicyPromise) {
      await this.loadPolicyPromise;
    } else {
      await this.loadPolicy();
    }

    const addGroupingPoliciesOperation = (async () => {
      if (policies.length === 0) {
        return;
      }

      const trx = externalTrx ?? (await this.knex.transaction());

      try {
        const currentRoleMetadata =
          await this.roleMetadataStorage.findRoleMetadata(
            oldRoleEntityRef ?? roleMetadata.roleEntityRef,
            trx,
          );
        if (currentRoleMetadata) {
          await this.roleMetadataStorage.updateRoleMetadata(
            mergeRoleMetadata(currentRoleMetadata, roleMetadata),
            oldRoleEntityRef ?? roleMetadata.roleEntityRef,
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
    })();
    await this.execOperation(addGroupingPoliciesOperation);
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
      await this.addGroupingPolicies(
        newRole,
        newRoleMetadata,
        currentMetadata.roleEntityRef,
        trx,
      );

      // Role name changed -> update roleEntityRef in policies
      if (newRoleMetadata.roleEntityRef !== currentMetadata.roleEntityRef) {
        const oldPolicies = await this.enforcer.getFilteredPolicy(
          0,
          currentMetadata.roleEntityRef,
        );
        const updatedPolicies = oldPolicies.map(oldPolicy => [
          newRoleMetadata.roleEntityRef,
          ...oldPolicy.slice(1),
        ]);
        await this.updatePolicies(oldPolicies, updatedPolicies, trx);

        const oldConditions = await this.conditionalStorage.filterConditions(
          currentMetadata.roleEntityRef,
          undefined,
          undefined,
          undefined,
          undefined,
          trx,
        );
        for (const condition of oldConditions) {
          await this.conditionalStorage.updateCondition(
            condition.id,
            {
              ...condition,
              roleEntityRef: newRoleMetadata.roleEntityRef,
            },
            trx,
          );
        }
      }

      await trx.commit();
    } catch (err) {
      await trx.rollback(err);
      throw err;
    }
  }

  async updatePolicies(
    oldPolicies: string[][],
    newPolicies: string[][],
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());

    try {
      await this.removePolicies(oldPolicies, trx);
      await this.addPolicies(newPolicies, trx);
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

  async removePolicy(policy: string[], externalTrx?: Knex.Transaction) {
    if (this.loadPolicyPromise) {
      await this.loadPolicyPromise;
    } else {
      await this.loadPolicy();
    }

    const removePolicyOperation = (async () => {
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
    })();
    await this.execOperation(removePolicyOperation);
  }

  async removePolicies(
    policies: string[][],
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    if (this.loadPolicyPromise) {
      await this.loadPolicyPromise;
    } else {
      await this.loadPolicy();
    }

    const removePoliciesOperation = (async () => {
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
    })();
    await this.execOperation(removePoliciesOperation);
  }

  async removeGroupingPolicy(
    policy: string[],
    roleMetadata: RoleMetadataDao,
    isUpdate?: boolean,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    if (this.loadPolicyPromise) {
      await this.loadPolicyPromise;
    } else {
      await this.loadPolicy();
    }

    const removeGroupingPolicyOperation = (async () => {
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
          const remainingGroupPolicies = await this.getFilteredGroupingPolicy(
            1,
            roleEntity,
          );
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
    })();
    await this.execOperation(removeGroupingPolicyOperation);
  }

  async removeGroupingPolicies(
    policies: string[][],
    roleMetadata: RoleMetadataDao,
    isUpdate?: boolean,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    if (this.loadPolicyPromise) {
      await this.loadPolicyPromise;
    } else {
      await this.loadPolicy();
    }

    const removeGroupingPolicyOperation = (async () => {
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
          const remainingGroupPolicies = await this.getFilteredGroupingPolicy(
            1,
            roleEntity,
          );

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
    })();
    await this.execOperation(removeGroupingPolicyOperation);
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
   * role manager / database and it will be filtered and loaded whenever `getFilteredPolicy` is called
   * and permissions / roles are applied to the temp enforcer
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
    const model = newModelFromString(MODEL);
    let policies: string[][] = [];
    if (roles.length > 0) {
      for (const role of roles) {
        const filteredPolicy = await this.getFilteredPolicy(
          0,
          role,
          resourceType,
          action,
        );
        policies.push(...filteredPolicy);
      }
    } else {
      const enforcePolicies = await this.getFilteredPolicy(
        1,
        resourceType,
        action,
      );
      policies = enforcePolicies.filter(
        policy =>
          policy[0].startsWith('user:') || policy[0].startsWith('group:'),
      );
    }

    const roleManager = this.enforcer.getRoleManager();
    const tempEnforcer = new Enforcer();

    model.addPolicies('p', 'p', policies);

    await tempEnforcer.initWithModelAndAdapter(model);
    tempEnforcer.setRoleManager(roleManager);
    await tempEnforcer.buildRoleLinks();

    return await tempEnforcer.enforce(entityRef, resourceType, action);
  }

  async getImplicitPermissionsForUser(user: string): Promise<string[][]> {
    if (this.loadPolicyPromise) {
      await this.loadPolicyPromise;
    } else {
      await this.loadPolicy();
    }

    const getPermissionsForUserOperation = (async () => {
      return this.enforcer.getImplicitPermissionsForUser(user);
    })();

    return await this.execOperation(getPermissionsForUserOperation);
  }

  async getAllRoles(): Promise<string[]> {
    if (this.loadPolicyPromise) {
      await this.loadPolicyPromise;
    } else {
      await this.loadPolicy();
    }

    const getRolesOperation = (async () => {
      return this.enforcer.getAllRoles();
    })();

    return await this.execOperation(getRolesOperation);
  }
}
