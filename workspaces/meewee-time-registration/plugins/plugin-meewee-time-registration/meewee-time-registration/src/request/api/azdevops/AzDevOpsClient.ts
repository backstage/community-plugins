import { DiscoveryApi, FetchApi, OAuthApi } from '@backstage/core-plugin-api';
import { AzDevopsApi, request } from '../../../types/azdevops/types';
import { ResponseError } from '@backstage/errors';

/** @public */
export class AzDevOpsClient implements AzDevopsApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly authApi: OAuthApi;
  private readonly client: FetchApi;
  constructor(options: {
    discoveryApi: DiscoveryApi;
    authApi: OAuthApi;
    fetchApi: FetchApi;
  }) {
    this.discoveryApi = options.discoveryApi;
    this.authApi = options.authApi;
    this.client = options.fetchApi;
  }

  private async handleResponse(req: request): Promise<any> {
    // azure devops scope  '499b84ac-1321-427f-aa17-267ca6975798/.default'
    const token = await this.authApi.getAccessToken(req.scope);

    const temp: any = {};

    if (token) {
      temp.Authorization = `Bearer ${token}`;
    }

    const response = await this.client.fetch(req.url.toString(), {
      method: req.method,
      headers: temp,
    });

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    return await response.json();
  }

  async getProjects(): Promise<any> {
    const url = `${await this.discoveryApi.getBaseUrl('ado')}/projects`;
    const req: request = {
      url: url,
      method: 'GET',
      scope: [
        '499b84ac-1321-427f-aa17-267ca6975798/vso.project',
        '499b84ac-1321-427f-aa17-267ca6975798/vso.profile',
      ],
    };

    return await this.handleResponse(req);
  }

  async getTeamsByProject(projectId: string): Promise<any> {
    const url = `${await this.discoveryApi.getBaseUrl(
      'ado',
    )}/project/${projectId}/teams`;

    const req: request = {
      url: url,
      method: 'GET',
      scope: [
        '499b84ac-1321-427f-aa17-267ca6975798/vso.project',
        '499b84ac-1321-427f-aa17-267ca6975798/vso.profile',
      ],
    };

    return await this.handleResponse(req);
  }

  async workItemsByQuery(
    project: string,
    team: string,
    top: number,
  ): Promise<any> {
    const url = `${await this.discoveryApi.getBaseUrl(
      'ado',
    )}/project/${project}/team/${encodeURI(team)}/workitems/${top}`;
    const req: request = {
      url: url,
      method: 'POST',
      scope: ['499b84ac-1321-427f-aa17-267ca6975798/vso.work'],
    };

    return await this.handleResponse(req);
  }

  async updateWorkItem(
    projectid: string,
    id: number,
    state: string,
  ): Promise<any> {
    const url = `${await this.discoveryApi.getBaseUrl(
      'ado',
    )}/workitem/${id}/project/${projectid}/state/${state}`;
    const req: request = {
      url: url,
      method: 'PATCH',
      scope: ['499b84ac-1321-427f-aa17-267ca6975798/vso.work_write'],
    };

    return await this.handleResponse(req);
  }
  async getWorkItemTypes(project: string): Promise<any> {
    const url = `${await this.discoveryApi.getBaseUrl(
      'ado',
    )}/project/${project}/workitemtypes`;
    const req: request = {
      url: url,
      method: 'GET',
      scope: ['499b84ac-1321-427f-aa17-267ca6975798/vso.work'],
    };
    return await this.handleResponse(req);
  }
  async getWorkItemStateByType(
    project: string,
    workItemtype: string = 'Tasks',
  ): Promise<any> {
    const url = `${await this.discoveryApi.getBaseUrl(
      'ado',
    )}/workitem/project/${project}/type/${workItemtype}`;
    const req: request = {
      url: url,
      method: 'GET',
      scope: ['499b84ac-1321-427f-aa17-267ca6975798/vso.work'],
    };
    return await this.handleResponse(req);
  }
}
