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
import {
  createApiRef,
  DiscoveryApi,
  FetchApi,
} from '@backstage/core-plugin-api';

import type {
  ExperimentResultSummary,
  ExperimentRow,
  FlagDetail,
  FlagRow,
} from '@backstage-community/plugin-growthbook-common';

/** @public */
export interface GrowthbookFlagsApi {
  getFlags(env: string, project?: string): Promise<FlagRow[]>;
  getProjects(): Promise<string[]>;
  /** Experiments for a GrowthBook project. Resolves to `[]` in SDK-only mode. */
  getExperiments(project?: string): Promise<ExperimentRow[]>;
  getExperimentResults(id: string): Promise<ExperimentResultSummary>;
  getFlagDetail(key: string): Promise<FlagDetail>;
}

/** @public */
export const growthbookFlagsApiRef = createApiRef<GrowthbookFlagsApi>({
  id: 'plugin.growthbook-flags.service',
});

/** @public */
export class GrowthbookFlagsClient implements GrowthbookFlagsApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  async getFlags(env: string, project?: string): Promise<FlagRow[]> {
    const baseUrl = await this.discoveryApi.getBaseUrl(
      'backstage-community-growthbook',
    );
    const params = new URLSearchParams({ env });
    if (project) params.set('project', project);
    const response = await this.fetchApi.fetch(`${baseUrl}/flags?${params}`);
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`GrowthBook flags API error ${response.status}: ${body}`);
    }
    return response.json();
  }

  async getProjects(): Promise<string[]> {
    const baseUrl = await this.discoveryApi.getBaseUrl(
      'backstage-community-growthbook',
    );
    const response = await this.fetchApi.fetch(`${baseUrl}/projects`);
    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `GrowthBook projects API error ${response.status}: ${body}`,
      );
    }
    const body = await response.json();
    return body.projects ?? [];
  }

  async getExperiments(project?: string): Promise<ExperimentRow[]> {
    const query = project ? `?${new URLSearchParams({ project })}` : '';
    const response = await this.get(`/experiments${query}`);
    if (response.status === 501) return [];
    return this.parse(response, 'experiments');
  }

  async getExperimentResults(id: string): Promise<ExperimentResultSummary> {
    const response = await this.get(
      `/experiments/${encodeURIComponent(id)}/results`,
    );
    return this.parse(response, 'experiment results');
  }

  async getFlagDetail(key: string): Promise<FlagDetail> {
    const response = await this.get(`/flags/${encodeURIComponent(key)}`);
    return this.parse(response, 'flag detail');
  }

  private async get(path: string): Promise<Response> {
    const baseUrl = await this.discoveryApi.getBaseUrl(
      'backstage-community-growthbook',
    );
    return this.fetchApi.fetch(`${baseUrl}${path}`);
  }

  private async parse<T>(response: Response, what: string): Promise<T> {
    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `GrowthBook ${what} API error ${response.status}: ${body}`,
      );
    }
    return response.json();
  }
}
