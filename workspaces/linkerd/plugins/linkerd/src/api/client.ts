import { DEFAULT_NAMESPACE, Entity } from '@backstage/catalog-model';
import { ResponseError } from '@backstage/errors';
import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { DeploymentResponse } from './types';

export class LinkerdClient {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  async getStatsForEntity(entity: Entity): Promise<DeploymentResponse> {
    const baseUrl = await this.discoveryApi.getBaseUrl('linkerd');
    const url = `/namespace/${encodeURIComponent(
      entity.metadata.namespace ?? DEFAULT_NAMESPACE,
    )}/deployments/${encodeURIComponent(entity.metadata.name)}/stats`;

    const response = await this.fetchApi.fetch(`${baseUrl}${url}`);
    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    return response.json();
  }
}
