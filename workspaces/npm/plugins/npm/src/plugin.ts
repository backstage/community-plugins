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

/** @public */
export const NpmReleaseTableCard = npmPlugin.provide(
  createComponentExtension({
    name: 'NpmReleaseTableCard',
    component: {
      lazy: () =>
        import('./components/NpmReleaseTableCard').then(
          m => m.NpmReleaseTableCard,
        ),
    },
  }),
);

/** @public */
export const NpmInfoCard = npmPlugin.provide(
  createComponentExtension({
    name: 'NpmInfoCard',
    component: {
      lazy: () => import('./components/NpmInfoCard').then(m => m.NpmInfoCard),
    },
  }),
);

/** @public */
export const NpmReleaseOverviewCard = npmPlugin.provide(
  createComponentExtension({
    name: 'NpmReleaseOverviewCard',
    component: {
      lazy: () =>
        import('./components/NpmReleaseOverviewCard').then(
          m => m.NpmReleaseOverviewCard,
        ),
    },
  }),
);
