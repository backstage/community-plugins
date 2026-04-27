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
import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
  EntityLayout,
} from '@backstage/plugin-catalog';
import {
  EntityKubernetesContent,
  isKubernetesAvailable,
} from '@backstage/plugin-kubernetes';
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

createDevApp()
  .registerPlugin(kubernetesPlugin)
  .registerPlugin(catalogPlugin)
  .registerPlugin(topologyPlugin)
  .addTranslationResource(topologyTranslations)
  .setAvailableLanguages(['en', 'de', 'fr', 'it', 'es', 'ja'])
  .setDefaultLanguage('en')
  .addPage({
    path: '/catalog',
    title: 'Catalog',
    element: <CatalogIndexPage />,
  })
  .addPage({
    path: '/catalog/:namespace/:kind/:name',
    element: <CatalogEntityPage />,
    children: (
      <EntityLayout>
        <EntityLayout.Route path="/topology" title="Topology">
          <TopologyPage />
        </EntityLayout.Route>
        <EntityLayout.Route
          path="/kubernetes"
          title="Kubernetes"
          if={e => isKubernetesAvailable(e)}
        >
          <EntityKubernetesContent />
        </EntityLayout.Route>
      </EntityLayout>
    ),
  })
  .render();
