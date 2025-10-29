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
import {
  ConfigApi,
  createApiRef,
  DiscoveryApi,
  IdentityApi,
} from '@backstage/core-plugin-api';

import { TagsResponse } from '../types';

const DEFAULT_PROXY_PATH = '/jfrog-artifactory/api';

export interface JfrogArtifactoryApiV1 {
  getTags(repo: string, target?: string): Promise<TagsResponse>;
}

export const jfrogArtifactoryApiRef = createApiRef<JfrogArtifactoryApiV1>({
  id: 'plugin.jfrog-artifactory.service',
});

export type Options = {
  discoveryApi: DiscoveryApi;
  configApi: ConfigApi;
  identityApi: IdentityApi;
};

export class JfrogArtifactoryApiClient implements JfrogArtifactoryApiV1 {
  // @ts-ignore
  private readonly discoveryApi: DiscoveryApi;

  private readonly configApi: ConfigApi;

  private readonly identityApi: IdentityApi;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.configApi = options.configApi;
    this.identityApi = options.identityApi;
  }

  private async getBaseUrl(target?: string) {
    const proxyPath =
      this.configApi.getOptionalString('jfrogArtifactory.proxyPath') ||
      DEFAULT_PROXY_PATH;
    return `${await this.discoveryApi.getBaseUrl('proxy')}${
      target ?? proxyPath
    }`;
  }

  private async fetcher(url: string, query: string) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
      method: 'POST',
      body: query,
    });
    if (!response.ok) {
      throw new Error(
        `failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
    }
    return await response.json();
  }

  async getTags(repo: string, target?: string) {
    const proxyUrl = await this.getBaseUrl(target);
    const tagQuery = {
      query:
        'query ($filter: VersionFilter!, $first: Int, $orderBy: VersionOrder) { versions (filter: $filter, first: $first, orderBy: $orderBy) { edges { node { name, created, modified, package { id }, repos { name, type, leadFilePath }, licenses { name, source }, size, stats { downloadCount }, vulnerabilities { critical, high, medium, low, info, unknown, skipped }, files { name, lead, size, md5, sha1, sha256, mimeType } } } } }',
      variables: {
        filter: {
          packageId: `docker://${repo}`,
          name: '*',
          ignorePreRelease: false,
        },
        first: 100,
        orderBy: {
          field: 'NAME_SEMVER',
          direction: 'DESC',
        },
      },
    };

    return (await this.fetcher(
      `${proxyUrl}/metadata/api/v1/query`,
      JSON.stringify(tagQuery),
    )) as TagsResponse;
  }
}
