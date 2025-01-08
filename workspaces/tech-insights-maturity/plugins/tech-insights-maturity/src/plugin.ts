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
import { scoringDataApiRef, ScoringDataClient } from './api';
import { rootRouteRef } from './routes';

export const techInsightsMaturityPlugin = createPlugin({
  id: 'tech-insights-maturity',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: scoringDataApiRef,
      deps: {
        catalogApi: catalogApiRef,
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ catalogApi, discoveryApi, identityApi }) =>
        new ScoringDataClient({
          catalogApi,
          discoveryApi,
          identityApi,
        }),
    }),
  ],
});

export const MaturityScorePage = techInsightsMaturityPlugin.provide(
  createRoutableExtension({
    name: 'MaturityScorePage',
    component: () => import('./ScoreRouter').then(m => m.ScoreRouter),
    mountPoint: rootRouteRef,
  }),
);

export const MaturitySummaryPage = techInsightsMaturityPlugin.provide(
  createRoutableExtension({
    name: 'MaturitySummaryPage',
    component: () => import('./SummaryRouter').then(m => m.SummaryRouter),
    mountPoint: rootRouteRef,
  }),
);

export const MaturityRankWidget = techInsightsMaturityPlugin.provide(
  createComponentExtension({
    name: 'MaturityRankWidget',
    component: {
      lazy: () =>
        import('./components/MaturityRankWidget').then(
          m => m.MaturityRankWidget,
        ),
    },
  }),
);

export const MaturityPage = techInsightsMaturityPlugin.provide(
  createComponentExtension({
    name: 'MaturityPage',
    component: {
      lazy: () => import('./components/MaturityPage').then(m => m.MaturityPage),
    },
  }),
);

export const MaturitySummaryInfoCard = techInsightsMaturityPlugin.provide(
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

export const MaturityRankAvatar = techInsightsMaturityPlugin.provide(
  createComponentExtension({
    name: 'MaturityRankAvatar',
    component: {
      lazy: () =>
        import('./components/MaturityRankAvatar').then(
          m => m.MaturityRankAvatar,
        ),
    },
  }),
);

export const MaturityBreakdownTable = techInsightsMaturityPlugin.provide(
  createComponentExtension({
    name: 'MaturityBreakdownTable',
    component: {
      lazy: () =>
        import('./components/MaturityBreakdownTable').then(
          m => m.MaturityBreakdownTable,
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

export const MaturityRankInfoCard = techInsightsMaturityPlugin.provide(
  createComponentExtension({
    name: 'MaturityChartCard',
    component: {
      lazy: () =>
        import('./components/MaturityRankInfoCard').then(
          m => m.MaturityRankInfoCard,
        ),
    },
  }),
);

export const MaturitySummaryTable = techInsightsMaturityPlugin.provide(
  createComponentExtension({
    name: 'MaturityChartCard',
    component: {
      lazy: () =>
        import('./components/MaturitySummaryTable').then(
          m => m.MaturitySummaryTable,
        ),
    },
  }),
);
