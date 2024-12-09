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
  createComponentExtension,
  createApiRef,
  discoveryApiRef,
  createApiFactory,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { LinkerdClient } from './api/client';

export const linkerdPluginRef = createApiRef<LinkerdClient>({
  id: 'plugin.linkerd.service',
});

/**
 * @public
 * The linkerd plugin
 */
export const linkerdPlugin = createPlugin({
  id: 'linkerd',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: linkerdPluginRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new LinkerdClient({ discoveryApi, fetchApi }),
    }),
  ],
});

/**
 * @public
 * A card that displays the dependencies of a Linkerd deployment
 */
export const LinkerdDependenciesCard = linkerdPlugin.provide(
  createComponentExtension({
    name: 'LinkerdDependenciesCard',
    component: {
      lazy: () =>
        import('./components/DependenciesCard').then(m => m.DependenciesCard),
    },
  }),
);

/**
 * @public
 * A banner that displays whether a component is meshed with Linkerd
 */
export const LinkerdIsMeshedBanner = linkerdPlugin.provide(
  createComponentExtension({
    name: 'LinkerdIsMeshedBanner',
    component: {
      lazy: () =>
        import('./components/IsMeshedBanner').then(m => m.IsMeshedBanner),
    },
  }),
);

/**
 * @public
 * A table providing information on the upstream and downstream requests for a component in Linkerd
 */
export const LinkerdEdgesTable = linkerdPlugin.provide(
  createComponentExtension({
    name: 'LinkerdEdgesTable',
    component: {
      lazy: () => import('./components/EdgesTable').then(m => m.EdgesTable),
    },
  }),
);
