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

import { GithubDiscussionsDocument } from '@backstage-community/plugin-github-discussions-common';
import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import {
  SearchFilterResultTypeBlueprint,
  SearchResultListItemBlueprint,
} from '@backstage/plugin-search-react/alpha';
import SpeakerNotesIcon from '@material-ui/icons/SpeakerNotes';
import { compatWrapper } from '@backstage/core-compat-api';

function isGithubDiscussionsDocument(
  result: any,
): result is GithubDiscussionsDocument {
  return result.entityRef;
}

/** @alpha */
export const githubDiscussionsSearchResultListItem =
  SearchResultListItemBlueprint.makeWithOverrides({
    config: {
      schema: {
        lineClamp: z => z.number().default(5),
      },
    },
    factory(originalFactory, { config }) {
      return originalFactory({
        predicate: result => result.type === 'github-discussions',
        component: async () => {
          const { GithubDiscussionsSearchResultListItem } = await import(
            '../components/GithubDiscussionsSearchResultListItem'
          );
          return ({ result, ...rest }) =>
            compatWrapper(
              isGithubDiscussionsDocument(result) ? (
                <GithubDiscussionsSearchResultListItem
                  {...rest}
                  {...config}
                  result={result}
                />
              ) : null,
            );
        },
      });
    },
  });

/** @alpha */
const githubDiscussionsSearchFilterResultType =
  SearchFilterResultTypeBlueprint.make({
    name: 'github-discussions-results-type',
    params: {
      value: 'github-discussions',
      name: 'GitHub Discussions',
      icon: <SpeakerNotesIcon />,
    },
  });

/** @alpha */
export default createFrontendPlugin({
  pluginId: 'github-discussions',
  extensions: [
    githubDiscussionsSearchResultListItem,
    githubDiscussionsSearchFilterResultType,
  ],
});
