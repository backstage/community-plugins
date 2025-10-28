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
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import {
  EntityCardBlueprint,
  EntityContentBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import {
  compatWrapper,
  convertLegacyRouteRef,
  convertLegacyRouteRefs,
} from '@backstage/core-compat-api';
import EmojiObjectsIcon from '@material-ui/icons/EmojiObjects';
import { maturityApiRef, MaturityClient } from './api';
import { rootRouteRef } from './routes';

/** @alpha */
const techInsightsMaturityNavItem = NavItemBlueprint.make({
  params: {
    icon: EmojiObjectsIcon,
    routeRef: convertLegacyRouteRef(rootRouteRef),
    title: 'Tech Insights Maturity',
  },
});

/** @alpha */
const techInsightsMaturityApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: maturityApiRef,
      deps: {
        catalogApi: catalogApiRef,
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ catalogApi, discoveryApi, identityApi }) =>
        new MaturityClient({ catalogApi, discoveryApi, identityApi }),
    }),
});

/** @alpha */
const entityComponentMaturityContent = EntityContentBlueprint.make({
  name: 'component-maturity',
  params: {
    filter: 'kind:component',
    path: '/maturity',
    title: 'Maturity',
    group: 'insights',
    loader: () =>
      import('./ScoreRouter').then(m => compatWrapper(<m.ScoreRouter />)),
  },
});

/** @alpha */
const entityDomainMaturityContent = EntityContentBlueprint.make({
  name: 'domain-maturity',
  params: {
    filter: 'kind:domain',
    path: '/maturity',
    title: 'Maturity',
    group: 'insights',
    loader: () =>
      import('./SummaryRouter').then(m => compatWrapper(<m.SummaryRouter />)),
  },
});

/** @alpha */
const entityGroupMaturityContent = EntityContentBlueprint.make({
  name: 'group-maturity',
  params: {
    filter: 'kind:group',
    path: '/maturity',
    title: 'Maturity',
    group: 'insights',
    loader: () =>
      import('./SummaryRouter').then(m => compatWrapper(<m.SummaryRouter />)),
  },
});

/** @alpha */
const entitySystemMaturityContent = EntityContentBlueprint.make({
  name: 'system-maturity',
  params: {
    filter: 'kind:system',
    path: '/maturity',
    title: 'Maturity',
    group: 'insights',
    loader: () =>
      import('./SummaryRouter').then(m => compatWrapper(<m.SummaryRouter />)),
  },
});

/** @alpha */
const maturityPage = PageBlueprint.make({
  params: {
    path: '/tech-insights-maturity',
    routeRef: convertLegacyRouteRef(rootRouteRef),
    loader: () =>
      import('./components/MaturityPage').then(m =>
        compatWrapper(<m.MaturityPage />),
      ),
  },
});

/** @alpha */
const entityMaturitySummaryCard = EntityCardBlueprint.make({
  name: 'maturity-summary',
  params: {
    loader: async () =>
      import('./components/MaturitySummaryInfoCard').then(m =>
        compatWrapper(<m.MaturitySummaryInfoCard />),
      ),
    type: 'summary',
  },
});

/** @alpha */
export default createFrontendPlugin({
  pluginId: 'tech-insights-maturity',
  extensions: [
    techInsightsMaturityNavItem,
    techInsightsMaturityApi,
    entityComponentMaturityContent,
    entityDomainMaturityContent,
    entityGroupMaturityContent,
    entitySystemMaturityContent,
    maturityPage,
    entityMaturitySummaryCard,
  ],
  routes: convertLegacyRouteRefs({
    root: rootRouteRef,
  }),
});
