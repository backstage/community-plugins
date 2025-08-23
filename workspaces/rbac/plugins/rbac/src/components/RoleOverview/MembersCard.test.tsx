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
import { usePermission } from '@backstage/plugin-permission-react';
import { renderInTestApp } from '@backstage/test-utils';

import { MembersData } from '../../types';
import { MembersCard } from './MembersCard';

jest.mock('../../hooks/useMembers', () => ({
  useMembers: jest.fn(),
}));

jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
}));

const useMembersMockData: MembersData[] = [
  {
    name: 'Amelia Park',
    type: 'User',
    ref: {
      namespace: 'default',
      kind: 'user',
      name: 'amelia.park',
    },
    members: 0,
  },
  {
    name: 'Calum Leavy',
    type: 'User',
    ref: {
      namespace: 'default',
      kind: 'user',
      name: 'calum.leavy',
    },
    members: 0,
  },
  {
    name: 'Team B',
    type: 'Group',
    ref: {
      namespace: 'default',
      kind: 'group',
      name: 'team-b',
    },
    members: 5,
  },
  {
    name: 'Team C',
    type: 'Group',
    ref: {
      namespace: 'default',
      kind: 'group',
      name: 'team-c',
    },
    members: 5,
  },
];

const mockUsePermission = usePermission as jest.MockedFunction<
  typeof usePermission
>;

describe('MembersCard', () => {
  it('should show list of Users and groups associated with the role when the data is loaded', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    const membersInfo = {
      loading: false,
      data: useMembersMockData,
      error: undefined,
      retry: { roleRetry: jest.fn(), membersRetry: jest.fn() },
      canReadUsersAndGroups: true,
    };
    const { queryByText } = await renderInTestApp(
      <MembersCard
        roleName="role:default/rbac_admin"
        membersInfo={membersInfo}
      />,
    );
    expect(queryByText('2 groups, 2 users')).not.toBeNull();
    expect(queryByText('Calum Leavy')).not.toBeNull();
    expect(queryByText('Amelia Park')).not.toBeNull();
    expect(queryByText('Team B')).not.toBeNull();
  });

  it('should show empty table when there are no users and groups', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    const membersInfo = {
      loading: false,
      data: [],
      error: undefined,
      retry: { roleRetry: jest.fn(), membersRetry: jest.fn() },
      canReadUsersAndGroups: true,
    };
    const { queryByText } = await renderInTestApp(
      <MembersCard
        roleName="role:default/rbac_admin"
        membersInfo={membersInfo}
      />,
    );
    expect(queryByText('Users and groups')).not.toBeNull();
    expect(queryByText('No records found')).not.toBeNull();
  });

  it('should show an error if api call fails', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    const membersInfo = {
      loading: false,
      data: [],
      error: { message: 'xyz' },
      retry: { roleRetry: jest.fn(), membersRetry: jest.fn() },
      canReadUsersAndGroups: false,
    };
    const { queryByText } = await renderInTestApp(
      <MembersCard
        roleName="role:default/rbac_admin"
        membersInfo={membersInfo}
      />,
    );
    expect(
      queryByText(
        'Error: Something went wrong while fetching the users and groups',
      ),
    ).not.toBeNull();

    expect(queryByText('No records found')).not.toBeNull();
  });

  it('should show edit icon when the user is authorized to update roles', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    const membersInfo = {
      loading: false,
      data: useMembersMockData,
      error: undefined,
      retry: { roleRetry: jest.fn(), membersRetry: jest.fn() },
      canReadUsersAndGroups: true,
    };
    const { getByTestId } = await renderInTestApp(
      <MembersCard
        roleName="role:default/rbac_admin"
        membersInfo={membersInfo}
      />,
    );
    expect(getByTestId('update-members')).not.toBeNull();
  });

  it('should disable edit icon when the user is not authorized to update roles', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: false });
    const membersInfo = {
      loading: false,
      data: useMembersMockData,
      error: undefined,
      retry: { roleRetry: jest.fn(), membersRetry: jest.fn() },
      canReadUsersAndGroups: false,
    };
    const { queryByTestId } = await renderInTestApp(
      <MembersCard
        roleName="role:default/rbac_admin"
        membersInfo={membersInfo}
      />,
    );
    expect(queryByTestId('disable-update-members')).not.toBeNull();
  });
});
