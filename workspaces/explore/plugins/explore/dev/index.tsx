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

import ReactDOM from 'react-dom/client';

import { createApp } from '@backstage/frontend-defaults';

// The dev harness bootstraps a standalone app, so it needs the BUI styles
// even though this package is a frontend-plugin.
// eslint-disable-next-line @backstage/no-ui-css-imports-in-non-frontend
import '@backstage/ui/css/styles.css';

import {
  ApiBlueprint,
  configApiRef,
  createFrontendModule,
} from '@backstage/frontend-plugin-api';

import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { catalogApiRef } from '@backstage/plugin-catalog-react';

import explorePlugin from '../src/alpha';
import { exploreApiRef } from '../src/api';

import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';

const components = [
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'example',
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

const domains = [
  'playback',
  'artists',
  'payments',
  'analytics',
  'songs',
  'devops',
].map((domainName, domainIndex) => ({
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Domain',
  metadata: {
    name: domainName,
    description: `Everything about ${domainName}`,
    tags: domainIndex % 2 === 0 ? [domainName] : undefined,
  },
  spec: {
    owner: `${domainName}@example.com`,
  },
}));

function generateGroups() {
  const groups: any[] = [];
  const topGroups = ['group1', 'group2', 'group3'];
  const subGroupsPerTop = 5;

  for (const top of topGroups) {
    const subGroupNames = Array.from(
      { length: subGroupsPerTop },
      (_, i) => `${top}-subgroup${i + 1}`,
    );
    groups.push({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Group',
      metadata: {
        namespace: 'default',
        annotations: {},
        name: top,
        description: `The ${top} business unit`,
      },
      spec: {
        type: 'business-unit',
        profile: {},
        children: subGroupNames.map(n => `group:default/${n}`),
      },
      relations: [
        ...subGroupNames.map(n => ({
          type: 'hasChild',
          targetRef: `group:default/${n}`,
        })),
      ],
    });

    for (const subName of subGroupNames) {
      groups.push({
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Group',
        metadata: {
          namespace: 'default',
          annotations: {},
          name: subName,
          description: `The ${subName} business unit`,
        },
        spec: {
          type: 'team',
          profile: {},
          parent: top,
          children: [],
        },
        relations: [{ type: 'childOf', targetRef: `group:default/${top}` }],
      });
    }
  }
  return groups;
}

const customGroups = generateGroups();

const catalogApi = catalogApiMock({
  entities: [...components, ...domains, ...customGroups],
});

const catalogPluginOverrides = createFrontendModule({
  pluginId: 'catalog',
  extensions: [
    ApiBlueprint.make({
      params: defineParams =>
        defineParams({
          api: catalogApiRef,
          deps: {},
          factory: () => catalogApi,
        }),
    }),
  ],
});

const explorePluginOverrides = createFrontendModule({
  pluginId: 'explore',
  extensions: [
    ApiBlueprint.make({
      params: defineParams =>
        defineParams({
          api: exploreApiRef,
          deps: { configApi: configApiRef },
          factory: ({ configApi }) => ({
            async getTools() {
              const tools =
                configApi
                  .getOptionalConfigArray('explore.tools')
                  ?.map(toolConfig => ({
                    title: toolConfig.getString('title'),
                    description: toolConfig.getOptionalString('description'),
                    url: toolConfig.getString('url'),
                    image: toolConfig.getString('image'),
                    tags: toolConfig.getOptionalStringArray('tags'),
                    lifecycle: toolConfig.getOptionalString('lifecycle'),
                  })) ?? [];
              return { tools };
            },
          }),
        }),
    }),
  ],
});

const app = createApp({
  features: [
    explorePlugin,
    catalogPlugin,
    catalogPluginOverrides,
    explorePluginOverrides,
  ],
});

const root = app.createRoot();

ReactDOM.createRoot(document.getElementById('root')!).render(root);
