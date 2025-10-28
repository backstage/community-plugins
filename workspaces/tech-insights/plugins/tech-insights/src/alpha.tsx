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
  createFrontendPlugin,
  discoveryApiRef,
  identityApiRef,
  ApiBlueprint,
  NavItemBlueprint,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import {
  EntityCardBlueprint,
  EntityContentBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import {
  compatWrapper,
  convertLegacyRouteRef,
  convertLegacyRouteRefs,
} from '@backstage/core-compat-api';
import {
  techInsightsApiRef,
  TechInsightsClient,
} from '@backstage-community/plugin-tech-insights-react';
import EmojiObjectsIcon from '@material-ui/icons/EmojiObjects';
import { rootRouteRef } from './routes';

/** @alpha */
const techInsightsNavItem = NavItemBlueprint.make({
  params: {
    icon: EmojiObjectsIcon,
    routeRef: convertLegacyRouteRef(rootRouteRef),
    title: 'Tech Insights',
  },
});

/** @alpha */
const techInsightsApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: techInsightsApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ discoveryApi, identityApi }) =>
        new TechInsightsClient({ discoveryApi, identityApi }),
    }),
});

/** @alpha */
const entityScorecardContent = EntityContentBlueprint.make({
  name: 'scorecard',
  params: {
    path: '/scorecard',
    title: 'Scorecard',
    group: 'insights',
    loader: () =>
      import('./components/ScorecardsContent').then(m =>
        compatWrapper(<m.ScorecardsContent title="Scorecard" />),
      ),
  },
});

/** @alpha */
const entityComponentScorecardCard = EntityCardBlueprint.make({
  name: 'scorecard',
  params: {
    filter: 'kind:component',
    loader: async () =>
      import('./components/ScorecardsCard').then(m =>
        compatWrapper(<m.ScorecardsCard title="Scorecard" />),
      ),
  },
});

/** @alpha */
const scorecardPage = PageBlueprint.make({
  params: {
    path: '/tech-insights',
    routeRef: convertLegacyRouteRef(rootRouteRef),
    loader: () =>
      import('./components/ScorecardsPage').then(m =>
        compatWrapper(<m.ScorecardsPage />),
      ),
  },
});

/** @alpha */
export default createFrontendPlugin({
  pluginId: 'tech-insights',
  extensions: [
    techInsightsNavItem,
    techInsightsApi,
    entityScorecardContent,
    entityComponentScorecardCard,
    scorecardPage,
  ],
  routes: convertLegacyRouteRefs({
    root: rootRouteRef,
  }),
});
