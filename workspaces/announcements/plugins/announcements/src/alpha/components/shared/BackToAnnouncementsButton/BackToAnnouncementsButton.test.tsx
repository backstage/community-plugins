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
import {
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';

import { BackToAnnouncementsButton } from './BackToAnnouncementsButton';
import { rootRouteRef } from '../../../../routes';

const renderBackToAnnouncementsButton = (routeEntry?: string) => {
  renderInTestApp(
    <TestApiProvider apis={[]}>
      <BackToAnnouncementsButton />
    </TestApiProvider>,
    {
      mountedRoutes: {
        '/announcements': rootRouteRef,
      },
      initialRouteEntries: routeEntry
        ? [routeEntry]
        : ['/announcements/view/1'],
    },
  );
};

describe('BackToAnnouncementsButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders back to announcements link when not from admin', () => {
    renderBackToAnnouncementsButton('/announcements/view/1');

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/announcements');
    expect(screen.getByText('Back to announcements')).toBeInTheDocument();
  });

  it('renders back to admin link when from=admin query parameter is present', () => {
    renderBackToAnnouncementsButton('/announcements/view/1?from=admin');

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();

    expect(link).toHaveAttribute('href', '/announcements/admin');
    expect(screen.getByText('Back to admin')).toBeInTheDocument();
  });

  it('renders back to announcements link when from query parameter has different value', () => {
    renderBackToAnnouncementsButton('/announcements/view/1?from=other');

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/announcements');
    expect(screen.getByText('Back to announcements')).toBeInTheDocument();
  });

  it('handles multiple query parameters correctly', () => {
    renderBackToAnnouncementsButton(
      '/announcements/view/1?from=admin&other=value',
    );

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/announcements/admin');
    expect(screen.getByText('Back to admin')).toBeInTheDocument();
  });
});
