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
import { AnyApiRef, errorApiRef } from '@backstage/core-plugin-api';
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

const apis: [AnyApiRef, Partial<unknown>][] = [
  [bitbucketApiRef, new BitbucketApi({ discoveryApi })],
  [errorApiRef, new MockErrorApi()],
  [translationApiRef, mockApis.translation()],
];

describe('PullRequestList', () => {
  const worker = setupServer();
  registerMswTestHooks(worker);

  beforeEach(() => jest.resetAllMocks());

  it('should display a table with the data from the requests', async () => {
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

    //  test the table header
    await waitFor(() => {
      expect(
        screen.getByText('Bitbucket Pull Requests (testproject/testrepo)'),
      ).toBeInTheDocument();
    });

    // test each column title
    await waitFor(() => {
      expect(screen.getByText(/ID/i)).toBeInTheDocument();
      expect(screen.getByText(/TITLE/i)).toBeInTheDocument();
      expect(screen.getByText(/AUTHOR/i)).toBeInTheDocument();
      expect(screen.getByText(/STATE/i)).toBeInTheDocument();
      expect(screen.getByText(/CREATED/i)).toBeInTheDocument();
      expect(screen.getByText(/LAST UPDATED/i)).toBeInTheDocument();
    });

    // check the count of row equal to mock response count
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(3);
    });
  });
});
