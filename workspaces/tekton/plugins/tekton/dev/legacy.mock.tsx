/*
 * Copyright 2026 The Backstage Authors
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

import { Page, Header, TabbedLayout } from '@backstage/core-components';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import {
  kubernetesApiRef,
  kubernetesProxyApiRef,
  kubernetesAuthProvidersApiRef,
} from '@backstage/plugin-kubernetes-react';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import { TestApiProvider } from '@backstage/test-utils';

import { tektonTranslations } from '../src/translations';
import { TektonCI, tektonPlugin } from '../src/legacy';
import {
  mockEntity,
  mockKubernetesAuthProviderApi,
  mockKubernetesClient,
  mockKubernetesProxyApi,
  mockPermissionApi,
} from './mocks';

createDevApp()
  .addTranslationResource(tektonTranslations)
  .setAvailableLanguages(['en', 'de', 'es', 'fr', 'it', 'ja'])
  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [kubernetesApiRef, mockKubernetesClient],
          [kubernetesProxyApiRef, mockKubernetesProxyApi],
          [permissionApiRef, mockPermissionApi],
          [kubernetesAuthProvidersApiRef, mockKubernetesAuthProviderApi],
        ]}
      >
        <EntityProvider entity={mockEntity}>
          <Page themeId="service">
            <Header type="component — service" title="demo-sevice" />
            <TabbedLayout>
              <TabbedLayout.Route path="/" title="CI/CD">
                <TektonCI />
              </TabbedLayout.Route>
            </TabbedLayout>
          </Page>
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Tekton CI',
    path: '/tekton',
  })
  .registerPlugin(tektonPlugin)
  .render();
