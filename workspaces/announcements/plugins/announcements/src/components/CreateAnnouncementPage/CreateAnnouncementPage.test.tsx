/*
 * Copyright 2025 The Backstage Authors
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

import { announcementsApiRef } from '@backstage-community/plugin-announcements-react';
import { alertApiRef } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { screen } from '@testing-library/react';
import { rootRouteRef } from '../../routes';
import { CreateAnnouncementPage } from './CreateAnnouncementPage';

const mockAnnouncementsApi = {
  announcements: jest.fn().mockResolvedValue({
    count: 0,
    results: [],
  }),
};

const mockAlertApi = {
  post: jest.fn(),
  alert$: jest.fn(),
};

const mockCatalogApi = {
  getEntities: async () => ({ items: [] }),
};

const renderCreateAnnouncementPage = async ({
  defaultInactive,
}: {
  defaultInactive?: boolean;
}) => {
  await renderInTestApp(
    <TestApiProvider
      apis={[
        [announcementsApiRef, mockAnnouncementsApi],
        [alertApiRef, mockAlertApi],
        [catalogApiRef, mockCatalogApi],
      ]}
    >
      <CreateAnnouncementPage
        themeId="home"
        title="Announcements"
        defaultInactive={defaultInactive}
      />
    </TestApiProvider>,
    {
      mountedRoutes: {
        '/announcements': rootRouteRef,
      },
    },
  );
};

describe('CreateAnnouncementPage', () => {
  it('should render "active" switch checked by default', async () => {
    await renderCreateAnnouncementPage({});
    expect(screen.getByRole('checkbox', { name: 'Active' })).toBeChecked();
  });

  it('should render "active" switch unchecked if defaultInactive flag is true', async () => {
    await renderCreateAnnouncementPage({ defaultInactive: true });
    expect(screen.getByRole('checkbox', { name: 'Active' })).not.toBeChecked();
  });
});
