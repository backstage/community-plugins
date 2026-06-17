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
import type { TokenSet, UserinfoResponse } from 'openid-client';
import {
  AuthResolverContext,
  commonSignInResolvers,
  type OAuthAuthenticatorResult,
  type SignInInfo,
} from '@backstage/plugin-auth-node';
import type { PingFederateAuthResult } from './authenticator';
import { pingfederateSignInResolvers } from './resolvers';

type PingFederateSignInInfo = SignInInfo<
  OAuthAuthenticatorResult<PingFederateAuthResult>
>;

const createMockContext = (): jest.Mocked<AuthResolverContext> => ({
  issueToken: jest.fn(),
  findCatalogUser: jest.fn(),
  signInWithCatalogUser: jest.fn().mockResolvedValue({ token: 'test-token' }),
  resolveOwnershipEntityRefs: jest.fn(),
});

const signTestIdToken = async (payload: Record<string, unknown>) => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .sign(new TextEncoder().encode('unit-test-secret'));
};

const createInfo = (
  userinfo: UserinfoResponse | Record<string, unknown>,
  idToken?: string,
): PingFederateSignInInfo => ({
  profile: {},
  result: {
    fullProfile: {
      userinfo: userinfo as UserinfoResponse,
      tokenset: (idToken !== undefined
        ? { id_token: idToken }
        : {}) as TokenSet,
    },
    session: {
      accessToken: 'test-access-token',
      tokenType: 'bearer',
      scope: 'openid profile email',
    },
  },
});

describe('pingfederateSignInResolvers', () => {
  describe('subClaimMatchingPingIdentityUserId', () => {
    it('signs in using pingidentity.org/id annotation when userinfo and id token sub match', async () => {
      const ctx = createMockContext();
      const resolver =
        pingfederateSignInResolvers.subClaimMatchingPingIdentityUserId();
      const sub = '9cf51b5d-e066-4ed8-940c-dc6da77f81a5';
      const idToken = await signTestIdToken({ sub });
      const info = createInfo({ sub }, idToken);

      const result = await resolver(info, ctx);

      expect(ctx.signInWithCatalogUser).toHaveBeenCalledWith(
        { annotations: { 'pingidentity.org/id': sub } },
        { dangerousEntityRefFallback: undefined },
      );
      expect(result).toEqual({ token: 'test-token' });
    });

    it('throws when sub is missing from userinfo', async () => {
      const ctx = createMockContext();
      const resolver =
        pingfederateSignInResolvers.subClaimMatchingPingIdentityUserId();
      const idToken = await signTestIdToken({
        sub: '9cf51b5d-e066-4ed8-940c-dc6da77f81a5',
      });
      const info = createInfo({ email: 'user@example.com' }, idToken);

      await expect(resolver(info, ctx)).rejects.toThrow(
        /missing a 'sub' claim/,
      );
      expect(ctx.signInWithCatalogUser).not.toHaveBeenCalled();
    });

    it('throws when id token is missing', async () => {
      const ctx = createMockContext();
      const resolver =
        pingfederateSignInResolvers.subClaimMatchingPingIdentityUserId();
      const sub = '9cf51b5d-e066-4ed8-940c-dc6da77f81a5';
      const info = createInfo({ sub });

      await expect(resolver(info, ctx)).rejects.toThrow(/ID token/);
      expect(ctx.signInWithCatalogUser).not.toHaveBeenCalled();
    });

    it('throws when id token sub does not match userinfo sub', async () => {
      const ctx = createMockContext();
      const resolver =
        pingfederateSignInResolvers.subClaimMatchingPingIdentityUserId();
      const idToken = await signTestIdToken({
        sub: '11111111-1111-1111-1111-111111111111',
      });
      const info = createInfo(
        { sub: '9cf51b5d-e066-4ed8-940c-dc6da77f81a5' },
        idToken,
      );

      await expect(resolver(info, ctx)).rejects.toThrow(
        /mismatching 'sub' claim/,
      );
      expect(ctx.signInWithCatalogUser).not.toHaveBeenCalled();
    });

    it('passes dangerousEntityRefFallback when enabled', async () => {
      const ctx = createMockContext();
      const resolver =
        pingfederateSignInResolvers.subClaimMatchingPingIdentityUserId({
          dangerouslyAllowSignInWithoutUserInCatalog: true,
        });
      const sub = '9cf51b5d-e066-4ed8-940c-dc6da77f81a5';
      const idToken = await signTestIdToken({ sub });
      const info = createInfo({ sub }, idToken);

      await resolver(info, ctx);

      expect(ctx.signInWithCatalogUser).toHaveBeenCalledWith(
        { annotations: { 'pingidentity.org/id': sub } },
        { dangerousEntityRefFallback: { entityRef: sub } },
      );
    });
  });

  describe('ldapUuidMatchingAnnotation', () => {
    it('signs in using backstage.io/ldap-uuid when userinfo and id token ldap_uuid match', async () => {
      const ctx = createMockContext();
      const resolver = pingfederateSignInResolvers.ldapUuidMatchingAnnotation();
      const ldapUuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const idToken = await signTestIdToken({
        sub: 'user-sub',
        ldap_uuid: ldapUuid,
      });
      const info = createInfo({ ldap_uuid: ldapUuid }, idToken);

      const result = await resolver(info, ctx);

      expect(ctx.signInWithCatalogUser).toHaveBeenCalledWith(
        { annotations: { 'backstage.io/ldap-uuid': ldapUuid } },
        { dangerousEntityRefFallback: undefined },
      );
      expect(result).toEqual({ token: 'test-token' });
    });

    it('uses ldapUuidKey when provided', async () => {
      const ctx = createMockContext();
      const resolver = pingfederateSignInResolvers.ldapUuidMatchingAnnotation({
        ldapUuidKey: 'directory_id',
      });
      const uuid = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
      const idToken = await signTestIdToken({
        sub: 'user-sub',
        directory_id: uuid,
      });
      const info = createInfo({ directory_id: uuid }, idToken);

      await resolver(info, ctx);

      expect(ctx.signInWithCatalogUser).toHaveBeenCalledWith(
        { annotations: { 'backstage.io/ldap-uuid': uuid } },
        { dangerousEntityRefFallback: undefined },
      );
    });

    it('throws when the configured claim is missing from userinfo', async () => {
      const ctx = createMockContext();
      const resolver = pingfederateSignInResolvers.ldapUuidMatchingAnnotation();
      const idToken = await signTestIdToken({
        sub: 'user-sub',
        ldap_uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      });
      const info = createInfo({ email: 'u@example.com' }, idToken);

      await expect(resolver(info, ctx)).rejects.toThrow(/ldap_uuid/);
      expect(ctx.signInWithCatalogUser).not.toHaveBeenCalled();
    });

    it('throws when userinfo claim is not a valid UUID string', async () => {
      const ctx = createMockContext();
      const resolver = pingfederateSignInResolvers.ldapUuidMatchingAnnotation();
      const idToken = await signTestIdToken({
        sub: 'user-sub',
        ldap_uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      });
      const info = createInfo({ ldap_uuid: 'not-a-uuid' }, idToken);

      await expect(resolver(info, ctx)).rejects.toThrow(/valid UUID string/);
      expect(ctx.signInWithCatalogUser).not.toHaveBeenCalled();
    });

    it('throws when id token is missing', async () => {
      const ctx = createMockContext();
      const resolver = pingfederateSignInResolvers.ldapUuidMatchingAnnotation();
      const ldapUuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const info = createInfo({ ldap_uuid: ldapUuid });

      await expect(resolver(info, ctx)).rejects.toThrow(/ID token/);
      expect(ctx.signInWithCatalogUser).not.toHaveBeenCalled();
    });

    it('throws when id token claim is not a valid UUID string', async () => {
      const ctx = createMockContext();
      const resolver = pingfederateSignInResolvers.ldapUuidMatchingAnnotation();
      const validUuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const idToken = await signTestIdToken({
        sub: 'user-sub',
        ldap_uuid: 'not-a-uuid',
      });
      const info = createInfo({ ldap_uuid: validUuid }, idToken);

      await expect(resolver(info, ctx)).rejects.toThrow(/valid UUID string/);
      expect(ctx.signInWithCatalogUser).not.toHaveBeenCalled();
    });

    it('throws when id token claim does not match userinfo', async () => {
      const ctx = createMockContext();
      const resolver = pingfederateSignInResolvers.ldapUuidMatchingAnnotation();
      const idToken = await signTestIdToken({
        sub: 'user-sub',
        ldap_uuid: '11111111-1111-1111-1111-111111111111',
      });
      const info = createInfo(
        { ldap_uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
        idToken,
      );

      await expect(resolver(info, ctx)).rejects.toThrow(/mismatching UUID/);
      expect(ctx.signInWithCatalogUser).not.toHaveBeenCalled();
    });

    it('passes dangerousEntityRefFallback when enabled', async () => {
      const ctx = createMockContext();
      const resolver = pingfederateSignInResolvers.ldapUuidMatchingAnnotation({
        dangerouslyAllowSignInWithoutUserInCatalog: true,
      });
      const ldapUuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const idToken = await signTestIdToken({
        sub: 'user-sub',
        ldap_uuid: ldapUuid,
      });
      const info = createInfo({ ldap_uuid: ldapUuid }, idToken);

      await resolver(info, ctx);

      expect(ctx.signInWithCatalogUser).toHaveBeenCalledWith(
        { annotations: { 'backstage.io/ldap-uuid': ldapUuid } },
        { dangerousEntityRefFallback: { entityRef: ldapUuid } },
      );
    });
  });

  describe('common resolver delegation', () => {
    it('delegates emailMatchingUserEntityProfileEmail to commonSignInResolvers', () => {
      expect(
        pingfederateSignInResolvers.emailMatchingUserEntityProfileEmail,
      ).toBe(commonSignInResolvers.emailMatchingUserEntityProfileEmail);
    });

    it('delegates emailLocalPartMatchingUserEntityName to commonSignInResolvers', () => {
      expect(
        pingfederateSignInResolvers.emailLocalPartMatchingUserEntityName,
      ).toBe(commonSignInResolvers.emailLocalPartMatchingUserEntityName);
    });
  });
});
