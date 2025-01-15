/*
 * Copyright 2025 The Backstage Authors
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

import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { maturityApiRef, MaturityClient } from './api';
import { rootRouteRef } from './routes';

/**
 * @public
 */
export const techInsightsMaturityPlugin = createPlugin({
  id: 'tech-insights-maturity',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: maturityApiRef,
      deps: {
        catalogApi: catalogApiRef,
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ catalogApi, discoveryApi, identityApi }) =>
        new MaturityClient({
          catalogApi,
          discoveryApi,
          identityApi,
        }),
    }),
  ],
});

/**
 * @public
 */
export const EntityMaturityScorecardContent =
  techInsightsMaturityPlugin.provide(
    createRoutableExtension({
      name: 'EntityMaturityScorecardContent',
      component: () => import('./ScoreRouter').then(m => m.ScoreRouter),
      mountPoint: rootRouteRef,
    }),
  );

/**
 * @public
 */
export const EntityMaturitySummaryContent = techInsightsMaturityPlugin.provide(
  createRoutableExtension({
    name: 'EntityMaturitySummaryContent',
    component: () => import('./SummaryRouter').then(m => m.SummaryRouter),
    mountPoint: rootRouteRef,
  }),
);

/**
 * @public
 */
export const EntityMaturityRankWidget = techInsightsMaturityPlugin.provide(
  createComponentExtension({
    name: 'EntityMaturityRankWidget',
    component: {
      lazy: () =>
        import('./components/MaturityRankWidget').then(
          m => m.MaturityRankWidget,
        ),
    },
  }),
);

/**
 * @public
 */
export const MaturityPage = techInsightsMaturityPlugin.provide(
  createComponentExtension({
    name: 'MaturityPage',
    component: {
      lazy: () => import('./components/MaturityPage').then(m => m.MaturityPage),
    },
  }),
);

/**
 * @public
 */
export const EntityMaturitySummaryCard = techInsightsMaturityPlugin.provide(
  createComponentExtension({
    name: 'MaturitySummaryInfoCard',
    component: {
      lazy: () =>
        import('./components/MaturitySummaryInfoCard').then(
          m => m.MaturitySummaryInfoCard,
        ),
    },
  }),
);

export const MaturityChartCard = techInsightsMaturityPlugin.provide(
  createComponentExtension({
    name: 'MaturityChartCard',
    component: {
      lazy: () =>
        import('./components/MaturityChartCard').then(m => m.MaturityChartCard),
    },
  }),
);
