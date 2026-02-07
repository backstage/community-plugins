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

import { Entity } from '@backstage/catalog-model';
import { createDevApp } from '@backstage/dev-utils';
import { catalogApiRef, EntityProvider } from '@backstage/plugin-catalog-react';
import { Content, Header, HeaderLabel, Page } from '@backstage/core-components';
import { TestApiProvider } from '@backstage/test-utils';
import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';

import Wifi from '@material-ui/icons/WifiSharp';
import OfflineIcon from '@material-ui/icons/WifiOff';

import { EntityTeamPullRequestsContent } from '../src';
import { githubAuthApiRef } from '@backstage/frontend-plugin-api';

const GITHUB_PULL_REQUESTS_ANNOTATION = 'github.com/project-slug';
const GITHUB_USER_LOGIN_ANNOTATION = 'github.com/user-login';

const teamEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Group',
  metadata: {
    name: 'engineering',
  },
  spec: {
    type: 'team',
  },
  relations: [
    {
      type: 'hasMember',
      targetRef: 'user:default/user1',
    },
    {
      type: 'hasMember',
      targetRef: 'user:default/user2',
    },
  ],
};
const teamMembers: Entity[] = [
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'User',
    metadata: {
      name: 'user1',
      annotations: {
        [GITHUB_USER_LOGIN_ANNOTATION]: 'Sarabadu',
      },
    },
    relations: [
      {
        type: 'memberOf',
        targetRef: 'group:default/engineering',
      },
    ],
  },
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'User',
    metadata: {
      name: 'user2',
      annotations: {
        [GITHUB_USER_LOGIN_ANNOTATION]: 'awanlin',
      },
    },
    relations: [
      {
        type: 'memberOf',
        targetRef: 'group:default/engineering',
      },
    ],
  },
];

const components: Entity[] = [
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'repo1',
      annotations: {
        [GITHUB_PULL_REQUESTS_ANNOTATION]: 'backstage/community-plugins',
      },
    },
    spec: {
      type: 'service',
      lifecycle: 'production',
      owner: 'group:engineering',
    },
    relations: [
      {
        type: 'ownedBy',
        targetRef: 'group:default/engineering',
      },
    ],
  },
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'repo2',
      annotations: {
        [GITHUB_PULL_REQUESTS_ANNOTATION]: 'backstage/backstage',
      },
    },
    spec: {
      type: 'service',
      lifecycle: 'production',
      owner: 'group:engineering',
    },
    relations: [
      {
        type: 'ownedBy',
        targetRef: 'group:default/engineering',
      },
    ],
  },
];
const catalogApiMockImp = catalogApiMock({
  entities: [teamEntity, ...teamMembers, ...components],
});

const githubMockApi = {
  getAccessToken: async () => {
    // This is only here to make been able to locally test this plugin without having to
    // setup a backend app
    return 'mocked-token';
  },
} as typeof githubAuthApiRef.T;

createDevApp()
  // .registerPlugin(githubPullRequestsBoardPlugin)
  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [catalogApiRef, catalogApiMockImp],
          [githubAuthApiRef, githubMockApi],
        ]}
      >
        <EntityProvider entity={teamEntity}>
          <Page themeId="service">
            <Header title="Mocked Pull Requests Board">
              <HeaderLabel label="Mode" value="Development" />
            </Header>
            <Content>
              <EntityTeamPullRequestsContent />
            </Content>
          </Page>
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Entity Todo Content',
    icon: OfflineIcon,
  })
  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [catalogApiRef, catalogApiMockImp],
          [githubAuthApiRef, githubMockApi],
        ]}
      >
        <EntityProvider entity={teamEntity}>
          <Page themeId="service">
            <Header title="Mocked Pull Requests Board">
              <HeaderLabel label="Mode" value="Development" />
            </Header>
            <Content>
              <EntityTeamPullRequestsContent />
            </Content>
          </Page>
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Live Pull Requests Board',
    icon: Wifi,
  })

  .render();
