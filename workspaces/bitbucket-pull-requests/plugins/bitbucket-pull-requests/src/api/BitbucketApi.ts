/*
 * Copyright 2025 The Backstage Authors
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

import fetch from 'cross-fetch';

import { createApiRef, DiscoveryApi } from '@backstage/core-plugin-api';

export const bitbucketApiRef = createApiRef<BitbucketApi>({
  id: 'plugin.bitbucket.service',
});
export type PullRequest = {
  id: number;
  title: string;
  author: string;
  created_on: string;
  updated_on: string;
  state: string;
  description: string;
  url: string;
};
const DEFAULT_PROXY_PATH = '/bitbucket/api';
type Options = {
  discoveryApi: DiscoveryApi;
};
export class BitbucketApi {
  private readonly discoveryApi: DiscoveryApi;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
  }

  async fetchPullRequestList(
    project: string,
    repo: string,
    state?: string,
  ): Promise<PullRequest[]> {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    const response = await fetch(
      `${proxyUrl}${DEFAULT_PROXY_PATH}/projects/${project}/repos/${repo}/pull-requests?state=${
        state || ''
      }`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (!response.ok) {
      throw new Error('Failed to fetch pull requests');
    }

    const data = await response.json();

    return data.values.map((pr: any) => ({
      id: pr.id,
      title: pr.title,
      author: pr.author.user.name,
      created_on: pr.createdDate,
      updated_on: pr.updatedDate,
      state: pr.state,
      url: pr.links.self[0].href,
      description: pr.description,
    }));
  }
}
