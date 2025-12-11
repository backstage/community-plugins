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
import { screen } from '@testing-library/react';
import { renderInTestApp } from '@backstage/test-utils';
import { AnnouncementsAdminPage } from './AnnouncementsAdminPage';
import { rootRouteRef } from '../../../routes';

describe('AnnouncementsAdminPage', () => {
  it('should render with default title', async () => {
    await renderInTestApp(<AnnouncementsAdminPage />, {
      mountedRoutes: {
        '/announcements': rootRouteRef,
      },
    });

    expect(screen.getByText('Admin Portal')).toBeInTheDocument();
  });

  it('should render with custom title', async () => {
    await renderInTestApp(
      <AnnouncementsAdminPage title="Custom Admin Title" />,
      {
        mountedRoutes: {
          '/announcements': rootRouteRef,
        },
      },
    );

    expect(screen.getByText('Custom Admin Title')).toBeInTheDocument();
    expect(screen.queryByText('Admin Portal')).not.toBeInTheDocument();
  });

  it('should render breadcrumbs', async () => {
    await renderInTestApp(<AnnouncementsAdminPage />, {
      mountedRoutes: {
        '/announcements': rootRouteRef,
      },
    });

    // Check for breadcrumb link with href="/announcements"
    const breadcrumbLink = screen.getByRole('link', {
      name: 'Announcements',
    });
    expect(breadcrumbLink).toBeInTheDocument();
    expect(breadcrumbLink).toHaveAttribute('href', '/announcements');
  });

  it('should render all tabs', async () => {
    await renderInTestApp(<AnnouncementsAdminPage />, {
      mountedRoutes: {
        '/announcements': rootRouteRef,
      },
    });

    // Check for all tab labels - use getAllByText since "Announcements" appears in both breadcrumb and tab
    const announcementsTabs = screen.getAllByText('Announcements');
    expect(announcementsTabs.length).toBeGreaterThan(0);
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Tags')).toBeInTheDocument();
  });

  it('should render Container with Outlet', async () => {
    await renderInTestApp(<AnnouncementsAdminPage />, {
      mountedRoutes: {
        '/announcements': rootRouteRef,
      },
    });

    expect(
      screen.getByTestId('announcements-admin-page-container-outlet'),
    ).toBeInTheDocument();
    expect(screen.getByText('Admin Portal')).toBeInTheDocument();
  });
});
