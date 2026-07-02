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
import {
  DoraMetrics,
  DoraMetricsTrend,
  DoraTeam,
} from '@backstage-community/plugin-devlake-common';
import { DevlakeApi } from './DevlakeApi';

/** @internal */
export class DevlakeClientImpl implements DevlakeApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  private async getBaseUrl(): Promise<string> {
    return this.discoveryApi.getBaseUrl('devlake');
  }

  async getTeams(): Promise<DoraTeam[]> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(`${baseUrl}/teams`);

    if (!response.ok) {
      throw new Error(`Failed to fetch teams: ${response.statusText}`);
    }

    return response.json();
  }

  async getDoraMetrics(options: {
    team: string;
    from?: string;
    to?: string;
    preset?: string;
  }): Promise<DoraMetrics> {
    const baseUrl = await this.getBaseUrl();
    const params = new URLSearchParams({ team: options.team });
    if (options.from) params.set('from', options.from);
    if (options.to) params.set('to', options.to);
    if (options.preset) params.set('preset', options.preset);

    const response = await this.fetchApi.fetch(
      `${baseUrl}/dora/metrics?${params}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch DORA metrics: ${response.statusText}`);
    }

    return response.json();
  }

  async getDoraTrend(options: {
    team: string;
    from?: string;
    to?: string;
    preset?: string;
  }): Promise<DoraMetricsTrend> {
    const baseUrl = await this.getBaseUrl();
    const params = new URLSearchParams({ team: options.team });
    if (options.from) params.set('from', options.from);
    if (options.to) params.set('to', options.to);
    if (options.preset) params.set('preset', options.preset);

    const response = await this.fetchApi.fetch(
      `${baseUrl}/dora/metrics/trend?${params}`,
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch DORA trend data: ${response.statusText}`,
      );
    }

    return response.json();
  }
}
