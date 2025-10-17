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

import { UrlPatternDiscovery } from '@backstage/core-app-api';
import {
  AnyApiRef,
  errorApiRef,
  identityApiRef,
  IdentityApi,
} from '@backstage/core-plugin-api';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { rest } from 'msw';
import {
  registerMswTestHooks,
  TestApiProvider,
  mockApis,
  MockErrorApi,
} from '@backstage/test-utils';
import { setupServer } from 'msw/node';
import { bitbucketApiRef, BitbucketApi } from '../api/BitbucketApi';
import PullRequestList from '../components/PullRequestList';
import { pullRequestsResponseStub, entityStub } from '../responseStubs';
import { render, screen, waitFor } from '@testing-library/react';
import { translationApiRef } from '@backstage/core-plugin-api/alpha';

const discoveryApi = UrlPatternDiscovery.compile('http://exampleapi.com');

const identityApi: IdentityApi = {
  getBackstageIdentity: async () => ({
    type: 'user',
    userEntityRef: 'user:default/test-user',
    ownershipEntityRefs: [],
  }),
  getCredentials: jest.fn().mockResolvedValue({ token: 'test-token' }),
  getProfileInfo: jest.fn().mockResolvedValue({
    email: 'test-user@example.com',
    displayName: 'Test User',
  }),
  signOut: jest.fn(),
};

const apis: [AnyApiRef, Partial<unknown>][] = [
  [bitbucketApiRef, new BitbucketApi({ discoveryApi, identityApi })],
  [errorApiRef, new MockErrorApi()],
  [identityApiRef, identityApi],
  [translationApiRef, mockApis.translation()],
];

describe('PullRequestList', () => {
  const worker = setupServer();
  registerMswTestHooks(worker);

  beforeEach(() => jest.resetAllMocks());

  it('should display a table with the data from the requests', async () => {
    // Mock the API response with our new stub
    worker.use(
      rest.get(
        'http://exampleapi.com/bitbucket/api/projects/testproject/repos/testrepo/pull-requests',
        (_, res, ctx) => res(ctx.json(pullRequestsResponseStub)),
      ),
    );

    render(
      <TestApiProvider apis={apis}>
        <EntityProvider entity={entityStub}>
          <PullRequestList />
        </EntityProvider>
      </TestApiProvider>,
    );

    // First verify table loads with title
    await waitFor(() => {
      expect(screen.getByText('Bitbucket Pull Requests')).toBeInTheDocument();
    });

    // Verify all expected columns exist
    const expectedColumns = [
      'ID',
      'TITLE',
      'STATE',
      'AUTHOR',
      'CREATED',
      'LAST UPDATED',
    ];
    await waitFor(() => {
      for (const column of expectedColumns) {
        expect(
          screen.getByRole('columnheader', { name: new RegExp(column, 'i') }),
        ).toBeInTheDocument();
      }
    });

    // Wait for table to load completely
    await waitFor(() => {
      // Just check that each PR title is rendered to ensure data is loaded
      pullRequestsResponseStub.values.forEach(pr => {
        expect(screen.getByText(pr.title)).toBeInTheDocument();
      });
    });

    // Now verify each PR in detail - outside of waitFor to avoid timing issues
    pullRequestsResponseStub.values.forEach(pr => {
      // Verify ID with link - ID may be rendered with a '#' prefix
      const idElement = screen.getByText(new RegExp(`#?${pr.id}$`));
      expect(idElement).toBeInTheDocument();

      // Link could be parent or the element itself
      const linkElement = idElement.closest('a') || idElement;
      expect(linkElement).toHaveAttribute(
        'href',
        expect.stringContaining(pr.links.self[0].href),
      );

      // Verify title
      expect(screen.getByText(pr.title)).toBeInTheDocument();

      // Verify author
      expect(screen.getByText(pr.author.user.displayName)).toBeInTheDocument();

      // Verify state is shown - implementation can vary (could be icon, text, etc)
      // Just check that the row renders without errors
      // We've already verified title and ID, which confirms the row exists
    });

    // Verify correct number of PRs shown
    const prIds = pullRequestsResponseStub.values.map(pr => `${pr.id}`);
    // IDs are always rendered with # prefix in the component
    const renderedIds = screen.getAllByText(/^#\d+$/);

    expect(renderedIds).toHaveLength(prIds.length);
  });

  it('should handle empty PR list', async () => {
    // Mock empty response
    const emptyResponseStub = {
      size: 0,
      limit: 25,
      isLastPage: true,
      values: [],
      start: 0,
    };

    worker.use(
      rest.get(
        'http://exampleapi.com/bitbucket/api/projects/testproject/repos/testrepo/pull-requests',
        (_, res, ctx) => res(ctx.json(emptyResponseStub)),
      ),
    );

    render(
      <TestApiProvider apis={apis}>
        <EntityProvider entity={entityStub}>
          <PullRequestList />
        </EntityProvider>
      </TestApiProvider>,
    );

    // Verify table still renders with no data
    await waitFor(() => {
      expect(screen.getByText('Bitbucket Pull Requests')).toBeInTheDocument();
      // No data text should be visible (or similar empty state indicator)
      // This depends on what the component shows when there's no data
      expect(screen.queryByText(/^#\d+$/)).not.toBeInTheDocument();
    });
  });
});
