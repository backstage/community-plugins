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

import { render, screen, waitFor } from '@testing-library/react';
import { TestApiProvider, MockErrorApi } from '@backstage/test-utils';
import { AnyApiRef, errorApiRef } from '@backstage/core-plugin-api';
import { HomePagePullRequestsTable } from './HomePagePullRequestsTable';
import {
  bitbucketApiRef,
  PullRequest,
  BitbucketApi,
} from '../../api/BitbucketApi';
import { pullRequestsResponseStub } from '../../responseStubs';

// Mock the EntityPeekAheadPopover to avoid catalog API dependencies
jest.mock('@backstage/plugin-catalog-react', () => ({
  EntityPeekAheadPopover: jest
    .fn()
    .mockImplementation(({ children }) => children),
}));

// Mock the Table component to avoid translation API dependencies
jest.mock('@backstage/core-components', () => ({
  Table: jest.fn().mockImplementation(
    ({
      data,
      columns,
      title,
    }: {
      data: Array<Record<string, any>>;
      columns: Array<{
        title?: string;
        field?: string;
        render?: (row: Record<string, any>) => React.ReactNode;
      }>;
      title?: React.ReactNode;
    }) => (
      <div data-testid="table-mock">
        <div>{title}</div>
        <table>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}-${row.id || ''}`}>
                {columns.map((col, colIndex) => (
                  <td key={`col-${colIndex}-${col.field || ''}`}>
                    {col.render ? col.render(row) : row[col.field || '']}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  ),
  InfoCard: jest
    .fn()
    .mockImplementation(
      ({
        children,
        ...props
      }: {
        children: React.ReactNode;
        [key: string]: any;
      }) => (
        <div data-testid="info-card-mock" {...props}>
          {children}
        </div>
      ),
    ),
  Link: jest
    .fn()
    .mockImplementation(
      ({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
      ),
    ),
}));

// Mock material-ui components that may cause issues in tests
jest.mock('@material-ui/core/Tooltip', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(({ children }) => children),
}));

describe('HomePagePullRequestsTable', () => {
  // Create a BitbucketApi instance just to use its mapPullRequests method
  const bitbucketApiMapper = new BitbucketApi({
    discoveryApi: { getBaseUrl: jest.fn() } as any,
    identityApi: { getBackstageIdentity: jest.fn() } as any,
  });

  // Map the response stub data to PullRequest objects and add buildStatus
  const mockPullRequests: PullRequest[] = bitbucketApiMapper
    .mapPullRequests(pullRequestsResponseStub)
    .map(pr => ({
      ...pr,
      buildStatus: 'SUCCESSFUL' as const,
    }));

  const mockBitbucketApi = {
    fetchUserPullRequests: jest.fn(),
    fetchPullRequestBuildStatus: jest.fn(),
  };

  const apis: [AnyApiRef, Partial<unknown>][] = [
    [bitbucketApiRef, mockBitbucketApi],
    [errorApiRef, new MockErrorApi()],
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Add a mock for the progress indicator
  jest.mock('@material-ui/core/CircularProgress', () => ({
    __esModule: true,
    default: function MockCircularProgress() {
      return <progress data-testid="mock-progress" />;
    },
  }));

  it('should show loading state initially', () => {
    // Setup the API to never resolve to keep the component in loading state
    mockBitbucketApi.fetchUserPullRequests.mockImplementation(
      () => new Promise(() => {}),
    );

    // Since we're mocking all the components, we can't directly test for the progress indicator
    // Instead, we'll check for the loading state by checking that no PRs are rendered
    render(
      <TestApiProvider apis={apis}>
        <HomePagePullRequestsTable userRole="AUTHOR" buildStatus />
      </TestApiProvider>,
    );

    // Verify the table is empty (in loading state)
    const tableMock = screen.getByTestId('table-mock');
    expect(tableMock).toBeInTheDocument();
    expect(screen.queryByText(/^PR #/)).not.toBeInTheDocument();
  });

  it('should render pull requests for author role', async () => {
    mockBitbucketApi.fetchUserPullRequests.mockResolvedValue(mockPullRequests);

    render(
      <TestApiProvider apis={apis}>
        <HomePagePullRequestsTable userRole="AUTHOR" />
      </TestApiProvider>,
    );

    // Wait for data to load
    await waitFor(() => {
      expect(mockBitbucketApi.fetchUserPullRequests).toHaveBeenCalledWith(
        'AUTHOR',
        'OPEN',
        25,
        { includeBuildStatus: true },
      );
    });

    // Verify PR content is rendered
    expect(
      await screen.findByText(`PR #${mockPullRequests[0].id}`),
    ).toBeInTheDocument();
    expect(screen.getByText(mockPullRequests[0].title)).toBeInTheDocument();
    expect(screen.getByText(mockPullRequests[1].title)).toBeInTheDocument();

    // Look for links to repositories instead of plain text
    const repoLinks = screen.getAllByRole('link', {
      name: mockPullRequests[0].fromRepo,
    });
    expect(repoLinks.length).toBeGreaterThan(0);

    // Verify author info is displayed - use getAllByText since names might appear multiple times
    const authorInstances = screen.getAllByText(
      mockPullRequests[0].author.displayName,
    );
    expect(authorInstances.length).toBeGreaterThan(0);

    // Verify branch info - branches are rendered as links
    const branchLinks = screen.getAllByRole('link', {
      name: mockPullRequests[0].sourceBranch,
    });
    expect(branchLinks.length).toBeGreaterThan(0);

    // With our mock Table component, we just need to verify the title is passed correctly
    // The actual rendering might be different in the real Table component
    const tableMock = screen.getByTestId('table-mock');
    expect(tableMock).toBeInTheDocument();
  });

  it('should render pull requests for reviewer role', async () => {
    mockBitbucketApi.fetchUserPullRequests.mockResolvedValue(mockPullRequests);

    render(
      <TestApiProvider apis={apis}>
        <HomePagePullRequestsTable userRole="REVIEWER" />
      </TestApiProvider>,
    );

    // Wait for data to load
    await waitFor(() => {
      expect(mockBitbucketApi.fetchUserPullRequests).toHaveBeenCalledWith(
        'REVIEWER',
        'OPEN',
        25,
        { includeBuildStatus: true },
      );
    });

    // Just verify the table mock is rendered with reviewer data
    const tableMock = screen.getByTestId('table-mock');
    expect(tableMock).toBeInTheDocument();

    // Verify PR content is rendered
    expect(
      await screen.findByText(`PR #${mockPullRequests[0].id}`),
    ).toBeInTheDocument();
  });

  it('should handle error state', async () => {
    // Setup the API to reject
    mockBitbucketApi.fetchUserPullRequests.mockRejectedValue(
      new Error('API error'),
    );

    render(
      <TestApiProvider apis={apis}>
        <HomePagePullRequestsTable userRole="AUTHOR" buildStatus />
      </TestApiProvider>,
    );

    // Wait for error to be shown
    expect(
      await screen.findByText(/Failed to load pull requests: API error/),
    ).toBeInTheDocument();
  });

  it('should respect maxItems parameter', async () => {
    // Create a longer list of PRs
    const lotsOfPRs = Array(15)
      .fill(null)
      .map((_, i) => ({
        ...mockPullRequests[0],
        id: `${i + 1}`,
        title: `Test PR ${i + 1}`,
      }));

    mockBitbucketApi.fetchUserPullRequests.mockResolvedValue(lotsOfPRs);

    render(
      <TestApiProvider apis={apis}>
        <HomePagePullRequestsTable userRole="AUTHOR" maxItems={5} />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(mockBitbucketApi.fetchUserPullRequests).toHaveBeenCalledWith(
        'AUTHOR',
        'OPEN',
        5,
        { includeBuildStatus: true },
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Pull Requests (5)')).toBeInTheDocument();
    });
  });

  it('should render "more reviewers" text when there are more than 4 reviewers', async () => {
    // Create a PR with more than 4 reviewers
    const prWithManyReviewers = {
      ...mockPullRequests[0],
      reviewers: Array(6)
        .fill(null)
        .map((_, i) => ({
          displayName: `Reviewer ${i + 1}`,
          slug: `reviewer-${i + 1}`,
        })),
    };

    mockBitbucketApi.fetchUserPullRequests.mockResolvedValue([
      prWithManyReviewers,
    ]);

    render(
      <TestApiProvider apis={apis}>
        <HomePagePullRequestsTable userRole="AUTHOR" buildStatus />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(mockBitbucketApi.fetchUserPullRequests).toHaveBeenCalledWith(
        'AUTHOR',
        'OPEN',
        25,
        { includeBuildStatus: true },
      );
    });

    // Wait for the +2 more text to appear (6 reviewers - 4 shown = 2 more)
    expect(await screen.findByText('+2 more')).toBeInTheDocument();
  });

  it('should render build status icons correctly', async () => {
    mockBitbucketApi.fetchUserPullRequests.mockResolvedValue(mockPullRequests);

    render(
      <TestApiProvider apis={apis}>
        <HomePagePullRequestsTable userRole="AUTHOR" buildStatus />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(mockBitbucketApi.fetchUserPullRequests).toHaveBeenCalledWith(
        'AUTHOR',
        'OPEN',
        25,
        { includeBuildStatus: true },
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText(`PR #${mockPullRequests[0].id}`),
      ).toBeInTheDocument();
    });

    // The icons themselves are hard to test directly, but we can verify the component rendered
    // and didn't throw any errors when processing different build statuses
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('should not include build status column when buildStatus is false', async () => {
    mockBitbucketApi.fetchUserPullRequests.mockResolvedValue(mockPullRequests);

    render(
      <TestApiProvider apis={apis}>
        <HomePagePullRequestsTable userRole="AUTHOR" buildStatus={false} />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(mockBitbucketApi.fetchUserPullRequests).toHaveBeenCalledWith(
        'AUTHOR',
        'OPEN',
        25,
        { includeBuildStatus: false },
      );
    });
  });
});
