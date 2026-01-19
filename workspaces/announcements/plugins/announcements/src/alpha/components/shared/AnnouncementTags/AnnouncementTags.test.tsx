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

import { screen } from '@testing-library/react';
import { renderInTestApp } from '@backstage/frontend-test-utils';
import { Tag } from '@backstage-community/plugin-announcements-common';

import { AnnouncementTags } from './AnnouncementTags';
import { rootRouteRef } from '../../../../routes';

const renderAnnouncementTags = (tags?: Tag[]) => {
  renderInTestApp(<AnnouncementTags tags={tags} />, {
    mountedRoutes: {
      '/announcements': rootRouteRef,
    },
  });
};

const mockTags: Tag[] = [
  {
    slug: 'best-practices',
    title: 'Best Practices',
  },
  {
    slug: 'maintenance',
    title: 'Maintenance',
  },
];

describe('AnnouncementTags', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders linkable tags when tags are present', () => {
    renderAnnouncementTags(mockTags);

    expect(screen.getByText('Best Practices')).toBeInTheDocument();
    expect(screen.getByText('Maintenance')).toBeInTheDocument();

    const bestPracticesTag = screen.getByRole('row', {
      name: 'Best Practices',
    });
    expect(bestPracticesTag).toHaveAttribute(
      'data-href',
      '/announcements?tags=best-practices',
    );

    const maintenanceTag = screen.getByRole('row', { name: 'Maintenance' });
    expect(maintenanceTag).toHaveAttribute(
      'data-href',
      '/announcements?tags=maintenance',
    );
  });

  it('returns null when tags are undefined', () => {
    renderAnnouncementTags(undefined);

    expect(screen.queryByText('Important')).not.toBeInTheDocument();
    expect(screen.queryByText('Maintenance')).not.toBeInTheDocument();
    expect(screen.queryByRole('row')).not.toBeInTheDocument();
  });

  it('returns null when tags array is empty', () => {
    renderAnnouncementTags([]);

    expect(screen.queryByText('Important')).not.toBeInTheDocument();
    expect(screen.queryByText('Maintenance')).not.toBeInTheDocument();
    expect(screen.queryByRole('row')).not.toBeInTheDocument();
  });
});
