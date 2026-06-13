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

import { RiStackLine } from '@remixicon/react';
import {
  compatWrapper,
  convertLegacyRouteRef,
  convertLegacyRouteRefs,
} from '@backstage/core-compat-api';
import {
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
  ApiBlueprint,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import { SearchResultListItemBlueprint } from '@backstage/plugin-search-react/alpha';
import { exploreApiRef, ExploreClient } from './api';
import { exploreRouteRef } from './routes';

/** @alpha */
const exploreApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: exploreApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new ExploreClient({ discoveryApi, fetchApi }),
    }),
});

/** @alpha */
const explorePage = PageBlueprint.make({
  params: {
    path: '/explore',
    title: 'Explore',
    icon: <RiStackLine />,
    routeRef: convertLegacyRouteRef(exploreRouteRef),
    // TODO: Revisit once Backstage core supports rendering plugin headers
    // without the wrapping PageLayout header. For now we opt out of the
    // default header so `PluginHeader` (used inside `ExploreLayout`) is the
    // only header rendered.
    noHeader: true,
    loader: async () =>
      import('./components/ExplorePage').then(m =>
        compatWrapper(<m.ExplorePage />),
      ),
  },
});

/** @alpha */
export const exploreSearchResultListItem = SearchResultListItemBlueprint.make({
  params: {
    predicate: result => result.type === 'tools',
    component: () =>
      import('./components/ToolSearchResultListItem').then(
        m => m.ToolSearchResultListItem,
      ),
  },
});

/** @alpha */
export default createFrontendPlugin({
  pluginId: 'explore',
  extensions: [exploreApi, explorePage, exploreSearchResultListItem],
  routes: convertLegacyRouteRefs({
    explore: exploreRouteRef,
  }),
});
