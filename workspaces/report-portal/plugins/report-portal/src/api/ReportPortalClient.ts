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

import { ReportPortalApi } from './ReportPortalApi';
import {
  LaunchDetailsResponse,
  ProjectDetails,
  ProjectListResponse,
} from '@backstage-community/plugin-report-portal-common';

export class ReportPortalClient implements ReportPortalApi {
  constructor(
    private readonly discoveryApi: DiscoveryApi,
    private readonly fetchApi: FetchApi,
  ) {}

  private async getBaseApiUrl() {
    return `${await this.discoveryApi.getBaseUrl('report-portal')}/v1/`;
  }

  getReportPortalBaseUrl(host: string) {
    return `https://${host}/`;
  }

  async getLaunchResults(
    projectName: string,
    host: string,
    filters: { [key: string]: string | number } | undefined,
  ) {
    const baseUrl = new URL(
      `${projectName}/launch/latest`,
      await this.getBaseApiUrl(),
    );
    if (filters) {
      Object.keys(filters).forEach(key =>
        baseUrl.searchParams.append(key, filters[key] as string),
      );
    }
    baseUrl.searchParams.append('host', host);
    const response = await this.fetchApi.fetch(baseUrl);
    if (response.status !== 200) {
      throw new Error(`Failed to fetch launch details for ${projectName}`);
    }
    return (await response.json()) as LaunchDetailsResponse;
  }

  async getProjectDetails(projectId: string, host: string) {
    const baseUrl = new URL(`project/${projectId}`, await this.getBaseApiUrl());
    baseUrl.searchParams.append('host', host);
    const response = await this.fetchApi.fetch(baseUrl);
    if (response.status !== 200) {
      throw new Error('Failed to fetch project details');
    }
    return (await response.json()) as ProjectDetails;
  }

  async getInstanceDetails(
    host: string,
    filters: { [key: string]: string | number } | undefined,
  ) {
    const baseUrl = new URL('project/list', await this.getBaseApiUrl());
    if (filters) {
      Object.keys(filters).forEach(key =>
        baseUrl.searchParams.append(key, filters[key] as string),
      );
    }
    baseUrl.searchParams.append('host', host);
    const response = await this.fetchApi.fetch(baseUrl);
    if (response.status !== 200) {
      throw new Error('Failed to get instance details');
    }
    return (await response.json()) as ProjectListResponse;
  }
}
