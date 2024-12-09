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

import { mockMembers } from '../__fixtures__/mockMembers';
import { useRole } from './useRole';

const apiMock = {
  getRole: jest.fn().mockImplementation(),
  getMembers: jest.fn().mockImplementation(),
};

jest.mock('@backstage/core-plugin-api', () => {
  const actualApi = jest.requireActual('@backstage/core-plugin-api');
  return {
    ...actualApi,
    useApi: jest.fn().mockImplementation(() => {
      return apiMock;
    }),
  };
});

describe('useRole', () => {
  beforeEach(() => {
    apiMock.getRole = jest.fn().mockImplementation(async () => {
      return [
        {
          memberReferences: [
            'group:default/admins',
            'user:default/amelia.park',
            'user:default/calum.leavy',
            'group:default/team-b',
            'group:default/team-c',
          ],
          name: 'role:default/rbac_admin',
          metadata: {
            source: 'rest',
            description: 'default rbac admin group',
          },
        },
      ];
    });
    apiMock.getMembers = jest.fn().mockImplementation(async () => mockMembers);
  });

  describe('useRole', () => {
    it('should throw an error on get role', async () => {
      apiMock.getRole = jest.fn().mockImplementation(() => {
        throw new Error('Some error message');
      });
      const { result } = renderHook(() => useRole('role:default/rbac_admin'));
      await waitFor(() => {
        expect(result.current.loading).toBeFalsy();
        expect(result.current.roleError.message).toEqual('Some error message');
      });
    });

    it('should return role', async () => {
      const { result } = renderHook(() => useRole('role:default/rbac_admin'));
      await waitFor(() => {
        expect(result.current.loading).toBeFalsy();
        expect(result.current.role).toEqual({
          memberReferences: [
            'group:default/admins',
            'user:default/amelia.park',
            'user:default/calum.leavy',
            'group:default/team-b',
            'group:default/team-c',
          ],
          name: 'role:default/rbac_admin',
          metadata: {
            source: 'rest',
            description: 'default rbac admin group',
          },
        });
      });
    });
  });
});
