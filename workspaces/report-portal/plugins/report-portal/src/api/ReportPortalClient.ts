import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';

import { ReportPortalApi } from './ReportPortalApi';
import {
  LaunchDetailsResponse,
  ProjectDetails,
  ProjectListResponse,
} from './types';

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
    projectId: string,
    host: string,
    filters: { [key: string]: string | number } | undefined,
  ) {
    const baseUrl = new URL(
      `${projectId}/launch/latest`,
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
      throw new Error('Failed to fetch launch details');
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
