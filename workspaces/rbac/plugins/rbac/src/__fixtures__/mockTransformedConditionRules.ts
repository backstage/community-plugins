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
import { ConditionRulesData } from '../components/ConditionalAccess/types';
import { mockConditionRules } from './mockConditionRules';

export const mockTransformedConditionRules: ConditionRulesData = {
  catalog: {
    'catalog-entity': {
      HAS_ANNOTATION: {
        description: mockConditionRules[0].rules[0].description,
        schema: mockConditionRules[0].rules[0].paramsSchema,
      },
      HAS_LABEL: {
        description: mockConditionRules[0].rules[1].description,
        schema: mockConditionRules[0].rules[1].paramsSchema,
      },
      rules: [
        mockConditionRules[0].rules[0].name,
        mockConditionRules[0].rules[1].name,
      ],
    },
  },
  scaffolder: {
    'scaffolder-template': {
      HAS_TAG: {
        description: mockConditionRules[1].rules[0].description,
        schema: mockConditionRules[1].rules[0].paramsSchema,
      },
      rules: [mockConditionRules[1].rules[0].name],
    },
  },
};
