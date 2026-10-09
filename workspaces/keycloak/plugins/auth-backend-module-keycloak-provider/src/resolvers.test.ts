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

import { SignJWT } from 'jose';
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
  idToken?: string,
) =>
  ({
    profile,
    result: {
      fullProfile,
      session: {
        accessToken: 'test-access-token',
        tokenType: 'bearer',
        scope: 'openid profile email',
        ...(idToken !== undefined ? { idToken } : {}),
      },
    },
  } as any);

const signTestIdToken = async (payload: Record<string, unknown>) => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .sign(new TextEncoder().encode('unit-test-secret'));
};

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
      expect(ctx.signInWithCatalogUser).toHaveBeenCalledWith(
        { entityRef: { name: 'jdoe' } },
        { dangerousEntityRefFallback: undefined },
      );
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
      expect(ctx.signInWithCatalogUser).toHaveBeenCalledWith(
        { entityRef: { name: 'jdoe' } },
        { dangerousEntityRefFallback: undefined },
      );
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
      expect(ctx.signInWithCatalogUser).toHaveBeenCalledWith(
        { entityRef: { name: 'Jane.Doe_Admin' } },
        { dangerousEntityRefFallback: undefined },
      );
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
      expect(ctx.signInWithCatalogUser).toHaveBeenCalledWith(
        { entityRef: { name: 'Jane-Doe-Admin-Example' } },
        { dangerousEntityRefFallback: undefined },
      );
    });

    it('passes a dangerousEntityRefFallback when dangerouslyAllowSignInWithoutUserInCatalog is true', async () => {
      // Arrange
      const ctx = createMockContext();
      const resolver =
        keycloakSignInResolvers.preferredUsernameMatchingUserEntityName({
          dangerouslyAllowSignInWithoutUserInCatalog: true,
        });
      const info = createInfo({ preferred_username: 'jdoe' });

      // Act
      await resolver(info, ctx);

      // Assert
      expect(ctx.signInWithCatalogUser).toHaveBeenCalledWith(
        { entityRef: { name: 'jdoe' } },
        { dangerousEntityRefFallback: { entityRef: { name: 'jdoe' } } },
      );
    });

    it('uses the sanitized username for the dangerous fallback entity ref', async () => {
      // Regression: fallback entity ref must mirror the sanitized name used for
      // the catalog lookup so that downstream consumers see a consistent identity.
      const ctx = createMockContext();
      const resolver =
        keycloakSignInResolvers.preferredUsernameMatchingUserEntityName({
          dangerouslyAllowSignInWithoutUserInCatalog: true,
        });
      const info = createInfo({ preferred_username: 'Jane Doe/Admin@Example' });

      // Act
      await resolver(info, ctx);

      // Assert
      expect(ctx.signInWithCatalogUser).toHaveBeenCalledWith(
        { entityRef: { name: 'Jane-Doe-Admin-Example' } },
        {
          dangerousEntityRefFallback: {
            entityRef: { name: 'Jane-Doe-Admin-Example' },
          },
        },
      );
    });

    it('does not pass a dangerousEntityRefFallback when dangerouslyAllowSignInWithoutUserInCatalog is false', async () => {
      // Arrange
      const ctx = createMockContext();
      const resolver =
        keycloakSignInResolvers.preferredUsernameMatchingUserEntityName({
          dangerouslyAllowSignInWithoutUserInCatalog: false,
        });
      const info = createInfo({ preferred_username: 'jdoe' });

      // Act
      await resolver(info, ctx);

      // Assert
      expect(ctx.signInWithCatalogUser).toHaveBeenCalledWith(
        { entityRef: { name: 'jdoe' } },
        { dangerousEntityRefFallback: undefined },
      );
    });

    it('does not fall back when preferred_username is missing even if dangerouslyAllowSignInWithoutUserInCatalog is true', async () => {
      // Guard: enabling the fallback must not bypass the basic input validation.
      const ctx = createMockContext();
      const resolver =
        keycloakSignInResolvers.preferredUsernameMatchingUserEntityName({
          dangerouslyAllowSignInWithoutUserInCatalog: true,
        });
      const info = createInfo({ email: 'jdoe@example.com' });

      // Act & Assert
      await expect(resolver(info, ctx)).rejects.toThrow(/preferred_username/);
      expect(ctx.signInWithCatalogUser).not.toHaveBeenCalled();
    });
  });

  describe('oidcSubClaimMatchingKeycloakUserId', () => {
    it('signs in using keycloak.org/id annotation matching userinfo and id token sub', async () => {
      const ctx = createMockContext();
      const resolver =
        keycloakSignInResolvers.oidcSubClaimMatchingKeycloakUserId();
      const sub = '9cf51b5d-e066-4ed8-940c-dc6da77f81a5';
      const idToken = await signTestIdToken({ sub });
      const info = createInfo({ sub }, {}, idToken);

      const result = await resolver(info, ctx);

      expect(ctx.signInWithCatalogUser).toHaveBeenCalledWith(
        { annotations: { 'keycloak.org/id': sub } },
        { dangerousEntityRefFallback: undefined },
      );
      expect(result).toEqual({ token: 'test-token' });
    });

    it('throws when sub is missing from userinfo', async () => {
      const ctx = createMockContext();
      const resolver =
        keycloakSignInResolvers.oidcSubClaimMatchingKeycloakUserId();
      const idToken = await signTestIdToken({
        sub: '9cf51b5d-e066-4ed8-940c-dc6da77f81a5',
      });
      const info = createInfo({ preferred_username: 'jdoe' }, {}, idToken);

      await expect(resolver(info, ctx)).rejects.toThrow(/sub claim/);
      expect(ctx.signInWithCatalogUser).not.toHaveBeenCalled();
    });

    it('throws when id token is missing', async () => {
      const ctx = createMockContext();
      const resolver =
        keycloakSignInResolvers.oidcSubClaimMatchingKeycloakUserId();
      const sub = '9cf51b5d-e066-4ed8-940c-dc6da77f81a5';
      const info = createInfo({ sub });

      await expect(resolver(info, ctx)).rejects.toThrow(/ID token/);
      expect(ctx.signInWithCatalogUser).not.toHaveBeenCalled();
    });

    it('throws when id token sub does not match userinfo sub', async () => {
      const ctx = createMockContext();
      const resolver =
        keycloakSignInResolvers.oidcSubClaimMatchingKeycloakUserId();
      const idToken = await signTestIdToken({
        sub: '11111111-1111-1111-1111-111111111111',
      });
      const info = createInfo(
        { sub: '9cf51b5d-e066-4ed8-940c-dc6da77f81a5' },
        {},
        idToken,
      );

      await expect(resolver(info, ctx)).rejects.toThrow(/does not match/);
      expect(ctx.signInWithCatalogUser).not.toHaveBeenCalled();
    });

    it('passes dangerousEntityRefFallback when enabled', async () => {
      const ctx = createMockContext();
      const resolver =
        keycloakSignInResolvers.oidcSubClaimMatchingKeycloakUserId({
          dangerouslyAllowSignInWithoutUserInCatalog: true,
        });
      const sub = '9cf51b5d-e066-4ed8-940c-dc6da77f81a5';
      const idToken = await signTestIdToken({ sub });
      const info = createInfo({ sub }, {}, idToken);

      await resolver(info, ctx);

      expect(ctx.signInWithCatalogUser).toHaveBeenCalledWith(
        { annotations: { 'keycloak.org/id': sub } },
        {
          dangerousEntityRefFallback: { entityRef: { name: sub } },
        },
      );
    });
  });

  describe('ldapUuidMatchingAnnotation', () => {
    it('signs in using backstage.io/ldap-uuid when userinfo and id token ldap_uuid match', async () => {
      const ctx = createMockContext();
      const resolver = keycloakSignInResolvers.ldapUuidMatchingAnnotation();
      const ldapUuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const idToken = await signTestIdToken({
        sub: 'user-sub',
        ldap_uuid: ldapUuid,
      });
      const info = createInfo({ ldap_uuid: ldapUuid }, {}, idToken);

      const result = await resolver(info, ctx);

      expect(ctx.signInWithCatalogUser).toHaveBeenCalledWith(
        { annotations: { 'backstage.io/ldap-uuid': ldapUuid } },
        { dangerousEntityRefFallback: undefined },
      );
      expect(result).toEqual({ token: 'test-token' });
    });

    it('uses ldapUuidKey when provided', async () => {
      const ctx = createMockContext();
      const resolver = keycloakSignInResolvers.ldapUuidMatchingAnnotation({
        ldapUuidKey: 'directory_id',
      });
      const uuid = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
      const idToken = await signTestIdToken({
        sub: 'user-sub',
        directory_id: uuid,
      });
      const info = createInfo({ directory_id: uuid }, {}, idToken);

      await resolver(info, ctx);

      expect(ctx.signInWithCatalogUser).toHaveBeenCalledWith(
        { annotations: { 'backstage.io/ldap-uuid': uuid } },
        { dangerousEntityRefFallback: undefined },
      );
    });

    it('throws when the configured claim is missing from userinfo', async () => {
      const ctx = createMockContext();
      const resolver = keycloakSignInResolvers.ldapUuidMatchingAnnotation();
      const idToken = await signTestIdToken({
        sub: 'user-sub',
        ldap_uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      });
      const info = createInfo({ email: 'u@example.com' }, {}, idToken);

      await expect(resolver(info, ctx)).rejects.toThrow(/ldap_uuid/);
      expect(ctx.signInWithCatalogUser).not.toHaveBeenCalled();
    });

    it('throws when id token claim is not a valid UUID string', async () => {
      const ctx = createMockContext();
      const resolver = keycloakSignInResolvers.ldapUuidMatchingAnnotation();
      const validUuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const idToken = await signTestIdToken({
        sub: 'user-sub',
        ldap_uuid: 'not-a-uuid',
      });
      const info = createInfo({ ldap_uuid: validUuid }, {}, idToken);

      await expect(resolver(info, ctx)).rejects.toThrow(/valid UUID string/);
      expect(ctx.signInWithCatalogUser).not.toHaveBeenCalled();
    });

    it('throws when id token is missing', async () => {
      const ctx = createMockContext();
      const resolver = keycloakSignInResolvers.ldapUuidMatchingAnnotation();
      const ldapUuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const info = createInfo({ ldap_uuid: ldapUuid });

      await expect(resolver(info, ctx)).rejects.toThrow(/ID token/);
      expect(ctx.signInWithCatalogUser).not.toHaveBeenCalled();
    });

    it('throws when id token claim does not match userinfo', async () => {
      const ctx = createMockContext();
      const resolver = keycloakSignInResolvers.ldapUuidMatchingAnnotation();
      const idToken = await signTestIdToken({
        sub: 'user-sub',
        ldap_uuid: '11111111-1111-1111-1111-111111111111',
      });
      const info = createInfo(
        { ldap_uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
        {},
        idToken,
      );

      await expect(resolver(info, ctx)).rejects.toThrow(/mismatching UUID/);
      expect(ctx.signInWithCatalogUser).not.toHaveBeenCalled();
    });

    it('throws when userinfo claim is not a valid UUID string', async () => {
      const ctx = createMockContext();
      const resolver = keycloakSignInResolvers.ldapUuidMatchingAnnotation();
      const idToken = await signTestIdToken({
        sub: 'user-sub',
        ldap_uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      });
      const info = createInfo({ ldap_uuid: 'not-a-uuid' }, {}, idToken);

      await expect(resolver(info, ctx)).rejects.toThrow(/valid UUID string/);
      expect(ctx.signInWithCatalogUser).not.toHaveBeenCalled();
    });

    it('passes dangerousEntityRefFallback when enabled', async () => {
      const ctx = createMockContext();
      const resolver = keycloakSignInResolvers.ldapUuidMatchingAnnotation({
        dangerouslyAllowSignInWithoutUserInCatalog: true,
      });
      const ldapUuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const idToken = await signTestIdToken({
        sub: 'user-sub',
        ldap_uuid: ldapUuid,
      });
      const info = createInfo({ ldap_uuid: ldapUuid }, {}, idToken);

      await resolver(info, ctx);

      expect(ctx.signInWithCatalogUser).toHaveBeenCalledWith(
        { annotations: { 'backstage.io/ldap-uuid': ldapUuid } },
        {
          dangerousEntityRefFallback: { entityRef: { name: ldapUuid } },
        },
      );
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
