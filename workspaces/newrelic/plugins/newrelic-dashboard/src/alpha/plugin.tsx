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
  createApiFactory,
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { compatWrapper } from '@backstage/core-compat-api';
import {
  EntityCardBlueprint,
  EntityContentBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import { newRelicDashboardApiRef, NewRelicDashboardClient } from '../api';

/** @alpha */
export const newRelicApi = ApiBlueprint.make({
  params: {
    factory: createApiFactory({
      api: newRelicDashboardApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new NewRelicDashboardClient({ discoveryApi, fetchApi }),
    }),
  },
});

/** @alpha */
export const newRelicDashboardEntityContent = EntityContentBlueprint.make({
  name: 'EntityNewRelicDashboardContent',
  params: {
    defaultPath: '/newrelic-dashboard',
    defaultTitle: 'New Relic Dashboard',
    loader: () => import('../Router').then(m => compatWrapper(<m.Router />)),
  },
});

/** @alpha */
export const newRelicDashboardCard = EntityCardBlueprint.make({
  name: 'EntityNewRelicDashboardCard',
  params: {
    loader: async () =>
      import('../components/NewRelicDashboard/DashboardEntityList').then(m =>
        compatWrapper(<m.DashboardEntityList />),
      ),
  },
});

/** @alpha */
export default createFrontendPlugin({
  pluginId: 'newrelic-dashboard',
  extensions: [
    newRelicApi,
    newRelicDashboardEntityContent,
    newRelicDashboardCard,
  ],
});
