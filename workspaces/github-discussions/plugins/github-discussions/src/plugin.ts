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
  SearchResultListItemExtensionProps,
  createSearchResultListItemExtension,
} from '@backstage/plugin-search-react';
import { GithubDiscussionsSearchResultListItemProps } from './components/GithubDiscussionsSearchResultListItem';

export const githubDiscussionsPlugin = createPlugin({
  id: 'github-discussions',
});

/**
 * @public
 */
export const GithubDiscussionsSearchResultListItem: (
  props: SearchResultListItemExtensionProps<GithubDiscussionsSearchResultListItemProps>,
) => JSX.Element | null = githubDiscussionsPlugin.provide(
  createSearchResultListItemExtension({
    name: 'GithubDiscussionsSearchResultListItem',
    component: () =>
      import('./components/GithubDiscussionsSearchResultListItem').then(
        m => m.GithubDiscussionsSearchResultListItem,
      ),
    predicate: result => result.type === 'github-discussions',
  }),
);
