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
import { FetchApi } from '@backstage/frontend-plugin-api';
import { NpmRegistryPackageInfo } from '@backstage-community/plugin-npm-common';

import { NpmBackendApi } from './NpmBackendApi';

export type Options = {
  fetchApi: FetchApi;
};

export class NpmBackendClient implements NpmBackendApi {
  private readonly fetchApi: FetchApi;

  constructor(options: Options) {
    this.fetchApi = options.fetchApi;
  }

  async getPackageInfo(entityRef: string): Promise<NpmRegistryPackageInfo> {
    const url = `plugin://npm/${encodeURIComponent(entityRef)}/package-info`;

    const response = await this.fetchApi.fetch(url);
    if (!response.ok) {
      throw new Error(
        `Unexpected status code: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data as NpmRegistryPackageInfo;
  }
}
