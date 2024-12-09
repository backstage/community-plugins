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
  createPlugin,
  createApiFactory,
  discoveryApiRef,
  identityApiRef,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

import { blackduckApiRef, BlackDuckClient } from './api';

/**
 * @public
 */
export const blackduckPlugin = createPlugin({
  id: 'blackduck',
  apis: [
    createApiFactory({
      api: blackduckApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ discoveryApi, identityApi }) =>
        new BlackDuckClient({
          discoveryApi,
          identityApi,
        }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

/**
 * @public
 */
export const BlackDuckPage = blackduckPlugin.provide(
  createRoutableExtension({
    name: 'BlackDuckPage',
    component: () =>
      import('./components/BlackDuckPage').then(m => m.BlackDuckPageComponent),
    mountPoint: rootRouteRef,
  }),
);

/**
 * @public
 */
export const RiskCard = blackduckPlugin.provide(
  createRoutableExtension({
    name: 'RiskCard',
    component: () =>
      import('./components/BlackDuckCard').then(m => m.RiskCardComponent),
    mountPoint: rootRouteRef,
  }),
);
