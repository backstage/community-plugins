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
  createComponentExtension,
  createPlugin,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

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
});

/**
 * Page content for the catalog (entiy page) that shows two tables.
 * One for the latest tags and versions of a npm package.
 * And another one for the complete version history.
 *  @public
 */
export const EntityNpmReleaseTableCard = npmPlugin.provide(
  createComponentExtension({
    name: 'EntityNpmReleaseTableCard',
    component: {
      lazy: () =>
        import('./components/NpmReleaseTableCard').then(
          m => m.NpmReleaseTableCard,
        ),
    },
  }),
);

/**
 *
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
      lazy: () => import('./components/NpmInfoCard').then(m => m.NpmInfoCard),
    },
  }),
);

/**
 * Card for the catalog (entiy page) that shows the latest tags
 * with their version number and the release date.
 *
 * @public
 */
export const EntityNpmReleaseOverviewCard = npmPlugin.provide(
  createComponentExtension({
    name: 'EntityNpmReleaseOverviewCard',
    component: {
      lazy: () =>
        import('./components/NpmReleaseOverviewCard').then(
          m => m.NpmReleaseOverviewCard,
        ),
    },
  }),
);
