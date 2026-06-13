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
  ApiBlueprint,
  configApiRef,
  createFrontendPlugin,
  discoveryApiRef,
  FrontendPlugin,
  identityApiRef,
} from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';

import { QuayApiClient, quayApiRef } from './api';
import { isQuayAvailable } from './components/Router';
import { rootRouteRef, tagRouteRef } from './routes';

const quayApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: quayApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ discoveryApi, configApi, identityApi }) =>
        QuayApiClient.fromConfig({ discoveryApi, configApi, identityApi }),
    }),
});

const quayEntityContent = EntityContentBlueprint.make({
  name: 'quay',
  params: {
    path: '/quay',
    title: 'Quay',
    routeRef: rootRouteRef,
    filter: isQuayAvailable,
    loader: async () => import('./components/Router').then(m => <m.Router />),
  },
});

/**
 * Quay plugin
 *
 * @public
 */
const plugin: FrontendPlugin = createFrontendPlugin({
  pluginId: 'quay',
  extensions: [quayApi, quayEntityContent],
  routes: {
    root: rootRouteRef,
    tag: tagRouteRef,
  },
});

export default plugin;
