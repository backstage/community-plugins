/*
 * Copyright 2024 The Backstage Authors
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
import fs from 'fs';
import https from 'https';
import type { LoggerService } from '@backstage/backend-plugin-api';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { KialiDetails } from '../service/config';
import {
  AuthInfo,
  AuthStrategy,
  KialiAuthentication,
  SessionInfo,
} from './Auth';

export enum ValidationCategory {
  configuration = 'configuration',
  authentication = 'authentication',
  versionSupported = 'versionSupported',
  networking = 'networking',
  unknown = 'unknown',
}

export type KialiValidations = {
  verify: boolean;
  category: ValidationCategory;
  title?: string;
  missingAttributes?: string[];
  message?: string;
  helper?: string;
  authData?: AuthInfo;
};

const TIMEOUT_FETCH = 8000;
export class KialiFetcher {
  private readonly logger: LoggerService;
  private kialiAuth: KialiAuthentication;
  private KialiDetails: KialiDetails;

  constructor(KD: KialiDetails, logger: LoggerService) {
    this.KialiDetails = KD;
    this.logger = logger;
    this.kialiAuth = new KialiAuthentication(KD);
  }

  newRequest = async <P>(endpoint: string, auth: boolean = false) => {
    this.logger.info(`Query to ${endpoint}`);
    return axios.request<P>(this.getRequestInit(endpoint, auth));
  };

  private async getAuthInfo(): Promise<AuthInfo> {
    return this.newRequest<AuthInfo>('api/auth/info').then(resp => resp.data);
  }

  getAuthData(): AuthInfo {
    return this.kialiAuth.getSession();
  }

  private validateConfiguration = (auth: AuthInfo): KialiValidations => {
    const result: KialiValidations = {
      verify: true,
      category: ValidationCategory.unknown,
      authData: auth,
    };
    switch (auth.strategy) {
      case AuthStrategy.anonymous:
        break;
      case AuthStrategy.token: {
        if (
          !this.KialiDetails.serviceAccountToken ||
          this.KialiDetails.serviceAccountToken === ''
        ) {
          result.verify = false;
          result.title = 'Authentication failed. Missing Configuration';
          result.category = ValidationCategory.configuration;
          result.message = `Attribute 'serviceAccountToken' is not in the backstage configuration`;
          result.helper = `For more information follow the steps in https://github.com/backstage/community-plugins/tree/main/workspaces/kiali`;
          result.missingAttributes = ['serviceAccountToken'];
        }
        break;
      }
      default:
        result.verify = false;
        result.category = ValidationCategory.configuration;
        result.title = 'Authentication failed. Not supported';
        result.message = `Strategy ${auth.strategy} is not supported in Kiali backstage plugin yet`;
        break;
    }

    return result;
  };

  async checkSession(): Promise<KialiValidations> {
    let checkValidations: KialiValidations = {
      verify: true,
      category: ValidationCategory.unknown,
    };
    /*
     * Get/Update AuthInformation from /api/auth/info
     */

    try {
      const auth = await this.getAuthInfo();
      this.kialiAuth.setAuthInfo(auth);
      this.logger.info(`AuthInfo: ${JSON.stringify(auth)}`);
      /*
       * Check Configuration
       */
      checkValidations = this.validateConfiguration(auth);
    } catch (error: any) {
      return {
        verify: false,
        category: ValidationCategory.networking,
        title: 'Error reaching Kiali',
        message: error.message || '',
        helper: `Check if ${this.KialiDetails.url} works`,
      };
    }

    /*
     * Check if the actual cookie/session is valid and if the configuration is right
     */
    if (checkValidations.verify && this.kialiAuth.shouldRelogin()) {
      this.logger.info(`User must relogin`);
      await this.newRequest<AuthInfo>('api/authenticate', true)
        .then(resp => {
          const session = resp.data as SessionInfo;
          this.kialiAuth.setSession(session);
          this.kialiAuth.setKialiCookie(
            resp.headers['set-cookie']?.join(';') || '',
            this.KialiDetails.tokenName || 'kiali-token-Kubernetes',
          );
          this.logger.info(`User ${session.username} logged in kiali plugin`);
        })
        .catch(err => {
          checkValidations.verify = false;
          checkValidations.category = ValidationCategory.authentication;
          checkValidations.title = 'Authentication failed';
          checkValidations.message = this.handleUnsuccessfulResponse(err);
        });
    }
    return checkValidations;
  }

  private bufferFromFileOrString(file?: string, data?: string): Buffer | null {
    if (file) {
      return fs.readFileSync(file);
    }
    if (data) {
      return Buffer.from(data, 'base64');
    }
    return null;
  }

  private getRequestInit = (
    endpoint: string,
    auth: boolean = false,
  ): AxiosRequestConfig => {
    const requestInit: AxiosRequestConfig = { timeout: TIMEOUT_FETCH };
    const headers = { 'X-Auth-Type-Kiali-UI': '1' };

    /*
      Check if is an authentication request to add the serviceAccountToken
    */
    if (auth) {
      const params = new URLSearchParams();
      params.append('token', this.KialiDetails.serviceAccountToken || '');
      requestInit.headers = headers;
      requestInit.data = params;
      requestInit.method = 'post';
    } else {
      requestInit.method = 'get';
      requestInit.headers = {
        ...headers,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        cookie: this.kialiAuth.getCookie(),
      };
    }
    /*
      kialiDetails.utl is formatted to make sure it ends in '/'
      We check that endpoint does not begin with '/'
    */
    const loginUrl = `${this.KialiDetails.url}${endpoint.replace(/^\//g, '')}`;
    requestInit.url = new URL(loginUrl).href;

    if (this.KialiDetails.skipTLSVerify) {
      requestInit.httpsAgent = new https.Agent({
        rejectUnauthorized: false,
        ca:
          this.bufferFromFileOrString(
            this.KialiDetails.caFile,
            this.KialiDetails.caData,
          ) ?? undefined,
      });
    }
    return requestInit;
  };

  private handleUnsuccessfulResponse(
    res: AxiosError,
    endpoint?: string,
  ): string {
    const message = res.message;
    const url = endpoint || res.config?.url || '';
    const urlMessage = url ? `when fetching "${url}" in "Kiali";` : '';
    return `[${
      res.code || 'UNKNOWN_ERROR'
    }] Fetching ${urlMessage} body=[${message}]`;
  }
}
