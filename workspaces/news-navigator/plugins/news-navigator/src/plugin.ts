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
import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { newsApiRef, NewsAPIBackendClient } from './api';

/**
 * News Plugin
 @public
 */
export const newsNavigatorPlugin = createPlugin({
  id: 'news-navigator',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: newsApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new NewsAPIBackendClient({ discoveryApi, fetchApi }),
    }),
  ],
});

/**
 * News Navigator Page
 * @public
 */
export const NewsNavigatorPage = newsNavigatorPlugin.provide(
  createRoutableExtension({
    name: 'NewsNavigatorPage',
    component: () =>
      import('./components/NewsNavigator').then(m => m.NewsNavigator),
    mountPoint: rootRouteRef,
  }),
);
