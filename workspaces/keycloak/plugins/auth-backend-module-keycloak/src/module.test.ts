/*
 * Copyright 2026 The Backstage Authors
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

import { mockServices, startTestBackend } from '@backstage/backend-test-utils';
import authPlugin from '@backstage/plugin-auth-backend';
import {
  AuthProviderRegistrationOptions,
  authProvidersExtensionPoint,
} from '@backstage/plugin-auth-node';
import { authModuleKeycloakProvider } from './module';

jest.mock('openid-client', () => {
  const mockAuthorizationUrl = jest.fn();
  const mockDiscover = jest.fn();

  class MockClient {
    authorizationUrl = mockAuthorizationUrl;
  }

  class MockIssuer {
    static discover(...args: unknown[]) {
      return mockDiscover(...args);
    }
  }

  return {
    Issuer: MockIssuer,
    custom: { http_options: Symbol('http_options') },
    __MockClient: MockClient,
    __mocks: { mockAuthorizationUrl, mockDiscover },
  };
});

const { __MockClient, __mocks: openIdMocks } =
  jest.requireMock('openid-client');

describe('authModuleKeycloakProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers the "keycloak" provider at the auth providers extension point', async () => {
    // Arrange
    const registered: AuthProviderRegistrationOptions[] = [];
    const extensionPoint = {
      registerProvider: (options: AuthProviderRegistrationOptions) => {
        registered.push(options);
      },
    };

    // Act
    const backend = await startTestBackend({
      extensionPoints: [[authProvidersExtensionPoint, extensionPoint]],
      features: [
        authModuleKeycloakProvider,
        mockServices.rootConfig.factory({ data: {} }),
      ],
    });

    // Assert
    expect(registered).toHaveLength(1);
    expect(registered[0].providerId).toBe('keycloak');
    expect(typeof registered[0].factory).toBe('function');

    await backend.stop();
  });

  it('exposes the keycloak start endpoint when composed with the auth backend plugin', async () => {
    openIdMocks.mockDiscover.mockResolvedValue({ Client: __MockClient });
    openIdMocks.mockAuthorizationUrl.mockReturnValue(
      'https://keycloak.test/realms/test-realm/protocol/openid-connect/auth',
    );

    const backend = await startTestBackend({
      features: [
        authPlugin,
        authModuleKeycloakProvider,
        mockServices.rootConfig.factory({
          data: {
            app: {
              baseUrl: 'http://localhost:3000',
            },
            backend: {
              baseUrl: 'http://localhost:7007',
            },
            auth: {
              session: {
                secret: 'test-session-secret-for-module-wiring',
              },
              providers: {
                keycloak: {
                  development: {
                    clientId: 'test-client',
                    clientSecret: 'test-secret', // NOSONAR
                    baseUrl: 'https://keycloak.test',
                    realm: 'test-realm',
                  },
                },
              },
            },
          },
        }),
      ],
    });

    const port = backend.server.port();
    const res = await fetch(
      `http://127.0.0.1:${port}/api/auth/keycloak/start?env=development`,
      { redirect: 'manual' },
    );

    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toMatch(/authorize|keycloak\.test/);

    await backend.stop();
  });
});
