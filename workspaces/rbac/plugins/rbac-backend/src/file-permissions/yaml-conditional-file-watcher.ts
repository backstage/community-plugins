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
  AuthService,
  LoggerService,
} from '@backstage/backend-plugin-api';

import yaml from 'js-yaml';
import { omit } from 'lodash';

import type {
  PermissionAction,
  RoleConditionalPolicyDecision,
} from '@backstage-community/plugin-rbac-common';

import fs from 'fs';

import { ActionType, ConditionEvents } from '../auditor/auditor';
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
    private readonly auditor: AuditorService,
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
      const auditorEvent = await this.auditor.createEvent({
        eventId: ConditionEvents.CONDITIONAL_POLICIES_FILE_NOT_FOUND,
        severityLevel: 'medium',
      });
      await auditorEvent.fail({
        error: new Error(`File '${this.filePath}' was not found`),
      });
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
      const newConds = this.parse();

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
      const auditorEvent = await this.auditor.createEvent({
        eventId: ConditionEvents.CONDITIONAL_POLICIES_FILE_CHANGE,
        severityLevel: 'medium',
      });
      await auditorEvent.fail({
        error,
      });
    }
  }

  /**
   * Reads the current contents of the file and parses it.
   * @returns parsed data.
   */
  parse(): RoleConditionalPolicyDecision<PermissionAction>[] {
    const fileContents = this.getCurrentContents();
    const data = yaml
      .loadAll(fileContents)
      .filter(
        doc => doc !== null,
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
    for (const condition of this.conditionsDiff.addedConditions) {
      const auditorEvent = await this.auditor.createEvent({
        eventId: ConditionEvents.CONDITION_WRITE,
        severityLevel: 'medium',
        meta: { actionType: ActionType.CREATE },
      });

      try {
        const conditionToCreate = await processConditionMapping(
          condition,
          this.pluginMetadataCollector,
          this.auth,
        );

        await this.conditionalStorage.createCondition(conditionToCreate);
        await auditorEvent.success({
          meta: { condition },
        });
      } catch (error) {
        await auditorEvent.fail({ error, meta: { condition } });
      }
    }

    this.conditionsDiff.addedConditions = [];
  }

  private async removeConditions(): Promise<void> {
    for (const condition of this.conditionsDiff.removedConditions) {
      const auditorEvent = await this.auditor.createEvent({
        eventId: ConditionEvents.CONDITION_WRITE,
        severityLevel: 'medium',
        meta: { actionType: ActionType.DELETE },
      });

      try {
        const conditionToDelete = (
          await this.conditionalStorage.filterConditions(
            condition.roleEntityRef,
            condition.pluginId,
            condition.resourceType,
            condition.permissionMapping,
          )
        )[0];
        await this.conditionalStorage.deleteCondition(conditionToDelete.id!);
        await auditorEvent.success({ meta: { condition } });
      } catch (error) {
        await auditorEvent.fail({
          error,
          meta: { condition },
        });
      }
    }

    this.conditionsDiff.removedConditions = [];
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
