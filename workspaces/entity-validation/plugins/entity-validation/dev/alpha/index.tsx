/*
 * Copyright 2023 The Backstage Authors
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

import ReactDOM from 'react-dom/client';

import { createApp } from '@backstage/frontend-defaults';
import { TestApiProvider } from '@backstage/frontend-test-utils';

import {
  PageBlueprint,
  createFrontendPlugin,
} from '@backstage/frontend-plugin-api';

import { catalogApiRef } from '@backstage/plugin-catalog-react';

import entityValidationPlugin from '../../src/alpha';
import { EntityValidationContent } from '../../src/components/EntityValidationPage';

import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';
import { identityApiRef } from '@backstage/core-plugin-api';

const devPagesPlugin = createFrontendPlugin({
  pluginId: 'entity-validation-dev-pages',
  extensions: [
    PageBlueprint.make({
      name: 'embed-example',
      params: {
        path: '/entity-validation-embed',
        loader: () =>
          import('@backstage/core-components').then(
            ({ Page, Header, Content }) => (
              <Page themeId="tool">
                <Header title="Embed Example" />
                <Content>
                  <EntityValidationContent />
                </Content>
              </Page>
            ),
          ),
      },
    }),
  ],
});

const mockEntities = [
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'example-service',
      annotations: {
        'backstage.io/managed-by-location': 'file:/path/to/catalog-info.yaml',
      },
    },
    spec: {
      type: 'service',
      lifecycle: 'production',
      owner: 'guest',
    },
  },
];

const catalogApi = catalogApiMock({ entities: mockEntities });

const mockIdentityApi = {
  getProfileInfo: () => Promise.resolve({ displayName: 'Test User' }),
  getBackstageIdentity: () =>
    Promise.resolve({
      type: 'user' as const,
      userEntityRef: 'user:default/testuser',
      ownershipEntityRefs: [] as string[],
    }),
  getCredentials: () => Promise.resolve({ token: 'mock-token' }),
  signOut: () => Promise.resolve(),
};

const app = createApp({
  features: [devPagesPlugin, entityValidationPlugin],
});

const root = app.createRoot();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <TestApiProvider
    apis={
      [
        [catalogApiRef, catalogApi],
        [identityApiRef, mockIdentityApi],
      ] as const
    }
  >
    {root}
  </TestApiProvider>,
);
