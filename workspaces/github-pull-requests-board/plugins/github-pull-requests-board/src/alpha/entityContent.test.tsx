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
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import React from 'react';

jest.mock('../hooks/useUserRepositoriesAndTeam', () => {
  return {
    useUserRepositoriesAndTeam: () => {
      return {
        loading: false,
        repositories: ['team-login/team-repo'],
        teamMembers: ['team-member'],
        teamMembersOrganization: 'test-org',
      };
    },
  };
});

jest.mock('../hooks/usePullRequestsByTeam', () => {
  return {
    usePullRequestsByTeam: () => {
      return {
        loading: false,
        pullRequests: [],
        refreshPullRequest: () => {},
      };
    },
  };
});

const entityGroup = {
  metadata: {
    annotations: {},
    name: 'backstage',
  },
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Group',
} as Entity;

describe('Entity card extensions', () => {
  it('should render card', async () => {
    renderInTestApp(
      <TestApiProvider apis={[]}>
        <EntityProvider entity={entityGroup}>
          {createExtensionTester(
            content.entityGithubPullRequestsContent,
          ).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('no-prs-msg')).toHaveTextContent(
          'No pull requests found',
        );
      },
      { timeout: 5000 },
    );
  });
});
