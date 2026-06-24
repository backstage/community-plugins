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
import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { CheckmarxClient } from './api';
import { checkmarxApiRef } from './apiRef';

/** @public */
export const checkmarxPlugin = createPlugin({
  id: 'checkmarx',
  apis: [
    createApiFactory({
      api: checkmarxApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new CheckmarxClient({
          discoveryApi,
          fetchApi,
        }),
    }),
  ],
});

/** @public */
export const EntityCheckmarxCard = checkmarxPlugin.provide(
  createComponentExtension({
    name: 'EntityCheckmarxCard',
    component: {
      lazy: () =>
        import('./components/EntityCheckmarxCard').then(m => m.CheckmarxCard),
    },
  }),
);

/** @public */
export const EntityCheckmarxContentPage = checkmarxPlugin.provide(
  createComponentExtension({
    name: 'EntityCheckmarxContentPage',
    component: {
      lazy: () =>
        import('./components/EntityCheckmarxContentPage').then(
          m => m.CheckmarxContentPage,
        ),
    },
  }),
);

/** @public */
export const EntityCheckmarxRelatedEntitiesOverview = checkmarxPlugin.provide(
  createComponentExtension({
    name: 'CheckmarxRelatedEntitiesOverview',
    component: {
      lazy: () =>
        import('./components/CheckmarxRelatedEntitiesOverview').then(
          m => m.CheckmarxRelatedEntitiesOverview,
        ),
    },
  }),
);
