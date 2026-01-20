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

import { AnnouncementCard } from './AnnouncementCard';
import { rootRouteRef } from '../../../routes';

const renderAnnouncementCard = (
  announcement: Announcement,
  hideStartAt?: boolean,
) => {
  renderInTestApp(
    <TestApiProvider apis={[[catalogApiRef, catalogApiMock()]]}>
      <AnnouncementCard announcement={announcement} hideStartAt={hideStartAt} />
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
  tags: [
    {
      slug: 'important',
      title: 'Important',
    },
  ],
};

describe('AnnouncementCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with all elements present', () => {
    renderAnnouncementCard(mockAnnouncement);

    expect(screen.getByText('Test Announcement')).toBeInTheDocument();
    expect(screen.getByText('Test Excerpt')).toBeInTheDocument();
    expect(screen.getByText(/by/i)).toBeInTheDocument();
    expect(screen.getByText('Maintenance')).toBeInTheDocument();
    expect(screen.getByText('Important')).toBeInTheDocument();

    const titleLink = screen.getByRole('link', { name: 'Test Announcement' });
    expect(titleLink).toBeInTheDocument();
  });

  it('renders announcement title as a link', () => {
    renderAnnouncementCard(mockAnnouncement);

    const titleLink = screen.getByRole('link', { name: 'Test Announcement' });
    expect(titleLink).toHaveAttribute('href', '/announcements/view/1');
  });

  it('renders published by information', () => {
    renderAnnouncementCard(mockAnnouncement);

    expect(screen.getByText(/by/i)).toBeInTheDocument();
    // Relative time format from luxon (e.g., "7 days ago", "1 week ago", etc.)
    expect(screen.getByText(/ago/i)).toBeInTheDocument();
  });

  it('renders category link when category is present', () => {
    renderAnnouncementCard(mockAnnouncement);

    const categoryLink = screen.getByRole('link', { name: 'Maintenance' });
    expect(categoryLink).toHaveAttribute(
      'href',
      '/announcements?category=maintenance',
    );
  });

  it('renders without category when category is undefined', () => {
    renderAnnouncementCard({
      ...mockAnnouncement,
      category: undefined,
    });

    expect(screen.getByText(/by/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Maintenance' })).toBeNull();
  });

  it('renders tags when tags are present', () => {
    renderAnnouncementCard(mockAnnouncement);

    expect(screen.getByText('Important')).toBeInTheDocument();
    const importantTag = screen.getByRole('row', { name: 'Important' });
    expect(importantTag).toHaveAttribute(
      'data-href',
      '/announcements?tags=important',
    );
  });

  it('renders without tags when tags are undefined', () => {
    renderAnnouncementCard({
      ...mockAnnouncement,
      tags: undefined,
    });

    expect(screen.queryByText('Important')).not.toBeInTheDocument();
    expect(screen.queryByRole('row')).not.toBeInTheDocument();
  });

  it('renders without tags when tags array is empty', () => {
    renderAnnouncementCard({
      ...mockAnnouncement,
      tags: [],
    });

    expect(screen.queryByText('Important')).not.toBeInTheDocument();
    expect(screen.queryByRole('row')).not.toBeInTheDocument();
  });

  it('renders start time when hideStartAt is false', () => {
    renderAnnouncementCard(mockAnnouncement, false);

    // The start time should be rendered (formatAnnouncementStartTime output)
    // It will contain either "Scheduled" or "Occurred" text
    expect(screen.getByText(/Scheduled|Occurred/i)).toBeInTheDocument();
  });

  it('renders start time when hideStartAt is undefined', () => {
    renderAnnouncementCard(mockAnnouncement);

    // The start time should be rendered when hideStartAt is undefined
    expect(screen.getByText(/Scheduled|Occurred/i)).toBeInTheDocument();
  });

  it('does not render start time when hideStartAt is true', () => {
    renderAnnouncementCard(mockAnnouncement, true);

    expect(screen.queryByText(/Scheduled/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Occurred/i)).not.toBeInTheDocument();
  });

  it('renders with multiple tags', () => {
    renderAnnouncementCard({
      ...mockAnnouncement,
      tags: [
        {
          slug: 'important',
          title: 'Important',
        },
        {
          slug: 'maintenance-tag',
          title: 'Maintenance Tag',
        },
        {
          slug: 'security',
          title: 'Security',
        },
      ],
    });

    expect(screen.getByText('Important')).toBeInTheDocument();
    expect(screen.getByText('Maintenance Tag')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();

    // Verify tags are rendered with correct links
    const importantTag = screen.getByRole('row', { name: 'Important' });
    expect(importantTag).toHaveAttribute(
      'data-href',
      '/announcements?tags=important',
    );

    const maintenanceTag = screen.getByRole('row', { name: 'Maintenance Tag' });
    expect(maintenanceTag).toHaveAttribute(
      'data-href',
      '/announcements?tags=maintenance-tag',
    );

    const securityTag = screen.getByRole('row', { name: 'Security' });
    expect(securityTag).toHaveAttribute(
      'data-href',
      '/announcements?tags=security',
    );
  });
});
