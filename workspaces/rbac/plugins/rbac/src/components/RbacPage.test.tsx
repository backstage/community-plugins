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
import React from 'react';

import {
  RequirePermission,
  usePermission,
} from '@backstage/plugin-permission-react';
import { renderInTestApp } from '@backstage/test-utils';

import { screen } from '@testing-library/react';

import { useCheckIfLicensePluginEnabled } from '../hooks/useCheckIfLicensePluginEnabled';
import { useRoles } from '../hooks/useRoles';
import { RbacPage } from './RbacPage';

jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
  RequirePermission: jest.fn(),
}));

jest.mock('../hooks/useRoles', () => ({
  useRoles: jest.fn(),
}));

jest.mock('../hooks/useCheckIfLicensePluginEnabled', () => ({
  useCheckIfLicensePluginEnabled: jest.fn(),
}));

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

describe('RbacPage', () => {
  it('should render if authorized', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockUseRoles.mockReturnValue({
      loading: true,
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
    mockUseCheckIfLicensePluginEnabled.mockReturnValue({
      loading: false,
      isEnabled: false,
      licenseCheckError: {
        message: '',
        name: '',
      },
    });
    await renderInTestApp(<RbacPage />);
    expect(screen.getByText('RBAC')).toBeInTheDocument();
  });

  it('should not render if not authorized', async () => {
    RequirePermissionMock.mockImplementation(_props => <>Not Found</>);
    mockUsePermission.mockReturnValue({ loading: false, allowed: false });

    await renderInTestApp(<RbacPage />);
    expect(screen.getByText('Not Found')).toBeInTheDocument();
  });

  it('should not render if loading', async () => {
    RequirePermissionMock.mockImplementation(_props => null);
    mockUsePermission.mockReturnValue({ loading: false, allowed: false });

    const { queryByText } = await renderInTestApp(<RbacPage />);
    expect(queryByText('Not Found')).not.toBeInTheDocument();
    expect(queryByText('RBAC')).not.toBeInTheDocument();
  });
});
