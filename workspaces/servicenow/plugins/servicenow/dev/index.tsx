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
  discoveryApiRef,
  fetchApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { TestApiProvider } from '@backstage/test-utils';
import {
  serviceNowApiRef,
  ServiceNowBackendClient,
} from '../src/api/ServiceNowBackendClient';
import { mockComponentEntity } from '../src/__fixtures__/mockEntity';
import { mockServicenowApi } from '../src/__fixtures__/mockServicenowApi';

import { servicenowPlugin, EntityServicenowContent } from '../src/plugin';
import { servicenowTranslations } from '../src/translations';
import { useMemo } from 'react';

const mockIdentityApi = {
  getProfileInfo: async () => ({
    email: 'test@example.com',
    displayName: 'Test User',
  }),
  signOut: () => Promise.resolve(),
  getCredentials: async () => ({ token: 'mock-user-token' }),
  getBackstageIdentity: async () => ({
    type: 'user' as const,
    userEntityRef: 'user:default/test-user',
    ownershipEntityRefs: ['user:default/test-user'],
  }),
};

function LiveServicenowPage() {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const client = useMemo(
    () => new ServiceNowBackendClient(discoveryApi, fetchApi, mockIdentityApi),
    [discoveryApi, fetchApi],
  );
  return (
    <TestApiProvider apis={[[serviceNowApiRef, client]]}>
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
  );
}

// const mockUserEmailToSysId: { [email: string]: string } = {
//   'test@example.com': 'user-sys-id-1',
//   'yicai@redhat.com': 'user-sys-id-2',
// };

createDevApp()
  .registerPlugin(servicenowPlugin)
  .addTranslationResource(servicenowTranslations)
  .setAvailableLanguages(['en', 'de', 'fr', 'it', 'es', 'ja'])
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
    title: 'ServiceNow (Mock)',
    path: '/servicenow',
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
  })
  .addPage({
    title: 'ServiceNow (Backend)',
    path: '/servicenow-live',
    element: <LiveServicenowPage />,
  })
  .render();
