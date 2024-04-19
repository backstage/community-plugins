/*
 * Copyright 2020 The Backstage Authors
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
export const vaultApiRef = createApiRef<VaultApi>({
  id: 'plugin.vault.service',
});

/**
 * Object containing the secret name and some links.
 * @public
 */
export type VaultSecret = {
  name: string;
  path: string;
  showUrl: string;
  editUrl: string;
};

/**
 * Interface for the VaultApi.
 * @public
 */
export interface VaultApi {
  /**
   * Returns a list of secrets used to show in a table.
   * @param secretPath - The path where the secrets are stored in Vault
   * @param options - Additional options to be passed to the Vault API, allows to override vault default settings in app config file
   */
  listSecrets(
    secretPath: string,
    options?: {
      secretEngine?: string;
    },
  ): Promise<VaultSecret[]>;
}

/**
 * Default implementation of the VaultApi.
 * @public
 */
export class VaultClient implements VaultApi {
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
    query: { [key in string]: any },
  ): Promise<T> {
    const apiUrl = `${await this.discoveryApi.getBaseUrl('vault')}`;
    const response = await this.fetchApi.fetch(
      `${apiUrl}/${path}?${new URLSearchParams(query).toString()}`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );
    if (response.ok) {
      return (await response.json()) as T;
    } else if (response.status === 404) {
      throw new NotFoundError(`No secrets found in path '${path}'`);
    }
    throw await ResponseError.fromResponse(response);
  }

  async listSecrets(
    secretPath: string,
    options?: {
      secretEngine?: string;
    },
  ): Promise<VaultSecret[]> {
    const query: { [key in string]: any } = {};
    const { secretEngine } = options || {};
    if (secretEngine) {
      query.engine = secretEngine;
    }

    const result = await this.callApi<{ items: VaultSecret[] }>(
      `v1/secrets/${encodeURIComponent(secretPath)}`,
      query,
    );
    return result.items;
  }
}
