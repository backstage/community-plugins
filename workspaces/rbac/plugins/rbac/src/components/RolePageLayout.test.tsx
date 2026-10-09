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
import { renderInTestApp } from '@backstage/test-utils';

import { screen } from '@testing-library/react';

import { RolePageLayout } from './RolePageLayout';

describe('RolePageLayout', () => {
  it('draws the legacy header, linking back to the roles list', async () => {
    await renderInTestApp(
      <RolePageLayout headerVariant="legacy" title="role:default/admins">
        <div>Role content</div>
      </RolePageLayout>,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'role:default/admins' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'RBAC' })).toBeInTheDocument();
    expect(screen.getByText('Role content')).toBeInTheDocument();
  });

  it('draws only a page header under the app plugin header in the new frontend system', async () => {
    await renderInTestApp(
      <RolePageLayout headerVariant="bui" title="role:default/admins">
        <div>Role content</div>
      </RolePageLayout>,
    );

    expect(
      screen.getByRole('heading', { name: 'role:default/admins' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'RBAC' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Role content')).toBeInTheDocument();
  });
});
