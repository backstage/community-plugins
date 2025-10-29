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
import { AnnouncementPage } from './AnnouncementPage';
import { rootRouteRef } from '../../routes';
import {
  AnnouncementsApi,
  announcementsApiRef,
} from '@backstage-community/plugin-announcements-react';
import { entityRouteRef } from '@backstage/plugin-catalog-react';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { Route } from 'react-router-dom';
import { FlatRoutes } from '@backstage/core-app-api';
import { DateTime } from 'luxon';

const announcementsApiMock: jest.Mocked<
  Pick<
    AnnouncementsApi,
    'announcementByID' | 'lastSeenDate' | 'markLastSeenDate'
  >
> = {
  announcementByID: jest.fn(),
  lastSeenDate: jest.fn(),
  markLastSeenDate: jest.fn(),
};

const renderAnnouncementPage = () => {
  return renderInTestApp(
    <TestApiProvider apis={[[announcementsApiRef, announcementsApiMock]]}>
      <FlatRoutes>
        <Route
          path="/announcements/view/:id"
          element={<AnnouncementPage themeId="home" title="Announcements" />}
        />
      </FlatRoutes>
    </TestApiProvider>,
    {
      mountedRoutes: {
        '/announcements': rootRouteRef,
        '/catalog/:namespace/:kind/:name': entityRouteRef,
      },
      routeEntries: ['/announcements/view/1'],
    },
  );
};

describe('AnnouncementPage', () => {
  const announcement = {
    id: '1',
    publisher: 'default:user/user',
    title: 'Announcement title',
    excerpt: 'Announcement excerpt',
    body: 'Announcement body',
    created_at: '2025-01-10T00:00:00.000Z',
    active: true,
    start_at: '2025-01-10T00:00:00.000Z',
    until_date: '2025-02-10T00:00:00.000Z',
    updated_at: '2025-01-10T00:00:00.000Z',
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render announcement', async () => {
    announcementsApiMock.announcementByID.mockResolvedValue(announcement);

    const { getByText } = await renderAnnouncementPage();

    expect(announcementsApiMock.announcementByID).toHaveBeenCalledWith('1');
    expect(getByText('Announcement title')).toBeInTheDocument();
  });

  it('should update the last seen date if the announcement is newer than previously displayed announcements', async () => {
    const lastSeenDate = DateTime.fromISO(announcement.created_at).minus({
      days: 1,
    });
    announcementsApiMock.lastSeenDate.mockReturnValue(lastSeenDate);
    announcementsApiMock.announcementByID.mockResolvedValue(announcement);

    await renderAnnouncementPage();

    expect(announcementsApiMock.markLastSeenDate).toHaveBeenCalledWith(
      DateTime.fromISO(announcement.created_at),
    );
  });

  it('should not update the last seen date if the announcement is not newer than previously displayed announcements', async () => {
    const lastSeenDate = DateTime.fromISO(announcement.created_at).plus({
      days: 1,
    });
    announcementsApiMock.lastSeenDate.mockReturnValue(lastSeenDate);
    announcementsApiMock.announcementByID.mockResolvedValue(announcement);

    await renderAnnouncementPage();

    expect(announcementsApiMock.markLastSeenDate).not.toHaveBeenCalled();
  });

  it('should render error', async () => {
    announcementsApiMock.announcementByID.mockRejectedValue(
      new Error('Announcement not found'),
    );

    const { getByText } = await renderAnnouncementPage();

    expect(getByText('Announcement not found')).toBeInTheDocument();
  });
});
