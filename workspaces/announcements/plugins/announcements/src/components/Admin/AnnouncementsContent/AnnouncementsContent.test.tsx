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
import { AnnouncementsContent } from './AnnouncementsContent';
import {
  mockApis,
  TestApiProvider,
  renderInTestApp,
} from '@backstage/test-utils';
import { announcementsApiRef } from '@backstage-community/plugin-announcements-react';
import { AnnouncementsList } from '@backstage-community/plugin-announcements-common';
import { DateTime } from 'luxon';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import { userEvent } from '@testing-library/user-event';
import { catalogApiRef } from '@backstage/plugin-catalog-react';

const mockAnnouncementsApi = (announcements: AnnouncementsList) => ({
  announcements: jest.fn().mockResolvedValue(announcements),
});

type RenderAnnouncementsContentProps = {
  announcements: AnnouncementsList;
  defaultInactive?: boolean;
};

const mockCatalogApi = {
  getEntities: async () => ({ items: [] }),
};

const renderAnnouncementsContent = async ({
  announcements,
  defaultInactive,
}: RenderAnnouncementsContentProps) => {
  await renderInTestApp(
    <TestApiProvider
      apis={[
        [announcementsApiRef, mockAnnouncementsApi(announcements)],
        [permissionApiRef, mockApis.permission()],
        [catalogApiRef, mockCatalogApi],
      ]}
    >
      <AnnouncementsContent defaultInactive={defaultInactive} />
    </TestApiProvider>,
  );
};

describe('AnnouncementsContent', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders no announcements text', async () => {
    await renderAnnouncementsContent({
      announcements: { count: 0, results: [] },
    });
    expect(screen.getByText(/No announcements found/i)).toBeInTheDocument();
  });

  it('renders "Create Announcement" button', async () => {
    await renderAnnouncementsContent({
      announcements: { count: 0, results: [] },
    });
    expect(screen.getByText(/Create Announcement/i)).toBeInTheDocument();
  });

  it('renders announcement list in the table', async () => {
    const announcementsList: AnnouncementsList = {
      count: 2,
      results: [
        {
          id: '1',
          title: 'Test Announcement 1',
          excerpt: 'Test Excerpt 1',
          body: 'Test Body 1',
          publisher: 'Test Publisher 1',
          created_at: DateTime.now().toISO(),
          updated_at: DateTime.now().toISO(),
          active: true,
          start_at: DateTime.now().toISO(),
          until_date: DateTime.now().plus({ days: 7 }).toISO(),
        },
        {
          id: '2',
          title: 'Test Announcement 2',
          excerpt: 'Test Excerpt 2',
          body: 'Test Body 2',
          publisher: 'Test Publisher 2',
          created_at: DateTime.now().toISO(),
          updated_at: DateTime.now().toISO(),
          active: false,
          start_at: DateTime.now().toISO(),
          until_date: DateTime.now().plus({ days: 7 }).toISO(),
        },
      ],
    };

    await renderAnnouncementsContent({ announcements: announcementsList });

    announcementsList.results.forEach(a => {
      expect(screen.getByText(a.title)).toBeInTheDocument();
      expect(
        screen.getByText(new RegExp(a.publisher, 'i')),
      ).toBeInTheDocument();
    });
  });

  it('renders AnnouncementForm with "active" switch checked by default', async () => {
    await renderAnnouncementsContent({
      announcements: { count: 0, results: [] },
    });
    await userEvent.click(screen.getByText(/Create Announcement/i));
    expect(screen.getByRole('checkbox', { name: 'Active' })).toBeChecked();
  });

  it('renders AnnouncementForm with "active" switch unchecked if defaultInactive flag is true', async () => {
    await renderAnnouncementsContent({
      announcements: { count: 0, results: [] },
      defaultInactive: true,
    });
    await userEvent.click(screen.getByText(/Create Announcement/i));
    expect(screen.getByRole('checkbox', { name: 'Active' })).not.toBeChecked();
  });
});
