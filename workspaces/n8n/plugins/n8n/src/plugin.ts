/*
 * Copyright 2024 The Backstage Authors
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

import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  createRouteRef,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { N8nClient, n8nApiRef } from './api';

/** @public */
export const rootRouteRef = createRouteRef({
  id: 'n8n',
});

/** @public */
export const n8nPlugin = createPlugin({
  id: 'n8n',
  apis: [
    createApiFactory({
      api: n8nApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new N8nClient({ discoveryApi, fetchApi }),
    }),
  ],
  routes: {
    entityContent: rootRouteRef,
  },
});

/** @public */
export const EntityN8nContent = n8nPlugin.provide(
  createRoutableExtension({
    name: 'EntityN8nContent',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: rootRouteRef,
  }),
);

/** @public */
export const EntityN8nLatestExecutionCard = n8nPlugin.provide(
  createComponentExtension({
    name: 'EntityN8nLatestExecutionCard',
    component: {
      lazy: () =>
        import(
          './components/N8nLatestExecutionCard/N8nLatestExecutionCard'
        ).then(m => m.N8nLatestExecutionCard),
    },
  }),
);

/** @public */
export const EntityN8nWorkflowsTable = n8nPlugin.provide(
  createComponentExtension({
    name: 'EntityN8nWorkflowsTable',
    component: {
      lazy: () =>
        import('./components/N8nWorkflowsTable/N8nWorkflowsTable').then(
          m => m.N8nWorkflowsTable,
        ),
    },
  }),
);
