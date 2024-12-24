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
import { Entity } from '@backstage/catalog-model';
import React from 'react';
import {
  GithubDeployment,
  GithubDeploymentsApi,
  githubDeploymentsApiRef,
} from '../api';

const entityComponent = {
  metadata: {
    annotations: {
      'github.com/project-slug': 'backstage/backstage',
      'backstage.io/source-location':
        'url:https://github.com/backstage/backstage',
    },
    name: 'backstage',
  },
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
} as unknown as Entity;

const mockGithubDeployementsApi = {
  listDeployments: async (): Promise<GithubDeployment[]> => {
    return [] as GithubDeployment[];
  },
} as GithubDeploymentsApi;

const apis = [[githubDeploymentsApiRef, mockGithubDeployementsApi]] as const;

describe('Entity card extensions', () => {
  it('should render', async () => {
    renderInTestApp(
      <TestApiProvider apis={apis}>
        <EntityProvider entity={entityComponent}>
          {createExtensionTester(
            cards.entityGithubDeploymentsCard,
          ).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByText('GitHub Deployments')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });
});
