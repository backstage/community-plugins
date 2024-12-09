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

import { mockPolicies } from '../__fixtures__/mockPolicies';
import { useRoles } from './useRoles';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn().mockReturnValue({
    getRoles: jest.fn().mockReturnValue([
      {
        memberReferences: ['user:default/guest'],
        name: 'role:default/guests',
      },
      {
        memberReferences: ['user:default/debsmita1', 'group:default/admins'],
        name: 'role:default/rbac_admin',
      },
    ]),
    getPolicies: jest
      .fn()
      .mockReturnValueOnce(mockPolicies)
      .mockReturnValue([
        {
          entityReference: 'role:default/guests',
          permission: 'catalog-entity',
          policy: 'read',
          effect: 'allow',
        },
        {
          entityReference: 'role:default/guests',
          permission: 'catalog.entity.create',
          policy: 'use',
          effect: 'allow',
        },
        {
          entityReference: 'role:default/rbac_admin',
          permission: 'policy-entity',
          policy: 'read',
          effect: 'allow',
        },
        {
          entityReference: 'role:default/rbac_admin',
          permission: 'policy-entity',
          policy: 'create',
          effect: 'allow',
        },
        {
          entityReference: 'role:default/rbac_admin',
          permission: 'policy-entity',
          policy: 'delete',
          effect: 'allow',
        },
        {
          entityReference: 'role:default/rbac_admin',
          permission: 'catalog-entity',
          policy: 'read',
          effect: 'allow',
        },
        {
          entityReference: 'role:default/rbac_admin',
          permission: 'catalog.entity.create',
          policy: 'use',
          effect: 'allow',
        },
      ]),
    getRoleConditions: jest.fn().mockReturnValue([]),
  }),
}));

describe('useRoles', () => {
  it('should return all roles irrespective of permission policies', async () => {
    const { result } = renderHook(() => useRoles());
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.data).toHaveLength(2);
    });
  });

  it('should return roles', async () => {
    const { result } = renderHook(() => useRoles());
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.data).toHaveLength(2);
    });
  });
});
