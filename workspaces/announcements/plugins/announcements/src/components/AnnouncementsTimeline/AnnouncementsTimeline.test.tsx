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
import { screen } from '@testing-library/react';
import {
  AnnouncementsTimeline,
  AnnouncementsTimelineProps,
} from './AnnouncementsTimeline';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { rootRouteRef } from '../../routes';
import { AnnouncementsList } from '@backstage-community/plugin-announcements-common';
import {
  AnnouncementsApi,
  announcementsApiRef,
} from '@backstage-community/plugin-announcements-react';

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
          updated_at: '2022-01-01',
          active: true,
          start_at: '2025-01-01',
          until_date: '2025-02-01',
        },
        {
          id: '2',
          title: 'Announcement 2',
          excerpt: 'Excerpt 2',
          body: 'Body 2',
          publisher: 'Publisher 2',
          created_at: '2022-01-02',
          updated_at: '2022-01-02',
          active: true,
          start_at: '2022-01-02',
          until_date: '2022-02-02',
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
