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

jest.mock('./useLanguage', () => ({
  useLanguage: () => 'en',
}));

jest.mock('@backstage/core-plugin-api', () => {
  const { mockMembers } = require('../__fixtures__/mockMembers');

  return {
    ...jest.requireActual('@backstage/core-plugin-api'),
    useApi: jest.fn().mockReturnValue({
      getRole: jest.fn().mockReturnValue([
        {
          memberReferences: [
            'group:default/admins',
            'user:default/amelia.park',
            'user:default/calum.leavy',
            'group:default/team-b',
            'group:default/team-c',
          ],
          name: 'role:default/rbac_admin',
        },
      ]),
      getMembers: jest.fn().mockReturnValue(mockMembers),
    }),
  };
});

// Component imports AFTER mocks
import { useMembers } from './useMembers';

describe('useMembers', () => {
  it('should return members', async () => {
    const { result } = renderHook(() => useMembers('role:default/rbac_admin'));
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.data).toHaveLength(5);
    });
  });
});
