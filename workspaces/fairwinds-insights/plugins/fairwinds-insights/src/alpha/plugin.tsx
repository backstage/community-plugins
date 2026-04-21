/*
 * Copyright 2026 The Backstage Authors
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
  ApiBlueprint,
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';

import { FairwindsInsightsClient, fairwindsInsightsApiRef } from '../api';
import {
  entityActionItemsCard,
  entityActionItemsTopCard,
  entityMTDCostOverviewCard,
  entityResourcesHistoryCPUCard,
  entityResourcesHistoryMemoryCard,
  entityResourcesHistoryPodCountCard,
  entityVulnerabilitiesCard,
} from './entityCards';

/**
 * Registers the Fairwinds Insights API with the app.
 *
 * @alpha
 */
export const fairwindsInsightsApiExtension = ApiBlueprint.make({
  name: 'api',
  params: defineParams =>
    defineParams({
      api: fairwindsInsightsApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new FairwindsInsightsClient({ discoveryApi, fetchApi }),
    }),
});

/**
 * Backstage frontend plugin (new frontend system).
 *
 * @alpha
 */
const fairwindsInsightsFrontendPlugin = createFrontendPlugin({
  pluginId: 'fairwinds-insights',
  extensions: [
    fairwindsInsightsApiExtension,
    entityVulnerabilitiesCard,
    entityMTDCostOverviewCard,
    entityActionItemsTopCard,
    entityActionItemsCard,
    entityResourcesHistoryPodCountCard,
    entityResourcesHistoryCPUCard,
    entityResourcesHistoryMemoryCard,
  ],
});

export default fairwindsInsightsFrontendPlugin;
