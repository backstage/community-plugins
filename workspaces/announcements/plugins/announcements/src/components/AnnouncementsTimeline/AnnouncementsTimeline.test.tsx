import { screen } from '@testing-library/react';
import {
  AnnouncementsTimeline,
  AnnouncementsTimelineProps,
} from './AnnouncementsTimeline';
import React from 'react';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { rootRouteRef } from '../../routes';
import { AnnouncementsList } from '@procore-oss/backstage-plugin-announcements-common';
import {
  AnnouncementsApi,
  announcementsApiRef,
} from '@procore-oss/backstage-plugin-announcements-react';

const renderMockTimelineComponent = async ({
  announcements,
  options,
}: {
  announcements: AnnouncementsList;
  options?: AnnouncementsTimelineProps;
}) => {
  const mockedAnnouncementsApi: Partial<AnnouncementsApi> = {
    announcements: jest.fn().mockImplementation(() => {
      return Promise.resolve(announcements);
    }),
  };

  await renderInTestApp(
    <TestApiProvider apis={[[announcementsApiRef, mockedAnnouncementsApi]]}>
      <AnnouncementsTimeline {...options} />
    </TestApiProvider>,
    {
      mountedRoutes: {
        '/view': rootRouteRef,
      },
    },
  );
};

describe('AnnouncementsTimeline', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders no announcements message when there are no announcements', async () => {
    await renderMockTimelineComponent({
      announcements: { count: 0, results: [] },
    });

    expect(screen.getByText('No announcements')).toBeInTheDocument();
  });

  it('renders announcements timeline with correct number of announcements', async () => {
    const announcementsList: AnnouncementsList = {
      count: 2,
      results: [
        {
          id: '1',
          title: 'Announcement 1',
          excerpt: 'Excerpt 1',
          body: 'Body 1',
          publisher: 'Publisher 1',
          created_at: '2022-01-01',
        },
        {
          id: '2',
          title: 'Announcement 2',
          excerpt: 'Excerpt 2',
          body: 'Body 2',
          publisher: 'Publisher 2',
          created_at: '2022-01-02',
        },
      ],
    };

    await renderMockTimelineComponent({ announcements: announcementsList });

    announcementsList.results.forEach(a => {
      expect(screen.getByText(a.title)).toBeInTheDocument();
      expect(screen.getByText(a.excerpt)).toBeInTheDocument();
    });
  });
});
