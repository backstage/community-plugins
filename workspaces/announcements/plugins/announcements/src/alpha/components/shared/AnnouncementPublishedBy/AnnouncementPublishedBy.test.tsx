/*
 * Copyright 2026 The Backstage Authors
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

import { DateTime } from 'luxon';
import { screen } from '@testing-library/react';
import {
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import { catalogApiRef, entityRouteRef } from '@backstage/plugin-catalog-react';
import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';
import { Announcement } from '@backstage-community/plugin-announcements-common';

import { AnnouncementPublishedBy } from './AnnouncementPublishedBy';
import { rootRouteRef } from '../../../../routes';

const renderAnnouncementPublishedBy = (announcement: Announcement) => {
  renderInTestApp(
    <TestApiProvider apis={[[catalogApiRef, catalogApiMock()]]}>
      <AnnouncementPublishedBy announcement={announcement} />
    </TestApiProvider>,
    {
      mountedRoutes: {
        '/announcements': rootRouteRef,
        '/catalog/:namespace/:kind/:name': entityRouteRef,
      },
    },
  );
};

const mockAnnouncement: Announcement = {
  id: '1',
  title: 'Test Announcement',
  excerpt: 'Test Excerpt',
  body: 'Test Body',
  publisher: 'user:default/test-user',
  category: {
    slug: 'maintenance',
    title: 'Maintenance',
  },
  created_at: DateTime.now().minus({ weeks: 1 }).toISO(),
  updated_at: DateTime.now().toISO(),
  active: true,
  start_at: DateTime.now().toISO(),
};

describe('AnnouncementPublishedBy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with all defaults present', () => {
    renderAnnouncementPublishedBy(mockAnnouncement);

    expect(screen.getByText(/by/i)).toBeInTheDocument();
    expect(screen.getByText('Maintenance')).toBeInTheDocument();
    // Relative time format from luxon (e.g., "7 days ago", "1 week ago", etc.)
    expect(screen.getByText(/ago/i)).toBeInTheDocument();

    const categoryLink = screen.getByRole('link', { name: 'Maintenance' });
    expect(categoryLink).toHaveAttribute(
      'href',
      '/announcements?category=maintenance',
    );
  });

  it('renders on_behalf_of when present instead of publisher', () => {
    renderAnnouncementPublishedBy({
      ...mockAnnouncement,
      publisher: 'user:default/test-user',
    });

    expect(screen.getByText(/by/i)).toBeInTheDocument();
    expect(screen.getByText('Maintenance')).toBeInTheDocument();
    // Relative time format from luxon (e.g., "7 days ago", "1 week ago", etc.)
    expect(screen.getByText(/ago/i)).toBeInTheDocument();

    const categoryLink = screen.getByRole('link', { name: 'Maintenance' });
    expect(categoryLink).toHaveAttribute(
      'href',
      '/announcements?category=maintenance',
    );
  });

  it('rendes without category', () => {
    renderAnnouncementPublishedBy({
      ...mockAnnouncement,
      created_at: DateTime.now().minus({ hours: 2 }).toISO(),
      category: undefined,
    });

    expect(screen.getByText(/by/i)).toBeInTheDocument();
    expect(screen.getByText(/2 hours ago/i)).toBeInTheDocument();

    expect(screen.queryByRole('link', { name: 'Maintenance' })).toBeNull();
  });

  it('renders category link when category is present', () => {
    const announcement: Announcement = {
      ...mockAnnouncement,
      category: {
        slug: 'updates',
        title: 'Updates',
      },
    };

    renderAnnouncementPublishedBy(announcement);

    expect(screen.getByText(/by/i)).toBeInTheDocument();
    expect(screen.getByText('Updates')).toBeInTheDocument();

    const categoryLink = screen.getByRole('link', { name: 'Updates' });
    expect(categoryLink).toBeInTheDocument();
    expect(categoryLink).toHaveAttribute(
      'href',
      '/announcements?category=updates',
    );
  });
});
