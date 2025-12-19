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

import { createExtensionBlueprint } from '@backstage/frontend-plugin-api';

import { ManageTechInsightsConfig } from './types';
import { manageTechInsightsConfigDataRef } from './data-refs';

/**
 * Blueprint for configuring the Manage Tech Insights module.
 *
 * @public
 */
export const ManageTechInsightsBlueprint = createExtensionBlueprint({
  kind: 'manage-tech-insights',
  attachTo: { id: 'manage-provider:tech-insights/provider', input: 'config' },
  output: [manageTechInsightsConfigDataRef],
  config: {
    schema: {
      showEmpty: z =>
        z.union([z.boolean(), z.record(z.string(), z.boolean())]).optional(),
    },
  },
  *factory(params: ManageTechInsightsConfig, { config }) {
    if (typeof params.showEmpty === 'undefined') {
      params.showEmpty = config.showEmpty;
    }

    yield manageTechInsightsConfigDataRef(params);
  },
});
