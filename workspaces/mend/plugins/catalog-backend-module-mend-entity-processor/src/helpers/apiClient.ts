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

import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import {
  ProjectStatisticsItem,
  ProjectStatisticsResponse,
  MendAuthResponse,
  JwtLicenceKeyPayload,
} from './types';
import { LoggerService } from '@backstage/backend-plugin-api';

const MEND_API_VERSION = 'v3.0';
const PAGE_LIMIT = 10000;

const caesarCipherDecrypt = (activationKey: string): string => {
  let tmp = '';
  const OFFSET = 4;
  for (let i = 0; i < activationKey.length; i++) {
    tmp += String.fromCharCode(activationKey.charCodeAt(i) - OFFSET);
  }

  const reversed = tmp.split('').reverse().join('');
  return Buffer.from(reversed, 'base64').toString();
};

export class MendApiClient {
  private authToken: string | null = null;
  private organizationUuid: string | null = null;
  private tokenExpiry: number = 0;
  private baseUrl: string | null = null;
  private clientEmail: string | null = null;
  private clientKey: string | null = null;
  private configured: boolean = false;
  private configurationError: string = '';

  constructor(
    private readonly activationKey: string | undefined,
    private readonly logger: LoggerService,
  ) {
    this.configure();
  }

  private configure(): void {
    this.configured = false;
    this.configurationError = '';
    this.baseUrl = null;
    this.clientEmail = null;
    this.clientKey = null;

    if (!this.activationKey) {
      this.configurationError =
        'Mend activation key is not configured. Please set mend.activationKey in your app-config.';
      this.logger.warn(this.configurationError);
      return;
    }

    try {
      const licenseKey = caesarCipherDecrypt(this.activationKey);
      const decoded = jwt.decode(licenseKey);

      if (!decoded || typeof decoded !== 'object') {
        this.configurationError =
          'Invalid activation key. Please provide a valid Activation Key.';
        this.logger.error(this.configurationError);
        return;
      }

      const jwtPayload = decoded as JwtLicenceKeyPayload;
      const { wsEnvUrl, integratorEmail, userKey } = jwtPayload;

      if (
        !wsEnvUrl ||
        typeof wsEnvUrl !== 'string' ||
        !integratorEmail ||
        typeof integratorEmail !== 'string' ||
        !userKey ||
        typeof userKey !== 'string'
      ) {
        this.configurationError =
          'Invalid activation key. Please provide a valid Activation Key.';
        this.logger.error(
          'Invalid activation key: missing required fields (wsEnvUrl, integratorEmail, userKey).',
        );
        return;
      }

      let baseUrlObj: URL;
      try {
        baseUrlObj = new URL(wsEnvUrl);
      } catch {
        this.configurationError =
          'Invalid activation key. Please provide a valid Activation Key.';
        this.logger.error(
          'Invalid activation key: wsEnvUrl is not a valid URL.',
        );
        return;
      }

      baseUrlObj.hostname = `api-${baseUrlObj.hostname}`;
      baseUrlObj.pathname = `/api/${MEND_API_VERSION}`;

      this.baseUrl = baseUrlObj.toString();
      this.clientEmail = integratorEmail;
      this.clientKey = userKey;
      this.configured = true;
    } catch (err) {
      this.configurationError =
        'Something went wrong while configuring Mend. Please check the Activation Key.';
      this.logger.error(
        `Unexpected error while configuring Mend: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  private async authenticate(): Promise<boolean> {
    if (
      !this.configured ||
      !this.baseUrl ||
      !this.clientEmail ||
      !this.clientKey
    ) {
      this.logger.warn(
        `[CacheManager] ${
          this.configurationError || 'Mend is not configured properly.'
        }`,
      );
      return false;
    }

    // Check if token is still valid
    if (this.authToken && Date.now() < this.tokenExpiry) {
      return true;
    }

    try {
      // First, login to get refresh token
      const loginResponse = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'agent-name': 'pi-backstage',
          'agent-version': '24.8.2',
        },
        body: JSON.stringify({
          email: this.clientEmail,
          userKey: this.clientKey,
        }),
      });

      if (!loginResponse.ok) {
        throw new Error(
          `Login failed: ${loginResponse.status} ${loginResponse.statusText}`,
        );
      }

      const loginData = (await loginResponse.json()) as {
        response: { refreshToken: string };
      };
      if (!loginData?.response?.refreshToken) {
        throw new Error('Login failed: missing refreshToken in response');
      }

      // Then, get access token using refresh token
      const tokenResponse = await fetch(`${this.baseUrl}/login/accessToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'agent-name': 'pi-backstage',
          'agent-version': '24.8.2',
          'wss-refresh-token': loginData.response.refreshToken,
        },
      });

      if (!tokenResponse.ok) {
        throw new Error(
          `Refresh token failed: ${tokenResponse.status} ${tokenResponse.statusText}`,
        );
      }

      const tokenData = (await tokenResponse.json()) as MendAuthResponse;
      if (!tokenData?.response?.jwtToken) {
        throw new Error('Refresh token failed: missing jwtToken in response');
      }

      this.authToken = tokenData.response.jwtToken;
      this.organizationUuid = tokenData.response.orgUuid;
      // Set expiry to 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + 55 * 60 * 1000; // 55 minutes

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[CacheManager] Error authenticating with Mend API: ${errorMessage}`,
      );
      return false;
    }
  }

  async fetchAllProjects(): Promise<ProjectStatisticsItem[]> {
    const isAuthenticated = await this.authenticate();
    if (!isAuthenticated) {
      return [];
    }

    const projects: ProjectStatisticsItem[] = [];
    let cursor = '0';
    let hasMore = true;

    try {
      while (hasMore) {
        const response = await fetch(
          `${this.baseUrl}/orgs/${this.organizationUuid}/projects/summaries?limit=${PAGE_LIMIT}&cursor=${cursor}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.authToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          },
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch projects: ${response.status} ${response.statusText}`,
          );
        }

        const data = (await response.json()) as ProjectStatisticsResponse;
        projects.push(...data.response);

        const nextUrl = data.additionalData?.paging?.next;
        if (nextUrl) {
          const nextUrlParams = new URLSearchParams(nextUrl.split('?')[1]);
          cursor = nextUrlParams.get('cursor') || '0';
        } else {
          hasMore = false;
        }
      }

      this.logger.info(
        `[CacheManager] Fetched ${projects.length} Mend projects`,
      );
      return projects;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[CacheManager] Error fetching projects from Mend API: ${errorMessage}`,
      );
      return [];
    }
  }
}
