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
import { render, screen } from '@testing-library/react';
import { useActivityStream } from '../../hooks';
import { JiraUpdatesContent } from './JiraUpdatesContent';

jest.mock('../../hooks/useActivityStream');

describe('LatestUpdatesCard', () => {
  const mockUseActivityStream = useActivityStream as jest.Mock;

  it('renders loading state when activities are loading', () => {
    mockUseActivityStream.mockReturnValue({
      activities: [],
      activitiesLoading: true,
      activitiesError: null,
    });

    render(
      <JiraUpdatesContent
        projectKey="ABC"
        issues={['issue1']}
        loading={false}
      />,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders loading state when loading is true', () => {
    mockUseActivityStream.mockReturnValue({
      activities: [],
      activitiesLoading: false,
      activitiesError: null,
    });

    render(<JiraUpdatesContent projectKey="ABC" issues={['issue1']} loading />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error message when there is an error loading activities', () => {
    const error = new Error('Failed to fetch activities');
    mockUseActivityStream.mockReturnValue({
      activities: [],
      activitiesLoading: false,
      activitiesError: error,
    });

    render(
      <JiraUpdatesContent
        projectKey="ABC"
        issues={['issue1']}
        loading={false}
      />,
    );

    expect(
      screen.getByText(`Error loading activities: ${error.message}`),
    ).toBeInTheDocument();
  });

  it('renders "No activities found" when there are no activities', () => {
    mockUseActivityStream.mockReturnValue({
      activities: [],
      activitiesLoading: false,
      activitiesError: null,
    });

    render(
      <JiraUpdatesContent
        projectKey="ABC"
        issues={['issue1']}
        loading={false}
      />,
    );

    expect(screen.getByText('No activities found.')).toBeInTheDocument();
  });

  it('renders a list of activities when data is available', () => {
    const mockActivities = [
      {
        time: { value: '2024-09-16' },
        title: 'Activity 1',
      },
      {
        time: { value: '2024-09-15' },
        title: 'Activity 2',
      },
    ];

    mockUseActivityStream.mockReturnValue({
      activities: mockActivities,
      activitiesLoading: false,
      activitiesError: null,
    });

    render(
      <JiraUpdatesContent
        projectKey="ABC"
        issues={['issue1']}
        loading={false}
      />,
    );

    mockActivities.forEach(activity => {
      expect(screen.getByText(activity.time.value)).toBeInTheDocument();
      expect(screen.getByText(activity.title)).toBeInTheDocument();
    });
  });

  it('renders formatted title with bold and blue second link in activity title', () => {
    const mockActivities = [
      {
        time: { value: '2024-09-16' },
        title:
          'Check out <a href="http://example.com">this link</a> and also <a href="http://second.com">this second link</a>',
      },
    ];

    mockUseActivityStream.mockReturnValue({
      activities: mockActivities,
      activitiesLoading: false,
      activitiesError: null,
    });

    render(
      <JiraUpdatesContent
        projectKey="ABC"
        issues={['issue1']}
        loading={false}
      />,
    );

    expect(screen.getByText('this link')).not.toHaveAttribute('href');
    expect(screen.getByText('this link')).not.toHaveStyle('font-weight: bold');

    const secondLink = screen.getByText('this second link').closest('a');
    expect(secondLink).toHaveAttribute('href', 'http://second.com');
    expect(secondLink).toHaveStyle('font-weight: bold');
  });
});
