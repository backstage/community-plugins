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
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';
import { ConditionsData } from './types';
import { rbacTranslationRef } from '../../translations';

export const criterias = {
  condition: 'condition' as keyof ConditionsData,
  anyOf: 'anyOf' as keyof ConditionsData,
  allOf: 'allOf' as keyof ConditionsData,
  not: 'not' as keyof ConditionsData,
};

export const getCriteriasLabels = (
  t: TranslationFunction<typeof rbacTranslationRef.T>,
) => ({
  [criterias.condition]: t('conditionalAccess.condition'),
  [criterias.allOf]: t('conditionalAccess.allOf'),
  [criterias.anyOf]: t('conditionalAccess.anyOf'),
  [criterias.not]: t('conditionalAccess.not'),
});

export const getConditionButtons = (
  t: TranslationFunction<typeof rbacTranslationRef.T>,
) => [
  { val: criterias.condition, label: t('conditionalAccess.condition') },
  { val: criterias.allOf, label: t('conditionalAccess.allOf') },
  { val: criterias.anyOf, label: t('conditionalAccess.anyOf') },
  { val: criterias.not, label: t('conditionalAccess.not') },
];
