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
import type { AuthService, LoggerService } from '@backstage/backend-plugin-api';

import type { AuditLogger } from '@janus-idp/backstage-plugin-audit-log-node';
import yaml from 'js-yaml';
import { omit } from 'lodash';

import type {
  PermissionAction,
  RoleConditionalPolicyDecision,
} from '@backstage-community/plugin-rbac-common';

import fs from 'fs';

import {
  ConditionAuditInfo,
  ConditionEvents,
  HANDLE_RBAC_DATA_STAGE,
} from '../audit-log/audit-logger';
import { ConditionalStorage } from '../database/conditional-storage';
import { RoleMetadataStorage } from '../database/role-metadata';
import { deepSortEqual, processConditionMapping } from '../helper';
import { RoleEventEmitter, RoleEvents } from '../service/enforcer-delegate';
import { PluginPermissionMetadataCollector } from '../service/plugin-endpoints';
import { validateRoleCondition } from '../validation/condition-validation';
import { AbstractFileWatcher } from './file-watcher';

type ConditionalPoliciesDiff = {
  addedConditions: RoleConditionalPolicyDecision<PermissionAction>[];
  removedConditions: RoleConditionalPolicyDecision<PermissionAction>[];
};

export class YamlConditinalPoliciesFileWatcher extends AbstractFileWatcher<
  RoleConditionalPolicyDecision<PermissionAction>[]
> {
  private conditionsDiff: ConditionalPoliciesDiff;

  constructor(
    filePath: string | undefined,
    allowReload: boolean,
    logger: LoggerService,
    private readonly conditionalStorage: ConditionalStorage,
    private readonly auditLogger: AuditLogger,
    private readonly auth: AuthService,
    private readonly pluginMetadataCollector: PluginPermissionMetadataCollector,
    private readonly roleMetadataStorage: RoleMetadataStorage,
    private readonly roleEventEmitter: RoleEventEmitter<RoleEvents>,
  ) {
    super(filePath, allowReload, logger);

    this.conditionsDiff = {
      addedConditions: [],
      removedConditions: [],
    };
  }

  async initialize(): Promise<void> {
    if (!this.filePath) {
      return;
    }
    const fileExists = fs.existsSync(this.filePath);
    if (!fileExists) {
      const err = new Error(`File '${this.filePath}' was not found`);
      this.handleError(
        err.message,
        err,
        ConditionEvents.CONDITIONAL_POLICIES_FILE_NOT_FOUND,
      );
      return;
    }

    this.roleEventEmitter.on('roleAdded', this.onChange.bind(this));
    await this.onChange();

    if (this.allowReload) {
      this.watchFile();
    }
  }

  async onChange(): Promise<void> {
    try {
      const newConds = this.parse().filter(c => c);

      const addedConds: RoleConditionalPolicyDecision<PermissionAction>[] = [];
      const removedConds: RoleConditionalPolicyDecision<PermissionAction>[] =
        [];

      const csvFileRoles =
        await this.roleMetadataStorage.filterRoleMetadata('csv-file');
      const existedFileConds = (
        await this.conditionalStorage.filterConditions(
          csvFileRoles.map(role => role.roleEntityRef),
        )
      ).map(condition => {
        return {
          ...condition,
          permissionMapping: condition.permissionMapping.map(pm => pm.action),
        };
      });

      // Find added conditions
      for (const condition of newConds) {
        const roleMetadata = csvFileRoles.find(
          role => condition.roleEntityRef === role.roleEntityRef,
        );
        if (!roleMetadata) {
          this.logger.warn(
            `skip to add condition for role '${condition.roleEntityRef}'. The role either does not exist or was not created from a CSV file.`,
          );
          continue;
        }
        if (roleMetadata.source !== 'csv-file') {
          this.logger.warn(
            `skip to add condition for role '${condition.roleEntityRef}'. Role is not from csv-file`,
          );
          continue;
        }

        const existingCondition = existedFileConds.find(c =>
          deepSortEqual(omit(c, ['id']), omit(condition, ['id'])),
        );

        if (!existingCondition) {
          addedConds.push(condition);
        }
      }

      // Find removed conditions
      for (const condition of existedFileConds) {
        if (
          !newConds.find(c =>
            deepSortEqual(omit(c, ['id']), omit(condition, ['id'])),
          )
        ) {
          removedConds.push(condition);
        }
      }

      this.conditionsDiff = {
        addedConditions: addedConds,
        removedConditions: removedConds,
      };

      await this.handleFileChanges();
    } catch (error) {
      await this.handleError(
        `Error handling changes from conditional policies file ${this.filePath}`,
        error,
        ConditionEvents.CHANGE_CONDITIONAL_POLICIES_FILE_ERROR,
      );
    }
  }

  /**
   * Reads the current contents of the file and parses it.
   * @returns parsed data.
   */
  parse(): RoleConditionalPolicyDecision<PermissionAction>[] {
    const fileContents = this.getCurrentContents();
    const data = yaml.loadAll(
      fileContents,
    ) as RoleConditionalPolicyDecision<PermissionAction>[];

    for (const condition of data) {
      validateRoleCondition(condition);
    }

    return data;
  }

  private async handleFileChanges(): Promise<void> {
    await this.removeConditions();
    await this.addConditions();
  }

  private async addConditions(): Promise<void> {
    try {
      for (const condition of this.conditionsDiff.addedConditions) {
        const conditionToCreate = await processConditionMapping(
          condition,
          this.pluginMetadataCollector,
          this.auth,
        );

        await this.conditionalStorage.createCondition(conditionToCreate);

        await this.auditLogger.auditLog<ConditionAuditInfo>({
          message: `Created conditional permission policy`,
          eventName: ConditionEvents.CREATE_CONDITION,
          metadata: { condition },
          stage: HANDLE_RBAC_DATA_STAGE,
          status: 'succeeded',
        });
      }
    } catch (error) {
      await this.handleError(
        'Failed to create condition',
        error,
        ConditionEvents.CREATE_CONDITION_ERROR,
      );
    }
    this.conditionsDiff.addedConditions = [];
  }

  private async removeConditions(): Promise<void> {
    try {
      for (const condition of this.conditionsDiff.removedConditions) {
        const conditionToDelete = (
          await this.conditionalStorage.filterConditions(
            condition.roleEntityRef,
            condition.pluginId,
            condition.resourceType,
            condition.permissionMapping,
          )
        )[0];
        await this.conditionalStorage.deleteCondition(conditionToDelete.id!);

        await this.auditLogger.auditLog<ConditionAuditInfo>({
          message: `Deleted conditional permission policy`,
          eventName: ConditionEvents.DELETE_CONDITION,
          metadata: { condition },
          stage: HANDLE_RBAC_DATA_STAGE,
          status: 'succeeded',
        });
      }
    } catch (error) {
      await this.handleError(
        'Failed to delete condition by id',
        error,
        ConditionEvents.DELETE_CONDITION_ERROR,
      );
    }

    this.conditionsDiff.removedConditions = [];
  }

  private async handleError(
    message: string,
    error: unknown,
    event: string,
  ): Promise<void> {
    await this.auditLogger.auditLog({
      message,
      eventName: event,
      stage: HANDLE_RBAC_DATA_STAGE,
      status: 'failed',
      errors: [error],
    });
  }

  async cleanUpConditionalPolicies(): Promise<void> {
    const csvFileRoles =
      await this.roleMetadataStorage.filterRoleMetadata('csv-file');
    const existedFileConds = (
      await this.conditionalStorage.filterConditions(
        csvFileRoles.map(role => role.roleEntityRef),
      )
    ).map(condition => {
      return {
        ...condition,
        permissionMapping: condition.permissionMapping.map(pm => pm.action),
      };
    });
    this.conditionsDiff.removedConditions = existedFileConds;
    await this.removeConditions();
  }
}
