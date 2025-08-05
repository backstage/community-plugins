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
  configApiRef,
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { MatomoApiClient, matomoApiRef } from './api';
import { rootRouteRef } from './routes';

/**
 * Create frontend plugin
 * @public
 */
export const matomoPlugin = createPlugin({
  id: 'matomo',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: matomoApiRef,
      deps: {
        configApi: configApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ configApi, fetchApi }) =>
        new MatomoApiClient({ configApi, fetchApi }),
    }),
  ],
});

/**
 * Matomo analytics entity page
 * @public
 */
export const MatomoPage = matomoPlugin.provide(
  createRoutableExtension({
    name: 'MatomoPage',
    component: () => import('./components/MatomoPage').then(m => m.MatomoPage),
    mountPoint: rootRouteRef,
  }),
);
