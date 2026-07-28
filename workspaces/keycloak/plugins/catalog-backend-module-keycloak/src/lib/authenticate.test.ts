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

import { InputError } from '@backstage/errors';
import { mockServices } from '@backstage/backend-test-utils';
import type KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import jwt from 'jsonwebtoken';

import { authenticate, ensureTokenValid } from './authenticate';
import type { KeycloakProviderConfig } from './config';

const logger = mockServices.logger.mock();

function createMockKcClient(
  overrides: Partial<KeycloakAdminClient> = {},
): KeycloakAdminClient {
  return {
    accessToken: undefined,
    auth: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as KeycloakAdminClient;
}

const passwordProvider: KeycloakProviderConfig = {
  baseUrl: 'https://keycloak.test',
  realm: 'test',
  username: 'admin',
  password: 'admin',
} as KeycloakProviderConfig;

const clientCredProvider: KeycloakProviderConfig = {
  baseUrl: 'https://keycloak.test',
  realm: 'test',
  clientId: 'backstage',
  clientSecret: 'secret',
} as KeycloakProviderConfig;

function createExpiredToken(expiresInMs: number = -60000): string {
  const exp = Math.floor((Date.now() + expiresInMs) / 1000);
  return jwt.sign({ exp, sub: 'test' }, 'test-secret');
}

function createValidToken(expiresInMs: number = 3600000): string {
  const exp = Math.floor((Date.now() + expiresInMs) / 1000);
  return jwt.sign({ exp, sub: 'test' }, 'test-secret');
}

describe('authenticate', () => {
  it('authenticates with username and password', async () => {
    const kc = createMockKcClient();
    await authenticate(kc, passwordProvider, logger);

    expect(kc.auth).toHaveBeenCalledWith({
      grantType: 'password',
      clientId: 'admin-cli',
      username: 'admin',
      password: 'admin',
    });
  });

  it('authenticates with client credentials', async () => {
    const kc = createMockKcClient();
    await authenticate(kc, clientCredProvider, logger);

    expect(kc.auth).toHaveBeenCalledWith({
      grantType: 'client_credentials',
      clientId: 'backstage',
      clientSecret: 'secret',
    });
  });

  it('throws InputError when credentials are missing', async () => {
    const kc = createMockKcClient();
    const emptyProvider = {
      baseUrl: 'https://keycloak.test',
      realm: 'test',
    } as KeycloakProviderConfig;

    await expect(authenticate(kc, emptyProvider, logger)).rejects.toThrow(
      InputError,
    );
    await expect(authenticate(kc, emptyProvider, logger)).rejects.toThrow(
      'username and password or clientId and clientSecret must be provided.',
    );
  });
});

describe('ensureTokenValid', () => {
  it('authenticates when no access token is present', async () => {
    const kc = createMockKcClient();
    await ensureTokenValid(kc, passwordProvider, logger);

    expect(kc.auth).toHaveBeenCalledTimes(1);
  });

  it('does not re-authenticate when token is still valid', async () => {
    const kc = createMockKcClient({
      accessToken: createValidToken(),
    });
    await ensureTokenValid(kc, passwordProvider, logger);

    expect(kc.auth).not.toHaveBeenCalled();
  });

  it('refreshes when token is near expiry', async () => {
    const kc = createMockKcClient({
      accessToken: createExpiredToken(),
    });
    await ensureTokenValid(kc, passwordProvider, logger);

    expect(kc.auth).toHaveBeenCalledTimes(1);
  });

  it('does not trigger multiple refreshes when called concurrently with a near-expiry token', async () => {
    const kc = createMockKcClient({
      accessToken: createExpiredToken(),
    });

    await Promise.all([
      ensureTokenValid(kc, passwordProvider, logger),
      ensureTokenValid(kc, passwordProvider, logger),
      ensureTokenValid(kc, passwordProvider, logger),
    ]);

    expect(kc.auth).toHaveBeenCalledTimes(1);
  });
});
