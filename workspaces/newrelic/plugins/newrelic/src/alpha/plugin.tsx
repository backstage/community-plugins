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
  PageBlueprint,
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
  NavItemBlueprint,
} from '@backstage/frontend-plugin-api';
import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import ExtensionIcon from '@material-ui/icons/ExtensionOutlined';

import { newRelicApiRef, NewRelicClient } from '../api';
import { rootRouteRef } from '../plugin';

/** @alpha */
export const newRelicApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: newRelicApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new NewRelicClient({ discoveryApi, fetchApi }),
    }),
});

/** @alpha */
export const newRelicPage = PageBlueprint.make({
  params: {
    path: '/new-relic',
    routeRef: convertLegacyRouteRef(rootRouteRef),
    loader: () =>
      import('../components/NewRelicComponent').then(m =>
        compatWrapper(<m.NewRelicComponent />),
      ),
  },
});

/** @alpha */
export const newRelicNavItem = NavItemBlueprint.make({
  params: {
    routeRef: convertLegacyRouteRef(rootRouteRef),
    title: 'New Relic',
    icon: ExtensionIcon,
  },
});

/** @alpha */
export default createFrontendPlugin({
  pluginId: 'newrelic',
  extensions: [newRelicApi, newRelicPage, newRelicNavItem],
});
