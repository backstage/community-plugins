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

import type { ComponentType } from 'react';
import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { devlakeApiRef, DevlakeClientImpl } from './api';
import type { EntityDoraCardProps } from './components/EntityDoraCard';

/**
 * The DevLake plugin instance.
 *
 * @public
 */
export const devlakePlugin = createPlugin({
  id: 'devlake',
  apis: [
    createApiFactory({
      api: devlakeApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new DevlakeClientImpl({ discoveryApi, fetchApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

/**
 * The DORA Metrics dashboard page.
 *
 * @public
 */
export const DoraMetricsPage = devlakePlugin.provide(
  createRoutableExtension({
    name: 'DoraMetricsPage',
    component: () =>
      import('./pages/DoraMetricsPage').then(m => m.DoraMetricsPage),
    mountPoint: rootRouteRef,
  }),
);

/**
 * A compact DORA metrics card for Backstage entity pages.
 * Requires the `devlake.io/project-name` annotation on the entity.
 *
 * @public
 */
export const EntityDoraCard: ComponentType<EntityDoraCardProps> =
  devlakePlugin.provide(
    createComponentExtension({
      name: 'EntityDoraCard',
      component: {
        lazy: () =>
          import('./components/EntityDoraCard').then(m => m.EntityDoraCard),
      },
    }),
  ) as ComponentType<EntityDoraCardProps>;
