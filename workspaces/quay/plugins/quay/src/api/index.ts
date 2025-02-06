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

import {
  LabelsResponse,
  ManifestByDigestResponse,
  SecurityDetailsResponse,
  TagsResponse,
} from '../types';

const DEFAULT_PROXY_PATH = '/quay/api';

export interface QuayApiV1 {
  getTags(
    org: string,
    repo: string,
    page?: number,
    limit?: number,
  ): Promise<TagsResponse>;
  getLabels(org: string, repo: string, digest: string): Promise<LabelsResponse>;
  getManifestByDigest(
    org: string,
    repo: string,
    digest: string,
  ): Promise<ManifestByDigestResponse>;
  getSecurityDetails(
    org: string,
    repo: string,
    digest: string,
  ): Promise<SecurityDetailsResponse>;
}

export const quayApiRef = createApiRef<QuayApiV1>({
  id: 'plugin.quay.service',
});

export type Options = {
  discoveryApi: DiscoveryApi;
  configApi: ConfigApi;
  identityApi: IdentityApi;
};

export class QuayApiClient implements QuayApiV1 {
  // @ts-ignore
  private readonly discoveryApi: DiscoveryApi;

  private readonly configApi: ConfigApi;

  private readonly identityApi: IdentityApi;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.configApi = options.configApi;
    this.identityApi = options.identityApi;
  }

  private async getBaseUrl() {
    // Check if the user opted into the quay-backend
    // Default to proxy if not
    const apiUrl = this.configApi.getOptionalString('quay.apiUrl');
    const proxyPath =
      this.configApi.getOptionalString('quay.proxyPath') ?? DEFAULT_PROXY_PATH;
    const baseUrl = await this.discoveryApi.getBaseUrl(
      apiUrl ? 'quay' : 'proxy',
    );

    return apiUrl ? baseUrl : `${baseUrl}${proxyPath}/api/v1`;
  }

  private async fetcher(url: string) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
    });
    if (!response.ok) {
      throw new Error(
        `failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
    }
    return await response.json();
  }

  private encodeGetParams(params: Record<string, any>) {
    return Object.keys(params)
      .filter(key => typeof params[key] !== 'undefined')
      .map(
        k =>
          `${encodeURIComponent(k)}=${encodeURIComponent(params[k] as string)}`,
      )
      .join('&');
  }

  async getTags(
    org: string,
    repo: string,
    page?: number,
    limit?: number,
    specificTag?: string,
  ) {
    const baseUrl = await this.getBaseUrl();
    const params = this.encodeGetParams({
      limit,
      page,
      onlyActiveTags: true,
      specificTag,
    });

    return (await this.fetcher(
      `${baseUrl}/repository/${org}/${repo}/tag/?${params}`,
    )) as TagsResponse;
  }

  async getLabels(org: string, repo: string, digest: string) {
    const baseUrl = await this.getBaseUrl();

    return (await this.fetcher(
      `${baseUrl}/repository/${org}/${repo}/manifest/${digest}/labels`,
    )) as LabelsResponse;
  }

  async getManifestByDigest(org: string, repo: string, digest: string) {
    const baseUrl = await this.getBaseUrl();

    return (await this.fetcher(
      `${baseUrl}/repository/${org}/${repo}/manifest/${digest}`,
    )) as ManifestByDigestResponse;
  }

  async getSecurityDetails(org: string, repo: string, digest: string) {
    const baseUrl = await this.getBaseUrl();

    return (await this.fetcher(
      `${baseUrl}/repository/${org}/${repo}/manifest/${digest}/security`,
    )) as SecurityDetailsResponse;
  }
}
