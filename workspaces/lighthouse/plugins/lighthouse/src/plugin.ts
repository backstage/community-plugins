/*
 * Copyright 2020 The Backstage Authors
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

import { LighthouseRestApi } from '@backstage-community/plugin-lighthouse-common';
import { lighthouseApiRef } from './api';
import {
  createPlugin,
  createRouteRef,
  createApiFactory,
  configApiRef,
  createRoutableExtension,
  createComponentExtension,
} from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'lighthouse',
});

export const viewAuditRouteRef = createRouteRef({
  id: 'lighthouse:audit',
});

export const createAuditRouteRef = createRouteRef({
  id: 'lighthouse:create-audit',
});

export const entityContentRouteRef = createRouteRef({
  id: 'lighthouse:entity-content',
});

/** @public */
export const lighthousePlugin = createPlugin({
  id: 'lighthouse',
  apis: [
    createApiFactory({
      api: lighthouseApiRef,
      deps: { configApi: configApiRef },
      factory: ({ configApi }) => LighthouseRestApi.fromConfig(configApi),
    }),
  ],
  routes: {
    root: createAuditRouteRef,
    entityContent: entityContentRouteRef,
  },
});

/** @public */
export const LighthousePage = lighthousePlugin.provide(
  createRoutableExtension({
    name: 'LighthousePage',
    component: () => import('./Router').then(m => m.Router),
    mountPoint: rootRouteRef,
  }),
);

/** @public */
export const EntityLighthouseContent = lighthousePlugin.provide(
  createRoutableExtension({
    name: 'EntityLighthouseContent',
    component: () => import('./Router').then(m => m.EmbeddedRouter),
    mountPoint: entityContentRouteRef,
  }),
);

/** @public */
export const EntityLastLighthouseAuditCard = lighthousePlugin.provide(
  createComponentExtension({
    name: 'EntityLastLighthouseAuditCard',
    component: {
      lazy: () =>
        import('./components/Cards').then(m => m.LastLighthouseAuditCard),
    },
  }),
);
