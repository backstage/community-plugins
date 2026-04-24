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

import { createDevApp } from '@backstage/dev-utils';
import { Page, Header, TabbedLayout } from '@backstage/core-components';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { kubernetesPlugin } from '@backstage/plugin-kubernetes';

import { Entity } from '@backstage/catalog-model';

import { topologyTranslations } from '../src/translations';
import { topologyPlugin, TopologyPage } from '../src/plugin';

export const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage',
    description: 'backstage.io',
    annotations: {
      'backstage.io/kubernetes-id': 'backstage',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

const permissionDeniedMockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'permission-denied',
    description: 'backstage.io',
    annotations: {
      'backstage.io/kubernetes-id': 'backstage',
    },
  },
};

createDevApp()
  .registerPlugin(kubernetesPlugin)
  .registerPlugin(topologyPlugin)
  .addTranslationResource(topologyTranslations)
  .setAvailableLanguages(['en', 'de', 'fr', 'it', 'es', 'ja'])
  .setDefaultLanguage('en')
  .addPage({
    element: (
      <EntityProvider entity={mockEntity}>
        <Page themeId="service">
          <Header type="component — service" title={mockEntity.metadata.name} />
          <TabbedLayout>
            <TabbedLayout.Route path="/" title="Topology">
              <TopologyPage />
            </TabbedLayout.Route>
          </TabbedLayout>
        </Page>
      </EntityProvider>
    ),
    title: 'Topology',
    path: '/topology',
  })
  .addPage({
    element: (
      <EntityProvider entity={permissionDeniedMockEntity}>
        <Page themeId="service">
          <Header
            type="component — service"
            title={permissionDeniedMockEntity.metadata.name}
          />
          <TabbedLayout>
            <TabbedLayout.Route path="/" title="Topology">
              <TopologyPage />
            </TabbedLayout.Route>
          </TabbedLayout>
        </Page>
      </EntityProvider>
    ),
    title: 'Missing permissions',
    path: '/missing-permissions',
  })
  .render();
