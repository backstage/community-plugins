/*
 * Copyright 2022 The Backstage Authors
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

import { useApi } from '@backstage/core-plugin-api';
import useAsyncRetry from 'react-use/esm/useAsyncRetry';
import {
  Repository,
  githubIssuesApiRef,
  GithubIssuesByRepoOptions,
} from '../api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { getHostnameFromEntity } from './useEntityGithubRepositories';

export const useGetIssuesByRepoFromGithub = (
  repos: Array<Repository>,
  itemsPerRepo: number,
  options?: GithubIssuesByRepoOptions,
) => {
  const githubIssuesApi = useApi(githubIssuesApiRef);
  const { entity } = useEntity();
  // For Group/User entities the issues come from the *owned* repositories, not
  // from the owner entity itself. Its own source/managed-by location therefore
  // must not constrain the GitHub host — and is frequently a non-URL location
  // that used to crash the card. Let the API resolve the host from the
  // configured `integrations.github`, the same way the
  // github-pull-requests-board plugin does.
  const isOwnerEntity = entity.kind === 'Group' || entity.kind === 'User';
  const hostname = isOwnerEntity ? undefined : getHostnameFromEntity(entity);

  const {
    value: issues,
    loading: isLoading,
    retry,
  } = useAsyncRetry(async () => {
    if (repos.length > 0) {
      return await githubIssuesApi.fetchIssuesByRepoFromGithub(
        repos,
        itemsPerRepo,
        hostname,
        options,
      );
    }

    return {};
  }, [repos]);

  return { isLoading, githubIssuesByRepo: issues, retry };
};
