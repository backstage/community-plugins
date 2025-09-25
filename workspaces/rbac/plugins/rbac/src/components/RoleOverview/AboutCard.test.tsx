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
import { renderInTestApp } from '@backstage/test-utils';

import { Role } from '@backstage-community/plugin-rbac-common';

import { useRole } from '../../hooks/useRole';
import { AboutCard } from './AboutCard';

jest.mock('../../hooks/useRole', () => ({
  useRole: jest.fn(),
}));

const mockRole: Role = {
  name: 'role:default/rbac-admin',
  memberReferences: ['user:default/tom', 'group:default/performance-dev-team'],
  metadata: {
    source: 'rest',
    description: 'performance dev team',
    lastModified: '2024-04-04T14:25:53.000Z',
    modifiedBy: 'user:default/tim',
  },
};

const mockRoleWithoutDescription: Role = {
  name: 'role:default/rbac-admin',
  memberReferences: ['user:default/tom', 'group:default/performance-dev-team'],
  metadata: {
    source: 'rest',
    description: undefined,
  },
};

const mockUseRole = useRole as jest.MockedFunction<typeof useRole>;

describe('AboutCard', () => {
  it('should show role metadata information', async () => {
    mockUseRole.mockReturnValue({
      loading: false,
      role: mockRole,
      roleError: {
        name: '',
        message: '',
      },
    });
    const { queryByText } = await renderInTestApp(
      <AboutCard roleName="role:default/rbac_admin" />,
    );
    expect(queryByText('About')).not.toBeNull();
    expect(queryByText('performance dev team')).not.toBeNull();
    expect(queryByText('user:default/tim')).not.toBeNull();
    expect(queryByText('4 Apr 2024, 14:25')).not.toBeNull();
  });

  it('should display stub, when role metadata is absent', async () => {
    mockUseRole.mockReturnValue({
      loading: false,
      role: mockRoleWithoutDescription,
      roleError: {
        name: '',
        message: '',
      },
    });
    const { queryByText, queryAllByText } = await renderInTestApp(
      <AboutCard roleName="role:default/rbac_admin" />,
    );
    expect(queryByText('About')).not.toBeNull();
    expect(queryAllByText('--').length).toEqual(4);
  });

  it('should show an error if api call fails', async () => {
    mockUseRole.mockReturnValue({
      loading: false,
      role: mockRole,
      roleError: {
        name: 'Role not found',
        message: 'Role not found',
      },
    });
    const { queryByText } = await renderInTestApp(
      <AboutCard roleName="role:default/rbac_admin" />,
    );
    expect(
      queryByText('Error: Something went wrong while fetching the role'),
    ).not.toBeNull();
    expect(queryByText('Role not found')).not.toBeNull();
  });
});
