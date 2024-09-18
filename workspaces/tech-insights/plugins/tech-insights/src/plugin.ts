/*
 * Copyright 2021 The Backstage Authors
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
  createRoutableExtension,
  createApiFactory,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';
import { techInsightsApiRef } from './api/TechInsightsApi';
import { TechInsightsClient } from './api/TechInsightsClient';

/**
 * @public
 */
export const techInsightsPlugin = createPlugin({
  id: 'tech-insights',
  apis: [
    createApiFactory({
      api: techInsightsApiRef,
      deps: { discoveryApi: discoveryApiRef, identityApi: identityApiRef },
      factory: ({ discoveryApi, identityApi }) =>
        new TechInsightsClient({ discoveryApi, identityApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

/**
 * @public
 */
export const ScorecardInfo = techInsightsPlugin.provide(
  createComponentExtension({
    name: 'ScorecardInfo',
    component: {
      lazy: () =>
        import('./components/ScorecardsInfo').then(m => m.ScorecardInfo),
    },
  }),
);

/**
 * @public
 */
export const ScorecardsList = techInsightsPlugin.provide(
  createComponentExtension({
    name: 'ScorecardsList',
    component: {
      lazy: () =>
        import('./components/ScorecardsList').then(m => m.ScorecardsList),
    },
  }),
);

/**
 * @public
 */
export const EntityTechInsightsScorecardContent = techInsightsPlugin.provide(
  createRoutableExtension({
    name: 'EntityTechInsightsScorecardContent',
    component: () =>
      import('./components/ScorecardsContent').then(m => m.ScorecardsContent),
    mountPoint: rootRouteRef,
  }),
);

/**
 * @public
 */
export const EntityTechInsightsScorecardCard = techInsightsPlugin.provide(
  createRoutableExtension({
    name: 'EntityTechInsightsScorecardCard',
    component: () =>
      import('./components/ScorecardsCard').then(m => m.ScorecardsCard),
    mountPoint: rootRouteRef,
  }),
);

/**
 * @public
 */
export const TechInsightsScorecardPage = techInsightsPlugin.provide(
  createRoutableExtension({
    name: 'TechInsightsScorecardPage',
    component: () =>
      import('./components/ScorecardsPage').then(m => m.ScorecardsPage),
    mountPoint: rootRouteRef,
  }),
);

/**
 * @public
 */
export const TechInsightsCheckIcon = techInsightsPlugin.provide(
  createComponentExtension({
    name: 'TechInsightsCheckIcon',
    component: {
      lazy: () =>
        import('./components/ResultCheckIcon').then(m => m.ResultCheckIcon),
    },
  }),
);

/**
 * @public
 */
export const TechInsightsLinksMenu = techInsightsPlugin.provide(
  createComponentExtension({
    name: 'TechInsightsLinksMenu',
    component: {
      lazy: () =>
        import('./components/ResultLinksMenu').then(m => m.ResultLinksMenu),
    },
  }),
);
