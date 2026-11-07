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
import { MemoryRouter } from 'react-router-dom';

import { RequirePermission } from '@backstage/plugin-permission-react';

import { render, screen } from '@testing-library/react';

import { NfsRouter, Router } from './Router';

const configMock = {
  getOptionalBoolean: jest.fn(() => true),
};

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(() => configMock),
}));

jest.mock('./RbacPage', () => ({
  RbacPage: ({ useHeader }: { useHeader?: boolean }) => (
    <div data-use-header={String(useHeader)}>RBAC</div>
  ),
}));

jest.mock('./RoleOverview/RoleOverviewPage', () => ({
  RoleOverviewPage: ({ headerVariant }: { headerVariant?: string }) => (
    <div data-header-variant={headerVariant}>Role</div>
  ),
}));

jest.mock('./CreateRole/CreateRolePage', () => ({
  CreateRolePage: ({ headerVariant }: { headerVariant?: string }) => (
    <div data-header-variant={headerVariant}>CreateRole</div>
  ),
}));

jest.mock('./CreateRole/EditRolePage', () => ({
  EditRolePage: ({ headerVariant }: { headerVariant?: string }) => (
    <div data-header-variant={headerVariant}>EditRole</div>
  ),
}));

jest.mock('@backstage/core-components', () => ({
  ErrorPage: jest.fn().mockImplementation(() => <div>Mocked ErrorPage</div>),
}));

jest.mock('@backstage/plugin-permission-react', () => ({
  RequirePermission: jest
    .fn()
    .mockImplementation(({ permission, resourceRef, children }) => (
      <div>
        {`${permission} ${resourceRef}`}
        {children}
      </div>
    )),
}));

const mockedPrequirePermission = RequirePermission as jest.MockedFunction<
  typeof RequirePermission
>;

describe('Router component', () => {
  it('renders RbacPage when path is "/"', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Router />
      </MemoryRouter>,
    );
    expect(screen.queryByText('RBAC')).toBeInTheDocument();
  });

  it(`should not render RbacPage when path is "/", when plugin is disabled`, () => {
    configMock.getOptionalBoolean.mockReturnValueOnce(false);
    render(
      <MemoryRouter initialEntries={['/']}>
        <Router />
      </MemoryRouter>,
    );
    expect(screen.queryByText('RBAC')).not.toBeInTheDocument();
  });

  it('should render ErrorPage when rbac-backend plugin is disabled', () => {
    configMock.getOptionalBoolean.mockReturnValueOnce(false);
    render(
      <MemoryRouter initialEntries={['/']}>
        <Router />
      </MemoryRouter>,
    );

    expect(screen.queryByText('Mocked ErrorPage')).toBeInTheDocument();
  });

  it('renders RoleOverviewPage when path matches roleRouteRef', () => {
    render(
      <MemoryRouter initialEntries={['/roles/user/testns/testname']}>
        <Router />
      </MemoryRouter>,
    );

    expect(screen.queryByText('Role')).toBeInTheDocument();
  });

  it('should not render RoleOverviewPage when path matches roleRouteRef, when plugin is disabled', () => {
    configMock.getOptionalBoolean.mockReturnValueOnce(false);
    render(
      <MemoryRouter initialEntries={['/roles/user/testns/testname']}>
        <Router />
      </MemoryRouter>,
    );

    expect(screen.queryByText('Role')).not.toBeInTheDocument();
  });

  it('renders CreateRolePage with the right permissions when path matches createRoleRouteRef', () => {
    render(
      <MemoryRouter initialEntries={['/role/new']}>
        <Router />
      </MemoryRouter>,
    );
    expect(mockedPrequirePermission).toHaveBeenCalledWith(
      expect.objectContaining({
        permission: expect.objectContaining({ name: 'policy.entity.create' }),
      }),
      expect.anything(),
    );
    expect(screen.queryByText('CreateRole')).toBeInTheDocument();
  });

  it('should not render CreateRolePage with the right permissions when path matches createRoleRouteRef, when plugin is disabled', () => {
    configMock.getOptionalBoolean.mockReturnValueOnce(false);
    render(
      <MemoryRouter initialEntries={['/role/new']}>
        <Router />
      </MemoryRouter>,
    );

    expect(screen.queryByText('CreateRole')).not.toBeInTheDocument();
  });

  it('renders EditRolePage with the right permissions when path matches editRoleRouteRef', () => {
    render(
      <MemoryRouter initialEntries={['/role/user/testns/testname']}>
        <Router />
      </MemoryRouter>,
    );

    expect(screen.queryByText('EditRole')).toBeInTheDocument();
  });

  it('should not render EditRolePage with the right permissions when path matches editRoleRouteRef, when plugin is disabled', () => {
    configMock.getOptionalBoolean.mockReturnValueOnce(false);
    render(
      <MemoryRouter initialEntries={['/role/user/testns/testname']}>
        <Router />
      </MemoryRouter>,
    );

    expect(screen.queryByText('EditRole')).not.toBeInTheDocument();
  });

  it.each([
    ['/roles/user/testns/testname', 'Role'],
    ['/role/new', 'CreateRole'],
    ['/role/user/testns/testname', 'EditRole'],
  ])(
    'renders %s with the header for the frontend system in use',
    (path, page) => {
      const { unmount } = render(
        <MemoryRouter initialEntries={[path]}>
          <Router />
        </MemoryRouter>,
      );
      expect(screen.getByText(page)).toHaveAttribute(
        'data-header-variant',
        'legacy',
      );
      unmount();

      render(
        <MemoryRouter initialEntries={[path]}>
          <NfsRouter />
        </MemoryRouter>,
      );
      expect(screen.getByText(page)).toHaveAttribute(
        'data-header-variant',
        'bui',
      );
    },
  );

  it('leaves the header of the roles list to the app in the new frontend system', () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/']}>
        <Router />
      </MemoryRouter>,
    );
    expect(screen.getByText('RBAC')).toHaveAttribute('data-use-header', 'true');
    unmount();

    render(
      <MemoryRouter initialEntries={['/']}>
        <NfsRouter />
      </MemoryRouter>,
    );
    expect(screen.getByText('RBAC')).toHaveAttribute(
      'data-use-header',
      'false',
    );
  });
});
