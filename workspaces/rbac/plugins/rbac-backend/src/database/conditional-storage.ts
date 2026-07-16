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
import { ConflictError, InputError, NotFoundError } from '@backstage/errors';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import { Knex } from 'knex';

import {
  type PermissionAction,
  type PermissionMapping,
  type RoleConditionalPolicyDecision,
  isPermissionInfo,
  permissionMappingAction,
} from '@backstage-community/plugin-rbac-common';

export const CONDITIONAL_TABLE = 'role-condition-policies';

function mappingEntriesConflict(
  a: PermissionMapping,
  b: PermissionMapping,
): boolean {
  if (permissionMappingAction(a) !== permissionMappingAction(b)) {
    return false;
  }
  const aHasName = isPermissionInfo(a);
  const bHasName = isPermissionInfo(b);
  if (aHasName && bHasName) {
    return a.name === b.name;
  }
  // broad (nameless) conflicts with everything that has the same action
  return true;
}

export interface ConditionalPolicyDecisionDAO {
  result: AuthorizeResult.CONDITIONAL;
  id?: number;
  roleEntityRef: string;
  permissions: string;
  pluginId: string;
  resourceType: string;
  conditionsJson: string;
}

export interface ConditionalStorage {
  filterConditions(
    roleEntityRef?: string | string[],
    pluginId?: string,
    resourceType?: string,
    actions?: PermissionAction[],
    permissionName?: string,
    trx?: Knex.Transaction | Knex,
  ): Promise<RoleConditionalPolicyDecision[]>;
  createCondition(
    conditionalDecision: RoleConditionalPolicyDecision,
    idsToExclude?: ReadonlySet<number>,
  ): Promise<number>;
  checkConflictedConditions(
    roleEntityRef: string,
    resourceType: string,
    pluginId: string,
    queryMapping: PermissionMapping[],
    idToExclude?: number,
    trx?: Knex.Transaction | Knex,
    idsToExclude?: ReadonlySet<number>,
  ): Promise<void>;
  getCondition(
    id: number,
    trx?: Knex.Transaction | Knex,
  ): Promise<RoleConditionalPolicyDecision | undefined>;
  deleteCondition(id: number): Promise<void>;
  updateCondition(
    id: number,
    conditionalDecision: RoleConditionalPolicyDecision,
    trx?: Knex.Transaction,
    idsToExclude?: ReadonlySet<number>,
  ): Promise<void>;
}

export class DataBaseConditionalStorage implements ConditionalStorage {
  public constructor(private readonly knex: Knex<any, any[]>) {}

  async filterConditions(
    roleEntityRef?: string | string[],
    pluginId?: string,
    resourceType?: string,
    actions?: PermissionAction[],
    permissionName?: string,
    trx?: Knex.Transaction | Knex,
  ): Promise<RoleConditionalPolicyDecision[]> {
    const db = trx ?? this.knex;
    const daoRaws = await db.table(CONDITIONAL_TABLE).where(builder => {
      if (pluginId) {
        builder.where('pluginId', pluginId);
      }
      if (resourceType) {
        builder.where('resourceType', resourceType);
      }
      if (roleEntityRef) {
        if (Array.isArray(roleEntityRef)) {
          builder.whereIn('roleEntityRef', roleEntityRef);
        } else {
          builder.where('roleEntityRef', roleEntityRef);
        }
      }
    });

    let conditions: RoleConditionalPolicyDecision[] = [];
    if (daoRaws) {
      conditions = daoRaws.map(dao => this.daoToConditionalDecision(dao));
    }

    if (actions && actions.length > 0) {
      conditions = conditions.filter(condition => {
        return actions.every(action =>
          condition.permissionMapping.some(
            entry =>
              permissionMappingAction(entry) === action &&
              (!permissionName ||
                !isPermissionInfo(entry) ||
                entry.name === permissionName),
          ),
        );
      });
    }

    return conditions;
  }

  async createCondition(
    conditionalDecision: RoleConditionalPolicyDecision,
    idsToExclude?: ReadonlySet<number>,
  ): Promise<number> {
    await this.checkConflictedConditions(
      conditionalDecision.roleEntityRef,
      conditionalDecision.resourceType,
      conditionalDecision.pluginId,
      conditionalDecision.permissionMapping,
      undefined,
      undefined,
      idsToExclude,
    );

    const conditionRaw = this.toDAO(conditionalDecision);
    const result = await this.knex
      .table(CONDITIONAL_TABLE)
      .insert<ConditionalPolicyDecisionDAO>(conditionRaw)
      .returning('id');
    if (result && result?.length > 0) {
      return result[0].id;
    }

    throw new Error(`Failed to create the condition.`);
  }

  async checkConflictedConditions(
    roleEntityRef: string,
    resourceType: string,
    pluginId: string,
    queryMapping: PermissionMapping[],
    idToExclude?: number,
    trx?: Knex.Transaction | Knex,
    idsToExclude?: ReadonlySet<number>,
  ): Promise<void> {
    const db = trx ?? this.knex;
    let conditionsForTheSameResource = await this.filterConditions(
      roleEntityRef,
      pluginId,
      resourceType,
      undefined,
      undefined,
      db,
    );
    conditionsForTheSameResource = conditionsForTheSameResource.filter(
      c =>
        c.id !== idToExclude &&
        (idsToExclude === undefined ||
          c.id === undefined ||
          !idsToExclude.has(c.id)),
    );

    if (conditionsForTheSameResource) {
      const conflictedCondition = conditionsForTheSameResource.find(condition =>
        queryMapping.some(queryEntry =>
          condition.permissionMapping.some(storedEntry =>
            mappingEntriesConflict(queryEntry, storedEntry),
          ),
        ),
      );

      if (conflictedCondition) {
        const queryActions = queryMapping.map(permissionMappingAction);
        const storedActions = conflictedCondition.permissionMapping.map(
          permissionMappingAction,
        );
        const conflictedActions = queryActions.filter(action =>
          storedActions.includes(action),
        );
        throw new ConflictError(
          `Found condition with conflicted permission action '${JSON.stringify(
            conflictedActions,
          )}'. Role could have multiple ` +
            `conditions for the same resource type '${conflictedCondition.resourceType}', but with different permission action sets.`,
        );
      }
    }
  }

  async getCondition(
    id: number,
    trx?: Knex.Transaction | Knex,
  ): Promise<RoleConditionalPolicyDecision | undefined> {
    const db = trx ?? this.knex;
    const daoRaw = await db.table(CONDITIONAL_TABLE).where('id', id).first();

    if (daoRaw) {
      return this.daoToConditionalDecision(daoRaw);
    }
    return undefined;
  }

  async deleteCondition(id: number): Promise<void> {
    const condition = await this.getCondition(id);
    if (!condition) {
      throw new NotFoundError(`Condition with id ${id} was not found`);
    }
    await this.knex?.table(CONDITIONAL_TABLE).delete().whereIn('id', [id]);
  }

  async updateCondition(
    id: number,
    conditionalDecision: RoleConditionalPolicyDecision,
    trx?: Knex.Transaction,
    idsToExclude?: ReadonlySet<number>,
  ): Promise<void> {
    const db = trx ?? this.knex;
    const condition = await this.getCondition(id, db);
    if (!condition) {
      throw new NotFoundError(`Condition with id ${id} was not found`);
    }

    await this.checkConflictedConditions(
      conditionalDecision.roleEntityRef,
      conditionalDecision.resourceType,
      conditionalDecision.pluginId,
      conditionalDecision.permissionMapping,
      id,
      db,
      idsToExclude,
    );

    const conditionRaw = this.toDAO(conditionalDecision);
    conditionRaw.id = id;
    const result = await db
      .table(CONDITIONAL_TABLE)
      .where('id', conditionRaw.id)
      .update<ConditionalPolicyDecisionDAO>(conditionRaw)
      .returning('id');

    if (!result || result.length === 0) {
      throw new Error(`Failed to update the condition with id: ${id}.`);
    }
  }

  private toDAO(
    conditionalDecision: RoleConditionalPolicyDecision,
  ): ConditionalPolicyDecisionDAO {
    const {
      result,
      pluginId,
      resourceType,
      conditions,
      roleEntityRef,
      permissionMapping,
    } = conditionalDecision;
    const conditionsJson = JSON.stringify(conditions);
    return {
      result,
      pluginId,
      resourceType,
      conditionsJson,
      roleEntityRef,
      permissions: JSON.stringify(permissionMapping),
    };
  }

  private daoToConditionalDecision(
    dao: ConditionalPolicyDecisionDAO,
  ): RoleConditionalPolicyDecision {
    if (!dao.id) {
      throw new InputError(`Missed id in the dao object: ${dao}`);
    }
    const {
      id,
      result,
      pluginId,
      resourceType,
      conditionsJson,
      roleEntityRef,
      permissions,
    } = dao;

    const conditions = JSON.parse(conditionsJson);
    return {
      id,
      result,
      pluginId,
      resourceType,
      conditions,
      roleEntityRef,
      permissionMapping: JSON.parse(permissions),
    };
  }
}
