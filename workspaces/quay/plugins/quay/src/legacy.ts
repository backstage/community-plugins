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
  configApiRef,
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

import { QuayApiClient, quayApiRef } from './api';
import { rootRouteRef, tagRouteRef } from './routes';

/**
 * Quay plugin (legacy frontend system)
 *
 * @public
 * @remarks Prefer the default export from the package root for the new frontend system.
 */
export const quayPlugin = createPlugin({
  id: 'quay',
  routes: {
    root: rootRouteRef,
    tag: tagRouteRef,
  },
  apis: [
    createApiFactory({
      api: quayApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ discoveryApi, configApi, identityApi }) =>
        QuayApiClient.fromConfig({ discoveryApi, configApi, identityApi }),
    }),
  ],
});

/**
 * Quay page (legacy frontend system)
 *
 * @public
 * @remarks Prefer the default export from the package root for the new frontend system.
 */
export const QuayPage = quayPlugin.provide(
  createRoutableExtension({
    name: 'QuayPage',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: rootRouteRef,
  }),
);

export { isQuayAvailable } from './lib/isQuayAvailable';
