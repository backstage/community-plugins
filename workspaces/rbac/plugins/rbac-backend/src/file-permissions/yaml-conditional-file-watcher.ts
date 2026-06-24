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
import { InputError } from '@backstage/errors';

import yaml from 'js-yaml';
import { omit } from 'lodash';

import type {
  PermissionAction,
  PermissionInfo,
  RoleConditionalPolicyDecision,
} from '@backstage-community/plugin-rbac-common';

import fs from 'fs';

import { ActionType, ConditionEvents } from '../auditor/auditor';
import { ConditionalStorage } from '../database/conditional-storage';
import { RoleMetadataStorage } from '../database/role-metadata';
import {
  abortConditionalPolicyReconcile,
  deepSortEqual,
  permissionMappingToActions,
  planConditionalReconcile,
  processConditionMapping,
  toError,
} from '../helper';
import { RoleEventEmitter, RoleEvents } from '../service/enforcer-delegate';
import { PluginPermissionMetadataCollector } from '../service/plugin-endpoints';
import {
  type ConditionValidationLimits,
  validateRoleCondition,
} from '../validation/condition-validation';
import { AbstractFileWatcher } from './file-watcher';

type ConditionalPoliciesDiff = {
  addedConditions: RoleConditionalPolicyDecision<PermissionAction>[];
  removedConditions: RoleConditionalPolicyDecision<PermissionAction>[];
};

export type ConditionalPoliciesFileLimits = {
  maxBytes: number;
  maxDocuments: number;
};

export const DEFAULT_CONDITIONAL_POLICIES_FILE_LIMITS: ConditionalPoliciesFileLimits =
  {
    maxBytes: 1024 * 1024,
    maxDocuments: 256,
  };

function assertPositiveIntegerConditionalPoliciesFileLimit(
  value: number,
  fieldRef: string,
): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new InputError(
      `'${fieldRef}' must be a positive integer for conditional policies file validation`,
    );
  }
}

/**
 * Merges optional overrides with defaults and validates both limits are positive integers.
 */
export function resolveConditionalPoliciesFileLimits(
  partial: Partial<ConditionalPoliciesFileLimits> = {},
  errorFieldRefs?: {
    maxBytes: string;
    maxDocuments: string;
  },
): ConditionalPoliciesFileLimits {
  const resolved: ConditionalPoliciesFileLimits = {
    maxBytes:
      partial.maxBytes ?? DEFAULT_CONDITIONAL_POLICIES_FILE_LIMITS.maxBytes,
    maxDocuments:
      partial.maxDocuments ??
      DEFAULT_CONDITIONAL_POLICIES_FILE_LIMITS.maxDocuments,
  };
  assertPositiveIntegerConditionalPoliciesFileLimit(
    resolved.maxBytes,
    errorFieldRefs?.maxBytes ?? 'maxBytes',
  );
  assertPositiveIntegerConditionalPoliciesFileLimit(
    resolved.maxDocuments,
    errorFieldRefs?.maxDocuments ?? 'maxDocuments',
  );
  return resolved;
}

export class YamlConditionalPoliciesFileWatcher extends AbstractFileWatcher<
  RoleConditionalPolicyDecision<PermissionAction>[]
> {
  private conditionsDiff: ConditionalPoliciesDiff;
  private readonly maxFileBytes: number;
  private readonly maxFileDocuments: number;
  private readonly conditionValidationLimits: ConditionValidationLimits;

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
    conditionValidationLimits: ConditionValidationLimits,
    limits: Partial<ConditionalPoliciesFileLimits> = {},
  ) {
    super(filePath, allowReload, logger);

    this.conditionsDiff = {
      addedConditions: [],
      removedConditions: [],
    };
    const resolvedLimits = resolveConditionalPoliciesFileLimits(limits);
    this.maxFileBytes = resolvedLimits.maxBytes;
    this.maxFileDocuments = resolvedLimits.maxDocuments;
    this.conditionValidationLimits = conditionValidationLimits;
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
    const fileSizeInBytes = Buffer.byteLength(fileContents, 'utf8');
    if (fileSizeInBytes > this.maxFileBytes) {
      throw new InputError(
        `conditional policies file exceeds maximum size of ${this.maxFileBytes} bytes`,
      );
    }

    const parsedDocuments: RoleConditionalPolicyDecision<PermissionAction>[] =
      [];
    yaml.loadAll(fileContents, doc => {
      if (doc === null) {
        return;
      }

      parsedDocuments.push(
        doc as RoleConditionalPolicyDecision<PermissionAction>,
      );
      if (parsedDocuments.length > this.maxFileDocuments) {
        throw new InputError(
          `conditional policies file exceeds maximum of ${this.maxFileDocuments} YAML documents`,
        );
      }
    });

    for (const condition of parsedDocuments) {
      validateRoleCondition(condition, this.conditionValidationLimits);
    }

    return parsedDocuments;
  }

  private async handleFileChanges(): Promise<void> {
    const { addedConditions, removedConditions } = this.conditionsDiff;

    if (addedConditions.length === 0 && removedConditions.length === 0) {
      return;
    }

    // Map all additions, then apply updates/creates before deletes so a failed
    // persist does not delete stored conditions (#9429).
    try {
      const stagedAdditions: RoleConditionalPolicyDecision<PermissionInfo>[] =
        [];
      for (const condition of addedConditions) {
        stagedAdditions.push(
          await processConditionMapping(
            condition,
            this.pluginMetadataCollector,
            this.auth,
          ),
        );
      }

      const plan = planConditionalReconcile(
        stagedAdditions,
        removedConditions,
        item => permissionMappingToActions(item.permissionMapping),
      );

      for (const { stored, desired } of plan.updates) {
        await this.persistConditionUpdate(stored.id!, desired);
      }

      for (const conditionToCreate of plan.creates) {
        await this.persistConditionAddition(conditionToCreate);
      }

      for (const condition of plan.deletes) {
        await this.persistConditionRemoval(condition);
      }

      this.conditionsDiff = {
        addedConditions: [],
        removedConditions: [],
      };
    } catch (error) {
      await abortConditionalPolicyReconcile({
        logger: this.logger,
        auditor: this.auditor,
        source: 'conditional-policies-file',
        abortEventId: ConditionEvents.CONDITIONAL_POLICIES_FILE_CHANGE,
        pendingAdds: addedConditions.length,
        pendingRemoves: removedConditions.length,
        pluginIds: [...new Set(addedConditions.map(c => c.pluginId))],
        error: toError(error),
      });
    }
  }

  private async persistConditionUpdate(
    id: number,
    conditionToUpdate: RoleConditionalPolicyDecision<PermissionInfo>,
  ): Promise<void> {
    const auditorEvent = await this.auditor.createEvent({
      eventId: ConditionEvents.CONDITION_WRITE,
      severityLevel: 'medium',
      meta: { actionType: ActionType.UPDATE },
    });

    try {
      await this.conditionalStorage.updateCondition(id, conditionToUpdate);
      await auditorEvent.success({
        meta: {
          condition: {
            ...conditionToUpdate,
            permissionMapping: conditionToUpdate.permissionMapping.map(
              pm => pm.action,
            ),
          },
        },
      });
    } catch (error) {
      await auditorEvent.fail({
        error,
        meta: {
          condition: {
            ...conditionToUpdate,
            permissionMapping: conditionToUpdate.permissionMapping.map(
              pm => pm.action,
            ),
          },
        },
      });
      throw error;
    }
  }

  private async persistConditionAddition(
    conditionToCreate: RoleConditionalPolicyDecision<PermissionInfo>,
  ): Promise<void> {
    const auditorEvent = await this.auditor.createEvent({
      eventId: ConditionEvents.CONDITION_WRITE,
      severityLevel: 'medium',
      meta: { actionType: ActionType.CREATE },
    });

    try {
      await this.conditionalStorage.createCondition(conditionToCreate);
      await auditorEvent.success({
        meta: {
          condition: {
            ...conditionToCreate,
            permissionMapping: conditionToCreate.permissionMapping.map(
              pm => pm.action,
            ),
          },
        },
      });
    } catch (error) {
      await auditorEvent.fail({
        error,
        meta: {
          condition: {
            ...conditionToCreate,
            permissionMapping: conditionToCreate.permissionMapping.map(
              pm => pm.action,
            ),
          },
        },
      });
      throw error;
    }
  }

  private async persistConditionRemoval(
    condition: RoleConditionalPolicyDecision<PermissionAction>,
  ): Promise<void> {
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
    for (const condition of this.conditionsDiff.removedConditions) {
      await this.persistConditionRemoval(condition);
    }
    this.conditionsDiff.removedConditions = [];
  }
}
