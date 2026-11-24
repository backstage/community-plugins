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
import { MemoryRouter, useSearchParams } from 'react-router-dom';

import { translationApiRef } from '@backstage/core-plugin-api/alpha';
import { mockApis, TestApiProvider } from '@backstage/test-utils';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RbacPageContent } from './RbacPageContent';

jest.mock('./RolesList/RolesList', () => ({
  RolesList: () => <div>roles-list-content</div>,
}));
jest.mock('./PermissionsMatrix/PermissionsMatrix', () => ({
  PermissionsMatrix: () => <div>permissions-matrix-content</div>,
}));
jest.mock('./AccessCheck/AccessCheck', () => ({
  AccessCheck: () => <div>access-check-content</div>,
}));

const SearchParamsProbe = () => {
  const [searchParams] = useSearchParams();
  return <output>{`params:${searchParams.toString()}`}</output>;
};

const renderContent = (initialEntry: string) =>
  render(
    <TestApiProvider apis={[[translationApiRef, mockApis.translation()]]}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <RbacPageContent />
        <SearchParamsProbe />
      </MemoryRouter>
    </TestApiProvider>,
  );

describe('RbacPageContent', () => {
  it('switches between tabs and keeps the selected view in the URL', async () => {
    renderContent('/rbac');

    expect(screen.getByText('roles-list-content')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('tab', { name: 'Permissions by plugin' }),
    );
    expect(
      await screen.findByText('permissions-matrix-content'),
    ).toBeInTheDocument();
    expect(screen.getByText('params:view=permissions')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Access check' }));
    expect(await screen.findByText('access-check-content')).toBeInTheDocument();
    expect(screen.getByText('params:view=access-check')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Roles' }));
    expect(await screen.findByText('roles-list-content')).toBeInTheDocument();
    expect(screen.getByText('params:')).toBeInTheDocument();
  });

  it('opens on the permissions matrix when the URL asks for it', () => {
    renderContent('/rbac?view=permissions');

    expect(screen.getByText('permissions-matrix-content')).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Permissions by plugin' }),
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('opens on the access checker when the URL asks for it', () => {
    renderContent('/rbac?view=access-check');

    expect(screen.getByText('access-check-content')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Access check' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});
