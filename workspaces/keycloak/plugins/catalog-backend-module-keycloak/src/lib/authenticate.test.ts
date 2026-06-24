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

import { KeycloakProviderConfig } from './config';
import { authenticate } from './authenticate';

const logger = mockServices.logger.mock();

describe('authenticate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses password grant when username and password are configured', async () => {
    const client = {
      auth: jest.fn().mockResolvedValue(undefined),
    } as unknown as KeycloakAdminClient;

    const provider: KeycloakProviderConfig = {
      id: 'default',
      realm: 'myrealm',
      baseUrl: 'http://localhost:8080',
      username: 'myusername',
      password: 'mypassword', // NOSONAR
    };

    await authenticate(client, provider, logger);

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

    const provider: KeycloakProviderConfig = {
      id: 'default',
      realm: 'myrealm',
      baseUrl: 'http://localhost:8080',
      clientId: 'myclientid',
      clientSecret: 'myclientsecret', // NOSONAR
    };

    await authenticate(client, provider, logger);

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

    const provider: KeycloakProviderConfig = {
      id: 'default',
      realm: 'myrealm',
      baseUrl: 'http://localhost:8080',
    };

    await expect(authenticate(client, provider, logger)).rejects.toThrow(
      'username and password or clientId and clientSecret must be provided.',
    );
    expect(client.auth).not.toHaveBeenCalled();
  });
});
