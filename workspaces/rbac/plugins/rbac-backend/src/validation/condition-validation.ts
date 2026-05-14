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
import {
  PermissionCondition,
  PermissionCriteria,
  PermissionRuleParams,
} from '@backstage/plugin-permission-common';
import { InputError } from '@backstage/errors';

import {
  PermissionActionValues,
  type PermissionAction,
  type RoleConditionalPolicyDecision,
} from '@backstage-community/plugin-rbac-common';

import { isPermissionAction } from '../helper';

export type ConditionValidationLimits = {
  maxConditionDepth: number;
  maxConditionNodeCount: number;
  maxCriteriaItems: number;
};

export const DEFAULT_CONDITION_VALIDATION_LIMITS: ConditionValidationLimits = {
  maxConditionDepth: 12,
  maxConditionNodeCount: 256,
  maxCriteriaItems: 64,
};

let conditionValidationLimits: ConditionValidationLimits = {
  ...DEFAULT_CONDITION_VALIDATION_LIMITS,
};

export function configureConditionValidationLimits(
  limits: Partial<ConditionValidationLimits>,
): void {
  const nextLimits = {
    ...conditionValidationLimits,
    ...limits,
  };

  assertPositiveInteger(nextLimits.maxConditionDepth, 'maxConditionDepth');
  assertPositiveInteger(
    nextLimits.maxConditionNodeCount,
    'maxConditionNodeCount',
  );
  assertPositiveInteger(nextLimits.maxCriteriaItems, 'maxCriteriaItems');

  conditionValidationLimits = nextLimits;
}

function getConditionValidationLimits(): ConditionValidationLimits {
  return conditionValidationLimits;
}

function assertPositiveInteger(value: number, fieldName: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new InputError(
      `'${fieldName}' must be a positive integer for conditional policy validation`,
    );
  }
}

export function validateRoleCondition(
  condition: RoleConditionalPolicyDecision<PermissionAction>,
) {
  const limits = getConditionValidationLimits();
  if (!condition.roleEntityRef) {
    throw new InputError(
      `'roleEntityRef' must be specified in the role condition`,
    );
  }
  if (!condition.result) {
    throw new InputError(`'result' must be specified in the role condition`);
  }
  if (!condition.pluginId) {
    throw new InputError(`'pluginId' must be specified in the role condition`);
  }
  if (!condition.resourceType) {
    throw new InputError(
      `'resourceType' must be specified in the role condition`,
    );
  }

  if (
    !condition.permissionMapping ||
    condition.permissionMapping.length === 0
  ) {
    throw new InputError(
      `'permissionMapping' must be non empty array in the role condition`,
    );
  }
  const maxDistinctPermissionActions = PermissionActionValues.length;
  if (condition.permissionMapping.length > maxDistinctPermissionActions) {
    throw new InputError(
      `'permissionMapping' can have at most ${maxDistinctPermissionActions} items (one entry per distinct permission action)`,
    );
  }
  const nonActionValue = condition.permissionMapping.find(
    action => !isPermissionAction(action),
  );
  if (nonActionValue) {
    throw new InputError(
      `'permissionMapping' array contains non action value: '${nonActionValue}'`,
    );
  }

  const seenActions = new Set<PermissionAction>();
  for (const action of condition.permissionMapping) {
    if (seenActions.has(action)) {
      throw new InputError(
        `'permissionMapping' must not contain duplicate permission action '${action}'`,
      );
    }
    seenActions.add(action);
  }

  if (
    condition.resourceType === 'policy-entity' &&
    condition.permissionMapping.includes('create')
  ) {
    throw new InputError(
      `Conditional policy can not be created for resource type 'policy-entity' with the permission action 'create'`,
    );
  }

  if (!condition.conditions) {
    throw new InputError(
      `'conditions' must be specified in the role condition`,
    );
  }
  if (condition.conditions) {
    validatePermissionCondition(
      condition.conditions,
      'roleCondition.conditions',
      1,
      { nodeCount: 0 },
      limits,
    );
  }
}

/**
 * validatePermissionCondition validate conditional permission policies using validateCriteria and validateRule.
 * @param conditionOrCriteria The Permission Criteria of the conditional permission.
 * @param jsonPathLocator The location in the JSON of the current check.
 * @returns undefined.
 */
function validatePermissionCondition(
  conditionOrCriteria: PermissionCriteria<
    PermissionCondition<string, PermissionRuleParams>
  >,
  jsonPathLocator: string,
  currentDepth: number,
  state: { nodeCount: number },
  limits: ConditionValidationLimits,
) {
  if (currentDepth > limits.maxConditionDepth) {
    throw new InputError(
      `Conditional criteria depth exceeds maximum of ${limits.maxConditionDepth}`,
    );
  }
  state.nodeCount += 1;
  if (state.nodeCount > limits.maxConditionNodeCount) {
    throw new InputError(
      `Conditional criteria exceeds maximum of ${limits.maxConditionNodeCount} nodes`,
    );
  }

  validateCriteria(conditionOrCriteria, jsonPathLocator);

  if ('not' in conditionOrCriteria) {
    validatePermissionCondition(
      conditionOrCriteria.not,
      `${jsonPathLocator}.not`,
      currentDepth + 1,
      state,
      limits,
    );
    return;
  }

  if ('allOf' in conditionOrCriteria) {
    if (
      !Array.isArray(conditionOrCriteria.allOf) ||
      conditionOrCriteria.allOf.length === 0
    ) {
      throw new InputError(
        `${jsonPathLocator}.allOf criteria must be non empty array`,
      );
    }
    if (conditionOrCriteria.allOf.length > limits.maxCriteriaItems) {
      throw new InputError(
        `${jsonPathLocator}.allOf criteria supports at most ${limits.maxCriteriaItems} items`,
      );
    }
    for (const [index, elem] of conditionOrCriteria.allOf.entries()) {
      validatePermissionCondition(
        elem,
        `${jsonPathLocator}.allOf[${index}]`,
        currentDepth + 1,
        state,
        limits,
      );
    }
    return;
  }

  if ('anyOf' in conditionOrCriteria) {
    if (
      !Array.isArray(conditionOrCriteria.anyOf) ||
      conditionOrCriteria.anyOf.length === 0
    ) {
      throw new InputError(
        `${jsonPathLocator}.anyOf criteria must be non empty array`,
      );
    }
    if (conditionOrCriteria.anyOf.length > limits.maxCriteriaItems) {
      throw new InputError(
        `${jsonPathLocator}.anyOf criteria supports at most ${limits.maxCriteriaItems} items`,
      );
    }
    for (const [index, elem] of conditionOrCriteria.anyOf.entries()) {
      validatePermissionCondition(
        elem,
        `${jsonPathLocator}.anyOf[${index}]`,
        currentDepth + 1,
        state,
        limits,
      );
    }
  }
}

/**
 * validateRule ensures that there is a rule and resource type associated with each conditional permission.
 * @param conditionOrCriteria The Permission Criteria of the conditional permission.
 * @param jsonPathLocator The location in the JSON of the current check.
 */
function validateRule(
  conditionOrCriteria: PermissionCriteria<
    PermissionCondition<string, PermissionRuleParams>
  >,
  jsonPathLocator: string,
) {
  if (!('resourceType' in conditionOrCriteria)) {
    throw new InputError(
      `'resourceType' must be specified in the ${jsonPathLocator}.condition`,
    );
  }
  if (!('rule' in conditionOrCriteria)) {
    throw new InputError(
      `'rule' must be specified in the ${jsonPathLocator}.condition`,
    );
  }
}

/**
 * validateCriteria ensures that there is only one of the following criteria: allOf, anyOf, and not, at any given level.
 * We want to make sure that there are no parallel conditional criteria for conditional permission policies as this is
 * not support by the permission framework.
 *
 * If more than one criteria are at a given level, we throw an error about the inability to support parallel conditions.
 * If no criteria are found, we validate the rule.
 *
 * @param conditionOrCriteria The Permission Criteria of the conditional permission.
 * @param jsonPathLocator The location in the JSON of the current check.
 */
function validateCriteria(
  conditionOrCriteria: PermissionCriteria<
    PermissionCondition<string, PermissionRuleParams>
  >,
  jsonPathLocator: string,
) {
  const criteriaList = ['allOf', 'anyOf', 'not'];
  const found: string[] = [];

  for (const crit of criteriaList) {
    if (crit in conditionOrCriteria) {
      found.push(crit);
    }
  }

  if (found.length > 1) {
    throw new InputError(
      `RBAC plugin does not support parallel conditions, consider reworking request to include nested condition criteria. Conditional criteria causing the error ${found}.`,
    );
  } else if (found.length === 0) {
    validateRule(conditionOrCriteria, jsonPathLocator);
  }

  if (found.length === 1 && 'rule' in conditionOrCriteria) {
    throw new InputError(
      `RBAC plugin does not support parallel conditions alongside rules, consider reworking request to include nested condition criteria. Conditional criteria causing the error ${found}, 'rule: ${conditionOrCriteria.rule}'.`,
    );
  }
}
