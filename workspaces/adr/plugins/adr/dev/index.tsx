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
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Content, Header, Page } from '@backstage/core-components';
import { ANNOTATION_SOURCE_LOCATION, Entity } from '@backstage/catalog-model';

import { ANNOTATION_ADR_LOCATION } from '@backstage-community/plugin-adr-common';

import { adrPlugin, EntityAdrContent } from '../src/plugin';

const entities: Entity[] = [
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'adr-example',
      annotations: {
        [ANNOTATION_SOURCE_LOCATION]: 'url:https://github.com/adr/madr',
        [ANNOTATION_ADR_LOCATION]:
          'https://github.com/adr/madr/tree/develop/docs/decisions',
      },
    },
    spec: {
      type: 'service',
      lifecycle: 'experimental',
      owner: 'user:guest',
    },
  },
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'madr-example',
      annotations: {
        [ANNOTATION_SOURCE_LOCATION]: 'url:https://github.com/adr/madr',
        [ANNOTATION_ADR_LOCATION]:
          'https://github.com/adr/madr/tree/develop/docs/decisions',
      },
    },
    spec: {
      type: 'service',
      lifecycle: 'experimental',
      owner: 'user:guest',
    },
  },
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'missing-adrs',
      annotations: {
        [ANNOTATION_SOURCE_LOCATION]: 'url:https://github.com/adr/madr',
        [ANNOTATION_ADR_LOCATION]:
          'https://github.com/adr/madr/tree/develop/docs/not-existing-folder',
      },
    },
    spec: {
      type: 'service',
      lifecycle: 'experimental',
      owner: 'user:guest',
    },
  },
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'missing-annotation',
    },
    spec: {
      type: 'service',
      lifecycle: 'experimental',
      owner: 'user:guest',
    },
  },
];

const builder = createDevApp().registerPlugin(adrPlugin);

entities.forEach(entity => {
  builder.addPage({
    element: (
      <Page themeId={entity.spec!.type as string}>
        <Header title={entity.metadata.name} />
        <Content>
          <EntityProvider entity={entity}>
            <EntityAdrContent />
          </EntityProvider>
        </Content>
      </Page>
    ),
    title: entity.metadata.name,
    path: `/${entity.metadata.name}`,
  });
});

builder.render();
