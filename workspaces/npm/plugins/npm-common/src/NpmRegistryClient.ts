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
import { ResponseError } from '@backstage/errors';

import { NpmRegistryPackageInfo } from './types';

/**
 * @public
 */
export class NpmRegistryClient {
  private readonly fetch: typeof fetch;
  private readonly baseUrl: string;
  private readonly token?: string;
  private readonly extraRequestHeaders?: Record<string, string>;

  constructor(options: {
    fetch?: typeof fetch;
    baseUrl?: string;
    token?: string;
    extraRequestHeaders?: Record<string, string>;
  }) {
    this.fetch = options?.fetch || global.fetch.bind(global);
    this.baseUrl = options.baseUrl || 'https://registry.npmjs.com';
    this.token = options.token;
    this.extraRequestHeaders = options.extraRequestHeaders;
  }

  async getPackageInfo(packageName: string): Promise<NpmRegistryPackageInfo> {
    if (!packageName) {
      throw new Error('No package name provided');
    }

    const url = `${this.baseUrl}/${encodeURIComponent(packageName)}`;

    const response = await this.fetch(url, {
      headers: {
        ...this.extraRequestHeaders,
        ...(this.token ? { Authorization: this.token } : undefined),
      },
    });

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    return response.json();
  }
}
