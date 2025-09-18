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

import { configApiRef } from '@backstage/core-plugin-api';
import {
  ApiBlueprint,
  createFrontendPlugin,
} from '@backstage/frontend-plugin-api';
import {
  SearchFilterResultTypeBlueprint,
  SearchResultListItemBlueprint,
} from '@backstage/plugin-search-react/alpha';
import { StackOverflowClient, stackOverflowApiRef } from './api';
import { StackOverflowIcon } from './icons';

/** @alpha */
const stackOverflowApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: stackOverflowApiRef,
      deps: { configApi: configApiRef },
      factory: ({ configApi }) => StackOverflowClient.fromConfig(configApi),
    }),
});

/** @alpha */
const stackOverflowSearchResultListItem = SearchResultListItemBlueprint.make({
  params: {
    predicate: result => result.type === 'stack-overflow',
    component: () =>
      import('./search/StackOverflowSearchResultListItem').then(
        m => m.StackOverflowSearchResultListItem,
      ),
  },
});

const stackOverflowSearchFilterResultType =
  SearchFilterResultTypeBlueprint.make({
    params: {
      name: 'Stack Overflow',
      value: 'stack-overflow',
      icon: <StackOverflowIcon />,
    },
  });

/** @alpha */
export default createFrontendPlugin({
  pluginId: 'stack-overflow',
  // TODO: Migrate homepage cards when the declarative homepage plugin supports them
  extensions: [
    stackOverflowApi,
    stackOverflowSearchResultListItem,
    stackOverflowSearchFilterResultType,
  ],
});
