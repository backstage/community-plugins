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
import GitUrlParse from 'git-url-parse';

export const getCheDecoratorData = (cheCluster?: any): string | undefined => {
  return cheCluster?.status?.cheURL;
};

export const getFullGitURL = (
  gitUrl: GitUrlParse.GitUrl,
  branch?: string,
): string => {
  const baseUrl = `https://${gitUrl.resource}/${gitUrl.owner}/${gitUrl.name}`;
  if (!branch) {
    return baseUrl;
  }
  if (gitUrl.resource.includes('github')) {
    return `${baseUrl}/tree/${branch}`;
  }
  if (gitUrl.resource.includes('gitlab')) {
    return `${baseUrl}/-/tree/${branch}`;
  }
  // Branch names containing '/' do not work with bitbucket src URLs
  // https://jira.atlassian.com/browse/BCLOUD-9969
  if (gitUrl.resource.includes('bitbucket') && !branch.includes('/')) {
    return `${baseUrl}/src/${branch}`;
  }
  return baseUrl;
};

export const getEditURL = (
  vcsURI?: string,
  gitBranch?: string,
  cheURL?: string,
): string | null => {
  if (!vcsURI) {
    return null;
  }
  // eslint-disable-next-line new-cap
  const fullGitURL = getFullGitURL(GitUrlParse(vcsURI), gitBranch);
  return cheURL
    ? `${cheURL}/f?url=${fullGitURL}&policies.create=peruser`
    : fullGitURL;
};
