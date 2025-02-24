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
import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import { KeycloakProviderConfig } from './config';
import { Credentials } from '@keycloak/keycloak-admin-client/lib/utils/auth';
import { InputError } from '@backstage/errors';
import { LoggerService } from '@backstage/backend-plugin-api';
import jwt from 'jsonwebtoken';

let refreshTokenPromise: Promise<void> | null = null;

export async function ensureTokenValid(
  kcAdminClient: KeycloakAdminClient,
  provider: KeycloakProviderConfig,
  logger: LoggerService,
) {
  if (!kcAdminClient.accessToken) {
    await authenticate(kcAdminClient, provider, logger);
  } else {
    // returns null if token is not a JWT, string if payload is empty string, object if payload is a valid JSON
    const decodedToken = jwt.decode(kcAdminClient.accessToken);
    if (decodedToken && typeof decodedToken === 'object' && decodedToken.exp) {
      const tokenExpiry = decodedToken.exp * 1000; // Convert to milliseconds
      const now = Date.now();

      if (now > tokenExpiry - 30000) {
        refreshTokenPromise = authenticate(
          kcAdminClient,
          provider,
          logger,
        ).finally(() => {
          refreshTokenPromise = null;
        });
      }
      await refreshTokenPromise;
    }
  }
}

export async function authenticate(
  kcAdminClient: KeycloakAdminClient,
  provider: KeycloakProviderConfig,
  logger: LoggerService,
) {
  try {
    let credentials: Credentials;
    if (provider.username && provider.password) {
      credentials = {
        grantType: 'password',
        clientId: provider.clientId ?? 'admin-cli',
        username: provider.username,
        password: provider.password,
      };
    } else if (provider.clientId && provider.clientSecret) {
      credentials = {
        grantType: 'client_credentials',
        clientId: provider.clientId,
        clientSecret: provider.clientSecret,
      };
    } else {
      throw new InputError(
        `username and password or clientId and clientSecret must be provided.`,
      );
    }
    await kcAdminClient.auth(credentials);
  } catch (error) {
    logger.error('Failed to authenticate', error.message);
    throw error;
  }
}
