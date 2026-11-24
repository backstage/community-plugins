/*
 * Copyright 2026 The Backstage Authors
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
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AccessCheckResponse } from '@backstage-community/plugin-rbac-common';

import { RBACAPI, rbacApiRef } from '../../api/RBACBackendClient';
import { AccessCheck } from './AccessCheck';

const accessCheckResponse: AccessCheckResponse = {
  userEntityRef: 'user:default/tom',
  isSuperUser: false,
  roles: [
    { roleEntityRef: 'role:default/dev', via: ['user:default/tom'] },
    { roleEntityRef: 'role:default/qa', via: ['group:default/team-a'] },
    // a configured default role applies without any membership
    { roleEntityRef: 'role:default/everyone', via: [] },
  ],
  decisions: [
    {
      pluginId: 'catalog',
      permission: 'catalog.entity.read',
      resourceType: 'catalog-entity',
      action: 'read',
      result: AuthorizeResult.ALLOW,
      allowedBy: ['role:default/dev'],
      deniedBy: [],
      conditionalBy: [],
    },
    {
      pluginId: 'catalog',
      permission: 'catalog.entity.delete',
      resourceType: 'catalog-entity',
      action: 'delete',
      result: AuthorizeResult.CONDITIONAL,
      allowedBy: [],
      deniedBy: [],
      conditionalBy: [
        {
          id: 1,
          result: AuthorizeResult.CONDITIONAL,
          pluginId: 'catalog',
          resourceType: 'catalog-entity',
          roleEntityRef: 'role:default/qa',
          permissionMapping: [
            { name: 'catalog.entity.delete', action: 'delete' },
          ],
          conditions: {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {},
          },
        },
      ],
    },
    {
      pluginId: 'scaffolder',
      permission: 'scaffolder.template.read',
      resourceType: 'scaffolder-template',
      action: 'read',
      result: AuthorizeResult.DENY,
      allowedBy: ['role:default/dev'],
      deniedBy: ['role:default/qa'],
      conditionalBy: [],
    },
    {
      // denied by default: nothing grants or denies it explicitly
      pluginId: 'catalog',
      permission: 'catalog.location.read',
      action: 'read',
      result: AuthorizeResult.DENY,
      allowedBy: [],
      deniedBy: [],
      conditionalBy: [],
    },
  ],
};

const createRbacApi = (
  overrides: Partial<RBACAPI> = {},
): jest.Mocked<Partial<RBACAPI>> => ({
  searchMembers: jest.fn().mockResolvedValue({
    items: [
      {
        kind: 'User',
        apiVersion: 'backstage.io/v1alpha1',
        metadata: { name: 'tom', namespace: 'default' },
        spec: { profile: { displayName: 'Tom' } },
      },
    ],
    totalItems: 1,
  }),
  checkAccess: jest.fn().mockResolvedValue(accessCheckResponse),
  ...overrides,
});

const renderAccessCheck = (rbacApi: jest.Mocked<Partial<RBACAPI>>) =>
  renderInTestApp(
    <TestApiProvider apis={[[rbacApiRef, rbacApi]]}>
      <AccessCheck />
    </TestApiProvider>,
  );

const selectTom = async () => {
  await userEvent.click(screen.getByRole('combobox', { name: 'User' }));
  await userEvent.click(await screen.findByText('Tom'));
};

describe('AccessCheck', () => {
  it('explains the roles and the decisions of the selected user', async () => {
    const rbacApi = createRbacApi();
    await renderAccessCheck(rbacApi);

    expect(
      screen.getByText('Select a user to see their permissions.'),
    ).toBeInTheDocument();

    await selectTom();
    expect(rbacApi.checkAccess).toHaveBeenCalledWith('user:default/tom');

    // roles with how the user is connected to them
    const roles = await screen.findByRole('list');
    expect(within(roles).getByRole('link', { name: 'dev' })).toHaveAttribute(
      'href',
      '/roles/role/default/dev',
    );
    expect(within(roles).getByText('direct assignment')).toBeInTheDocument();
    expect(
      within(roles).getByText('via group:default/team-a'),
    ).toBeInTheDocument();
    expect(
      within(roles).getByText('applies to every user'),
    ).toBeInTheDocument();

    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    // header + four decisions
    expect(rows).toHaveLength(5);
    // a permission nothing grants or denies says so instead of listing roles
    expect(within(rows[4]).getByText('No matching policy')).toBeInTheDocument();

    const readRow = rows[1];
    expect(
      within(readRow).getByText('catalog.entity.read'),
    ).toBeInTheDocument();
    expect(
      within(readRow).getByRole('img', { name: 'Allow' }),
    ).toBeInTheDocument();
    expect(
      within(readRow).getByRole('link', { name: 'dev' }),
    ).toBeInTheDocument();

    const deleteRow = rows[2];
    expect(
      within(deleteRow).getByRole('img', { name: 'Conditional' }),
    ).toBeInTheDocument();
    expect(
      within(deleteRow).getByRole('link', { name: 'qa' }),
    ).toBeInTheDocument();

    // the deny vetoes the allow, so the deny source is shown
    const scaffolderRow = rows[3];
    expect(
      within(scaffolderRow).getByRole('img', { name: 'Deny' }),
    ).toBeInTheDocument();
    expect(
      within(scaffolderRow).getByRole('link', { name: 'qa' }),
    ).toBeInTheDocument();
    expect(
      within(scaffolderRow).queryByRole('link', { name: 'dev' }),
    ).not.toBeInTheDocument();
  });

  it('narrows the table with the search and the result filter', async () => {
    await renderAccessCheck(createRbacApi());
    await selectTom();
    await screen.findByRole('table');

    await userEvent.click(screen.getByRole('button', { name: /access/i }));
    await userEvent.click(await screen.findByRole('option', { name: 'Deny' }));
    expect(screen.getByText('scaffolder.template.read')).toBeInTheDocument();
    expect(screen.queryByText('catalog.entity.read')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /access/i }));
    await userEvent.click(
      await screen.findByRole('option', { name: 'All results' }),
    );
    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Filter permissions' }),
      'catalog',
    );
    expect(screen.getByText('catalog.entity.read')).toBeInTheDocument();
    expect(
      screen.queryByText('scaffolder.template.read'),
    ).not.toBeInTheDocument();

    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Filter permissions' }),
      '-nothing',
    );
    expect(
      await screen.findByText('No permissions match the current filters'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('calls out a super user and a user without roles', async () => {
    await renderAccessCheck(
      createRbacApi({
        checkAccess: jest.fn().mockResolvedValue({
          ...accessCheckResponse,
          isSuperUser: true,
          roles: [],
          decisions: [
            {
              ...accessCheckResponse.decisions[0],
              allowedBy: [],
            },
          ],
        }),
      }),
    );
    await selectTom();

    expect(
      await screen.findByText(
        'This user is configured as a super user: every permission is allowed.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('The user has no roles.')).toBeInTheDocument();
    // a super user's access does not come from a policy, and the table says so
    expect(screen.getByText('Super user')).toBeInTheDocument();
  });

  it('offers no user options when the catalog search fails', async () => {
    await renderAccessCheck(
      createRbacApi({
        searchMembers: jest
          .fn()
          .mockResolvedValue({ status: 403, statusText: 'Forbidden' }),
      }),
    );

    await userEvent.click(screen.getByRole('combobox', { name: 'User' }));
    expect(await screen.findByText('No options')).toBeInTheDocument();
    expect(screen.queryByText('Tom')).not.toBeInTheDocument();
  });

  it('shows an error panel with the backend message when the check fails', async () => {
    // statusText is empty over HTTP/2; the panel surfaces the error body
    const { unmount } = await renderAccessCheck(
      createRbacApi({
        checkAccess: jest.fn().mockResolvedValue({
          status: 403,
          statusText: '',
          json: async () => ({
            error: {
              name: 'NotAllowedError',
              message: 'Unrestricted access required',
            },
          }),
        }),
      }),
    );
    await selectTom();

    expect(
      await screen.findByText(/Something went wrong while checking the access/),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Unrestricted access required'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    unmount();

    // without a JSON body the status text is still shown
    await renderAccessCheck(
      createRbacApi({
        checkAccess: jest
          .fn()
          .mockResolvedValue({ status: 403, statusText: 'Forbidden' }),
      }),
    );
    await selectTom();
    expect(await screen.findByText('Forbidden')).toBeInTheDocument();
  });
});
