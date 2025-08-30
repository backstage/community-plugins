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
import { createPlugin } from '@backstage/core-plugin-api';
import {
  createSearchResultListItemExtension,
  SearchResultListItemExtensionProps,
} from '@backstage/plugin-search-react';
import { ConfluenceResultItemProps } from './search/ConfluenceSearchResultListItem';

/**
 * The Backstage plugin that holds Confluence specific components
 *
 * @public
 */
export const confluencePlugin = createPlugin({
  id: 'confluence',
});

/**
 * @public
 */
export const ConfluenceSearchResultListItem: (
  props: SearchResultListItemExtensionProps<ConfluenceResultItemProps>,
) => JSX.Element | null = confluencePlugin.provide(
  createSearchResultListItemExtension({
    name: 'ConfluenceSearchResultListItem',
    component: () =>
      import('./search/ConfluenceSearchResultListItem').then(
        m => m.ConfluenceSearchResultListItem,
      ),
    predicate: result => result.type === 'confluence',
  }),
);
