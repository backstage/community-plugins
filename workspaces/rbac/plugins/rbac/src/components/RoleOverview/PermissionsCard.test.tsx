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

import { mockFormInitialValues } from '../../__fixtures__/mockFormValues';
import { usePermissionPolicies } from '../../hooks/usePermissionPolicies';
import { PermissionsData } from '../../types';
import { PermissionsCard } from './PermissionsCard';

jest.mock('../../hooks/usePermissionPolicies', () => ({
  usePermissionPolicies: jest.fn(),
}));

jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
}));

const usePermissionPoliciesMockData: PermissionsData[] = [
  {
    permission: 'policy-entity',
    plugin: 'permission',
    policyString: ['Read', ', Create', ', Delete'],
    policies: [
      {
        policy: 'read',
        effect: 'allow',
      },
      {
        policy: 'create',
        effect: 'allow',
      },
      {
        policy: 'delete',
        effect: 'allow',
      },
    ],
  },
];

const mockPermissionPolicies = usePermissionPolicies as jest.MockedFunction<
  typeof usePermissionPolicies
>;
const mockUsePermission = usePermission as jest.MockedFunction<
  typeof usePermission
>;

describe('PermissionsCard', () => {
  it('should show list of Permission Policies when the data is loaded', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockPermissionPolicies.mockReturnValue({
      loading: false,
      data: usePermissionPoliciesMockData,
      retry: {
        policiesRetry: jest.fn(),
        permissionPoliciesRetry: jest.fn(),
        conditionalPoliciesRetry: jest.fn(),
      },
      error: new Error(''),
    });
    const { queryByText } = await renderInTestApp(
      <PermissionsCard
        entityReference="user:default/debsmita1"
        canReadUsersAndGroups
      />,
    );
    expect(queryByText('3 permissions')).not.toBeNull();
    expect(queryByText('Read, Create, Delete')).not.toBeNull();
  });

  it('should show empty table when there are no permission policies', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockPermissionPolicies.mockReturnValue({
      loading: false,
      data: [],
      retry: {
        policiesRetry: jest.fn(),
        permissionPoliciesRetry: jest.fn(),
        conditionalPoliciesRetry: jest.fn(),
      },
      error: new Error(''),
    });
    const { queryByText } = await renderInTestApp(
      <PermissionsCard
        entityReference="user:default/debsmita1"
        canReadUsersAndGroups
      />,
    );
    expect(queryByText('Permission Policies')).not.toBeNull();
    expect(queryByText('No records found')).not.toBeNull();
  });
  it('should show an error if api call fails', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockPermissionPolicies.mockReturnValue({
      loading: false,
      data: [],
      retry: {
        policiesRetry: jest.fn(),
        permissionPoliciesRetry: jest.fn(),
        conditionalPoliciesRetry: jest.fn(),
      },
      error: { message: '404', name: 'Not Found' },
    });
    const { queryByText } = await renderInTestApp(
      <PermissionsCard
        entityReference="user:default/debsmita1"
        canReadUsersAndGroups
      />,
    );
    expect(
      queryByText(
        'Error: Something went wrong while fetching the permission policies',
      ),
    ).not.toBeNull();

    expect(queryByText('No records found')).not.toBeNull();
  });
  it('should show edit icon when the user is authorized to update roles', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockPermissionPolicies.mockReturnValue({
      loading: false,
      data: [],
      error: new Error(''),
      retry: {
        policiesRetry: jest.fn(),
        permissionPoliciesRetry: jest.fn(),
        conditionalPoliciesRetry: jest.fn(),
      },
    });
    const { getByTestId } = await renderInTestApp(
      <PermissionsCard
        entityReference="role:default/rbac_admin"
        canReadUsersAndGroups
      />,
    );
    expect(getByTestId('update-policies')).not.toBeNull();
  });

  it('should disable edit icon when the user is not authorized to update roles', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: false });
    mockPermissionPolicies.mockReturnValue({
      loading: false,
      data: [],
      error: new Error(''),
      retry: {
        policiesRetry: jest.fn(),
        permissionPoliciesRetry: jest.fn(),
        conditionalPoliciesRetry: jest.fn(),
      },
    });
    const { queryByTestId } = await renderInTestApp(
      <PermissionsCard
        entityReference="role:default/rbac_admin"
        canReadUsersAndGroups={false}
      />,
    );
    expect(queryByTestId('disable-update-policies')).not.toBeNull();
  });

  it('should show conditions rules count for Conditional permission policies when the data is loaded', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockPermissionPolicies.mockReturnValue({
      loading: false,
      data: [
        ...usePermissionPoliciesMockData,
        ...mockFormInitialValues.permissionPoliciesRows,
      ],
      retry: {
        policiesRetry: jest.fn(),
        permissionPoliciesRetry: jest.fn(),
        conditionalPoliciesRetry: jest.fn(),
      },
      error: new Error(''),
    });
    const { queryByText } = await renderInTestApp(
      <PermissionsCard
        entityReference="user:default/debsmita1"
        canReadUsersAndGroups
      />,
    );
    expect(queryByText('4 permissions')).not.toBeNull();
    expect(queryByText('Read, Create, Delete', { exact: true })).not.toBeNull();
    expect(queryByText('Read', { exact: true })).not.toBeNull();
    expect(queryByText('1 rule')).not.toBeNull();
  });
});
