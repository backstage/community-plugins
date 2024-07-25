import { screen, waitFor } from '@testing-library/react';
import { createExtensionTester } from '@backstage/frontend-test-utils';
import * as cards from './entityCards';
import {
  createApiExtension,
  createApiFactory,
} from '@backstage/frontend-plugin-api';
import { GithubActionsApi, githubActionsApiRef } from '../api';
import { sampleEntity } from '../__fixtures__/entity';

jest.mock('@backstage/plugin-catalog-react', () => ({
  ...jest.requireActual('@backstage/plugin-catalog-react'),
  useEntity: () => sampleEntity,
}));

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
  const mockGithubActionsApi = createApiExtension({
    factory: createApiFactory({
      api: githubActionsApiRef,
      deps: {},
      factory: () =>
        ({
          getDefaultBranch: jest.fn().mockReturnValue('main'),
          listBranches: listBranchesMock,
          listWorkflowRuns: listWorkflowRunsMock,
          reRunWorkflow: () => null,
        } as unknown as GithubActionsApi),
    }),
  });

  it('should render WorkflowRunsCard', async () => {
    createExtensionTester(cards.entityGithubActionsCard)
      .add(mockGithubActionsApi)
      .render();

    await waitFor(
      () => {
        expect(screen.getByText('backstage/backstage')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it('should render LatestWorkflowRunCard', async () => {
    createExtensionTester(cards.entityLatestGithubActionRunCard)
      .add(mockGithubActionsApi)
      .render();

    await waitFor(
      () => {
        expect(screen.getByText('Last master build')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it('should render LatestWorkflowsRunForBranchCard', async () => {
    createExtensionTester(cards.entityLatestGithubActionsForBranchCard)
      .add(mockGithubActionsApi)
      .render();

    await waitFor(
      () => {
        expect(screen.getByText('Last master build')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it('should render RecentWorkflowRunsCard', async () => {
    createExtensionTester(cards.entityRecentGithubActionsRunsCard)
      .add(mockGithubActionsApi)
      .render();

    await waitFor(
      () => {
        expect(screen.getByText('Commit Message')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });
});
