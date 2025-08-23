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
import {
  RequirePermission,
  usePermission,
} from '@backstage/plugin-permission-react';
import { renderInTestApp } from '@backstage/test-utils';

import { useCheckIfLicensePluginEnabled } from '../../hooks/useCheckIfLicensePluginEnabled';
import { useRoles } from '../../hooks/useRoles';
import { RolesData } from '../../types';
import { RolesList } from './RolesList';

jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
  RequirePermission: jest.fn(),
}));

jest.mock('../../hooks/useRoles', () => ({
  useRoles: jest.fn(),
}));

jest.mock('../../hooks/useCheckIfLicensePluginEnabled', () => ({
  useCheckIfLicensePluginEnabled: jest.fn(),
}));

const useRolesMockData: RolesData[] = [
  {
    name: 'role:default/guests',
    description: '-',
    members: ['user:default/xyz'],
    permissions: 2,
    modifiedBy: '-',
    lastModified: '-',
    actionsPermissionResults: {
      edit: { allowed: true },
    },
    accessiblePlugins: ['catalog'],
  },
  {
    name: 'role:default/rbac_admin',
    description: '-',
    members: ['user:default/xyz', 'group:default/hkhkh'],
    permissions: 4,
    modifiedBy: '-',
    lastModified: '-',
    actionsPermissionResults: {
      edit: { allowed: true },
    },
    accessiblePlugins: ['catalog', 'permission', 'scaffolder'],
  },
];

const mockUsePermission = usePermission as jest.MockedFunction<
  typeof usePermission
>;

const mockUseRoles = useRoles as jest.MockedFunction<typeof useRoles>;
const mockUseCheckIfLicensePluginEnabled =
  useCheckIfLicensePluginEnabled as jest.MockedFunction<
    typeof useCheckIfLicensePluginEnabled
  >;

const RequirePermissionMock = RequirePermission as jest.MockedFunction<
  typeof RequirePermission
>;

describe('RolesList', () => {
  it('should show list of roles when the roles are loaded', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockUseRoles.mockReturnValue({
      loading: false,
      data: useRolesMockData,
      error: {
        rolesError: '',
        policiesError: '',
        roleConditionError: '',
      },
      retry: { roleRetry: jest.fn(), policiesRetry: jest.fn() },
      createRoleAllowed: false,
      createRoleLoading: false,
    });
    mockUseCheckIfLicensePluginEnabled.mockReturnValue({
      loading: false,
      isEnabled: false,
      licenseCheckError: {
        message: '',
        name: '',
      },
    });
    const { queryByText } = await renderInTestApp(<RolesList />);
    expect(queryByText('All roles (2)')).not.toBeNull();
    expect(queryByText('role:default/guests')).not.toBeNull();
    expect(queryByText('role:default/rbac_admin')).not.toBeNull();
    expect(queryByText('1 group, 1 user')).not.toBeNull();
  });

  it('should show empty table when there are no roles', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockUseRoles.mockReturnValue({
      loading: false,
      data: [],
      error: {
        rolesError: '',
        policiesError: '',
        roleConditionError: '',
      },
      retry: { roleRetry: jest.fn(), policiesRetry: jest.fn() },
      createRoleAllowed: false,
      createRoleLoading: false,
    });
    const { getByTestId, queryByText } = await renderInTestApp(<RolesList />);
    expect(getByTestId('roles-table-empty')).not.toBeNull();
    expect(queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should show delete icon if user is authorized to delete roles', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission
      .mockReturnValueOnce({ loading: false, allowed: true })
      .mockReturnValue({ loading: false, allowed: true });
    mockUseRoles.mockReturnValue({
      loading: false,
      data: useRolesMockData,
      error: {
        rolesError: '',
        policiesError: '',
        roleConditionError: '',
      },
      retry: { roleRetry: jest.fn(), policiesRetry: jest.fn() },
      createRoleAllowed: false,
      createRoleLoading: false,
    });
    const { getByTestId, getByText } = await renderInTestApp(<RolesList />);
    expect(getByTestId('delete-role-role:default/guests')).not.toBeNull();
    expect(getByText('Actions')).not.toBeNull();
  });

  it('should show disabled delete icon if user is not authorized to delete roles', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission.mockImplementation(input => {
      if (input.permission.name === 'policy.entity.delete')
        return { loading: false, allowed: false };
      return { loading: false, allowed: true };
    });
    mockUseRoles.mockReturnValue({
      loading: false,
      data: [
        {
          ...useRolesMockData[0],
          actionsPermissionResults: {
            edit: { allowed: true },
          },
        },
        {
          ...useRolesMockData[1],
          actionsPermissionResults: {
            edit: { allowed: true },
          },
        },
      ],
      error: {
        rolesError: '',
        policiesError: '',
        roleConditionError: '',
      },
      retry: { roleRetry: jest.fn(), policiesRetry: jest.fn() },
      createRoleAllowed: false,
      createRoleLoading: false,
    });
    const { getByTestId } = await renderInTestApp(<RolesList />);
    expect(
      getByTestId('disable-delete-role-role:default/guests'),
    ).not.toBeNull();
    expect(getByTestId('edit-role-role:default/guests')).not.toBeNull();
  });

  it('should show disabled edit icon if user is not authorized to update roles', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission.mockImplementation(input => {
      if (input.permission.name === 'policy.entity.update')
        return { loading: false, allowed: false };
      return { loading: false, allowed: true };
    });
    mockUseRoles.mockReturnValue({
      loading: false,
      data: [
        {
          ...useRolesMockData[0],
          actionsPermissionResults: {
            edit: { allowed: true },
          },
        },
        {
          ...useRolesMockData[1],
          actionsPermissionResults: {
            edit: { allowed: true },
          },
        },
      ],
      error: {
        rolesError: '',
        policiesError: '',
        roleConditionError: '',
      },
      retry: { roleRetry: jest.fn(), policiesRetry: jest.fn() },
      createRoleAllowed: true,
      createRoleLoading: false,
    });
    const { getByTestId } = await renderInTestApp(<RolesList />);
    expect(getByTestId('disable-edit-role-role:default/guests')).not.toBeNull();
    expect(getByTestId('delete-role-role:default/rbac_admin')).not.toBeNull();
  });

  it('should disable create button if user is not authorized to create roles', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockUseRoles.mockReturnValue({
      loading: false,
      data: useRolesMockData,
      error: {
        rolesError: '',
        policiesError: '',
        roleConditionError: '',
      },
      retry: { roleRetry: jest.fn(), policiesRetry: jest.fn() },
      createRoleAllowed: false,
      createRoleLoading: false,
    });
    const { getByTestId } = await renderInTestApp(<RolesList />);

    expect(getByTestId('create-role').getAttribute('aria-disabled')).toEqual(
      'true',
    );
  });

  it('should enable create button if user is authorized to create roles', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockUseRoles.mockReturnValue({
      loading: false,
      data: useRolesMockData,
      error: {
        rolesError: '',
        policiesError: '',
        roleConditionError: '',
      },
      retry: { roleRetry: jest.fn(), policiesRetry: jest.fn() },
      createRoleAllowed: true,
      createRoleLoading: false,
    });
    const { getByTestId } = await renderInTestApp(<RolesList />);

    expect(getByTestId('create-role').getAttribute('aria-disabled')).toEqual(
      'false',
    );
  });

  it('should show warning alert if user is not authorized to create roles', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockUseRoles.mockReturnValue({
      loading: false,
      data: useRolesMockData,
      error: {
        rolesError: '',
        policiesError: '',
        roleConditionError: '',
      },
      retry: { roleRetry: jest.fn(), policiesRetry: jest.fn() },
      createRoleAllowed: false,
      createRoleLoading: false,
    });
    const { getByTestId } = await renderInTestApp(<RolesList />);

    expect(getByTestId('create-role-warning')).not.toBeNull();
  });

  it('should show error message when there is an error fetching the roles', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockUseRoles.mockReturnValue({
      loading: true,
      data: [],
      error: {
        rolesError: 'Something went wrong',
        policiesError: '',
        roleConditionError: '',
      },
      retry: { roleRetry: jest.fn(), policiesRetry: jest.fn() },
      createRoleAllowed: false,
      createRoleLoading: false,
    });

    const { queryByText } = await renderInTestApp(<RolesList />);
    expect(queryByText('Something went wrong')).toBeInTheDocument();
  });

  it('should show error message when there is an error fetching the role conditions', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockUseRoles.mockReturnValue({
      loading: true,
      data: [],
      error: {
        rolesError: '',
        policiesError: '',
        roleConditionError:
          'Error fetching role conditions for role role:default/xyz, please try again later.',
      },
      retry: { roleRetry: jest.fn(), policiesRetry: jest.fn() },
      createRoleAllowed: false,
      createRoleLoading: false,
    });

    const { queryByText } = await renderInTestApp(<RolesList />);
    expect(
      queryByText(
        'Error fetching role conditions for role role:default/xyz, please try again later.',
      ),
    ).toBeInTheDocument();
  });

  it('should show accessible plugins for each role', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockUseRoles.mockReturnValue({
      loading: false,
      data: useRolesMockData,
      error: {
        rolesError: '',
        policiesError: '',
        roleConditionError: '',
      },
      retry: { roleRetry: jest.fn(), policiesRetry: jest.fn() },
      createRoleAllowed: false,
      createRoleLoading: false,
    });
    const { queryByText } = await renderInTestApp(<RolesList />);
    expect(queryByText('role:default/guests')).not.toBeNull();
    expect(queryByText('Catalog', { exact: true })).not.toBeNull();
    expect(queryByText('role:default/rbac_admin')).not.toBeNull();
    expect(
      queryByText('Catalog, Permission + 1', { exact: true }),
    ).not.toBeNull();
  });
});
