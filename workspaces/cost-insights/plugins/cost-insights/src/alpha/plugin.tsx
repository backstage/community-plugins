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
  PageBlueprint,
  NavItemBlueprint,
  createFrontendPlugin,
  ApiBlueprint,
} from '@backstage/frontend-plugin-api';
import {
  compatWrapper,
  convertLegacyRouteRef,
  convertLegacyRouteRefs,
} from '@backstage/core-compat-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import MoneyIcon from '@material-ui/icons/MonetizationOn';
import { rootRouteRef } from '../routes';
import { costInsightsApiRef } from '../api';
import { ExampleCostInsightsClient } from '../example';

/** @alpha */
export const CostInsightsApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: costInsightsApiRef,
      deps: {},
      factory: ({}) => new ExampleCostInsightsClient(),
    }),
});

/** @alpha */
export const CostInsightsPage = PageBlueprint.make({
  params: {
    path: '/cost-insights',
    routeRef: convertLegacyRouteRef(rootRouteRef),
    loader: () =>
      import('./router').then(m => compatWrapper(<m.CostInsightsRouter />)),
  },
});

/** @alpha */
export const EntityCostInsightsContent = EntityContentBlueprint.make({
  name: 'EntityCostInsightsContent',
  params: {
    path: '/cost-insights',
    title: 'Cost Insights',
    loader: () =>
      import('../components/EntityCosts').then(m =>
        compatWrapper(<m.EntityCosts />),
      ),
  },
});

/**
 * @alpha
 */
export const CostInsightsNavItem = NavItemBlueprint.make({
  params: {
    title: 'Cost Insights',
    routeRef: convertLegacyRouteRef(rootRouteRef),
    icon: MoneyIcon,
  },
});

export default createFrontendPlugin({
  pluginId: 'cost-insights',
  extensions: [CostInsightsApi, CostInsightsPage, CostInsightsNavItem],
  routes: convertLegacyRouteRefs({
    root: rootRouteRef,
  }),
});
