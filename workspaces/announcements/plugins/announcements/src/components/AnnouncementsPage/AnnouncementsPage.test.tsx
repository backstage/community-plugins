import React from 'react';
import {
  MockPermissionApi,
  TestApiProvider,
  renderInTestApp,
} from '@backstage/test-utils';
import { AnnouncementsPage } from './AnnouncementsPage';
import { rootRouteRef } from '../../routes';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import { catalogApiRef, entityRouteRef } from '@backstage/plugin-catalog-react';
import { fireEvent, screen } from '@testing-library/react';
import { announcementsApiRef } from '@backstage/community-plugins/backstage-plugin-announcements-react';

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
  const mockPermissionApi = new MockPermissionApi();
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
          [permissionApiRef, mockPermissionApi],
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
          [permissionApiRef, mockPermissionApi],
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
            [permissionApiRef, mockPermissionApi],
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
            [permissionApiRef, mockPermissionApi],
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
  });
});
