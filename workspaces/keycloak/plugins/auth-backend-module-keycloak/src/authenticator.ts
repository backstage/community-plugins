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
  createOAuthAuthenticator,
  decodeOAuthState,
  OAuthAuthenticatorLogoutResult,
} from '@backstage/plugin-auth-node';
import {
  Client,
  custom,
  CustomHttpOptionsProvider,
  Issuer,
  UserinfoResponse,
} from 'openid-client';

/**
 * Context for Keycloak OAuth authenticator.
 *
 * @public
 */
export type KeycloakAuthenticatorContext = {
  prompt?: string;
  promise: Promise<{
    client: Client;
    callbackUrl: string;
    postLogoutRedirectUri?: string;
  }>;
};

// Default `openid-client` timeout (3.5s) is too tight for Keycloak, which may stall on cold start or heavy load.
// Bump to 10s, matching the upstream `@backstage/plugin-auth-backend-module-oidc-provider`.
const HTTP_TIMEOUT_MS = 10000;

const httpOptionsProvider: CustomHttpOptionsProvider = (_url, options) => ({
  ...options,
  timeout: HTTP_TIMEOUT_MS,
});

// Mutating the shared `Issuer` class would leak into every other `openid-client` consumer
// loaded into the same Node process (e.g. `@backstage/plugin-auth-backend-module-oidc-provider`).
// Subclassing keeps the override scoped to this module.
class KeycloakIssuer extends Issuer {}
KeycloakIssuer[custom.http_options] = httpOptionsProvider;

/**
 * Authenticator for Keycloak OAuth.
 *
 * @public
 */
export const keycloakAuthenticator = createOAuthAuthenticator<
  KeycloakAuthenticatorContext,
  UserinfoResponse
>({
  scopes: {
    persist: true,
    required: ['openid', 'profile', 'email'],
  },

  defaultProfileTransform: async result => {
    const profile = result.fullProfile;
    return {
      profile: {
        email: profile.email,
        picture: profile.picture,
        displayName:
          profile.name ||
          profile.preferred_username ||
          profile.email ||
          profile.sub,
      },
    };
  },

  initialize({ config, callbackUrl }) {
    // Final scope is composed by the framework from `input.scope` + `scopes.required` + config `additionalScopes`.
    // A dedicated `scope` key is therefore unsupported to avoid confusion with that pipeline.
    if (config.has('scope')) {
      throw new Error(
        'The keycloak provider does not support the "scope" configuration option. Please use the standard "additionalScopes" option instead.',
      );
    }

    const clientId = config.getString('clientId');
    const clientSecret = config.getString('clientSecret');
    const baseUrl = config.getString('baseUrl').replace(/\/+$/, '');
    const realm = config.getString('realm');
    const postLogoutRedirectUri = config.getOptionalString(
      'postLogoutRedirectUri',
    );
    const prompt = config.getOptionalString('prompt');
    const issuerUrl = `${baseUrl}/realms/${realm}`;

    const promise = (async () => {
      let issuer: Issuer;
      try {
        issuer = await KeycloakIssuer.discover(issuerUrl);
      } catch (error) {
        throw new Error(
          `Failed to discover Keycloak OIDC issuer at ${issuerUrl}: ${
            (error as Error).message
          }`,
          { cause: error },
        );
      }

      issuer[custom.http_options] = httpOptionsProvider;
      issuer.Client[custom.http_options] = httpOptionsProvider;

      const client = new issuer.Client({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uris: [callbackUrl],
        response_types: ['code'],
      });
      client[custom.http_options] = httpOptionsProvider;

      return { client, callbackUrl, postLogoutRedirectUri };
    })();

    // Prevents `unhandledRejection` crashes if discovery fails during startup.
    // The error is preserved and will be surfaced when the promise is awaited by auth handlers later.
    void promise.catch(() => undefined);

    return { promise, prompt };
  },

  async start(input, { promise, prompt }) {
    const { client } = await promise;
    const { nonce } = decodeOAuthState(input.state);

    return {
      url: client.authorizationUrl({
        scope: input.scope,
        state: input.state,
        nonce,
        ...(prompt ? { prompt } : {}),
      }),
      status: 302,
    };
  },

  async authenticate(input, { promise }) {
    const { client, callbackUrl } = await promise;
    const params = client.callbackParams(input.req);

    // CSRF is handled by the framework via the nonce cookie.
    // We only need to verify the ID Token `nonce` against the decoded state.
    const expectedNonce = params.state
      ? decodeOAuthState(String(params.state)).nonce
      : undefined;

    let tokenSet;
    try {
      tokenSet = await client.callback(callbackUrl, params, {
        state: params.state,
        nonce: expectedNonce,
      });
    } catch (error) {
      throw new Error(
        `Failed to exchange Keycloak authorization code: ${
          (error as Error).message
        }`,
        { cause: error },
      );
    }

    if (!tokenSet.access_token) {
      throw new Error(
        'Keycloak authentication failed: no access token returned',
      );
    }

    let userInfo: UserinfoResponse;
    try {
      userInfo = await client.userinfo(tokenSet.access_token);
    } catch (error) {
      throw new Error(
        `Failed to fetch Keycloak userinfo: ${(error as Error).message}`,
        { cause: error },
      );
    }

    return {
      fullProfile: userInfo,
      session: {
        accessToken: tokenSet.access_token,
        tokenType: tokenSet.token_type ?? 'bearer',
        idToken: tokenSet.id_token,
        refreshToken: tokenSet.refresh_token,
        expiresInSeconds: tokenSet.expires_in,
        scope: tokenSet.scope ?? '',
      },
    };
  },

  async refresh(input, { promise }) {
    const { client } = await promise;

    let tokenSet;
    try {
      tokenSet = await client.refresh(input.refreshToken);
    } catch (error) {
      throw new Error(
        `Failed to refresh Keycloak access token: ${(error as Error).message}`,
        { cause: error },
      );
    }

    if (!tokenSet.access_token) {
      throw new Error('Keycloak refresh failed: no access token returned');
    }

    let userInfo: UserinfoResponse;
    try {
      userInfo = await client.userinfo(tokenSet.access_token);
    } catch (error) {
      throw new Error(
        `Failed to fetch Keycloak userinfo after refresh: ${
          (error as Error).message
        }`,
        { cause: error },
      );
    }

    return {
      fullProfile: userInfo,
      session: {
        accessToken: tokenSet.access_token,
        idToken: tokenSet.id_token,
        refreshToken: tokenSet.refresh_token,
        tokenType: tokenSet.token_type ?? 'bearer',
        // Keycloak may omit 'scope' if unchanged since the last request.
        // Fall back to requested scopes to prevent session permission loss.
        scope: tokenSet.scope ?? input.scope,
        expiresInSeconds: tokenSet.expires_in,
      },
    };
  },

  async logout(
    { refreshToken },
    { promise },
  ): Promise<void | OAuthAuthenticatorLogoutResult> {
    const { client, postLogoutRedirectUri } = await promise;
    const { metadata: issuerMetadata } = client.issuer;

    // Best-effort server-side revocation to prevent replay attacks.
    // Pre-checking `revocation_endpoint` ensures the catch block only
    // hides genuine network errors, not "missing endpoint" exceptions.
    if (refreshToken && issuerMetadata.revocation_endpoint) {
      try {
        await client.revoke(refreshToken, 'refresh_token');
      } catch {
        // Intentionally ignore transient errors.
        // A failed backend revocation must not block the primary RP-initiated logout flow.
      }
    }

    // Since Backstage omits the ID Token, we rely on `client_id` for logout.
    // If the issuer lacks an `end_session_endpoint` (e.g., old RHSSO),
    // return undefined to safely fall back to local cookie clearing.
    if (!issuerMetadata.end_session_endpoint) {
      return undefined;
    }

    const logoutUrl = client.endSessionUrl({
      client_id: client.metadata.client_id,
      ...(postLogoutRedirectUri
        ? { post_logout_redirect_uri: postLogoutRedirectUri }
        : {}),
    });
    return { logoutUrl };
  },
});
