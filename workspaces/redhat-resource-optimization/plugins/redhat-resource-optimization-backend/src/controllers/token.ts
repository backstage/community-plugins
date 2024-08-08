import assert from 'assert';
import type { RequestHandler } from 'express';
import type { GetTokenResponse } from '../models/token/GetTokenResponse';
import type { RouterOptions } from '../service/router';

const DEFAULT_SSO_BASE_URL = 'https://sso.redhat.com';

export const getToken: (options: RouterOptions) => RequestHandler =
  options => async (_, response) => {
    const { logger, config } = options;

    assert(typeof config !== 'undefined', 'Config is undefined');

    logger.info('Requesting new access token');

    const clientId = config.getString('resourceOptimization.clientId');
    const clientSecret = config.getString('resourceOptimization.clientSecret');
    const ssoBaseUrl =
      config.getOptionalString('resourceOptimization.ssoBaseUrl') ??
      DEFAULT_SSO_BASE_URL;

    const params = {
      tokenUrl: `${ssoBaseUrl}/auth/realms/redhat-external/protocol/openid-connect/token`,
      clientId,
      clientSecret,
      scope: 'api.console',
      grantType: 'client_credentials',
    } as const;

    const rhSsoResponse = await fetch(params.tokenUrl, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(
        Object.entries({
          client_id: params.clientId,
          client_secret: params.clientSecret,
          scope: params.scope,
          grant_type: params.grantType,
        }).map(([k, v]) => [encodeURIComponent(k), encodeURIComponent(v)]),
      ),
      method: 'POST',
    });

    if (rhSsoResponse.ok) {
      const { access_token, expires_in } = await rhSsoResponse.json();
      const body: GetTokenResponse = {
        accessToken: access_token,
        expiresAt: Date.now() + expires_in * 1000,
      };
      response.json(body);
    } else {
      throw new Error(rhSsoResponse.statusText);
    }
  };
