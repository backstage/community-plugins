// code based on https://github.com/shailahir/backstage-plugin-shorturl
import type {
  DiscoveryApi,
  FetchApi,
  IdentityApi,
} from '@backstage/core-plugin-api';
import { ShortURLApi } from './ShortURLApi';
import { ShortURL } from '../types';

export class DefaultShortURLApi implements ShortURLApi {
  constructor(
    private readonly fetchApi: FetchApi,
    private readonly discoveryApi: DiscoveryApi,
    private readonly identityApi: IdentityApi,
  ) {}

  async createOrRetrieveShortUrl(shortURLRequest: Omit<ShortURL, 'shortId'>) {
    const baseUrl = await this.discoveryApi.getBaseUrl('shorturl');
    const idResponse = await this.identityApi.getCredentials();

    return await this.fetchApi.fetch(`${baseUrl}/create`, {
      method: 'PUT',
      body: JSON.stringify({
        fullUrl: shortURLRequest.fullUrl,
        usageCount: shortURLRequest.usageCount,
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idResponse?.token}`,
      },
    });
  }

  async getMappingData() {
    const baseUrl = await this.discoveryApi.getBaseUrl('shorturl');
    const idResponse = await this.identityApi.getCredentials();

    return await this.fetchApi.fetch(`${baseUrl}-backend/getAll`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${idResponse?.token}`,
      },
    });
  }
}
