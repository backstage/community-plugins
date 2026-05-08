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
  ApiBlueprint,
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';

import { fireHydrantApiRef, FireHydrantAPIClient } from './api';
import { isFireHydrantAvailable } from './components/hooks';

/**
 * API extension for communicating with the FireHydrant proxy.
 *
 * @alpha
 */
export const fireHydrantApi = ApiBlueprint.make({
  name: 'fireHydrantApi',
  params: defineParams =>
    defineParams({
      api: fireHydrantApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new FireHydrantAPIClient({ discoveryApi, fetchApi }),
    }),
});

/**
 * Entity card that displays FireHydrant service details, incidents, and analytics.
 *
 * @alpha
 */
export const entityFirehydrantCard = EntityCardBlueprint.make({
  name: 'service-details',
  params: {
    filter: isFireHydrantAvailable,
    loader: () =>
      import('./components/ServiceDetailsCard').then(m => (
        <m.ServiceDetailsCard />
      )),
  },
});

/**
 * @alpha
 */
export default createFrontendPlugin({
  pluginId: 'firehydrant',
  extensions: [fireHydrantApi, entityFirehydrantCard],
  routes: {},
});
