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
  configApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { apiiroApiRef, ApiiroClient } from './api';

/** @public */
export const apiiroPlugin = createPlugin({
  id: 'apiiro-plugin',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: apiiroApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
      },
      factory: ({ discoveryApi, configApi }) =>
        new ApiiroClient({ discoveryApi, configApi }),
    }),
  ],
});

/** @public */
export const ApiiroPage = apiiroPlugin.provide(
  createRoutableExtension({
    name: 'ApiiroPage',
    component: () => import('./App').then(m => m.App),
    mountPoint: rootRouteRef,
  }),
);
