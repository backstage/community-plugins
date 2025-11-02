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
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { announcementsApiRef } from '@backstage-community/plugin-announcements-react';
import { AnnouncementsList } from '@backstage-community/plugin-announcements-common';
import { DateTime } from 'luxon';
import { NewAnnouncementBanner } from './NewAnnouncementBanner';
import { rootRouteRef } from '../../routes';

const mockAnnouncementsApi = (announcements: AnnouncementsList) => ({
  announcements: jest.fn().mockResolvedValue(announcements),
  lastSeenDate: jest.fn().mockReturnValue(DateTime.now().minus({ days: 1 })),
  markLastSeenDate: jest.fn(),
});

const renderNewAnnouncementBanner = async (mockApi: any) => {
  return await renderInTestApp(
    <TestApiProvider apis={[[announcementsApiRef, mockApi]]}>
      <NewAnnouncementBanner />
    </TestApiProvider>,
    {
      mountedRoutes: {
        '/': rootRouteRef,
      },
    },
  );
};

describe('NewAnnouncementBanner', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders announcement banner when there is an unseen announcement', async () => {
    const announcementsList: AnnouncementsList = {
      count: 1,
      results: [
        {
          id: '1',
          title: 'New Announcement',
          excerpt: 'This is a new announcement',
          body: 'Full details of the announcement',
          publisher: 'Publisher 1',
          created_at: DateTime.now().toISO(),
          updated_at: DateTime.now().toISO(),
          active: true,
          start_at: DateTime.now().toISO(),
          until_date: DateTime.now().plus({ days: 7 }).toISO(),
        },
      ],
    };

    await renderNewAnnouncementBanner(mockAnnouncementsApi(announcementsList));

    expect(await screen.findByText('New Announcement')).toBeInTheDocument();
    expect(screen.getByText(/This is a new announcement/i)).toBeInTheDocument();
  });

  it('hides the announcement banner when dismissed', async () => {
    const mockApi = mockAnnouncementsApi({
      count: 1,
      results: [
        {
          id: '1',
          title: 'New Announcement',
          excerpt: 'This is a new announcement',
          body: 'Full details of the announcement',
          publisher: 'Publisher 1',
          created_at: DateTime.now().toISO(),
          updated_at: DateTime.now().toISO(),
          active: true,
          start_at: DateTime.now().toISO(),
          until_date: DateTime.now().plus({ days: 7 }).toISO(),
        },
      ],
    });

    await renderNewAnnouncementBanner(mockApi);

    const dismissButton = await screen.findByTitle(/mark as seen/i);
    fireEvent.click(dismissButton);

    await waitFor(() => {
      expect(screen.queryByText('New Announcement')).not.toBeInTheDocument();
    });

    expect(mockApi.markLastSeenDate).toHaveBeenCalled();
  });

  it('does not render when there are no unseen announcements', async () => {
    const mockApi = mockAnnouncementsApi({
      count: 0,
      results: [],
    });

    await renderNewAnnouncementBanner(mockApi);

    expect(screen.queryByText(/new announcement/i)).not.toBeInTheDocument();
  });
});
