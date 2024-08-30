import { screen, waitFor } from '@testing-library/react';
import {
  createExtensionTester,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import * as content from './entityContent';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { GithubActionsApi, githubActionsApiRef } from '../api';
import { sampleEntity } from '../__fixtures__/entity';
import React from 'react';

const listBranchesMock = jest
  .fn()
  .mockReturnValue([])
  .mockReturnValueOnce(require('../__fixtures__/list-branches.json'));

const listWorkflowRunsMock = jest
  .fn()
  .mockReturnValue(require('../__fixtures__/list-workflow-runs.json'));

describe('Entity content extension', () => {
  const mockGithubActionsApi = {
    getDefaultBranch: jest.fn().mockReturnValue('main'),
    listBranches: listBranchesMock,
    listWorkflowRuns: listWorkflowRunsMock,
    reRunWorkflow: () => null,
  } as unknown as GithubActionsApi;

  it('should render WorkflowRunsTable', async () => {
    renderInTestApp(
      <TestApiProvider apis={[[githubActionsApiRef, mockGithubActionsApi]]}>
        <EntityProvider entity={sampleEntity.entity}>
          {createExtensionTester(
            content.entityGithubActionsContent,
          ).reactElement()}
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
});
