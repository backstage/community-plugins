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
import { useAsync } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';

import { rbacApiRef } from '../api/RBACBackendClient';
import {
  ConditionRules,
  ConditionRulesData,
  ResourceTypeRuleData,
  RulesData,
} from '../components/ConditionalAccess/types';
import { ConditionRule, PluginConditionRules } from '../types';
import { uniqBy } from '../utils/create-role-utils';

const getPluginsResourceTypes = (
  conditionRules: PluginConditionRules[],
): { [plugin: string]: string[] } => {
  return conditionRules.reduce((acc, pluginRules) => {
    return {
      ...acc,
      [`${pluginRules.pluginId}`]: uniqBy(
        pluginRules.rules.map(rule => rule.resourceType),
        val => val,
      ),
    };
  }, {});
};

const getRuleData = (pluginRules: PluginConditionRules, resType: string) => {
  return pluginRules.rules.reduce(
    (ruleAcc: RulesData, rule: ConditionRule) => {
      return rule.resourceType === resType
        ? {
            ...ruleAcc,
            [`${rule.name}`]: {
              schema: rule.paramsSchema,
              description: rule.description,
            },
            rules: [...ruleAcc.rules, rule.name],
          }
        : ruleAcc;
    },
    { rules: [] },
  );
};

const getConditionRulesData = (conditionRules: PluginConditionRules[]) => {
  const pluginsResourceTypes = getPluginsResourceTypes(conditionRules);

  return conditionRules.reduce((acc: ConditionRulesData, pluginRules) => {
    return {
      ...acc,
      [`${pluginRules.pluginId}`]: pluginsResourceTypes[
        pluginRules.pluginId
      ].reduce((resAcc: ResourceTypeRuleData, resType: string) => {
        return {
          ...resAcc,
          [`${resType}`]: getRuleData(pluginRules, resType),
        };
      }, {}),
    };
  }, {});
};

export const useConditionRules = (): ConditionRules => {
  const rbacApi = useApi(rbacApiRef);

  const {
    value: conditionRules,
    loading: conditionRulesLoading,
    error: conditionRulesErr,
  } = useAsync(async () => {
    return await rbacApi.getPluginsConditionRules();
  });

  const isConditionRulesAvailable =
    !conditionRulesLoading && Array.isArray(conditionRules);

  const conditionRulesData = isConditionRulesAvailable
    ? getConditionRulesData(conditionRules)
    : undefined;

  return {
    data: conditionRulesData,
    error: conditionRulesErr,
  };
};
