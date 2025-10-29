/*
 * Copyright 2024 The Backstage Authors
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
import { createElement } from 'react';
import { convertLegacyRouteRefs } from '@backstage/core-compat-api';
import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import {
  SearchFilterResultTypeBlueprint,
  SearchResultListItemBlueprint,
} from '@backstage/plugin-search-react/alpha';
import { ConfluenceSearchIcon } from './icons';
import { rootRouteRef } from './routes';

const confluenceSearchResultListItem = SearchResultListItemBlueprint.make({
  name: 'search-result',
  params: {
    component: async () => {
      const { ConfluenceSearchResultListItem } = await import(
        './search/ConfluenceSearchResultListItem'
      );
      return ConfluenceSearchResultListItem;
    },
    predicate: result => {
      return result.type === 'confluence';
    },
  },
});

const confluenceSearchFilterResultType = SearchFilterResultTypeBlueprint.make({
  name: 'confluence-results-type',
  params: {
    value: 'confluence',
    name: 'Confluence',
    icon: createElement(ConfluenceSearchIcon),
  },
});

/**
 * @alpha
 */
export default createFrontendPlugin({
  pluginId: 'confluence',
  routes: convertLegacyRouteRefs({
    entityContent: rootRouteRef,
  }),
  extensions: [
    confluenceSearchResultListItem,
    confluenceSearchFilterResultType,
  ],
});
