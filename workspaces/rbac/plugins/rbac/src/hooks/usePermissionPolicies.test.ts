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
import { usePermissionPolicies } from './usePermissionPolicies';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest
    .fn()
    .mockReturnValueOnce({
      getAssociatedPolicies: jest.fn().mockReturnValue(mockAssociatedPolicies),
      listPermissions: jest.fn().mockReturnValue(mockPermissionPolicies),
      getRoleConditions: jest.fn().mockReturnValue(mockConditions),
      getDefaultPermissions: jest.fn().mockResolvedValue([]), // Added mock for getDefaultPermissions
    })
    .mockReturnValueOnce({
      getAssociatedPolicies: jest.fn().mockReturnValue(mockAssociatedPolicies),
      listPermissions: jest.fn().mockReturnValue([]),
      getRoleConditions: jest.fn().mockReturnValue([]),
      getDefaultPermissions: jest.fn().mockResolvedValue([]), // Added mock for getDefaultPermissions
    })
    .mockReturnValue({
      getAssociatedPolicies: jest
        .fn()
        .mockRejectedValue({ status: 403, message: 'Unauthorized' }), // Corrected mock
      listPermissions: jest.fn().mockReturnValue(mockPermissionPolicies),
      getRoleConditions: jest.fn().mockReturnValue([]),
      getDefaultPermissions: jest
        .fn()
        .mockRejectedValue(new Error('Unauthorized')), // Corrected mock
    }),
}));

describe('usePermissionPolicies', () => {
  it('should return simple and conditional permission policies', async () => {
    const { result } = renderHook(() =>
      usePermissionPolicies('role:default/rbac_admin'),
    );
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.rolePolicies).toHaveLength(9);
    });
  });

  it('should return empty permission policies when there are no permissions', async () => {
    const { result } = renderHook(() =>
      usePermissionPolicies('role:default/rbac_admin'),
    );
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.rolePolicies).toHaveLength(0);
    });
  });

  it('should return an error when the fetch api call returns an error', async () => {
    const { result } = renderHook(() =>
      usePermissionPolicies('role:default/rbac_admin'),
    );
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toEqual({
        message: 'Unauthorized',
        status: 403,
      });
    });
  });
});
