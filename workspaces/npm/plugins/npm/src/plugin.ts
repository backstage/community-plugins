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
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { NpmBackendApiRef, NpmBackendClient } from './api';

/**
 * Backstage plugin.
 *
 * @public
 */
export const npmPlugin = createPlugin({
  id: 'npm',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: NpmBackendApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new NpmBackendClient({
          discoveryApi,
          fetchApi,
        }),
    }),
  ],
});

/**
 * Page content for the catalog (entity page) that shows two tables.
 * One for the latest tags and versions of a npm package.
 * And another one for the complete version history.
 *
 * @public
 */
export const EntityNpmReleaseTableCard = npmPlugin.provide(
  createComponentExtension({
    name: 'EntityNpmReleaseTableCard',
    component: {
      lazy: () =>
        import('./components/EntityNpmReleaseTableCard').then(
          m => m.EntityNpmReleaseTableCard,
        ),
    },
  }),
);

/**
 * @deprecated please use `EntityNpmReleaseTableCard` instead.
 * @public
 */
export const NpmReleaseTableCard = EntityNpmReleaseTableCard;

/**
 * Card for the catalog (entity page) that shows the npm
 * name, description, keywords, license, some links and
 * the latest version if available.
 *
 * @public
 */
export const EntityNpmInfoCard = npmPlugin.provide(
  createComponentExtension({
    name: 'EntityNpmInfoCard',
    component: {
      lazy: () =>
        import('./components/EntityNpmInfoCard').then(m => m.EntityNpmInfoCard),
    },
  }),
);

/**
 * @deprecated please use `EntityNpmInfoCard` instead.
 * @public
 */
export const NpmInfoCard = EntityNpmInfoCard;

/**
 * Card for the catalog (entity page) that shows the latest tags
 * with their version number and the release date.
 *
 * @public
 */
export const EntityNpmReleaseOverviewCard = npmPlugin.provide(
  createComponentExtension({
    name: 'EntityNpmReleaseOverviewCard',
    component: {
      lazy: () =>
        import('./components/EntityNpmReleaseOverviewCard').then(
          m => m.EntityNpmReleaseOverviewCard,
        ),
    },
  }),
);

/**
 * @deprecated please use `EntityNpmReleaseOverviewCard` instead.
 * @public
 */
export const NpmReleaseOverviewCard = EntityNpmReleaseOverviewCard;
