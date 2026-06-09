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

import {
  DiscoveryApi,
  createApiRef,
  FetchApi,
} from '@backstage/core-plugin-api';
import { NotFoundError, ResponseError } from '@backstage/errors';

/**
 * @public
 */
export const akeylessApiRef = createApiRef<AkeylessApi>({
  id: 'plugin.akeyless.service',
});

/**
 * @public
 */
export type AkeylessSecret = {
  name: string;
  fullPath: string;
  itemType: string;
  path: string;
  showUrl: string;
  editUrl: string;
};

/**
 * @public
 */
export type ListSecretsResponse = {
  secrets: AkeylessSecret[];
  consoleUrl?: string;
  allowCrud?: boolean;
};

/**
 * @public
 */
export type StaticSecretValueResponse = {
  name: string;
  value: string;
};

/**
 * @public
 */
export interface AkeylessApi {
  listSecrets(
    secretPath: string,
    options?: { itemTypes?: string[] },
  ): Promise<ListSecretsResponse>;
  getStaticSecretValue(
    name: string,
    contextPath: string,
  ): Promise<StaticSecretValueResponse>;
  createStaticSecret(
    name: string,
    value: string,
    contextPath: string,
  ): Promise<{ name: string }>;
  updateStaticSecretValue(
    name: string,
    value: string,
    contextPath: string,
  ): Promise<{ name: string }>;
  deleteStaticSecret(name: string, contextPath: string): Promise<void>;
}

/**
 * @public
 */
export class AkeylessClient implements AkeylessApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor({
    discoveryApi,
    fetchApi,
  }: {
    discoveryApi: DiscoveryApi;
    fetchApi: FetchApi;
  }) {
    this.discoveryApi = discoveryApi;
    this.fetchApi = fetchApi;
  }

  private async callApi<T>(
    path: string,
    options: {
      method?: string;
      query?: Record<string, string | string[] | undefined>;
      body?: unknown;
    } = {},
  ): Promise<T> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value === undefined) {
        continue;
      }
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else {
        params.append(key, value);
      }
    }

    const apiUrl = `${await this.discoveryApi.getBaseUrl('akeyless')}`;
    const queryString = params.toString();
    const response = await this.fetchApi.fetch(
      `${apiUrl}/${path}${queryString ? `?${queryString}` : ''}`,
      {
        method: options.method ?? 'GET',
        headers: {
          Accept: 'application/json',
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      },
    );

    if (response.ok) {
      if (response.status === 204) {
        return undefined as T;
      }
      return (await response.json()) as T;
    }
    if (response.status === 404) {
      throw new NotFoundError(`Akeyless resource was not found for '${path}'`);
    }
    throw await ResponseError.fromResponse(response);
  }

  async listSecrets(
    secretPath: string,
    options?: { itemTypes?: string[] },
  ): Promise<ListSecretsResponse> {
    const query: Record<string, string | string[] | undefined> = {};
    if (options?.itemTypes?.length) {
      query.types = options.itemTypes;
    }

    const result = await this.callApi<{
      items: AkeylessSecret[];
      consoleUrl?: string;
      allowCrud?: boolean;
    }>(`v1/secrets/${encodeURIComponent(secretPath)}`, { query });

    return {
      secrets: result.items,
      consoleUrl: result.consoleUrl,
      allowCrud: result.allowCrud,
    };
  }

  async getStaticSecretValue(
    name: string,
    contextPath: string,
  ): Promise<StaticSecretValueResponse> {
    return this.callApi<StaticSecretValueResponse>('v1/static-secrets/value', {
      query: { name, contextPath },
    });
  }

  async createStaticSecret(
    name: string,
    value: string,
    contextPath: string,
  ): Promise<{ name: string }> {
    return this.callApi<{ name: string }>('v1/static-secrets', {
      method: 'POST',
      body: { name, value, contextPath },
    });
  }

  async updateStaticSecretValue(
    name: string,
    value: string,
    contextPath: string,
  ): Promise<{ name: string }> {
    return this.callApi<{ name: string }>('v1/static-secrets', {
      method: 'PUT',
      body: { name, value, contextPath },
    });
  }

  async deleteStaticSecret(name: string, contextPath: string): Promise<void> {
    await this.callApi<void>('v1/static-secrets', {
      method: 'DELETE',
      body: { name, contextPath },
    });
  }
}
