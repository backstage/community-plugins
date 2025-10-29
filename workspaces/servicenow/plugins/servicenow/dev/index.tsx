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

import { createDevApp } from '@backstage/dev-utils';
import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Header, Page, TabbedLayout } from '@backstage/core-components';
import {
  BackstageUserIdentity,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { TestApiProvider } from '@backstage/test-utils';
import { serviceNowApiRef } from '../src/api/ServiceNowBackendClient';
import { mockComponentEntity } from '../src/__fixtures__/mockEntity';
import { mockServicenowApi } from '../src/__fixtures__/mockServicenowApi';

import { servicenowPlugin, EntityServicenowContent } from '../src/plugin';

const mockIdentityApi = {
  getUserId: () => 'test-user',
  getProfile: () => ({
    email: 'test@example.com',
    displayName: 'Test User',
    picture: 'https://example.com/avatar.png',
  }),
  getProfileInfo: async () => ({
    email: 'test@example.com',
    displayName: 'Test User',
    picture: 'https://example.com/avatar.png',
  }),
  getIdToken: async () => 'test-user-token',
  signOut: () => Promise.resolve(),
  getCredentials: async () => ({ token: 'test-user-token' }),
  getBackstageIdentity: async (): Promise<BackstageUserIdentity> => ({
    type: 'user',
    userEntityRef: 'user:default/test-user',
    ownershipEntityRefs: ['user:default/test-user'],
  }),
};

// const mockUserEmailToSysId: { [email: string]: string } = {
//   'test@example.com': 'user-sys-id-1',
//   'yicai@redhat.com': 'user-sys-id-2',
// };

createDevApp()
  .registerPlugin(servicenowPlugin)
  .registerApi(
    catalogApiMock.factory({
      entities: [
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'software-template',
            namespace: 'default',
            description: 'A template for creating a new software component',
            annotations: {
              'servicenow.com/entity-id': 'my-test-entity',
            },
            spec: {
              type: 'service',
              owner: 'guest',
              lifecycle: 'experimental',
            },
          },
        },
      ],
    }),
  )
  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [identityApiRef, mockIdentityApi],
          [serviceNowApiRef, mockServicenowApi],
        ]}
      >
        <EntityProvider entity={mockComponentEntity}>
          <Page themeId="tool">
            <Header
              type="component — tool"
              title={mockComponentEntity.metadata.name}
            />
            <TabbedLayout>
              <TabbedLayout.Route path="/" title="ServiceNow">
                <EntityServicenowContent />
              </TabbedLayout.Route>
            </TabbedLayout>
          </Page>
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'ServiceNow',
    path: '/servicenow',
  })
  .render();
