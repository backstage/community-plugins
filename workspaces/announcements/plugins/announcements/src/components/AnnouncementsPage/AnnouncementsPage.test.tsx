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
import { fireEvent } from '@testing-library/react';
import { announcementsApiRef } from '@backstage-community/plugin-announcements-react';

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
    const rendered = await renderInTestApp(
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
    expect(rendered.getByText('Announcements')).toBeInTheDocument();
  });

  describe('AnnouncementCard', () => {
    it('should render announcement card title', async () => {
      const rendered = await renderInTestApp(
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
      expect(rendered.getByText('Announcements')).toBeInTheDocument();
      expect(rendered.getByText('announcement-title')).toBeInTheDocument();
      expect(rendered.getByText('excerpt')).toBeInTheDocument();
    });

    it('should render with overridden announcement card length', async () => {
      const rendered = await renderInTestApp(
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

      expect(rendered.getByText('Announcements')).toBeInTheDocument();
      expect(rendered.queryByText('announcement-title')).toBeNull();
      expect(rendered.getByText('announcement-...')).toBeInTheDocument();
      expect(rendered.getByText('New customNoun')).toBeInTheDocument();

      fireEvent.mouseOver(rendered.getByText('announcement-...'));
      expect(
        await rendered.findByText('announcement-title'),
      ).toBeInTheDocument();
    });
  });
});
