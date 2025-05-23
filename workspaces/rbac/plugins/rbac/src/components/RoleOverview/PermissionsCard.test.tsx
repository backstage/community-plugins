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
import { waitFor } from '@testing-library/react';

import { usePermissionPolicies } from '../../hooks/usePermissionPolicies';
import { PermissionsData, ConditionsData } from '../../types';
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
    policyString: ['Read', ', Create', ', Delete'], // This will be joined to "Read, Create, Delete"
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

// Mock for mockFormInitialValues.permissionPoliciesRows
const mockPermissionPoliciesRowsConditional: PermissionsData[] = [
  {
    permission: 'conditional-policy',
    plugin: 'catalog',
    policyString: ['Use'],
    policies: [{ policy: 'use', effect: 'allow' }],
    conditions: {
      condition: {
        rule: 'IS_ENTITY_OWNER',
        resourceType: 'catalog-entity',
        params: {},
      },
    } as ConditionsData,
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
      rolePolicies: usePermissionPoliciesMockData,
      defaultPolicies: [],
      retry: {
        policiesRetry: jest.fn(),
        permissionPoliciesRetry: jest.fn(),
        conditionalPoliciesRetry: jest.fn(),
        defaultPermissionsRetry: jest.fn(),
      },
      error: new Error(''),
    });
    const { queryByText, findAllByText } = await renderInTestApp(
      <PermissionsCard
        entityReference="user:default/debsmita1"
        canReadUsersAndGroups
      />,
    );
    // Check for plugin and permission name
    expect(queryByText('permission')).toBeInTheDocument(); // For plugin
    expect(queryByText('policy-entity')).toBeInTheDocument(); // For permission name

    // Check for "Allow" chips (there should be 3)
    const allowChips = await findAllByText('Allow');
    expect(allowChips).toHaveLength(3);

    await waitFor(() => {
      expect(queryByText('Permission Policies (3)')).toBeInTheDocument();
    });
  });

  it('should show empty table when there are no permission policies', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockPermissionPolicies.mockReturnValue({
      loading: false,
      rolePolicies: [],
      defaultPolicies: [],
      retry: {
        policiesRetry: jest.fn(),
        permissionPoliciesRetry: jest.fn(),
        conditionalPoliciesRetry: jest.fn(),
        defaultPermissionsRetry: jest.fn(),
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
      rolePolicies: [],
      defaultPolicies: [],
      retry: {
        policiesRetry: jest.fn(),
        permissionPoliciesRetry: jest.fn(),
        conditionalPoliciesRetry: jest.fn(),
        defaultPermissionsRetry: jest.fn(),
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
      rolePolicies: [],
      defaultPolicies: [],
      error: new Error(''),
      retry: {
        policiesRetry: jest.fn(),
        permissionPoliciesRetry: jest.fn(),
        conditionalPoliciesRetry: jest.fn(),
        defaultPermissionsRetry: jest.fn(),
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
      rolePolicies: [],
      defaultPolicies: [],
      error: new Error(''),
      retry: {
        policiesRetry: jest.fn(),
        permissionPoliciesRetry: jest.fn(),
        conditionalPoliciesRetry: jest.fn(),
        defaultPermissionsRetry: jest.fn(),
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
      rolePolicies: mockPermissionPoliciesRowsConditional, // Use conditional mock
      defaultPolicies: [],
      retry: {
        policiesRetry: jest.fn(),
        permissionPoliciesRetry: jest.fn(),
        conditionalPoliciesRetry: jest.fn(),
        defaultPermissionsRetry: jest.fn(),
      },
      error: new Error(''),
    });
    const { queryByText, findAllByText } = await renderInTestApp(
      <PermissionsCard
        entityReference="user:default/debsmita1"
        canReadUsersAndGroups
      />,
    );

    // Check for plugin and permission name
    expect(queryByText('catalog')).toBeInTheDocument(); // For plugin
    expect(queryByText('conditional-policy')).toBeInTheDocument(); // For permission name

    // Check for "Allow" chip (there should be 1)
    const allowChips = await findAllByText('Allow');
    expect(allowChips).toHaveLength(1);

    // Check for conditional rule text
    expect(queryByText('1 rule')).toBeInTheDocument();

    await waitFor(() => {
      // Title count should be 1 for this mock data
      expect(queryByText('Permission Policies (1)')).toBeInTheDocument();
    });
  });
});
