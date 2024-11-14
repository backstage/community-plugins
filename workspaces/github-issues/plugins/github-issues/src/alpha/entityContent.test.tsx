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
import * as content from './entityContent';
import {
  EntityProvider,
  catalogApiRef,
  CatalogApi,
} from '@backstage/plugin-catalog-react';
import { GithubIssuesApi, githubIssuesApiRef } from '../api';
import { Entity } from '@backstage/catalog-model';
import React from 'react';

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

const mockCatalogApi = {
  getEntities: () => ({}),
} as CatalogApi;

const mockGithubIssuesApi = {
  fetchIssuesByRepoFromGithub: async () => ({
    backstage: {
      issues: {
        totalCount: 0,
        edges: [],
      },
    },
  }),
} as GithubIssuesApi;

describe('Entity content extensions', () => {
  it('should render', async () => {
    const apis = [
      [githubIssuesApiRef, mockGithubIssuesApi],
      [catalogApiRef, mockCatalogApi],
    ] as const;

    renderInTestApp(
      <TestApiProvider apis={apis}>
        <EntityProvider entity={entityComponent}>
          {createExtensionTester(
            content.entityGithubIssuesContent,
          ).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('no-issues-msg')).toHaveTextContent(
          'Hurray! No Issues 🚀',
        );
      },
      { timeout: 5000 },
    );
  });
});
