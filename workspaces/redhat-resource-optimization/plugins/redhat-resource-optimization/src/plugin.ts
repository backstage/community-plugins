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
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { OptimizationsApiClient } from '@backstage-community/plugin-redhat-resource-optimization-common';
import { optimizationsBreakdownRouteRef, rootRouteRef } from './routes';
import { optimizationsApiRef } from './apis';

/** @public */
export const resourceOptimizationPlugin = createPlugin({
  id: 'redhat-resource-optimization',
  apis: [
    createApiFactory({
      api: optimizationsApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory({ discoveryApi, fetchApi }) {
        return new OptimizationsApiClient({
          discoveryApi,
          fetchApi,
        });
      },
    }),
  ],
  routes: {
    root: rootRouteRef,
    breakdown: optimizationsBreakdownRouteRef,
  },
});

/** @public */
export const ResourceOptimizationPage = resourceOptimizationPlugin.provide(
  createRoutableExtension({
    name: 'ResourceOptimizationPage',
    component: () => import('./pages/Router').then(m => m.Router),
    mountPoint: rootRouteRef,
  }),
);
