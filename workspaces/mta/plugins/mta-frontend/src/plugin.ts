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
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  identityApiRef,
  configApiRef,
} from '@backstage/core-plugin-api';
import { createApiFactory } from '@backstage/frontend-plugin-api';

import { rootRouteRef } from './routes';
import { mtaApiRef, DefaultMtaApi } from './api/api';

/**
 * The frontend MTA plugin for Backstage.
 *
 * Provides entity driven plugin for analyzing MTA applications.
 *
 * @public
 */

export const mtaPlugin = createPlugin({
  id: 'mta',
  apis: [
    createApiFactory({
      api: mtaApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
        config: configApiRef,
      },
      factory: ({ discoveryApi, identityApi }) => {
        return new DefaultMtaApi({ discoveryApi, identityApi });
      },
    }),
  ],
  routes: {
    entityContent: rootRouteRef,
  },
});

/**
 * The main content extension for the frontend MTA plugin.
 *
 * This extension mounts the main `App` component of the MTA plugin at the defined `entityContent` route.
 *
 * @public
 */

export const EntityMTAContent = mtaPlugin.provide(
  createRoutableExtension({
    name: 'EntityMTAContent',
    component: () => import('./components/App/App').then(m => m.App),
    mountPoint: rootRouteRef,
  }),
);
