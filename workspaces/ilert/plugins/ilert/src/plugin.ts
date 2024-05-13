/*
 * Copyright 2021 The Backstage Authors
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

import { ILertClient, ilertApiRef } from './api';
import { iLertRouteRef } from './route-refs';
import {
  configApiRef,
  createApiFactory,
  createPlugin,
  discoveryApiRef,
  createRoutableExtension,
  createComponentExtension,
  fetchApiRef,
} from '@backstage/core-plugin-api';

/** @public */
export const ilertPlugin = createPlugin({
  id: 'ilert',
  apis: [
    createApiFactory({
      api: ilertApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, configApi, fetchApi }) =>
        ILertClient.fromConfig(configApi, discoveryApi, fetchApi),
    }),
  ],
  routes: {
    root: iLertRouteRef,
  },
});

/** @public */
export const ILertPage = ilertPlugin.provide(
  createRoutableExtension({
    name: 'ILertPage',
    component: () => import('./components').then(m => m.ILertPage),
    mountPoint: iLertRouteRef,
  }),
);

/** @public */
export const EntityILertCard = ilertPlugin.provide(
  createComponentExtension({
    name: 'EntityILertCard',
    component: {
      lazy: () => import('./components/ILertCard').then(m => m.ILertCard),
    },
  }),
);
