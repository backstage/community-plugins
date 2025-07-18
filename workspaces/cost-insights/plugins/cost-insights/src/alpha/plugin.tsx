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
} from '@backstage/frontend-plugin-api';
import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import MoneyIcon from '@material-ui/icons/MonetizationOn';
import {
  projectGrowthAlertRef,
  rootRouteRef,
  unlabeledDataflowAlertRef,
} from '../routes';

/** @alpha */
export const CostInsightsPage = PageBlueprint.make({
  params: {
    defaultPath: '/cost-insights',
    routeRef: convertLegacyRouteRef(rootRouteRef),
    loader: () =>
      import('../components/CostInsightsPage').then(m =>
        compatWrapper(<m.CostInsightsPage />),
      ),
  },
});

/** @alpha */
export const CostInsightsProjectGrowthInstructionsPage = PageBlueprint.make({
  params: {
    defaultPath: '/cost-insights/investigating-growth',
    routeRef: convertLegacyRouteRef(projectGrowthAlertRef),
    loader: () =>
      import('../components/ProjectGrowthInstructionsPage').then(m =>
        compatWrapper(<m.ProjectGrowthInstructionsPage />),
      ),
  },
});

/** @alpha */
export const CostInsightsLabelDataflowInstructionsPage = PageBlueprint.make({
  params: {
    defaultPath: '/cost-insights/labeling-jobs',
    routeRef: convertLegacyRouteRef(unlabeledDataflowAlertRef),
    loader: () =>
      import('../components/LabelDataflowInstructionsPage').then(m =>
        compatWrapper(<m.LabelDataflowInstructionsPage />),
      ),
  },
});

/** @alpha */
export const EntityCostInsightsContent = EntityContentBlueprint.make({
  name: 'EntityCostInsightsContent',
  params: {
    defaultPath: '/cost-insights',
    defaultTitle: 'Cost Insights',
    routeRef: convertLegacyRouteRef(rootRouteRef),
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
