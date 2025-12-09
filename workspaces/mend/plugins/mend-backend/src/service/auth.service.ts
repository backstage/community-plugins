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
import jwt from 'jsonwebtoken';
import { post } from '../api';
import { caesarCipherDecrypt } from './auth.service.helpers';
import {
  JwtAuthToken,
  JwtLicenceKeyPayload,
  LoginSuccessResponseData,
  MendConfig,
  RefreshAccessTokenSuccessResponseData,
} from './auth.services.types';
import { LoggerService } from '@backstage/backend-plugin-api';

enum AuthRoutes {
  LOGIN = '/login',
  REFRESH_TOKEN = '/login/accessToken',
}

export class MendAuthSevice {
  private static authToken = '';
  private static refreshToken = '';
  private static baseUrl = '';
  private static clientEmail = '';
  private static clientKey = '';
  private static clientUrl = '';
  private static clientName = '';
  private static clientUuid = '';
  private static configured = false;
  private static configurationError = '';
  private static logger: LoggerService;

  constructor(config: MendConfig) {
    MendAuthSevice.init(config);
  }

  static init(config: MendConfig) {
    MendAuthSevice.logger = config.logger;
    MendAuthSevice.configure(config.apiVersion, config.activationKey);
  }

  private static configure(apiVersion: string, activationKey: string) {
    // Reset configuration state
    MendAuthSevice.configured = false;
    MendAuthSevice.configurationError = '';
    MendAuthSevice.baseUrl = '';
    MendAuthSevice.clientEmail = '';
    MendAuthSevice.clientKey = '';
    MendAuthSevice.clientUrl = '';

    // If no activation key provided, leave unconfigured but don't throw
    if (!activationKey) {
      MendAuthSevice.configurationError =
        'Mend activation key is not configured. Please set the Activation Key in the configuration file.';
      MendAuthSevice.logger?.warn(MendAuthSevice.configurationError);
      return;
    }

    try {
      const licenseKey = caesarCipherDecrypt(activationKey);

      // Decode the license key and validate payload shape
      const decoded = jwt.decode(licenseKey);
      if (!decoded || typeof decoded !== 'object') {
        MendAuthSevice.configurationError =
          'Invalid activation key. Please provide the valid Activation Key';
        MendAuthSevice.logger.error(MendAuthSevice.configurationError);
        return;
      }
      const jwtPayload = decoded as JwtLicenceKeyPayload;

      const { wsEnvUrl, integratorEmail, userKey } =
        (jwtPayload as Partial<JwtLicenceKeyPayload>) || {};

      // Validate required fields presence and types
      if (
        !wsEnvUrl ||
        typeof wsEnvUrl !== 'string' ||
        !integratorEmail ||
        typeof integratorEmail !== 'string' ||
        !userKey ||
        typeof userKey !== 'string'
      ) {
        MendAuthSevice.configurationError =
          'Invalid activation key. Please provide the valid Activation Key';
        MendAuthSevice.logger.error(
          'Invalid activation key: missing required fields (wsEnvUrl, integratorEmail, userKey).',
        );
        return;
      }

      // Create a baseUrl from the environment url with safety checks
      let baseUrl: URL;
      try {
        baseUrl = new URL(wsEnvUrl);
      } catch {
        MendAuthSevice.configurationError =
          'Invalid activation key. Please provide the valid Activation Key';
        MendAuthSevice.logger.error(
          'Invalid activation key: wsEnvUrl is not a valid URL.',
        );
        return;
      }
      baseUrl.hostname = `api-${baseUrl.hostname}`;
      baseUrl.pathname = `/api/${apiVersion}`;

      MendAuthSevice.baseUrl = baseUrl.toString();
      MendAuthSevice.clientEmail = integratorEmail;
      MendAuthSevice.clientKey = userKey;
      MendAuthSevice.clientUrl = wsEnvUrl;
      MendAuthSevice.configured = true;
    } catch (err) {
      MendAuthSevice.configurationError =
        'Something went wrong while configuring Mend. Please check the Activation Key';
      MendAuthSevice.logger?.error(
        `Unexpected error while configuring Mend: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      MendAuthSevice.baseUrl = '';
      MendAuthSevice.clientEmail = '';
      MendAuthSevice.clientKey = '';
      MendAuthSevice.clientUrl = '';
      MendAuthSevice.configured = false;
    }
  }

  private static async login(): Promise<void> {
    return post<LoginSuccessResponseData>(AuthRoutes.LOGIN, {
      body: {
        email: this.clientEmail,
        userKey: this.clientKey,
      },
    })
      .then(data => {
        if (!data?.response?.refreshToken) {
          throw new Error('Login failed: missing refreshToken in response');
        }
        this.refreshToken = data.response.refreshToken;
        return Promise.resolve();
      })
      .catch(err => {
        this.refreshToken = '';
        return Promise.reject(err);
      });
  }

  private static async refreshAccessToken(): Promise<void> {
    return post<RefreshAccessTokenSuccessResponseData>(
      AuthRoutes.REFRESH_TOKEN,
      {
        headers: {
          'wss-refresh-token': this.refreshToken,
        },
      },
    )
      .then(data => {
        if (!data?.response?.jwtToken) {
          throw new Error('Refresh token failed: missing jwtToken in response');
        }
        this.authToken = data.response.jwtToken;
        this.clientName = data.response.orgName ?? '';
        this.clientUuid = data.response.orgUuid ?? '';
        return Promise.resolve();
      })
      .catch(err => {
        this.authToken = '';
        this.clientName = '';
        this.clientUuid = '';
        return Promise.reject(err);
      });
  }

  static async connect(): Promise<void> {
    return MendAuthSevice.login()
      .then(() => MendAuthSevice.refreshAccessToken())
      .catch(err => {
        return Promise.reject(err);
      });
  }

  static async validateAuthToken(url: string): Promise<void> {
    if (
      [AuthRoutes.LOGIN, AuthRoutes.REFRESH_TOKEN].includes(url as AuthRoutes)
    ) {
      return Promise.resolve();
    }

    if (!this.authToken) {
      return this.connect();
    }

    const decoded = jwt.decode(this.authToken);
    if (!decoded || typeof decoded !== 'object' || !('exp' in decoded)) {
      return this.connect();
    }

    const token = decoded as JwtAuthToken;
    const expMs = Number(token.exp) * 1000;
    if (Number.isNaN(expMs) || expMs - Date.now() < 0) {
      return this.connect();
    }

    return Promise.resolve();
  }

  static getAuthToken(): string {
    return MendAuthSevice.authToken;
  }

  static getBaseUrl(): string {
    return MendAuthSevice.baseUrl;
  }

  static getOrganizationUuid(): string {
    return MendAuthSevice.clientUuid;
  }

  static getClientUrl(): string {
    return MendAuthSevice.clientUrl;
  }

  static getClientName(): string {
    return MendAuthSevice.clientName;
  }

  static isConfigured(): boolean {
    return MendAuthSevice.configured;
  }

  static getConfigurationError(): string {
    return MendAuthSevice.configurationError;
  }
}
