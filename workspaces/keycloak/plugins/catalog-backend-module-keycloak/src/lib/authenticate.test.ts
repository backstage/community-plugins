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
import { mockServices } from '@backstage/backend-test-utils';
import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import jwt from 'jsonwebtoken';

import { KeycloakProviderConfig } from './config';
import { authenticate, ensureTokenValid } from './authenticate';

jest.mock('jsonwebtoken', () => ({
  decode: jest.fn(),
}));

const mockedDecode = jwt.decode as jest.Mock;

const logger = mockServices.logger.mock();

const passwordProvider: KeycloakProviderConfig = {
  id: 'default',
  realm: 'myrealm',
  baseUrl: 'http://localhost:8080',
  username: 'myusername',
  password: 'mypassword', // NOSONAR
};

describe('authenticate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses password grant when username and password are configured', async () => {
    const client = {
      auth: jest.fn().mockResolvedValue(undefined),
    } as unknown as KeycloakAdminClient;

    await authenticate(client, passwordProvider, logger);

    expect(client.auth).toHaveBeenCalledWith({
      grantType: 'password',
      clientId: 'admin-cli',
      username: 'myusername',
      password: 'mypassword', // NOSONAR
    });
  });

  it('uses client_credentials grant when clientId and clientSecret are configured', async () => {
    const client = {
      auth: jest.fn().mockResolvedValue(undefined),
    } as unknown as KeycloakAdminClient;

    const clientCredentialsProvider: KeycloakProviderConfig = {
      id: 'default',
      realm: 'myrealm',
      baseUrl: 'http://localhost:8080',
      clientId: 'myclientid',
      clientSecret: 'myclientsecret', // NOSONAR
    };

    await authenticate(client, clientCredentialsProvider, logger);

    expect(client.auth).toHaveBeenCalledWith({
      grantType: 'client_credentials',
      clientId: 'myclientid',
      clientSecret: 'myclientsecret', // NOSONAR
    });
  });

  it('throws InputError when credentials are missing', async () => {
    const client = {
      auth: jest.fn(),
    } as unknown as KeycloakAdminClient;

    const providerWithoutCredentials: KeycloakProviderConfig = {
      id: 'default',
      realm: 'myrealm',
      baseUrl: 'http://localhost:8080',
    };

    await expect(
      authenticate(client, providerWithoutCredentials, logger),
    ).rejects.toThrow(
      'username and password or clientId and clientSecret must be provided.',
    );
    expect(client.auth).not.toHaveBeenCalled();
  });
});

describe('ensureTokenValid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('authenticates when the access token is missing', async () => {
    const client = {
      accessToken: undefined,
      auth: jest.fn().mockResolvedValue(undefined),
    } as unknown as KeycloakAdminClient;

    await ensureTokenValid(client, passwordProvider, logger);

    expect(client.auth).toHaveBeenCalledTimes(1);
    expect(mockedDecode).not.toHaveBeenCalled();
  });

  it('does not re-authenticate when the JWT expires more than 30 seconds from now', async () => {
    const client = {
      accessToken: 'valid-token',
      auth: jest.fn().mockResolvedValue(undefined),
    } as unknown as KeycloakAdminClient;

    mockedDecode.mockReturnValue({
      exp: Math.floor((Date.now() + 60_000) / 1000),
    });

    await ensureTokenValid(client, passwordProvider, logger);

    expect(mockedDecode).toHaveBeenCalledWith('valid-token');
    expect(client.auth).not.toHaveBeenCalled();
  });

  it('re-authenticates when the JWT is within 30 seconds of expiry', async () => {
    const client = {
      accessToken: 'near-expiry-token',
      auth: jest.fn().mockResolvedValue(undefined),
    } as unknown as KeycloakAdminClient;

    mockedDecode.mockReturnValue({
      exp: Math.floor((Date.now() + 10_000) / 1000),
    });

    await ensureTokenValid(client, passwordProvider, logger);

    expect(mockedDecode).toHaveBeenCalledWith('near-expiry-token');
    expect(client.auth).toHaveBeenCalledTimes(1);
    expect(client.auth).toHaveBeenCalledWith({
      grantType: 'password',
      clientId: 'admin-cli',
      username: 'myusername',
      password: 'mypassword', // NOSONAR
    });
  });
});
