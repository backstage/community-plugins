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

import { render, screen, fireEvent } from '@testing-library/react';
import { TestApiProvider, MockErrorApi } from '@backstage/test-utils';
import { AnyApiRef, errorApiRef } from '@backstage/core-plugin-api';
import { HomePagePullRequestsCard } from './HomePagePullRequestsCard';
import { bitbucketApiRef } from '../../api/BitbucketApi';

// Mock the child component to avoid testing its implementation
jest.mock('./HomePagePullRequestsTable', () => ({
  HomePagePullRequestsTable: jest.fn().mockImplementation(({ userRole }) => (
    <div data-testid="mock-table" data-user-role={userRole}>
      Mock Table with userRole: {userRole}
    </div>
  )),
}));

describe('HomePagePullRequestsCard', () => {
  const mockBitbucketApi = {
    fetchUserPullRequests: jest.fn(),
  };

  const apis: [AnyApiRef, Partial<unknown>][] = [
    [bitbucketApiRef, mockBitbucketApi],
    [errorApiRef, new MockErrorApi()],
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default tab selected', () => {
    render(
      <TestApiProvider apis={apis}>
        <HomePagePullRequestsCard />
      </TestApiProvider>,
    );

    // Check if tabs are present
    expect(screen.getByText('Authored by Me')).toBeInTheDocument();
    expect(screen.getByText('Assigned to Me')).toBeInTheDocument();

    // Check if first tab is selected by default
    const authoredTab = screen.getByRole('tab', { name: 'Authored by Me' });
    expect(authoredTab).toHaveAttribute('aria-selected', 'true');

    // Check if HomePagePullRequestsTable is rendered with the correct userRole for the first tab
    expect(screen.getByTestId('mock-table')).toHaveAttribute(
      'data-user-role',
      'AUTHOR',
    );
  });

  it('should switch to second tab when clicked', () => {
    render(
      <TestApiProvider apis={apis}>
        <HomePagePullRequestsCard />
      </TestApiProvider>,
    );

    // Click on the second tab
    const assignedTab = screen.getByRole('tab', { name: 'Assigned to Me' });
    fireEvent.click(assignedTab);

    // Check if second tab is now selected
    expect(assignedTab).toHaveAttribute('aria-selected', 'true');

    // Check if first tab is now unselected
    const authoredTab = screen.getByRole('tab', { name: 'Authored by Me' });
    expect(authoredTab).toHaveAttribute('aria-selected', 'false');

    // Check if HomePagePullRequestsTable is rendered with the correct userRole for the second tab
    expect(screen.getByTestId('mock-table')).toHaveAttribute(
      'data-user-role',
      'REVIEWER',
    );
  });

  it('should render both tab panels with correct content', () => {
    render(
      <TestApiProvider apis={apis}>
        <HomePagePullRequestsCard />
      </TestApiProvider>,
    );

    // First tab should be visible initially
    expect(
      screen.getByText('Mock Table with userRole: AUTHOR'),
    ).toBeInTheDocument();

    // Verify first tab is visible and second tab is not initially
    const firstTabPanel = screen.getByRole('tabpanel', { hidden: false });
    expect(firstTabPanel).toHaveAttribute('id', 'pr-tabpanel-0');

    // Second tabpanel might not be found with getAllByRole if it's truly hidden from accessibility tree
    // Instead, look for it by ID which is more reliable
    const secondTabPanel = document.getElementById('pr-tabpanel-1');
    expect(secondTabPanel).toHaveAttribute('hidden');

    // Click on the second tab
    fireEvent.click(screen.getByRole('tab', { name: 'Assigned to Me' }));

    // Second tab should now be visible
    expect(
      screen.getByText('Mock Table with userRole: REVIEWER'),
    ).toBeInTheDocument();

    // First tab should now be hidden
    expect(document.getElementById('pr-tabpanel-0')).toHaveAttribute('hidden');
  });
});
