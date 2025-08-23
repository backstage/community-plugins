/*
 * Copyright 2023 The Backstage Authors
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

import LayersIcon from '@material-ui/icons/Layers';
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
  NavItemBlueprint,
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
    routeRef: convertLegacyRouteRef(exploreRouteRef),
    loader: async () =>
      import('./components/ExplorePage').then(m =>
        compatWrapper(<m.ExplorePage />),
      ),
  },
});

/** @alpha */
const exploreNavItem = NavItemBlueprint.make({
  params: {
    icon: LayersIcon,
    routeRef: convertLegacyRouteRef(exploreRouteRef),
    title: 'Explore',
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
  extensions: [
    exploreApi,
    explorePage,
    exploreNavItem,
    exploreSearchResultListItem,
  ],
  routes: convertLegacyRouteRefs({
    explore: exploreRouteRef,
  }),
});
