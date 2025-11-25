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
import { fireEvent, screen, waitFor } from '@testing-library/react';
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
import { analyticsApiRef } from '@backstage/core-plugin-api';

const mockAnnouncementsApi = (announcements: AnnouncementsList) => ({
  announcements: jest.fn().mockResolvedValue(announcements),
  lastSeenDate: jest.fn().mockReturnValue(DateTime.now().minus({ days: 1 })),
});

type AnalyticsMock = ReturnType<typeof mockApis.analytics.mock>;

const renderAnnouncementsCard = async (
  announcements: AnnouncementsList,
  analyticsApi?: AnalyticsMock,
) => {
  const analytics = analyticsApi ?? mockApis.analytics.mock();

  await renderInTestApp(
    <TestApiProvider
      apis={[
        [announcementsApiRef, mockAnnouncementsApi(announcements)],
        [permissionApiRef, mockApis.permission()],
        [analyticsApiRef, analytics],
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

  return analytics;
};

const renderAnnouncementsCardWithProps = async (
  announcements: AnnouncementsList,
  props: any = {},
  analyticsApi?: AnalyticsMock,
) => {
  const analytics = analyticsApi ?? mockApis.analytics.mock();

  await renderInTestApp(
    <TestApiProvider
      apis={[
        [announcementsApiRef, mockAnnouncementsApi(announcements)],
        [permissionApiRef, mockApis.permission()],
        [analyticsApiRef, analytics],
      ]}
    >
      <AnnouncementsCard {...props} />
    </TestApiProvider>,
    {
      mountedRoutes: {
        '/announcements': rootRouteRef,
      },
    },
  );

  return analytics;
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
          until_date: '2025-02-01',
          updated_at: '2025-01-01',
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
          until_date: '2025-02-02',
          updated_at: '2025-01-01',
        },
      ],
    };

    await renderAnnouncementsCard(announcementsList);

    announcementsList.results.forEach(a => {
      expect(screen.getByText(a.title)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(a.excerpt, 'i'))).toBeInTheDocument();
    });
  });

  it('captures analytics click event for announcements', async () => {
    const clickableAnnouncements: AnnouncementsList = {
      count: 1,
      results: [
        {
          id: '1',
          title: 'Clickable Announcement',
          excerpt: 'Excerpt',
          body: 'Body',
          publisher: 'Publisher',
          created_at: '2025-01-01',
          active: true,
          start_at: '2025-01-01',
          until_date: '2025-02-01',
          updated_at: '2025-01-01',
        },
      ],
    };

    const analyticsApi = mockApis.analytics.mock();

    await renderAnnouncementsCard(clickableAnnouncements, analyticsApi);

    fireEvent.click(screen.getByText('Clickable Announcement'));

    await waitFor(() => {
      expect(analyticsApi.captureEvent).toHaveBeenCalled();
    });

    const events = analyticsApi.captureEvent.mock.calls.map(([event]) => event);

    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: 'click',
          subject: 'Clickable Announcement',
          attributes: expect.objectContaining({
            announcementId: '1',
            location: 'AnnouncementsCard',
          }),
        }),
        expect.objectContaining({
          action: 'click',
          subject: 'Clickable Announcement',
          attributes: expect.objectContaining({
            to: '/announcements/view/1',
          }),
        }),
      ]),
    );
  });

  it('should display "today" when the announcement start date matches current date', async () => {
    const today = DateTime.now().toISODate();
    const announcementsList: AnnouncementsList = {
      count: 1,
      results: [
        {
          id: '1',
          title: 'Today Announcement',
          excerpt: 'This is happening today',
          body: 'Body 1',
          publisher: 'Body1',
          created_at: today,
          active: true,
          start_at: today,
          until_date: DateTime.now().plus({ days: 7 }).toISODate(),
          updated_at: today,
        },
      ],
    };

    await renderAnnouncementsCard(announcementsList);
    expect(screen.getByText(/Scheduled Today/i)).toBeInTheDocument();
  });

  it('does not display start time when hideStartAt is true', async () => {
    const announcementsList: AnnouncementsList = {
      count: 1,
      results: [
        {
          id: '1',
          title: 'Hidden Start Time Announcement',
          excerpt: 'This announcement hides start time',
          body: 'Body 1',
          publisher: 'Publisher 1',
          created_at: '2025-01-01',
          active: true,
          start_at: '2025-01-01',
          until_date: '2025-02-01',
          updated_at: '2025-01-01',
        },
      ],
    };

    await renderAnnouncementsCardWithProps(announcementsList, {
      hideStartAt: true,
    });

    expect(screen.queryByText(/Scheduled/i)).not.toBeInTheDocument();
  });
});
