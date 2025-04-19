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

import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';

import { screen } from '@testing-library/react';

import { useCheckIfLicensePluginEnabled } from '../hooks/useCheckIfLicensePluginEnabled';
import { useRoles } from '../hooks/useRoles';
import { RbacPage } from './RbacPage';

import { RBACAPI, rbacApiRef } from '../api/RBACBackendClient';

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

const mockUseRoles = useRoles as jest.MockedFunction<typeof useRoles>;

const mockUseCheckIfLicensePluginEnabled =
  useCheckIfLicensePluginEnabled as jest.MockedFunction<
    typeof useCheckIfLicensePluginEnabled
  >;

// Added
let useAsyncMockResult: { loading: boolean; value?: { status: string } } = {
  loading: false,
  value: { status: 'Authorized' },
};

const mockRbacApi: jest.Mocked<Partial<RBACAPI>> = {
  getUserAuthorization: jest.fn().mockImplementation(() => useAsyncMockResult),
};

jest.mock('react-use', () => ({
  ...jest.requireActual('react-use'),
  useAsync: jest.fn().mockImplementation((fn: any, _deps: any) => {
    fn();
    return useAsyncMockResult;
  }),
}));

describe('RbacPage', () => {
  it('should render if authorized', async () => {
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

    await renderInTestApp(
      <TestApiProvider apis={[[rbacApiRef, mockRbacApi]]}>
        <RbacPage />
      </TestApiProvider>,
    );
    expect(screen.getByText('RBAC')).toBeInTheDocument();
  });

  it('should not render if not authorized', async () => {
    useAsyncMockResult = {
      loading: false,
      value: { status: 'Unauthorized' },
    };

    await renderInTestApp(
      <TestApiProvider apis={[[rbacApiRef, mockRbacApi]]}>
        <RbacPage />
      </TestApiProvider>,
    );
    expect(screen.getByText('ERROR : Not Found')).toBeInTheDocument();
  });

  it('should not render if loading', async () => {
    useAsyncMockResult = {
      loading: true,
      value: undefined,
    };

    const { queryByText } = await renderInTestApp(
      <TestApiProvider apis={[[rbacApiRef, mockRbacApi]]}>
        <RbacPage />
      </TestApiProvider>,
    );
    expect(queryByText('Not Found')).not.toBeInTheDocument();
    expect(queryByText('RBAC')).not.toBeInTheDocument();
  });
});
