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
import { PermissionCondition } from '@backstage/plugin-permission-common';

export type RulesData = {
  rules: string[];
  [rule: string]: {
    [key: string]: any;
  };
};

export type ResourceTypeRuleData = {
  [resourceType: string]: RulesData;
};

export type ConditionRulesData = {
  [plugin: string]: ResourceTypeRuleData;
};

export type ConditionRules = {
  data?: ConditionRulesData;
  error?: Error;
};

export type ConditionsData = {
  allOf?: Condition[];
  anyOf?: Condition[];
  not?: Condition;
  condition?: PermissionCondition;
};

export type Condition = PermissionCondition | ConditionsData;

export type ComplexErrors = string | NestedCriteriaErrors;

export type NestedCriteriaErrors = {
  [nestedCriteria: string]: string[] | string;
};

export type AccessConditionsErrors = {
  [criteria: string]: ComplexErrors[] | NestedCriteriaErrors | string;
};

export type ConditionFormRowProps = {
  conditionRulesData?: RulesData;
  conditionRow: ConditionsData;
  onRuleChange: (newCondition: ConditionsData) => void;
  selPluginResourceType: string;
  criteria: keyof ConditionsData;
  setCriteria: React.Dispatch<React.SetStateAction<keyof ConditionsData>>;
  setErrors: React.Dispatch<
    React.SetStateAction<AccessConditionsErrors | undefined>
  >;
  setRemoveAllClicked: React.Dispatch<React.SetStateAction<boolean>>;
};

export enum NotConditionType {
  SimpleCondition = 'simple-condition',
  NestedCondition = 'nested-condition',
}
