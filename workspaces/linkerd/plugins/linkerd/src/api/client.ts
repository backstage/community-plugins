import { Entity } from '@backstage/catalog-model';
import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { DeploymentResponse } from './types';

export class L5dClient {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  async getStatsForEntity(entity: Entity): Promise<DeploymentResponse> {
    return await this.fetchApi
      .fetch(
        `${await this.discoveryApi.getBaseUrl('linkerd')}/namespace/${
          entity.metadata.namespace
        }/deployment/${entity.metadata.name}/stats`,
      )
      .then(r => r.json());
  }
}
