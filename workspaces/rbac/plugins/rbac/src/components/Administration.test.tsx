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
import { SidebarItem } from '@backstage/core-components';
import { ApiRef, configApiRef } from '@backstage/core-plugin-api';

import { render, screen } from '@testing-library/react';

import { rbacApiRef } from '../api/RBACBackendClient';
import { Administration } from './Administration';

let useAsyncMockResult: { loading: boolean; value?: { status: string } } = {
  loading: false,
  value: { status: 'Authorized' },
};

jest.mock('react-use', () => ({
  ...jest.requireActual('react-use'),
  useAsync: jest.fn().mockImplementation((fn: any, _deps: any) => {
    fn();
    return useAsyncMockResult;
  }),
}));

const mockGetUserAuthorization = jest.fn();

const configMock = {
  getOptionalBoolean: jest.fn(() => true),
};

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn((apiRef: ApiRef<any>) => {
    if (apiRef === rbacApiRef) {
      return {
        getUserAuthorization: mockGetUserAuthorization,
      };
    }
    if (apiRef === configApiRef) {
      return configMock;
    }
    return undefined;
  }),
}));

jest.mock('@backstage/core-components', () => ({
  SidebarItem: jest
    .fn()
    .mockImplementation(() => <div data-testid="mockSidebarItem">RBAC</div>),
}));

const mockedSidebarItem = SidebarItem as jest.MockedFunction<
  typeof SidebarItem
>;

const mockUseApi = jest.fn(() => ({
  getUserAuthorization: mockGetUserAuthorization,
}));

const mockRbacApiRef = jest.fn();

describe('RBAC component', () => {
  beforeEach(() => {
    mockGetUserAuthorization.mockClear();
    mockUseApi.mockClear();
    mockRbacApiRef.mockClear();
    mockedSidebarItem.mockClear();
  });

  it('renders Administration sidebar item if user is authorized', async () => {
    render(<Administration />);
    expect(mockedSidebarItem).toHaveBeenCalled();
    expect(screen.queryByText('RBAC')).toBeInTheDocument();
    expect(mockGetUserAuthorization).toHaveBeenCalledTimes(1);
  });

  it('does not render Administration sidebar item if user is not authorized', async () => {
    useAsyncMockResult = {
      loading: false,
      value: { status: 'Unauthorized' },
    };

    render(<Administration />);
    expect(mockedSidebarItem).not.toHaveBeenCalled();
    expect(mockGetUserAuthorization).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('RBAC')).toBeNull();
  });

  it('does not render Administration sidebar item if user loading state is true', async () => {
    useAsyncMockResult = {
      loading: true,
      value: undefined,
    };

    render(<Administration />);
    expect(mockedSidebarItem).not.toHaveBeenCalled();
    expect(screen.queryByText('RBAC')).toBeNull();
  });

  it('does not render Administration sidebar item if plugin is disabled in the configuration', async () => {
    useAsyncMockResult = {
      loading: false,
      value: { status: 'Authorized' },
    };
    configMock.getOptionalBoolean.mockReturnValueOnce(false);

    render(<Administration />);
    expect(mockedSidebarItem).not.toHaveBeenCalled();
    expect(mockGetUserAuthorization).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('RBAC')).toBeNull();
  });
});
