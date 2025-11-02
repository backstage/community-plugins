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

import { mockConditions } from '../__fixtures__/mockConditions';
import { mockPermissionPolicies } from '../__fixtures__/mockPermissionPolicies';
import { mockAssociatedPolicies } from '../__fixtures__/mockPolicies';

import { mockUseLanguage } from '../test-utils/mockTranslations';

import { usePermissionPolicies } from './usePermissionPolicies';

jest.mock('./useLanguage', () => ({
  useLanguage: mockUseLanguage,
}));

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest
    .fn()
    .mockReturnValueOnce({
      getAssociatedPolicies: jest.fn().mockReturnValue(mockAssociatedPolicies),
      listPermissions: jest.fn().mockReturnValue(mockPermissionPolicies),
      getRoleConditions: jest.fn().mockReturnValue(mockConditions),
    })
    .mockReturnValueOnce({
      getAssociatedPolicies: jest.fn().mockReturnValue(mockAssociatedPolicies),
      listPermissions: jest.fn().mockReturnValue([]),
      getRoleConditions: jest.fn().mockReturnValue([]),
    })
    .mockReturnValue({
      getAssociatedPolicies: jest
        .fn()
        .mockReturnValue({ status: '403', statusText: 'Unauthorized' }),
      listPermissions: jest.fn().mockReturnValue(mockPermissionPolicies),
      getRoleConditions: jest.fn().mockReturnValue([]),
    }),
}));

describe('usePermissionPolicies', () => {
  it('should return simple and conditional permission policies', async () => {
    const { result } = renderHook(() =>
      usePermissionPolicies('role:default/rbac_admin'),
    );
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.data).toHaveLength(9);
    });
  });

  it('should return empty permission policies when there are no permissions', async () => {
    const { result } = renderHook(() =>
      usePermissionPolicies('role:default/rbac_admin'),
    );
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.data).toHaveLength(0);
    });
  });

  it('should return an error when the fetch api call returns an error', async () => {
    const { result } = renderHook(() =>
      usePermissionPolicies('role:default/rbac_admin'),
    );
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toEqual({
        message: 'Error fetching the policies. Unauthorized',
        name: '403',
      });
    });
  });
});
