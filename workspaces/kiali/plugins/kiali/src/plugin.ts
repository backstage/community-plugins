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
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { overviewRouteRef, rootRouteRef, workloadsRouteRef } from './routes';
import { KialiApiClient, kialiApiRef } from './services/Api';
import '@patternfly/patternfly/patternfly.css';
import { pluginId } from '@backstage-community/plugin-kiali-common';

export const kialiPlugin = createPlugin({
  id: pluginId,
  routes: {
    root: rootRouteRef,
    overview: overviewRouteRef,
    workloads: workloadsRouteRef,
  },
  apis: [
    createApiFactory({
      api: kialiApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ discoveryApi, identityApi }) =>
        new KialiApiClient({ discoveryApi, identityApi }),
    }),
  ],
});

export const KialiPage = kialiPlugin.provide(
  createRoutableExtension({
    name: 'KialiPage',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: rootRouteRef,
  }),
);

export const EntityKialiResourcesCard = kialiPlugin.provide(
  createComponentExtension({
    name: 'EntityKialiResourcesCard',
    component: {
      lazy: () =>
        import('./dynamic/EntityKialiResourcesCard').then(
          m => m.EntityKialiResourcesCard,
        ),
    },
  }),
);

export const EntityKialiGraphCard = kialiPlugin.provide(
  createComponentExtension({
    name: 'EntityKialiGraphCard',
    component: {
      lazy: () =>
        import('./dynamic/EntityKialiGraphCard').then(
          m => m.EntityKialiGraphCard,
        ),
    },
  }),
);
/**
 * Props of EntityExampleComponent
 *
 * @public
 */
export type EntityKialiContentProps = {
  /**
   * Sets the refresh interval in milliseconds. The default value is 10000 (10 seconds)
   */
  refreshIntervalMs?: number;
};

export const EntityKialiContent: (
  props: EntityKialiContentProps,
) => JSX.Element = kialiPlugin.provide(
  createRoutableExtension({
    name: 'EntityKialiContent',
    component: () => import('./components/Router').then(m => m.EmbeddedRouter),
    mountPoint: rootRouteRef,
  }),
);
