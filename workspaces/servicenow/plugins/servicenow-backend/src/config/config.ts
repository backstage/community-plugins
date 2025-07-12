/*
 * Copyright 2025 The Backstage Authors
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

import { Config } from '@backstage/config';
import { InputError } from '@backstage/errors';
import type {
  BasicAuthConfig,
  OAuthConfig,
  ServiceNowConfig,
} from '../../config';

/**
 * Reads the ServiceNow configuration from the provided Config object.
 *
 * @param config - The Backstage configuration object.
 * @returns The parsed ServiceNow configuration, or undefined if not found.
 * @throws InputError if the configuration is invalid.
 * @public
 */
export function readServiceNowConfig(
  config: Config,
): ServiceNowConfig | undefined {
  const serviceNowConfig = config.getOptionalConfig('servicenow');
  if (!serviceNowConfig) {
    return undefined;
  }

  const instanceUrl = serviceNowConfig.getString('instanceUrl');
  if (!instanceUrl) {
    throw new InputError(
      'Missing required config value at servicenow.instanceUrl',
    );
  }

  let oauth: OAuthConfig | undefined = undefined;
  const oauthConfig = serviceNowConfig.getOptionalConfig('oauth');

  let basicAuth: BasicAuthConfig | undefined = undefined;
  const basicAuthConfig = serviceNowConfig.getOptionalConfig('basicAuth');

  if (oauthConfig && basicAuthConfig) {
    throw new InputError(
      'Both servicenow.oauth and servicenow.basicAuth are configured. Please use only one.',
    );
  }

  if (oauthConfig) {
    const grantType = oauthConfig.getString('grantType');
    if (grantType !== 'client_credentials' && grantType !== 'password') {
      throw new Error(`Unsupported OAuth grantType: ${grantType}`);
    }
    const clientId = oauthConfig.getString('clientId');
    const clientSecret = oauthConfig.getString('clientSecret');
    const tokenUrl = oauthConfig.getOptionalString('tokenUrl');

    if (!clientId) {
      throw new InputError(
        'Missing required config value at servicenow.oauth.clientId',
      );
    }
    if (!clientSecret) {
      throw new InputError(
        'Missing required config value at servicenow.oauth.clientSecret',
      );
    }

    if (grantType === 'client_credentials') {
      oauth = {
        grantType,
        clientId,
        clientSecret,
        tokenUrl,
      };
    } else if (grantType === 'password') {
      const username = oauthConfig.getString('username');
      const password = oauthConfig.getString('password');
      if (!username) {
        throw new InputError(
          "Missing required config value at servicenow.oauth.username for 'password' grant type",
        );
      }
      if (!password) {
        throw new InputError(
          "Missing required config value at servicenow.oauth.password for 'password' grant type",
        );
      }
      oauth = {
        grantType,
        clientId,
        clientSecret,
        username,
        password,
        tokenUrl,
      };
    } else {
      throw new InputError(
        `Invalid or missing 'grantType' in servicenow.oauth configuration. Must be 'client_credentials' or 'password'. Received: ${grantType}`,
      );
    }
  }

  if (basicAuthConfig) {
    const username = basicAuthConfig.getString('username');
    const password = basicAuthConfig.getString('password');
    if (!username) {
      throw new InputError(
        'Missing required config value at servicenow.basicAuth.username',
      );
    }
    if (!password) {
      throw new InputError(
        'Missing required config value at servicenow.basicAuth.password',
      );
    }
    basicAuth = {
      username,
      password,
    };
  }

  return {
    servicenow: {
      instanceUrl,
      oauth,
      basicAuth,
    },
  };
}
