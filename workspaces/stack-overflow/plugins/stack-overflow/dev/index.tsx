/*
 * Copyright 2020 The Backstage Authors
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
import stackOverflowPlugin from '../src/alpha';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import searchPlugin from '@backstage/plugin-search/alpha';
import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';
import {
  ApiBlueprint,
  createFrontendModule,
} from '@backstage/frontend-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { searchApiRef } from '@backstage/plugin-search-react';

const entities = [
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

const catalogApi = catalogApiMock({ entities });

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

const searchPluginOverrides = createFrontendModule({
  pluginId: 'search',
  extensions: [
    ApiBlueprint.make({
      params: defineParams =>
        defineParams({
          api: searchApiRef,
          deps: {},
          factory: () => ({
            async query(query) {
              return {
                results: [
                  {
                    type: 'software-catalog',
                    title: 'Example result from catalog',
                    text: 'This is an example search result from the catalog',
                    document: {
                      title: 'example',
                      location: '/catalog/default/component/example',
                      text: 'This is an example search result from the catalog',
                      namespace: 'default',
                      componentType: 'service',
                      type: 'service',
                      kind: 'Component',
                      lifecycle: 'production',
                      owner: 'guest',
                    },
                    relevance: 1,
                    highlights: { text: [] },
                  },
                  {
                    type: 'stack-overflow',
                    title: 'Example result from Stack Overflow',
                    text: 'This is an example of a Search overflow result',
                    document: {
                      title: 'Example result from Stack Overflow',
                      location:
                        'https://stackoverflow.com/questions/12345678/example-question',
                      text: 'This is an example of a Search overflow result',
                      answers: 13,
                    },
                    relevance: 1,
                    highlights: { text: [] },
                  },
                ].filter(doc =>
                  query.types?.length ? query.types.includes(doc.type) : true,
                ),
              };
            },
          }),
        }),
    }),
  ],
});

export const app = createApp({
  features: [
    catalogPlugin,
    searchPlugin,
    catalogPluginOverrides,
    searchPluginOverrides,
    stackOverflowPlugin,
  ],
});
const root = app.createRoot();
ReactDOM.createRoot(document.getElementById('root')!).render(root);
