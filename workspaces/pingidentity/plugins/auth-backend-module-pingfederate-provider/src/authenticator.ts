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

import crypto from 'node:crypto';
import { Issuer, TokenSet, UserinfoResponse, Strategy } from 'openid-client';
import {
  createOAuthAuthenticator,
  OAuthAuthenticatorResult,
  PassportDoneCallback,
  PassportHelpers,
  PassportOAuthAuthenticatorHelper,
  PassportOAuthPrivateInfo,
} from '@backstage/plugin-auth-node';

/**
 * Authentication result for PingFederate OIDC which includes the token set and user
 * profile response
 * @public
 */
export type PingFederateAuthResult = {
  tokenset: TokenSet;
  userinfo: UserinfoResponse;
};

/**
 * PingFederate OIDC authenticator
 * @public
 */
export const pingfederateAuthenticator = createOAuthAuthenticator({
  defaultProfileTransform: async (
    input: OAuthAuthenticatorResult<PingFederateAuthResult>,
  ) => ({
    profile: {
      email: input.fullProfile.userinfo.email,
      picture: input.fullProfile.userinfo.picture,
      displayName: input.fullProfile.userinfo.name,
    },
  }),
  scopes: {
    persist: true,
    required: ['openid', 'profile', 'email'],
  },
  initialize({ callbackUrl, config }) {
    const clientId = config.getString('clientId');
    const clientSecret = config.getString('clientSecret');
    const baseUrl = config.getString('baseUrl');
    const metadataUrl = `${baseUrl}/.well-known/openid-configuration`;
    const customCallbackUrl = config.getOptionalString('callbackUrl');
    const initializedPrompt = config.getOptionalString('prompt');

    if (config.has('scope')) {
      throw new Error(
        'The PingFederate provider no longer supports the "scope" configuration option. Please use the "additionalScopes" option instead.',
      );
    }

    const promise = Issuer.discover(metadataUrl).then(issuer => {
      const client = new issuer.Client({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uris: [customCallbackUrl || callbackUrl],
        response_types: ['code'],
        token_endpoint_auth_method: 'client_secret_basic',
        id_token_signed_response_alg: 'RS256',
      });

      const strategy = new Strategy(
        {
          client,
          passReqToCallback: false,
        },
        (
          tokenset: TokenSet,
          userinfo: UserinfoResponse,
          done: PassportDoneCallback<
            PingFederateAuthResult,
            PassportOAuthPrivateInfo
          >,
        ) => {
          done(
            undefined,
            { tokenset, userinfo },
            { refreshToken: tokenset.refresh_token },
          );
        },
      );

      const helper = PassportOAuthAuthenticatorHelper.from(strategy);
      return { helper, client, strategy };
    });

    return { initializedPrompt, promise };
  },

  async start(input, ctx) {
    const { initializedPrompt, promise } = ctx;
    const { helper } = await promise;

    const options: Record<string, string> = {
      scope: input.scope,
      state: input.state,
      nonce: crypto.randomBytes(16).toString('base64'),
    };

    const prompt = initializedPrompt || 'none';
    if (prompt !== 'auto') {
      options.prompt = prompt;
    }

    return helper.start(input, {
      ...options,
    });
  },

  async authenticate(
    input,
    ctx,
  ): Promise<OAuthAuthenticatorResult<PingFederateAuthResult>> {
    const { strategy } = await ctx.promise;
    const { result, privateInfo } =
      await PassportHelpers.executeFrameHandlerStrategy<
        PingFederateAuthResult,
        PassportOAuthPrivateInfo
      >(input.req, strategy);

    return {
      fullProfile: result,
      session: {
        accessToken: result.tokenset.access_token!,
        tokenType: result.tokenset.token_type || 'bearer',
        scope: result.tokenset.scope!,
        expiresInSeconds: result.tokenset.expires_in,
        idToken: result.tokenset.id_token,
        refreshToken: privateInfo.refreshToken,
      },
    };
  },

  async refresh(input, ctx) {
    const { client } = await ctx.promise;
    const tokenset = await client.refresh(input.refreshToken);
    if (!tokenset.access_token) {
      throw new Error('Refresh failed');
    }
    const userinfo = await client.userinfo(tokenset.access_token);

    return new Promise((resolve, reject) => {
      if (!tokenset.access_token) {
        reject(new Error('Refresh Failed'));
      }
      resolve({
        fullProfile: { userinfo, tokenset },
        session: {
          accessToken: tokenset.access_token!,
          tokenType: tokenset.token_type ?? 'bearer',
          scope: tokenset.scope!,
          expiresInSeconds: tokenset.expires_in,
          idToken: tokenset.id_token,
          refreshToken: tokenset.refresh_token,
        },
      });
    });
  },

  async logout(input, ctx) {
    const { client } = await ctx.promise;
    const issuer = client.issuer;
    /**
     * Revoke the refresh token if PingFederate provides a revocation endpoint.
     * https://github.com/panva/node-openid-client/blob/main/lib/client.js#L1398
     * client.revoke will check revocation_endpoint and if undefined throw error.
     *
     * If the OIDC server does not provide revocation_endpoint, skip revocation.
     */

    if (input.refreshToken && issuer.revocation_endpoint) {
      await client.revoke(input.refreshToken);
    }
  },
});
