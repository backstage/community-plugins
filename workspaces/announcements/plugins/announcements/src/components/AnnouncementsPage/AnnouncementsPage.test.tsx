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
import {
  TestApiProvider,
  mockApis,
  renderInTestApp,
} from '@backstage/test-utils';
import { AnnouncementsPage } from './AnnouncementsPage';
import { rootRouteRef } from '../../routes';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import { catalogApiRef, entityRouteRef } from '@backstage/plugin-catalog-react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { announcementsApiRef } from '@backstage-community/plugin-announcements-react';
import { DateTime } from 'luxon';
import { AnnouncementsList } from '@backstage-community/plugin-announcements-common';

const mockAnnouncements = [
  {
    id: '0',
    publisher: 'default:user/user',
    title: 'announcement-title',
    excerpt: 'excerpt',
    body: 'body',
    created_at: 'created_at',
  },
];

describe('AnnouncementsPage', () => {
  const mockAnnouncementsApi = {
    announcements: jest.fn().mockResolvedValue({
      count: 0,
      results: mockAnnouncements,
    }),
  };

  const mockCatalogApi = {
    getEntities: async () => ({ items: [] }),
  };

  it('should render', async () => {
    await renderInTestApp(
      <TestApiProvider
        apis={[
          [permissionApiRef, mockApis.permission()],
          [announcementsApiRef, mockAnnouncementsApi],
          [catalogApiRef, mockCatalogApi],
        ]}
      >
        <AnnouncementsPage themeId="home" title="Announcements" />
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/announcements': rootRouteRef,
          '/catalog/:namespace/:kind/:name': entityRouteRef,
        },
      },
    );
    expect(screen.getByText('Announcements')).toBeInTheDocument();
  });

  it('should hide context menu', async () => {
    await renderInTestApp(
      <TestApiProvider
        apis={[
          [permissionApiRef, mockApis.permission()],
          [announcementsApiRef, mockAnnouncementsApi],
          [catalogApiRef, mockCatalogApi],
        ]}
      >
        <AnnouncementsPage
          themeId="home"
          title="Announcements"
          hideContextMenu
        />
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/announcements': rootRouteRef,
          '/catalog/:namespace/:kind/:name': entityRouteRef,
        },
      },
    );

    expect(screen.queryByTestId('announcements-context-menu')).toBeNull();
  });

  describe('AnnouncementCard', () => {
    it('should render announcement card title', async () => {
      await renderInTestApp(
        <TestApiProvider
          apis={[
            [permissionApiRef, mockApis.permission()],
            [announcementsApiRef, mockAnnouncementsApi],
            [catalogApiRef, mockCatalogApi],
          ]}
        >
          <AnnouncementsPage themeId="home" title="Announcements" />
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/announcements': rootRouteRef,
            '/catalog/:namespace/:kind/:name': entityRouteRef,
          },
        },
      );
      expect(screen.getByText('Announcements')).toBeInTheDocument();
      expect(screen.getByText('announcement-title')).toBeInTheDocument();
      expect(screen.getByText('excerpt')).toBeInTheDocument();
    });

    it('should render with overridden announcement card length', async () => {
      await renderInTestApp(
        <TestApiProvider
          apis={[
            [permissionApiRef, mockApis.permission()],
            [announcementsApiRef, mockAnnouncementsApi],
            [catalogApiRef, mockCatalogApi],
          ]}
        >
          <AnnouncementsPage
            themeId="home"
            title="Announcements"
            buttonOptions={{ name: 'customNoun' }}
            cardOptions={{ titleLength: 13 }}
          />
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/announcements': rootRouteRef,
            '/catalog/:namespace/:kind/:name': entityRouteRef,
          },
        },
      );

      expect(screen.getByText('Announcements')).toBeInTheDocument();
      expect(screen.queryByText('announcement-title')).toBeNull();
      expect(screen.getByText('announcement-...')).toBeInTheDocument();
      expect(screen.getByText('New customNoun')).toBeInTheDocument();

      fireEvent.mouseOver(screen.getByText('announcement-...'));
      expect(await screen.findByText('announcement-title')).toBeInTheDocument();
    });

    it('should display "today" when the announcement start date matches current date', async () => {
      const today = DateTime.now().toISODate();
      const todayAnnouncement: AnnouncementsList = {
        count: 1,
        results: [
          {
            id: '1',
            title: 'Today Announcement',
            excerpt: 'This is happening today',
            body: 'This is the full body of the announcement.',
            publisher: 'default:user/user',
            created_at: today,
            active: true,
            start_at: today,
          },
        ],
      };
      const mockAnnouncementsTodayApi = {
        announcements: jest.fn().mockResolvedValue(todayAnnouncement),
      };
      await renderInTestApp(
        <TestApiProvider
          apis={[
            [permissionApiRef, mockApis.permission()],
            [announcementsApiRef, mockAnnouncementsTodayApi],
            [catalogApiRef, mockCatalogApi],
          ]}
        >
          <AnnouncementsPage
            themeId="home"
            title="Announcements"
            buttonOptions={{ name: 'customNoun' }}
            cardOptions={{ titleLength: 13 }}
          />
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/announcements': rootRouteRef,
            '/catalog/:namespace/:kind/:name': entityRouteRef,
          },
        },
      );
      expect(screen.getByText(/Scheduled Today/i)).toBeInTheDocument();
    });

    it('should hide start date when hideStartAt is true', async () => {
      const today = DateTime.now().toISODate();
      const todayAnnouncement: AnnouncementsList = {
        count: 1,
        results: [
          {
            id: '1',
            title: 'Hidden Start Date Announcement',
            excerpt: 'This announcement hides the start date.',
            body: 'This is the full body of the announcement.',
            publisher: 'default:user/user',
            created_at: today,
            active: true,
            start_at: today,
          },
        ],
      };
      const mockAnnouncementsTodayApi = {
        announcements: jest.fn().mockResolvedValue(todayAnnouncement),
      };
      await renderInTestApp(
        <TestApiProvider
          apis={[
            [permissionApiRef, mockApis.permission()],
            [announcementsApiRef, mockAnnouncementsTodayApi],
            [catalogApiRef, mockCatalogApi],
          ]}
        >
          <AnnouncementsPage themeId="home" title="Announcements" hideStartAt />
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/announcements': rootRouteRef,
            '/catalog/:namespace/:kind/:name': entityRouteRef,
          },
        },
      );
      expect(screen.queryByText(/Scheduled Today/i)).toBeNull();
    });

    it('should filter announcements by tag when tag is clicked', async () => {
      const announcementWithTags: AnnouncementsList = {
        count: 1,
        results: [
          {
            id: '2',
            title: 'Tagged Announcement',
            excerpt: 'This has some tags',
            body: 'Full content',
            publisher: 'default:user/user',
            created_at: '2023-01-01T10:00:00.000Z',
            active: true,
            start_at: '2023-01-01T10:00:00.000Z',
            tags: [
              { slug: 'important', title: 'Important' },
              { slug: 'release', title: 'Release' },
            ],
          },
        ],
      };

      const mockTagsApi = {
        announcements: jest.fn().mockResolvedValue(announcementWithTags),
        lastSeenDate: jest.fn().mockReturnValue(DateTime.fromISO('2000-01-01')),
      };

      await renderInTestApp(
        <TestApiProvider
          apis={[
            [permissionApiRef, mockApis.permission()],
            [announcementsApiRef, mockTagsApi],
            [catalogApiRef, mockCatalogApi],
          ]}
        >
          <AnnouncementsPage themeId="home" title="Announcements" />
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/announcements': rootRouteRef,
            '/catalog/:namespace/:kind/:name': entityRouteRef,
          },
        },
      );

      expect(screen.getByText('Important')).toBeInTheDocument();
      expect(screen.getByText('Release')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Important'));

      await waitFor(() => {
        expect(mockTagsApi.announcements).toHaveBeenCalledWith(
          expect.objectContaining({
            tags: ['important'],
          }),
        );
      });
    });

    it('should filter announcements by multiple tags from URL parameters', async () => {
      const filteredAnnouncements: AnnouncementsList = {
        count: 1,
        results: [
          {
            id: '3',
            title: 'Multi-tagged Announcement',
            excerpt: 'This matches multiple tags',
            body: 'Full content',
            publisher: 'default:user/user',
            created_at: '2023-01-01T10:00:00.000Z',
            active: true,
            start_at: '2023-01-01T10:00:00.000Z',
            tags: [
              { slug: 'important', title: 'Important' },
              { slug: 'release', title: 'Release' },
            ],
          },
        ],
      };

      const mockTagsApi = {
        announcements: jest.fn().mockResolvedValue(filteredAnnouncements),
        lastSeenDate: jest.fn().mockReturnValue(DateTime.fromISO('2000-01-01')),
      };

      await renderInTestApp(
        <TestApiProvider
          apis={[
            [permissionApiRef, mockApis.permission()],
            [announcementsApiRef, mockTagsApi],
            [catalogApiRef, mockCatalogApi],
          ]}
        >
          <AnnouncementsPage themeId="home" title="Announcements" />
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/announcements': rootRouteRef,
            '/catalog/:namespace/:kind/:name': entityRouteRef,
          },
          routeEntries: ['/announcements?tags=important,release'],
        },
      );

      expect(mockTagsApi.announcements).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['important', 'release'],
        }),
      );

      expect(screen.getByText('Multi-tagged Announcement')).toBeInTheDocument();
    });
  });
});
