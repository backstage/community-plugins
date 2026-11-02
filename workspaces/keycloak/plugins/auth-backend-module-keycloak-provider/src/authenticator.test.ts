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

import { mockServices } from '@backstage/backend-test-utils';
import { encodeOAuthState } from '@backstage/plugin-auth-node';
import type { Request } from 'express';

const mockAuthorizationUrl = jest.fn();
const mockCallbackParams = jest.fn();
const mockCallback = jest.fn();
const mockUserinfo = jest.fn();
const mockRefresh = jest.fn();
const mockRevoke = jest.fn();
const mockEndSessionUrl = jest.fn();
const mockDiscover = jest.fn();

// Shared issuer metadata lets tests simulate optional OIDC endpoints.
const mockIssuerMetadata: {
  revocation_endpoint?: string;
  end_session_endpoint?: string;
} = {};

const setIssuerMetadata = (metadata: typeof mockIssuerMetadata) => {
  for (const key of Object.keys(mockIssuerMetadata) as Array<
    keyof typeof mockIssuerMetadata
  >) {
    delete mockIssuerMetadata[key];
  }
  Object.assign(mockIssuerMetadata, metadata);
};

// Issuer must be extendable and Client must support `new issuer.Client(...)`.
jest.mock('openid-client', () => {
  const httpOptions = Symbol('http_options');

  class MockClient {
    authorizationUrl = mockAuthorizationUrl;
    callbackParams = mockCallbackParams;
    callback = mockCallback;
    userinfo = mockUserinfo;
    refresh = mockRefresh;
    revoke = mockRevoke;
    endSessionUrl = mockEndSessionUrl;
    metadata = { client_id: 'test-client' };
    issuer = { metadata: mockIssuerMetadata };
  }

  class MockIssuer {
    static discover(...args: unknown[]) {
      return mockDiscover(...args);
    }
  }

  return {
    Issuer: MockIssuer,
    custom: { http_options: httpOptions },
    __MockClient: MockClient,
  };
});

import { keycloakAuthenticator } from './authenticator';

const baseConfig = {
  clientId: 'test-client',
  clientSecret: 'test-secret',
  baseUrl: 'https://keycloak.test',
  realm: 'test-realm',
};

const initContextWithoutDefaultMocks = (extra: Record<string, unknown> = {}) =>
  keycloakAuthenticator.initialize({
    callbackUrl: 'https://backstage.test/api/auth/keycloak/handler/frame',
    config: mockServices.rootConfig({ data: { ...baseConfig, ...extra } }),
  });

const initContext = (extra: Record<string, unknown> = {}) => {
  const { __MockClient } = jest.requireMock('openid-client');
  mockDiscover.mockResolvedValue({ Client: __MockClient });
  return initContextWithoutDefaultMocks(extra);
};

const req = {} as Request;

const NONCE = 'nonce-abc';
const encodedState = encodeOAuthState({
  env: 'development',
  nonce: NONCE,
});

describe('keycloakAuthenticator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setIssuerMetadata({
      revocation_endpoint:
        'https://keycloak.test/realms/test-realm/protocol/openid-connect/revoke',
      end_session_endpoint:
        'https://keycloak.test/realms/test-realm/protocol/openid-connect/logout',
    });
  });

  describe('initialize', () => {
    it('rejects the deprecated "scope" configuration option', () => {
      // Arrange & Act & Assert
      expect(() => initContext({ scope: 'openid profile' })).toThrow(
        /"scope" configuration option/,
      );
    });

    it('wraps issuer discovery failures with the issuer URL for context', async () => {
      // Arrange
      mockDiscover.mockRejectedValue(new Error('ECONNREFUSED'));

      // Act
      const ctx = initContextWithoutDefaultMocks();

      // Assert
      await expect(ctx.promise).rejects.toThrow(
        /Failed to discover Keycloak OIDC issuer at https:\/\/keycloak\.test\/realms\/test-realm/,
      );
    });

    it('strips multiple trailing slashes from baseUrl when building the issuer URL', async () => {
      // Arrange
      mockDiscover.mockRejectedValue(new Error('boom'));

      // Act
      const ctx = initContextWithoutDefaultMocks({
        baseUrl: 'https://keycloak.test///',
      });

      // Assert
      await expect(ctx.promise).rejects.toThrow(
        /https:\/\/keycloak\.test\/realms\/test-realm/,
      );
      expect(mockDiscover).toHaveBeenCalledWith(
        'https://keycloak.test/realms/test-realm',
      );
    });

    it('does not emit an unhandledRejection if discovery fails before any handler awaits', async () => {
      // Arrange
      mockDiscover.mockRejectedValue(new Error('boom'));
      const unhandled: unknown[] = [];
      const listener = (reason: unknown) => unhandled.push(reason);
      process.on('unhandledRejection', listener);

      try {
        // Act
        const ctx = initContextWithoutDefaultMocks();

        // Give Node a turn to report unhandled rejections before awaiting.
        await new Promise(resolve => setImmediate(resolve));
        await new Promise(resolve => setImmediate(resolve));

        // Assert
        expect(unhandled).toEqual([]);
        await expect(ctx.promise).rejects.toThrow(/boom/);
      } finally {
        process.removeListener('unhandledRejection', listener);
      }
    });
  });

  describe('start', () => {
    it('passes scope, state and the nonce decoded from the OAuth state to the authorization URL', async () => {
      // Arrange
      const ctx = initContext();
      mockAuthorizationUrl.mockReturnValue('https://keycloak.test/authorize');

      // Act
      await keycloakAuthenticator.start(
        {
          scope: 'openid profile email offline_access',
          state: encodedState,
          req,
        },
        ctx,
      );

      // Assert
      expect(mockAuthorizationUrl).toHaveBeenCalledWith({
        scope: 'openid profile email offline_access',
        state: encodedState,
        nonce: NONCE,
      });
    });

    it('rejects an invalid OAuth state that cannot be decoded', async () => {
      // Arrange
      const ctx = initContext();

      // Act & Assert
      await expect(
        keycloakAuthenticator.start(
          { scope: 'openid', state: 'not-a-valid-state', req },
          ctx,
        ),
      ).rejects.toThrow();
    });

    it('forwards the configured prompt to the authorization URL', async () => {
      // Arrange
      const ctx = initContext({ prompt: 'login' });
      mockAuthorizationUrl.mockReturnValue('https://keycloak.test/authorize');

      // Act
      await keycloakAuthenticator.start(
        { scope: 'openid', state: encodedState, req },
        ctx,
      );

      // Assert
      expect(mockAuthorizationUrl).toHaveBeenCalledWith(
        expect.objectContaining({ prompt: 'login' }),
      );
    });
  });

  describe('authenticate', () => {
    beforeEach(() => {
      mockCallbackParams.mockReturnValue({
        code: 'abc',
        state: encodedState,
      });
    });

    it('requires the ID Token nonce to match the nonce embedded in the OAuth state', async () => {
      // Arrange
      const ctx = initContext();
      mockCallback.mockResolvedValue({
        access_token: 'access-123',
        token_type: 'Bearer',
      });
      mockUserinfo.mockResolvedValue({ sub: 'user-1' });

      // Act
      await keycloakAuthenticator.authenticate({ req }, ctx);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ state: encodedState }),
        expect.objectContaining({ nonce: NONCE, state: encodedState }),
      );
    });

    it('returns a session populated from the Keycloak token response', async () => {
      // Arrange
      const ctx = initContext();
      mockCallback.mockResolvedValue({
        access_token: 'access-123',
        refresh_token: 'refresh-123',
        id_token: 'id-123',
        token_type: 'Bearer',
        scope: 'openid profile',
        expires_in: 300,
      });
      mockUserinfo.mockResolvedValue({ sub: 'user-1', email: 'a@b.com' });

      // Act
      const result = await keycloakAuthenticator.authenticate({ req }, ctx);

      // Assert
      expect(result.session).toEqual({
        accessToken: 'access-123',
        refreshToken: 'refresh-123',
        idToken: 'id-123',
        tokenType: 'Bearer',
        scope: 'openid profile',
        expiresInSeconds: 300,
      });
      expect(result.fullProfile).toEqual({ sub: 'user-1', email: 'a@b.com' });
    });

    it('throws when Keycloak returns a token response without an access token', async () => {
      // Arrange
      const ctx = initContext();
      mockCallback.mockResolvedValue({});

      // Act & Assert
      await expect(
        keycloakAuthenticator.authenticate({ req }, ctx),
      ).rejects.toThrow(/no access token returned/);
    });

    it('wraps authorization-code-exchange failures with context', async () => {
      // Arrange
      const ctx = initContext();
      mockCallback.mockRejectedValue(new Error('invalid_grant'));

      // Act & Assert
      await expect(
        keycloakAuthenticator.authenticate({ req }, ctx),
      ).rejects.toThrow(
        /Failed to exchange Keycloak authorization code: invalid_grant/,
      );
    });

    it('wraps userinfo failures with context', async () => {
      // Arrange
      const ctx = initContext();
      mockCallback.mockResolvedValue({
        access_token: 'access-123',
        token_type: 'Bearer',
      });
      mockUserinfo.mockRejectedValue(new Error('userinfo unreachable'));

      // Act & Assert
      await expect(
        keycloakAuthenticator.authenticate({ req }, ctx),
      ).rejects.toThrow(
        /Failed to fetch Keycloak userinfo: userinfo unreachable/,
      );
    });
  });

  describe('refresh', () => {
    // Regression: refresh must use the framework-provided token.
    it('forwards input.refreshToken to the OIDC client', async () => {
      // Arrange
      const ctx = initContext();
      mockRefresh.mockResolvedValue({
        access_token: 'new-access',
        refresh_token: 'new-refresh',
        token_type: 'Bearer',
        scope: 'openid',
      });
      mockUserinfo.mockResolvedValue({ sub: 'user-1' });

      // Act
      await keycloakAuthenticator.refresh(
        { refreshToken: 'original-refresh', scope: 'openid', req },
        ctx,
      );

      // Assert
      expect(mockRefresh).toHaveBeenCalledWith('original-refresh');
    });

    // Regression: rotated refresh tokens must stay in the session.
    it('returns the rotated refresh token in the session', async () => {
      // Arrange
      const ctx = initContext();
      mockRefresh.mockResolvedValue({
        access_token: 'new-access',
        refresh_token: 'rotated-refresh',
        token_type: 'Bearer',
        scope: 'openid',
      });
      mockUserinfo.mockResolvedValue({});

      // Act
      const result = await keycloakAuthenticator.refresh(
        { refreshToken: 'original', scope: 'openid', req },
        ctx,
      );

      // Assert
      expect(result.session.refreshToken).toBe('rotated-refresh');
    });

    // Non-rotating deployments omit `refresh_token`; keep the existing cookie.
    it('leaves session.refreshToken undefined when Keycloak does not rotate the refresh token', async () => {
      // Arrange
      const ctx = initContext();
      mockRefresh.mockResolvedValue({
        access_token: 'new-access',
        token_type: 'Bearer',
        scope: 'openid',
      });
      mockUserinfo.mockResolvedValue({});

      // Act
      const result = await keycloakAuthenticator.refresh(
        { refreshToken: 'original', scope: 'openid', req },
        ctx,
      );

      // Assert
      expect(result.session.refreshToken).toBeUndefined();
    });

    it('falls back the session scope to input.scope when Keycloak omits it', async () => {
      // Arrange
      const ctx = initContext();
      mockRefresh.mockResolvedValue({
        access_token: 'a',
        token_type: 'Bearer',
      });
      mockUserinfo.mockResolvedValue({});

      // Act
      const result = await keycloakAuthenticator.refresh(
        { refreshToken: 'r', scope: 'requested-scope', req },
        ctx,
      );

      // Assert
      expect(result.session.scope).toBe('requested-scope');
    });

    it('falls back the session tokenType to "bearer" when Keycloak omits it on refresh', async () => {
      // Arrange
      const ctx = initContext();
      mockRefresh.mockResolvedValue({
        access_token: 'a',
        scope: 'openid',
      });
      mockUserinfo.mockResolvedValue({});

      // Act
      const result = await keycloakAuthenticator.refresh(
        { refreshToken: 'r', scope: 'openid', req },
        ctx,
      );

      // Assert
      expect(result.session.tokenType).toBe('bearer');
    });

    it('throws when the refreshed token response has no access token', async () => {
      // Arrange
      const ctx = initContext();
      mockRefresh.mockResolvedValue({});

      // Act & Assert
      await expect(
        keycloakAuthenticator.refresh(
          { refreshToken: 'r', scope: '', req },
          ctx,
        ),
      ).rejects.toThrow(/no access token returned/);
    });

    it('wraps refresh failures with context', async () => {
      // Arrange
      const ctx = initContext();
      mockRefresh.mockRejectedValue(new Error('token expired'));

      // Act & Assert
      await expect(
        keycloakAuthenticator.refresh(
          { refreshToken: 'r', scope: '', req },
          ctx,
        ),
      ).rejects.toThrow(
        /Failed to refresh Keycloak access token: token expired/,
      );
    });

    it('wraps userinfo failures after refresh with context', async () => {
      // Arrange
      const ctx = initContext();
      mockRefresh.mockResolvedValue({
        access_token: 'new-access',
        token_type: 'Bearer',
      });
      mockUserinfo.mockRejectedValue(new Error('userinfo 500'));

      // Act & Assert
      await expect(
        keycloakAuthenticator.refresh(
          { refreshToken: 'r', scope: '', req },
          ctx,
        ),
      ).rejects.toThrow(
        /Failed to fetch Keycloak userinfo after refresh: userinfo 500/,
      );
    });
  });

  describe('defaultProfileTransform', () => {
    // Minimal resolver context; unused by this transform.
    const stubCtx = {} as Parameters<
      typeof keycloakAuthenticator.defaultProfileTransform
    >[1];

    it('prefers the name claim for the display name', async () => {
      // Arrange
      const result = {
        fullProfile: {
          sub: 'user-1',
          name: 'Jane Doe',
          preferred_username: 'jdoe',
          email: 'jane@example.com',
          picture: 'https://example.com/jane.png',
        },
        session: {} as any,
      };

      // Act
      const { profile } = await keycloakAuthenticator.defaultProfileTransform(
        result,
        stubCtx,
      );

      // Assert
      expect(profile).toEqual({
        displayName: 'Jane Doe',
        email: 'jane@example.com',
        picture: 'https://example.com/jane.png',
      });
    });

    it('falls back to preferred_username, then email, when name is missing', async () => {
      // Arrange
      const withUsername = {
        fullProfile: {
          sub: 'user-1',
          preferred_username: 'jdoe',
          email: 'jane@example.com',
        },
        session: {} as any,
      };
      const emailOnly = {
        fullProfile: { sub: 'user-1', email: 'jane@example.com' },
        session: {} as any,
      };

      // Act
      const first = await keycloakAuthenticator.defaultProfileTransform(
        withUsername,
        stubCtx,
      );
      const second = await keycloakAuthenticator.defaultProfileTransform(
        emailOnly,
        stubCtx,
      );

      // Assert
      expect(first.profile.displayName).toBe('jdoe');
      expect(second.profile.displayName).toBe('jane@example.com');
    });
  });

  describe('logout', () => {
    it('revokes the refresh token and returns the Keycloak end-session URL', async () => {
      // Arrange
      const ctx = initContext();
      mockRevoke.mockResolvedValue(undefined);
      mockEndSessionUrl.mockReturnValue(
        'https://keycloak.test/realms/test-realm/protocol/openid-connect/logout?client_id=test-client',
      );

      // Act
      const result = await keycloakAuthenticator.logout!(
        { req, refreshToken: 'rt-1' },
        ctx,
      );

      // Assert
      expect(mockRevoke).toHaveBeenCalledWith('rt-1', 'refresh_token');
      expect(mockEndSessionUrl).toHaveBeenCalledWith({
        client_id: 'test-client',
      });
      expect(result).toEqual({
        logoutUrl:
          'https://keycloak.test/realms/test-realm/protocol/openid-connect/logout?client_id=test-client',
      });
    });

    it('includes post_logout_redirect_uri when configured', async () => {
      // Arrange
      const ctx = initContext({
        postLogoutRedirectUri: 'https://backstage.test/signed-out',
      });
      mockRevoke.mockResolvedValue(undefined);
      mockEndSessionUrl.mockReturnValue(
        'https://keycloak.test/logout?redirect=signed-out',
      );

      // Act
      await keycloakAuthenticator.logout!({ req, refreshToken: 'rt-2' }, ctx);

      // Assert
      expect(mockEndSessionUrl).toHaveBeenCalledWith({
        client_id: 'test-client',
        post_logout_redirect_uri: 'https://backstage.test/signed-out',
      });
    });

    it('still returns an end-session URL when server-side revocation fails', async () => {
      // Arrange
      const ctx = initContext();
      mockRevoke.mockRejectedValue(new Error('revoke failed'));
      mockEndSessionUrl.mockReturnValue('https://keycloak.test/logout');

      // Act
      const result = await keycloakAuthenticator.logout!(
        { req, refreshToken: 'rt-3' },
        ctx,
      );

      // Assert
      expect(mockRevoke).toHaveBeenCalled();
      expect(result).toEqual({ logoutUrl: 'https://keycloak.test/logout' });
    });

    it('skips revocation when no refresh token is available', async () => {
      // Arrange
      const ctx = initContext();
      mockEndSessionUrl.mockReturnValue('https://keycloak.test/logout');

      // Act
      const result = await keycloakAuthenticator.logout!({ req }, ctx);

      // Assert
      expect(mockRevoke).not.toHaveBeenCalled();
      expect(result).toEqual({ logoutUrl: 'https://keycloak.test/logout' });
    });

    it('returns undefined when the issuer does not advertise an end_session_endpoint', async () => {
      // Arrange
      const ctx = initContext();
      setIssuerMetadata({
        revocation_endpoint:
          'https://keycloak.test/realms/test-realm/protocol/openid-connect/revoke',
        end_session_endpoint: undefined,
      });
      mockRevoke.mockResolvedValue(undefined);

      // Act
      const result = await keycloakAuthenticator.logout!(
        { req, refreshToken: 'rt-4' },
        ctx,
      );

      // Assert
      expect(result).toBeUndefined();
      expect(mockEndSessionUrl).not.toHaveBeenCalled();
    });

    it('skips revocation when the issuer does not advertise a revocation_endpoint', async () => {
      // Arrange
      const ctx = initContext();
      setIssuerMetadata({
        revocation_endpoint: undefined,
        end_session_endpoint: 'https://keycloak.test/logout',
      });
      mockEndSessionUrl.mockReturnValue('https://keycloak.test/logout');

      // Act
      const result = await keycloakAuthenticator.logout!(
        { req, refreshToken: 'rt-5' },
        ctx,
      );

      // Assert
      expect(mockRevoke).not.toHaveBeenCalled();
      expect(result).toEqual({ logoutUrl: 'https://keycloak.test/logout' });
    });

    // Regression: unexpected `endSessionUrl` errors must surface.
    it('propagates unexpected endSessionUrl errors', async () => {
      // Arrange
      const ctx = initContext();
      mockRevoke.mockResolvedValue(undefined);
      mockEndSessionUrl.mockImplementation(() => {
        throw new Error('unexpected internal failure');
      });

      // Act & Assert
      await expect(
        keycloakAuthenticator.logout!({ req, refreshToken: 'rt-6' }, ctx),
      ).rejects.toThrow(/unexpected internal failure/);
    });
  });
});
