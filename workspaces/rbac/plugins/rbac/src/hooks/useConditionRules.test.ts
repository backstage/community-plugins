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
import { renderHook, waitFor } from '@testing-library/react';

import { mockConditionRules } from '../__fixtures__/mockConditionRules';
import { mockTransformedConditionRules } from '../__fixtures__/mockTransformedConditionRules';
import { useConditionRules } from './useConditionRules';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn().mockReturnValue({
    getPluginsConditionRules: jest.fn().mockReturnValue([
      {
        pluginId: 'catalog',
        rules: [mockConditionRules[0].rules[0], mockConditionRules[0].rules[1]],
      },
      {
        pluginId: 'scaffolder',
        rules: [mockConditionRules[1].rules[0]],
      },
    ]),
  }),
}));

describe('useConditionRules', () => {
  it('should return condition-rules', async () => {
    const { result } = renderHook(() => useConditionRules());

    await waitFor(() => {
      expect(result.current.data).toEqual(mockTransformedConditionRules);
      expect(result.current.error).toBeUndefined();
    });
  });
});
