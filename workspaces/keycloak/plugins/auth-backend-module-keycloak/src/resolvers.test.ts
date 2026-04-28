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

import {
  AuthResolverContext,
  commonSignInResolvers,
} from '@backstage/plugin-auth-node';
import { keycloakSignInResolvers } from './resolvers';

const createMockContext = (): jest.Mocked<AuthResolverContext> => ({
  issueToken: jest.fn(),
  findCatalogUser: jest.fn(),
  signInWithCatalogUser: jest.fn().mockResolvedValue({ token: 'test-token' }),
  resolveOwnershipEntityRefs: jest.fn(),
});

const createInfo = (
  fullProfile: Record<string, unknown>,
  profile: Record<string, unknown> = {},
) =>
  ({
    profile,
    result: {
      fullProfile,
      session: {
        accessToken: 'test-access-token',
        tokenType: 'bearer',
        scope: 'openid profile email',
      },
    },
  } as any);

describe('keycloakSignInResolvers', () => {
  describe('preferredUsernameMatchingUserEntityName', () => {
    it('signs in using the preferred_username claim as the entity name', async () => {
      // Arrange
      const ctx = createMockContext();
      const resolver =
        keycloakSignInResolvers.preferredUsernameMatchingUserEntityName();
      const info = createInfo({ preferred_username: 'jdoe' });

      // Act
      const result = await resolver(info, ctx);

      // Assert
      expect(ctx.signInWithCatalogUser).toHaveBeenCalledWith({
        entityRef: { name: 'jdoe' },
      });
      expect(result).toEqual({ token: 'test-token' });
    });

    it('throws when preferred_username is missing from the Keycloak profile', async () => {
      // Arrange
      const ctx = createMockContext();
      const resolver =
        keycloakSignInResolvers.preferredUsernameMatchingUserEntityName();
      const info = createInfo({ email: 'jdoe@example.com' });

      // Act & Assert
      await expect(resolver(info, ctx)).rejects.toThrow(/preferred_username/);
      expect(ctx.signInWithCatalogUser).not.toHaveBeenCalled();
    });

    it('throws when preferred_username is whitespace-only', async () => {
      // Arrange
      const ctx = createMockContext();
      const resolver =
        keycloakSignInResolvers.preferredUsernameMatchingUserEntityName();
      const info = createInfo({ preferred_username: '   ' });

      // Act & Assert
      await expect(resolver(info, ctx)).rejects.toThrow(/preferred_username/);
      expect(ctx.signInWithCatalogUser).not.toHaveBeenCalled();
    });

    it('trims surrounding whitespace before matching the entity name', async () => {
      // Arrange
      const ctx = createMockContext();
      const resolver =
        keycloakSignInResolvers.preferredUsernameMatchingUserEntityName();
      const info = createInfo({ preferred_username: '  jdoe  ' });

      // Act
      await resolver(info, ctx);

      // Assert
      expect(ctx.signInWithCatalogUser).toHaveBeenCalledWith({
        entityRef: { name: 'jdoe' },
      });
    });

    it('preserves uppercase letters to match catalog Keycloak user entity names', async () => {
      // Arrange
      const ctx = createMockContext();
      const resolver =
        keycloakSignInResolvers.preferredUsernameMatchingUserEntityName();
      const info = createInfo({ preferred_username: 'Jane.Doe_Admin' });

      // Act
      await resolver(info, ctx);

      // Assert
      expect(ctx.signInWithCatalogUser).toHaveBeenCalledWith({
        entityRef: { name: 'Jane.Doe_Admin' },
      });
    });

    it('sanitizes invalid characters like the Keycloak catalog user transformer', async () => {
      // Arrange
      const ctx = createMockContext();
      const resolver =
        keycloakSignInResolvers.preferredUsernameMatchingUserEntityName();
      const info = createInfo({ preferred_username: 'Jane Doe/Admin@Example' });

      // Act
      await resolver(info, ctx);

      // Assert
      expect(ctx.signInWithCatalogUser).toHaveBeenCalledWith({
        entityRef: { name: 'Jane-Doe-Admin-Example' },
      });
    });
  });

  describe('common resolver delegation', () => {
    it('delegates emailMatchingUserEntityProfileEmail to commonSignInResolvers', () => {
      // Regression: reuse shared plus-addressing and domain checks.
      expect(keycloakSignInResolvers.emailMatchingUserEntityProfileEmail).toBe(
        commonSignInResolvers.emailMatchingUserEntityProfileEmail,
      );
    });

    it('delegates emailLocalPartMatchingUserEntityName to commonSignInResolvers', () => {
      expect(keycloakSignInResolvers.emailLocalPartMatchingUserEntityName).toBe(
        commonSignInResolvers.emailLocalPartMatchingUserEntityName,
      );
    });
  });
});
