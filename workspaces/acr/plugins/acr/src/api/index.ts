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

const DEFAULT_PROXY_PATH = '/acr/api';

export interface AzureContainerRegistryApiV1 {
  getTags(repo: string, registryName?: string): Promise<TagsResponse>;
}

export const AzureContainerRegistryApiRef =
  createApiRef<AzureContainerRegistryApiV1>({
    id: 'plugin.acr.service',
  });

export type Options = {
  discoveryApi: DiscoveryApi;
  configApi: ConfigApi;
  identityApi: IdentityApi;
};

export class AzureContainerRegistryApiClient
  implements AzureContainerRegistryApiV1
{
  private readonly discoveryApi: DiscoveryApi;
  private readonly configApi: ConfigApi;
  private readonly identityApi: IdentityApi;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.configApi = options.configApi;
    this.identityApi = options.identityApi;
  }

  private async getBaseUrl(registryName?: string) {
    const defaultPath =
      this.configApi.getOptionalString('acr.proxyPath') || DEFAULT_PROXY_PATH;

    const proxyPath = registryName
      ? `/acr/custom/api/${encodeURIComponent(registryName)}`
      : defaultPath;

    return `${await this.discoveryApi.getBaseUrl('proxy')}${proxyPath}`;
  }

  private async fetcher(url: string) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(
        `failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
    }
    return await response.json();
  }

  async getTags(repo: string, registryName?: string) {
    const proxyUrl = await this.getBaseUrl(registryName);

    return (await this.fetcher(
      `${proxyUrl}/${encodeURIComponent(repo)}/_tags?orderby=timedesc&n=100`,
    )) as TagsResponse;
  }
}
