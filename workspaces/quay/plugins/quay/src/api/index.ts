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

import { QUAY_SINGLE_INSTANCE_NAME } from '@backstage-community/plugin-quay-common';

import {
  LabelsResponse,
  ManifestByDigestResponse,
  SecurityDetailsResponse,
  TagsResponse,
} from '../types';

const DEFAULT_PROXY_PATH = '/quay/api';

export interface QuayApiV1 {
  getQuayInstance(instanceName?: string): QuayInstanceConfig | undefined;
  getTags(
    instanceName: string | undefined,
    org: string,
    repo: string,
    page?: number,
    limit?: number,
  ): Promise<TagsResponse>;
  getLabels(
    instanceName: string | undefined,
    org: string,
    repo: string,
    digest: string,
  ): Promise<LabelsResponse>;
  getManifestByDigest(
    instanceName: string | undefined,
    org: string,
    repo: string,
    digest: string,
  ): Promise<ManifestByDigestResponse>;
  getSecurityDetails(
    instanceName: string | undefined,
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

export type QuayInstanceConfig = {
  name: string;
  apiUrl?: string;
  uiUrl?: string;
  proxyPath?: string;
};

export class QuayApiClient implements QuayApiV1 {
  // @ts-ignore
  private readonly discoveryApi: DiscoveryApi;

  private readonly identityApi: IdentityApi;

  private readonly instances: Map<string, QuayInstanceConfig>;

  private readonly defaultInstanceName: string;

  static fromConfig(options: Options): QuayApiClient {
    const { configApi } = options;

    const instancesArray = configApi.getOptionalConfigArray('quay.instances');
    const singleApiUrl = configApi.getOptionalString('quay.apiUrl');
    const singleProxyPath = configApi.getOptionalString('quay.proxyPath');
    const singleUiUrl = configApi.getOptionalString('quay.uiUrl');

    // Validate that single-instance and multi-instance configs are not mixed
    if (instancesArray && (singleApiUrl || singleProxyPath || singleUiUrl)) {
      throw new Error(
        'Invalid Quay configuration: Cannot use both "quay.instances" (multi-instance) and "quay.apiUrl", "quay.proxyPath", "quay.uiUrl" (single-instance) at the same time.',
      );
    }

    const instances: QuayInstanceConfig[] = [];
    if (instancesArray && instancesArray.length > 0) {
      // Multi-instance configuration
      for (const instance of instancesArray) {
        instances.push({
          name: instance.getString('name'),
          uiUrl: instance.getOptionalString('uiUrl'),
          apiUrl: instance.getOptionalString('apiUrl'),
          proxyPath: instance.getOptionalString('proxyPath'),
        });
      }
    } else if (singleApiUrl) {
      // Single-instance configuration
      instances.push({
        name: QUAY_SINGLE_INSTANCE_NAME,
        apiUrl: singleApiUrl,
      });
    } else {
      // Single-instance proxy configuration
      instances.push({
        name: QUAY_SINGLE_INSTANCE_NAME,
        uiUrl: singleUiUrl,
        proxyPath: singleProxyPath,
      });
    }

    return new QuayApiClient(
      options.discoveryApi,
      options.identityApi,
      instances,
    );
  }

  private constructor(
    discoveryApi: DiscoveryApi,
    identityApi: IdentityApi,
    instances: QuayInstanceConfig[],
  ) {
    if (instances.length === 0) {
      throw new Error('At least one Quay instance must be configured');
    }

    this.discoveryApi = discoveryApi;
    this.identityApi = identityApi;
    this.instances = new Map(
      instances.map(instance => [instance.name, instance]),
    );
    this.defaultInstanceName = instances[0].name;
  }

  getQuayInstance(instanceName?: string): QuayInstanceConfig | undefined {
    return instanceName
      ? this.instances.get(instanceName)
      : this.instances.get(this.defaultInstanceName);
  }

  private async getBaseUrl(instanceName?: string) {
    const instance = this.getQuayInstance(instanceName);
    if (instance === undefined) {
      throw new Error(
        `Quay instance "${instanceName}" not found in configuration.`,
      );
    }

    const baseUrl = await this.discoveryApi.getBaseUrl(
      instance.apiUrl ? 'quay' : 'proxy',
    );
    return instance.apiUrl
      ? `${baseUrl}/${instance.name}`
      : `${baseUrl}${instance.proxyPath ?? DEFAULT_PROXY_PATH}/api/v1`;
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
    instanceName: string | undefined,
    org: string,
    repo: string,
    page?: number,
    limit?: number,
    specificTag?: string,
  ) {
    const baseUrl = await this.getBaseUrl(instanceName);
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

  async getLabels(
    instanceName: string | undefined,
    org: string,
    repo: string,
    digest: string,
  ) {
    const baseUrl = await this.getBaseUrl(instanceName);

    return (await this.fetcher(
      `${baseUrl}/repository/${org}/${repo}/manifest/${digest}/labels`,
    )) as LabelsResponse;
  }

  async getManifestByDigest(
    instanceName: string | undefined,
    org: string,
    repo: string,
    digest: string,
  ) {
    const baseUrl = await this.getBaseUrl(instanceName);

    return (await this.fetcher(
      `${baseUrl}/repository/${org}/${repo}/manifest/${digest}`,
    )) as ManifestByDigestResponse;
  }

  async getSecurityDetails(
    instanceName: string | undefined,
    org: string,
    repo: string,
    digest: string,
  ) {
    const baseUrl = await this.getBaseUrl(instanceName);

    return (await this.fetcher(
      `${baseUrl}/repository/${org}/${repo}/manifest/${digest}/security`,
    )) as SecurityDetailsResponse;
  }
}
