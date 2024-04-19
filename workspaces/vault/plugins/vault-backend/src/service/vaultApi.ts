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

import { Config } from '@backstage/config';
import { NotAllowedError, NotFoundError } from '@backstage/errors';
import fetch from 'node-fetch';
import plimit from 'p-limit';
import { getVaultConfig, VaultConfig } from '../config';

/**
 * Object received as a response from the Vault API when fetching secrets
 * @internal
 */
export type VaultSecretList = {
  data: {
    keys: string[];
  };
};

/**
 * Object containing the secret name and some links
 * @public
 * @deprecated Use the interface from `@backstage-community/plugin-vault-node`
 */
export type VaultSecret = {
  name: string;
  path: string;
  showUrl: string;
  editUrl: string;
};

/**
 * Object received as response when the token is renewed using the Vault API
 */
type RenewTokenResponse = {
  auth: {
    client_token: string;
  };
};

/**
 * Interface for the Vault API
 * @public
 * @deprecated Use the interface from `@backstage-community/plugin-vault-node`
 */
export interface VaultApi {
  /**
   * Returns the URL to access the Vault UI with the defined config.
   */
  getFrontendSecretsUrl(): string;

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

  /**
   * Optional, to renew the token used to list the secrets. Throws an
   * error if the token renewal went wrong.
   */
  renewToken?(): Promise<void>;
}

/**
 * Implementation of the Vault API to list secrets and renew the token if necessary
 * @public
 */
export class VaultClient implements VaultApi {
  private vaultConfig: VaultConfig;
  private readonly limit = plimit(5);

  constructor(options: { config: Config }) {
    this.vaultConfig = getVaultConfig(options.config);
  }

  private async callApi<T>(
    path: string,
    query: { [key in string]: any },
    method: string = 'GET',
  ): Promise<T> {
    const url = new URL(path, this.vaultConfig.baseUrl);
    const response = await fetch(
      `${url.toString()}?${new URLSearchParams(query).toString()}`,
      {
        method,
        headers: {
          Accept: 'application/json',
          'X-Vault-Token': this.vaultConfig.token,
        },
      },
    );
    if (response.ok) {
      return (await response.json()) as T;
    } else if (response.status === 404) {
      throw new NotFoundError(`No secrets found in path '${path}'`);
    } else if (response.status === 403) {
      throw new NotAllowedError(response.statusText);
    }
    throw new Error(
      `Unexpected error while fetching secrets from path '${path}'`,
    );
  }

  getFrontendSecretsUrl(): string {
    return `${this.vaultConfig.baseUrl}/ui/vault/secrets/${this.vaultConfig.secretEngine}`;
  }

  async listSecrets(
    secretPath: string,
    options?: {
      secretEngine?: string;
    },
  ): Promise<VaultSecret[]> {
    const mount = options?.secretEngine || this.vaultConfig.secretEngine;

    const listUrl =
      this.vaultConfig.kvVersion === 2
        ? `v1/${encodeURIComponent(mount)}/metadata/${secretPath}`
        : `v1/${encodeURIComponent(mount)}/${secretPath}`;
    const result = await this.limit(() =>
      this.callApi<VaultSecretList>(listUrl, { list: true }),
    );

    const secrets: VaultSecret[] = [];

    await Promise.all(
      result.data.keys.map(async secret => {
        if (secret.endsWith('/')) {
          secrets.push(
            ...(await this.listSecrets(`${secretPath}/${secret.slice(0, -1)}`, {
              secretEngine: mount,
            })),
          );
        } else {
          const vaultUrl =
            this.vaultConfig.publicUrl || this.vaultConfig.baseUrl;
          secrets.push({
            name: secret,
            path: secretPath,
            editUrl: `${vaultUrl}/ui/vault/secrets/${encodeURIComponent(
              mount,
            )}/edit/${secretPath}/${secret}`,
            showUrl: `${vaultUrl}/ui/vault/secrets/${encodeURIComponent(
              mount,
            )}/show/${secretPath}/${secret}`,
          });
        }
      }),
    );

    return secrets;
  }

  async renewToken(): Promise<void> {
    const result = await this.callApi<RenewTokenResponse>(
      'v1/auth/token/renew-self',
      {},
      'POST',
    );

    this.vaultConfig.token = result.auth.client_token;
  }
}
