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
import { screen } from '@testing-library/react';
import {
  createExtensionTester,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import * as content from './entityContent';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { GithubActionsApi, githubActionsApiRef } from '../api/index.ts';
import { sampleEntity } from '../__fixtures__/entity.ts';
import { convertLegacyRouteRef } from '@backstage/core-compat-api';
import { rootRouteRef } from '../routes.ts';

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
      {
        mountedRoutes: {
          '/test': convertLegacyRouteRef(rootRouteRef),
        },
      },
    );

    await expect(screen.findByText('Age')).resolves.toBeInTheDocument();
    expect(screen.queryByText('Rerun workflow')).toBe(null);
  });

  it('should render WorkflowRunsCards', async () => {
    renderInTestApp(
      <TestApiProvider apis={[[githubActionsApiRef, mockGithubActionsApi]]}>
        <EntityProvider entity={sampleEntity.entity}>
          {createExtensionTester(content.entityGithubActionsContent, {
            config: { layout: 'cards' },
          }).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/test': convertLegacyRouteRef(rootRouteRef),
        },
      },
    );

    await expect(
      screen.findByText('Rerun workflow'),
    ).resolves.toBeInTheDocument();
    expect(screen.queryByText('Age')).toBe(null);
  });
});
