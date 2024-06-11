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

import { Config } from '@backstage/config';

/**
 * The static token needed for the vault-backend plugin to login.
 *
 * @public
 */
export interface VaultStaticTokenConfig {
  /**
   * The static token used by Backstage to access Vault.
   */
  secret: string;
}

/**
 * The Kubernetes auth method parameters needed for the vault-backend plugin
 * to login.
 *
 * @public
 */
export interface VaultKubernetesAuthConfig {
  /**
   * The role used to login to Vault.
   */
  role: string;

  /**
   * The authPath used to login to Vault. If not set, it defaults to 'kubernetes'.
   */
  authPath: string;

  /**
   * The path where the service account token is. If not set,
   * it defaults to '/var/run/secrets/kubernetes.io/serviceaccount/token'.
   */
  serviceAccountTokenPath: string;
}

export type AuthenticationConfig =
  | { type: 'static'; config: VaultStaticTokenConfig }
  | { type: 'kubernetes'; config: VaultKubernetesAuthConfig };

/**
 * The configuration needed for the vault-backend plugin
 *
 * @public
 */
export interface VaultConfig {
  /**
   * The baseUrl for your Vault instance.
   */
  baseUrl: string;

  /**
   * The publicUrl for your Vault instance (Optional).
   */
  publicUrl?: string;

  /**
   * The credentials used to login to Vault. They can be a raw token
   * or the Kubernetes parameters.
   */
  token: AuthenticationConfig;

  /**
   * The secret engine name where in vault. Defaults to `secrets`.
   */
  secretEngine: string;

  /**
   * The version of the K/V API. Defaults to `2`.
   */
  kvVersion: number;
}

/**
 * Extract the Vault config from a config object
 *
 * @public
 *
 * @param config - The config object to extract from
 */
export function getVaultConfig(config: Config): VaultConfig {
  let tokenCfg: AuthenticationConfig;

  if (config.has('vault.token')) {
    // Keep for retro compatibility. Remove in future releases in favor of "vault.auth"
    tokenCfg = {
      type: 'static',
      config: {
        secret: config.getString('vault.token'),
      },
    };
  } else {
    const authType = config.getString('vault.auth.type');
    switch (authType) {
      case 'static':
        tokenCfg = {
          type: 'static',
          config: {
            secret: config.getString('vault.auth.secret'),
          },
        };
        break;
      case 'kubernetes':
        tokenCfg = {
          type: 'kubernetes',
          config: {
            role: config.getString('vault.auth.role'),
            authPath:
              config.getOptionalString('vault.auth.authPath') ?? 'kubernetes',
            serviceAccountTokenPath:
              config.getOptionalString('vault.auth.serviceAccountTokenPath') ??
              '/var/run/secrets/kubernetes.io/serviceaccount/token',
          },
        };
        break;
      default:
        throw new Error(`unknown authentication type: ${authType}`);
    }
  }

  return {
    baseUrl: config.getString('vault.baseUrl'),
    publicUrl: config.getOptionalString('vault.publicUrl'),
    token: tokenCfg,
    kvVersion: config.getOptionalNumber('vault.kvVersion') ?? 2,
    secretEngine: config.getOptionalString('vault.secretEngine') ?? 'secrets',
  };
}
