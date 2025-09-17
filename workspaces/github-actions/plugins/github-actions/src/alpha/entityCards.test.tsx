/*
 * Copyright 2024 The Backstage Authors
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
import { screen, waitFor } from '@testing-library/react';
import {
  createExtensionTester,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import * as cards from './entityCards';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { GithubActionsApi, githubActionsApiRef } from '../api';
import { sampleEntity } from '../__fixtures__/entity';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useRouteRef: () => () => '/github-actions',
}));

const listBranchesMock = jest
  .fn()
  .mockReturnValue([])
  .mockReturnValueOnce(require('../__fixtures__/list-branches.json'));

const listWorkflowRunsMock = jest
  .fn()
  .mockReturnValue(require('../__fixtures__/list-workflow-runs.json'));

describe('Entity card extensions', () => {
  const mockGithubActionsApi = {
    getDefaultBranch: jest.fn().mockReturnValue('main'),
    listBranches: listBranchesMock,
    listWorkflowRuns: listWorkflowRunsMock,
    reRunWorkflow: () => null,
  } as unknown as GithubActionsApi;

  it('should render WorkflowRunsCard', async () => {
    renderInTestApp(
      <TestApiProvider apis={[[githubActionsApiRef, mockGithubActionsApi]]}>
        <EntityProvider entity={sampleEntity.entity}>
          {createExtensionTester(cards.entityGithubActionsCard).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByText('backstage/backstage')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it('should render LatestWorkflowRunCard', async () => {
    renderInTestApp(
      <TestApiProvider apis={[[githubActionsApiRef, mockGithubActionsApi]]}>
        <EntityProvider entity={sampleEntity.entity}>
          {createExtensionTester(
            cards.entityLatestGithubActionRunCard,
          ).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByText('Last main build')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it('should render LatestWorkflowsRunForBranchCard', async () => {
    renderInTestApp(
      <TestApiProvider apis={[[githubActionsApiRef, mockGithubActionsApi]]}>
        <EntityProvider entity={sampleEntity.entity}>
          {createExtensionTester(
            cards.entityLatestGithubActionsForBranchCard,
          ).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByText('Recent main builds')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it('should render RecentWorkflowRunsCard', async () => {
    renderInTestApp(
      <TestApiProvider apis={[[githubActionsApiRef, mockGithubActionsApi]]}>
        <EntityProvider entity={sampleEntity.entity}>
          {createExtensionTester(
            cards.entityRecentGithubActionsRunsCard,
          ).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByText('Commit Message')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });
});
