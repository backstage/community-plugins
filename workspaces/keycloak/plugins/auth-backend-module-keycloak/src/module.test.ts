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
import {
  AuthProviderRegistrationOptions,
  authProvidersExtensionPoint,
} from '@backstage/plugin-auth-node';
import { authModuleKeycloakProvider } from './module';

describe('authModuleKeycloakProvider', () => {
  it('registers the "keycloak" provider at the auth providers extension point', async () => {
    // Arrange
    const registered: AuthProviderRegistrationOptions[] = [];
    const extensionPoint = {
      registerProvider: (options: AuthProviderRegistrationOptions) => {
        registered.push(options);
      },
    };

    // Act
    await startTestBackend({
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
  });
});
