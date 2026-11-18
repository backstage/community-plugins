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

import { RBACAPI, rbacApiRef } from '../../api/RBACBackendClient';
import { PermissionsMatrix } from './PermissionsMatrix';

const createRbacApi = (
  overrides: Partial<RBACAPI> = {},
): jest.Mocked<Partial<RBACAPI>> => ({
  getRoles: jest.fn().mockResolvedValue([
    {
      name: 'role:default/developers',
      memberReferences: [],
      metadata: { source: 'rest' },
    },
    {
      name: 'role:default/admins',
      memberReferences: [],
      metadata: { source: 'csv-file' },
    },
  ]),
  getPolicies: jest.fn().mockResolvedValue([
    {
      entityReference: 'role:default/developers',
      permission: 'catalog.entity.read',
      policy: 'read',
      effect: 'allow',
    },
    {
      entityReference: 'role:default/developers',
      permission: 'scaffolder.template.read',
      policy: 'read',
      effect: 'deny',
    },
  ]),
  listPermissions: jest.fn().mockResolvedValue([
    {
      pluginId: 'catalog',
      policies: [
        {
          name: 'catalog.entity.read',
          policy: 'read',
          resourceType: 'catalog-entity',
        },
      ],
    },
    {
      pluginId: 'scaffolder',
      policies: [
        {
          name: 'scaffolder.template.read',
          policy: 'read',
          resourceType: 'scaffolder-template',
        },
      ],
    },
  ]),
  getRoleConditions: jest.fn().mockResolvedValue([
    {
      id: 1,
      result: AuthorizeResult.CONDITIONAL,
      pluginId: 'catalog',
      resourceType: 'catalog-entity',
      roleEntityRef: 'role:default/admins',
      permissionMapping: ['read'],
      conditions: {
        rule: 'IS_ENTITY_OWNER',
        resourceType: 'catalog-entity',
        params: {},
      },
    },
  ]),
  ...overrides,
});

const renderMatrix = (rbacApi: jest.Mocked<Partial<RBACAPI>>) =>
  renderInTestApp(
    <TestApiProvider apis={[[rbacApiRef, rbacApi]]}>
      <PermissionsMatrix />
    </TestApiProvider>,
  );

describe('PermissionsMatrix', () => {
  it('renders allow, deny and conditional cells, marks non-UI roles as view-only and filters', async () => {
    const rbacApi = createRbacApi();
    await renderMatrix(rbacApi);

    const table = await screen.findByRole('table');
    expect(rbacApi.getRoleConditions).toHaveBeenCalledTimes(1);

    expect(
      within(table).getByRole('columnheader', { name: 'catalog' }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole('columnheader', { name: 'scaffolder' }),
    ).toBeInTheDocument();

    const developersRow = screen
      .getByRole('link', { name: 'role:default/developers' })
      .closest('tr');
    const adminsRow = screen
      .getByRole('link', { name: 'role:default/admins' })
      .closest('tr');
    if (!developersRow || !adminsRow) {
      throw new Error('role rows not rendered');
    }

    expect(
      screen.getByRole('link', { name: 'role:default/developers' }),
    ).toHaveAttribute('href', '/roles/role/default/developers');
    expect(
      within(developersRow)
        .getAllByRole('img')
        .map(img => img.getAttribute('aria-label')),
    ).toEqual(['Allow', 'Deny']);
    expect(
      within(adminsRow)
        .getAllByRole('img')
        .map(img => img.getAttribute('aria-label')),
    ).toEqual(['View-only role: CSV', 'Conditional', 'Not set']);

    expect(screen.getByRole('list', { name: 'Legend' })).toHaveTextContent(
      'AllowDenyConditionalNot set',
    );

    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Filter roles' }),
      'admins',
    );
    expect(
      screen.queryByRole('link', { name: 'role:default/developers' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'role:default/admins' }),
    ).toBeInTheDocument();

    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Filter roles' }),
      '-missing',
    );
    expect(await screen.findByText('No roles found')).toBeInTheDocument();
  });

  it('filters the columns by plugin', async () => {
    await renderMatrix(createRbacApi());
    await screen.findByRole('table');

    await userEvent.click(screen.getByRole('button', { name: /plugin/i }));
    await userEvent.click(
      await screen.findByRole('option', { name: 'catalog' }),
    );

    expect(
      screen.getByRole('columnheader', { name: 'catalog' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('columnheader', { name: 'scaffolder' }),
    ).not.toBeInTheDocument();
  });

  it('narrows the rows to the roles checked in the sidebar', async () => {
    await renderMatrix(createRbacApi());
    await screen.findByRole('table');

    const developers = screen.getByRole('checkbox', {
      name: 'role:default/developers',
    });
    await userEvent.click(developers);
    expect(
      screen.getByRole('link', { name: 'role:default/developers' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'role:default/admins' }),
    ).not.toBeInTheDocument();

    // unchecking every role shows all of them again
    await userEvent.click(developers);
    expect(
      screen.getByRole('link', { name: 'role:default/admins' }),
    ).toBeInTheDocument();
  });

  it('keeps only the rows and columns where the selected policy appears', async () => {
    await renderMatrix(createRbacApi());
    await screen.findByRole('table');

    await userEvent.click(screen.getByRole('button', { name: /policy/i }));
    await userEvent.click(await screen.findByRole('option', { name: 'Deny' }));

    // only developers denies something, and only on the scaffolder permission
    expect(
      screen.getByRole('columnheader', { name: 'scaffolder' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('columnheader', { name: 'catalog' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'role:default/developers' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'role:default/admins' }),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /policy/i }));
    await userEvent.click(
      await screen.findByRole('option', { name: 'Conditional' }),
    );
    expect(
      await screen.findByRole('link', { name: 'role:default/admins' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'role:default/developers' }),
    ).not.toBeInTheDocument();

    // nothing in the catalog plugin is denied
    await userEvent.click(screen.getByRole('button', { name: /policy/i }));
    await userEvent.click(await screen.findByRole('option', { name: 'Deny' }));
    await userEvent.click(screen.getByRole('button', { name: /plugin/i }));
    await userEvent.click(
      await screen.findByRole('option', { name: 'catalog' }),
    );
    expect(
      await screen.findByText('No permissions match the current filters'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('says so when there are no plugin permissions to show', async () => {
    await renderMatrix(
      createRbacApi({ listPermissions: jest.fn().mockResolvedValue([]) }),
    );

    expect(
      await screen.findByText('No plugin permissions found'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows an error panel when a request fails', async () => {
    await renderMatrix(
      createRbacApi({
        getRoleConditions: jest
          .fn()
          .mockResolvedValue({ status: 403, statusText: 'Forbidden' }),
      }),
    );

    expect(
      await screen.findByText(
        /Something went wrong while fetching the role conditions/,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Forbidden')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
