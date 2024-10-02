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
import { GithubSearchResultListItemProps } from './components';

export const searchGithubPlugin = createPlugin({
  id: 'search-github',
});

/** @public */
export const GithubSearchResultListItem: (
  props: SearchResultListItemExtensionProps<GithubSearchResultListItemProps>,
) => JSX.Element | null = searchGithubPlugin.provide(
  createSearchResultListItemExtension({
    name: 'GithubSearchResultListItem',
    component: () =>
      import('./components/GitHubSearchResultListItem').then(
        m => m.GithubSearchResultListItem,
      ),
    predicate: result => result.type === 'github',
  }),
);
