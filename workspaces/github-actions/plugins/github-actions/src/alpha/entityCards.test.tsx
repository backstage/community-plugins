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
import React from 'react';

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
        expect(screen.getByText('Last master build')).toBeInTheDocument();
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
        expect(screen.getByText('Last master build')).toBeInTheDocument();
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
