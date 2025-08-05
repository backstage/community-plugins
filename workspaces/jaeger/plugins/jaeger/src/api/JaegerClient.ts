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

import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import {
  convertTimeStringToMicroSeconds,
  getCurrentTimeInMicroseconds,
} from '../utils';

import { JaegerApi } from './JaegerApi';

export class JaegerClient implements JaegerApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  async getTraces(
    serviceName: string,
    operation = '',
    limit = 20,
    lookback = '1h',
  ): Promise<any> {
    const apiUrl = await this.getApiUrl();
    let fetchUrl = `${apiUrl}/traces?service=${serviceName}&limit=${limit}`;
    if (operation !== undefined && operation !== '') {
      fetchUrl = `${fetchUrl}&operation=${operation}`;
    }
    if (lookback !== undefined && lookback !== '') {
      const lookbackInMicroseconds = convertTimeStringToMicroSeconds(lookback);
      const endTime = getCurrentTimeInMicroseconds();
      const startTime = endTime - lookbackInMicroseconds;
      fetchUrl = `${fetchUrl}&lookback=${lookback}&start=${startTime}&end=${endTime}`;
    }

    // const res = await this.fetchApi.fetch(`${apiUrl}?limit=${limit}&service=${serviceName}&lookback=${lookback}&servicePath=${servicePath}`);
    const res = await this.fetchApi.fetch(fetchUrl);
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }

    return await res.json();
  }

  private async getApiUrl() {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    return `${proxyUrl}/jaeger-api`;
  }
}
