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
import { APIIRO_DEFAULT_BASE_URL } from '@backstage-community/plugin-apiiro-common';

/**
 * Minimal Apiiro auth service.
 *
 * Apiiro uses a bearer token provided via configuration.
 */
export class ApiiroAuthService {
  private static authToken = '';
  private static baseUrl = '';

  static async connect(config: Config): Promise<void> {
    try {
      const token = config.getString('apiiro.accessToken');
      const base = APIIRO_DEFAULT_BASE_URL;

      ApiiroAuthService.authToken = token;
      ApiiroAuthService.baseUrl = base.replace(/\/$/, '');

      return Promise.resolve();
    } catch (err) {
      ApiiroAuthService.authToken = '';
      ApiiroAuthService.baseUrl = '';
      return Promise.reject(err);
    }
  }

  static getBearerToken(): string {
    return ApiiroAuthService.authToken;
  }

  static getBaseUrl(): string {
    return ApiiroAuthService.baseUrl;
  }
}
