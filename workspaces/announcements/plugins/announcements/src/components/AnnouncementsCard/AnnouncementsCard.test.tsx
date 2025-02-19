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
import React from 'react';
import { screen } from '@testing-library/react';
import { AnnouncementsCard } from './AnnouncementsCard';
import {
  mockApis,
  TestApiProvider,
  renderInTestApp,
} from '@backstage/test-utils';
import { announcementsApiRef } from '@backstage-community/plugin-announcements-react';
import { AnnouncementsList } from '@backstage-community/plugin-announcements-common';
import { DateTime } from 'luxon';
import { rootRouteRef } from '../../routes';
import { permissionApiRef } from '@backstage/plugin-permission-react';

const mockAnnouncementsApi = (announcements: AnnouncementsList) => ({
  announcements: jest.fn().mockResolvedValue(announcements),
  lastSeenDate: jest.fn().mockReturnValue(DateTime.now().minus({ days: 1 })),
});

const renderAnnouncementsCard = async (announcements: AnnouncementsList) => {
  await renderInTestApp(
    <TestApiProvider
      apis={[
        [announcementsApiRef, mockAnnouncementsApi(announcements)],
        [permissionApiRef, mockApis.permission()],
      ]}
    >
      <AnnouncementsCard />
    </TestApiProvider>,
    {
      mountedRoutes: {
        '/announcements': rootRouteRef,
      },
    },
  );
};

describe('AnnouncementsCard', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders no announcements message when there are no announcements', async () => {
    await renderAnnouncementsCard({ count: 0, results: [] });
    expect(screen.getByText(/No announcements yet/i)).toBeInTheDocument();
  });

  it('renders announcements when available', async () => {
    const announcementsList: AnnouncementsList = {
      count: 2,
      results: [
        {
          id: '1',
          title: 'Announcement 1',
          excerpt: 'Excerpt 1',
          body: 'Body 1',
          publisher: 'Publisher 1',
          created_at: '2025-01-01',
          active: true,
          start_at: '2025-01-01',
        },
        {
          id: '2',
          title: 'Announcement 2',
          excerpt: 'Excerpt 2',
          body: 'Body 2',
          publisher: 'Publisher 2',
          created_at: '2025-01-02',
          active: true,
          start_at: '2025-01-02',
        },
      ],
    };

    await renderAnnouncementsCard(announcementsList);

    announcementsList.results.forEach(a => {
      expect(screen.getByText(a.title)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(a.excerpt, 'i'))).toBeInTheDocument();
    });
  });
});
