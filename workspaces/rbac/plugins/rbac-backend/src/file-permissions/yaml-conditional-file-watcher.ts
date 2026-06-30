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
import { isEqual, omit } from 'lodash';

import type {
  PermissionAction,
  PermissionInfo,
  RoleConditionalPolicyDecision,
} from '@backstage-community/plugin-rbac-common';

import fs from 'fs';

import { ActionType, ConditionEvents } from '../auditor/auditor';
import { ConditionalStorage } from '../database/conditional-storage';
import {
  RoleMetadataDao,
  RoleMetadataStorage,
} from '../database/role-metadata';
import {
  abortConditionalPolicyReconcile,
  diffConditionalPolicies,
  pendingDeleteIdsFromPlan,
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

function yamlConditionEquals(
  stored: RoleConditionalPolicyDecision<PermissionInfo>,
  desired: RoleConditionalPolicyDecision<PermissionAction>,
): boolean {
  const storedComparable = {
    ...omit(stored, ['id']),
    permissionMapping: permissionMappingToActions(stored.permissionMapping),
  };
  return isEqual(storedComparable, omit(desired, ['id']));
}

export class YamlConditionalPoliciesFileWatcher extends AbstractFileWatcher<
  RoleConditionalPolicyDecision<PermissionAction>[]
> {
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
      await this.syncYamlConditionalPoliciesFile();
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

  private async syncYamlConditionalPoliciesFile(): Promise<void> {
    const parsed = this.parse();
    const csvFileSourcedRoles =
      await this.roleMetadataStorage.filterRoleMetadata('csv-file');
    const fileDesired = this.filterParsedToCsvFileSourcedRoles(
      parsed,
      csvFileSourcedRoles,
    );
    const stored = await this.loadStoredConditionsForRoles(csvFileSourcedRoles);
    const diff = diffConditionalPolicies(
      stored,
      fileDesired,
      yamlConditionEquals,
    );

    if (diff.toAdd.length === 0 && diff.toRemove.length === 0) {
      return;
    }

    try {
      const stagedAdditions: RoleConditionalPolicyDecision<PermissionInfo>[] =
        [];
      for (const condition of diff.toAdd) {
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
        diff.toRemove,
        item => permissionMappingToActions(item.permissionMapping),
      );
      const pendingDeleteIds = pendingDeleteIdsFromPlan(plan);

      for (const { stored: storedRow, desired } of plan.updates) {
        await this.persistConditionUpdate(
          storedRow.id!,
          desired,
          pendingDeleteIds,
        );
      }

      for (const conditionToCreate of plan.creates) {
        await this.persistConditionCreate(conditionToCreate, pendingDeleteIds);
      }

      for (const condition of plan.deletes) {
        await this.persistConditionDelete(condition);
      }
    } catch (error) {
      await abortConditionalPolicyReconcile({
        logger: this.logger,
        auditor: this.auditor,
        source: 'conditional-policies-file',
        abortEventId: ConditionEvents.CONDITIONAL_POLICIES_FILE_CHANGE,
        pendingAdds: diff.toAdd.length,
        pendingRemoves: diff.toRemove.length,
        pluginIds: [...new Set(diff.toAdd.map(c => c.pluginId))],
        error: toError(error),
      });
    }
  }

  private filterParsedToCsvFileSourcedRoles(
    parsed: RoleConditionalPolicyDecision<PermissionAction>[],
    csvFileSourcedRoles: RoleMetadataDao[],
  ): RoleConditionalPolicyDecision<PermissionAction>[] {
    const fileDesired: RoleConditionalPolicyDecision<PermissionAction>[] = [];

    for (const condition of parsed) {
      const roleMetadata = csvFileSourcedRoles.find(
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
      fileDesired.push(condition);
    }

    return fileDesired;
  }

  private async loadStoredConditionsForRoles(
    csvFileSourcedRoles: RoleMetadataDao[],
  ): Promise<RoleConditionalPolicyDecision<PermissionInfo>[]> {
    return this.conditionalStorage.filterConditions(
      csvFileSourcedRoles.map(role => role.roleEntityRef),
    );
  }

  private async persistConditionUpdate(
    id: number,
    conditionToUpdate: RoleConditionalPolicyDecision<PermissionInfo>,
    pendingDeleteIds: ReadonlySet<number>,
  ): Promise<void> {
    const auditorEvent = await this.auditor.createEvent({
      eventId: ConditionEvents.CONDITION_WRITE,
      severityLevel: 'medium',
      meta: { actionType: ActionType.UPDATE },
    });

    try {
      await this.conditionalStorage.updateCondition(
        id,
        conditionToUpdate,
        undefined,
        pendingDeleteIds,
      );
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

  private async persistConditionCreate(
    conditionToCreate: RoleConditionalPolicyDecision<PermissionInfo>,
    pendingDeleteIds: ReadonlySet<number>,
  ): Promise<void> {
    const auditorEvent = await this.auditor.createEvent({
      eventId: ConditionEvents.CONDITION_WRITE,
      severityLevel: 'medium',
      meta: { actionType: ActionType.CREATE },
    });

    try {
      await this.conditionalStorage.createCondition(
        conditionToCreate,
        pendingDeleteIds,
      );
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

  private async persistConditionDelete(
    condition: RoleConditionalPolicyDecision<PermissionInfo>,
  ): Promise<void> {
    const auditorEvent = await this.auditor.createEvent({
      eventId: ConditionEvents.CONDITION_WRITE,
      severityLevel: 'medium',
      meta: { actionType: ActionType.DELETE },
    });

    const deleteMeta = {
      condition: {
        ...condition,
        permissionMapping: condition.permissionMapping.map(pm => pm.action),
      },
    };

    try {
      if (condition.id === undefined) {
        throw new InputError(
          `Cannot delete conditional policy without stored id for role '${condition.roleEntityRef}'`,
        );
      }
      await this.conditionalStorage.deleteCondition(condition.id);
      await auditorEvent.success({ meta: deleteMeta });
    } catch (error) {
      await auditorEvent.fail({
        error,
        meta: deleteMeta,
      });
      throw error;
    }
  }

  async cleanUpConditionalPolicies(): Promise<void> {
    const csvFileRoles =
      await this.roleMetadataStorage.filterRoleMetadata('csv-file');
    const existedFileConds =
      await this.loadStoredConditionsForRoles(csvFileRoles);
    for (const condition of existedFileConds) {
      await this.persistConditionDelete(condition);
    }
  }
}
