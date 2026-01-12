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
import { LoggerService } from '@backstage/backend-plugin-api';
import { OAuthConfig, ServiceNowConfig } from '../../config';
import {
  ClientCredentials,
  ResourceOwnerPassword,
  ModuleOptions,
  AccessToken,
} from 'simple-oauth2';
import axios, { AxiosInstance } from 'axios';
import https from 'https';

export class ServiceNowConnection {
  private oauthClient?: ClientCredentials | ResourceOwnerPassword;
  private readonly instanceUrl: string;
  private readonly config: ServiceNowConfig;
  private readonly logger: LoggerService;
  private axiosInstance: AxiosInstance;

  constructor(config: ServiceNowConfig, logger: LoggerService) {
    this.config = config;
    this.logger = logger;

    if (!config.servicenow?.instanceUrl) {
      logger.error('ServiceNow instance url is missing. Please configure it.');
      throw new Error(
        'ServiceNow instance url is missing. Please configure it.',
      );
    }
    this.instanceUrl = config.servicenow?.instanceUrl.replace(/\/$/, '');

    if (!config.servicenow?.oauth && !config.servicenow?.basicAuth) {
      logger.error(
        'ServiceNow authentication configuration is missing. Please configure either OAuth or Basic Auth.',
      );
      throw new Error(
        'ServiceNow authentication configuration is missing. Please configure either OAuth or Basic Auth.',
      );
    }

    if (config.servicenow?.oauth) {
      this.setupOAuthClient(config.servicenow.oauth);
    }

    if (config.servicenow?.basicAuth) {
      logger.warn(
        'Basic authentication is configured for ServiceNow. This is not recommended for production environments.',
      );
    }

    this.axiosInstance = axios.create({
      baseURL: this.instanceUrl,
      httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 10 }),
      timeout: 10000,
    });
  }

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  private setupOAuthClient(oauth: OAuthConfig) {
    const determinedTokenUrl = `${this.instanceUrl}/oauth_token.do`;

    let tokenHost: string;
    let tokenPath: string;
    try {
      const parsedTokenUrl = new URL(determinedTokenUrl);
      tokenHost = parsedTokenUrl.origin;
      tokenPath = parsedTokenUrl.pathname;
    } catch (e: any) {
      this.logger.error(
        `Invalid tokenUrl constructed or provided: ${determinedTokenUrl}. Error: ${e.message}`,
      );
      throw new Error(`Invalid tokenUrl: ${determinedTokenUrl}`);
    }

    const oauthModuleOptions: ModuleOptions = {
      client: {
        id: oauth.clientId,
        secret: oauth.clientSecret,
      },
      auth: {
        tokenHost: tokenHost,
        tokenPath: tokenPath,
      },
      options: {
        authorizationMethod: 'body',
      },
    };

    if (oauth.grantType === 'client_credentials') {
      this.oauthClient = new ClientCredentials(oauthModuleOptions);
    } else if (oauth.grantType === 'password') {
      if (!oauth.username || !oauth.password) {
        this.logger.error(
          "Username and/or password missing for 'password' grant type in ServiceNow OAuth config.",
        );
        throw new Error(
          "Username and/or password missing for 'password' grant type.",
        );
      }
      this.oauthClient = new ResourceOwnerPassword(oauthModuleOptions);
    } else {
      const grantType = (oauth as any).grantType;
      this.logger.error(`Unsupported OAuth grantType: ${grantType}`);
      throw new Error(`Unsupported OAuth grantType: ${grantType}`);
    }
  }

  async getAuthHeaders(): Promise<{ Authorization: string }> {
    if (this.config.servicenow?.basicAuth) {
      const { username, password } = this.config.servicenow.basicAuth;
      const encodedCredentials = Buffer.from(
        `${username}:${password}`,
      ).toString('base64');
      return { Authorization: `Basic ${encodedCredentials}` };
    }

    if (this.config.servicenow?.oauth && this.oauthClient) {
      let accessToken: AccessToken;
      try {
        if (this.config.servicenow.oauth.grantType === 'client_credentials') {
          accessToken = await (this.oauthClient as ClientCredentials).getToken(
            {},
          );
        } else if (this.config.servicenow.oauth.grantType === 'password') {
          if (
            !this.config.servicenow.oauth.username ||
            !this.config.servicenow.oauth.password
          ) {
            throw new Error(
              "Username or password missing for 'password' grant type during token acquisition.",
            );
          }
          accessToken = await (
            this.oauthClient as ResourceOwnerPassword
          ).getToken({
            username: this.config.servicenow.oauth.username,
            password: this.config.servicenow.oauth.password,
          });
        } else {
          throw new Error(
            `Unsupported grantType in getAuthHeaders: ${
              (this.config.servicenow.oauth as any).grantType
            }`,
          );
        }

        const tokenData = accessToken.token;
        if (
          !tokenData ||
          typeof tokenData.access_token !== 'string' ||
          !tokenData.access_token
        ) {
          throw new Error(
            'Failed to obtain access_token string (token data is invalid or missing).',
          );
        }
        return { Authorization: `Bearer ${tokenData.access_token}` };
      } catch (error: any) {
        this.logger.error(`Error fetching ServiceNow token: ${error.message}`, {
          error: error.stack || error,
        });
        if (error.isAxiosError && error.response) {
          this.logger.error(
            `OAuth2 token error details: Status ${
              error.response.status
            }, Data: ${JSON.stringify(error.response.data)}`,
          );
        } else if (error.data && error.data.payload) {
          this.logger.error(
            `OAuth2 token error payload: ${JSON.stringify(error.data.payload)}`,
          );
        }
        throw new Error(`Failed to obtain access token: ${error.message}`);
      }
    }

    throw new Error('No authentication method configured.');
  }
}
