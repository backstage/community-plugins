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
import type { BackstageUserInfo } from '@backstage/backend-plugin-api';
import type {
  PermissionCondition,
  PermissionCriteria,
  PermissionRuleParam,
  PermissionRuleParams,
} from '@backstage/plugin-permission-common';
import type { JsonPrimitive } from '@backstage/types';

import {
  CONDITION_ALIAS_SIGN,
  ConditionalAliases,
} from '@backstage-community/plugin-rbac-common';

interface Predicate<T> {
  (item: T): boolean;
}

function isOwnerRefsAlias(value: PermissionRuleParam): boolean {
  const alias = `${CONDITION_ALIAS_SIGN}${ConditionalAliases.OWNER_REFS}`;
  return value === alias;
}

function isCurrentUserAlias(value: PermissionRuleParam): boolean {
  const alias = `${CONDITION_ALIAS_SIGN}${ConditionalAliases.CURRENT_USER}`;
  return value === alias;
}

function replaceAliasWithValue<
  K extends string,
  V extends JsonPrimitive | JsonPrimitive[],
>(
  params: Record<K, PermissionRuleParam> | undefined,
  key: K,
  predicate: Predicate<PermissionRuleParam>,
  newValue: V,
): Record<K, PermissionRuleParam> | undefined {
  if (!params) {
    return params;
  }

  if (Array.isArray(params[key])) {
    const oldValues = params[key] as JsonPrimitive[];
    const nonAliasValues: JsonPrimitive[] = [];
    for (const oldValue of oldValues) {
      const isAliasMatched = predicate(oldValue);
      if (isAliasMatched) {
        const newValues = Array.isArray(newValue) ? newValue : [newValue];
        nonAliasValues.push(...newValues);
      } else {
        nonAliasValues.push(oldValue);
      }
    }
    return { ...params, [key]: nonAliasValues };
  }

  const oldValue = params[key] as JsonPrimitive;
  const isAliasMatched = predicate(oldValue);
  if (isAliasMatched && !Array.isArray(newValue)) {
    return { ...params, [key]: newValue };
  }

  return params;
}

export function replaceAliases(
  conditions: PermissionCriteria<
    PermissionCondition<string, PermissionRuleParams>
  >,
  userInfo: BackstageUserInfo,
) {
  if ('not' in conditions) {
    replaceAliases(conditions.not, userInfo);
    return;
  }
  if ('allOf' in conditions) {
    for (const condition of conditions.allOf) {
      replaceAliases(condition, userInfo);
    }
    return;
  }
  if ('anyOf' in conditions) {
    for (const condition of conditions.anyOf) {
      replaceAliases(condition, userInfo);
    }
    return;
  }

  const params = (
    conditions as PermissionCondition<string, PermissionRuleParams>
  ).params;
  if (params) {
    for (const key of Object.keys(params)) {
      const currentParams = (
        conditions as PermissionCondition<string, PermissionRuleParams>
      ).params;

      let modifiedParams = replaceAliasWithValue(
        currentParams,
        key,
        isCurrentUserAlias,
        userInfo.userEntityRef,
      );

      modifiedParams = replaceAliasWithValue(
        modifiedParams,
        key,
        isOwnerRefsAlias,
        userInfo.ownershipEntityRefs,
      );

      (conditions as PermissionCondition<string, PermissionRuleParams>).params =
        modifiedParams;
    }
  }
}
