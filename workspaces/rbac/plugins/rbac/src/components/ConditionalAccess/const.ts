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
import { ConditionsData } from './types';

export const criterias = {
  condition: 'condition' as keyof ConditionsData,
  anyOf: 'anyOf' as keyof ConditionsData,
  allOf: 'allOf' as keyof ConditionsData,
  not: 'not' as keyof ConditionsData,
};

export const criteriasLabels = {
  [criterias.condition]: 'Condition',
  [criterias.allOf]: 'AllOf',
  [criterias.anyOf]: 'AnyOf',
  [criterias.not]: 'Not',
};

export const conditionButtons = [
  { val: criterias.condition, label: criteriasLabels[criterias.condition] },
  { val: criterias.allOf, label: criteriasLabels[criterias.allOf] },
  { val: criterias.anyOf, label: criteriasLabels[criterias.anyOf] },
  { val: criterias.not, label: criteriasLabels[criterias.not] },
];
