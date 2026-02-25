import {
  createApiRef,
  DiscoveryApi,
  FetchApi,
} from '@backstage/core-plugin-api';

export type FlagType = 'boolean' | 'number' | 'string' | 'json' | 'null';

export type FlagRow = {
  key: string;
  type: FlagType;
  valuePreview: string;
  valuePretty?: string;
};

export interface GrowthbookFlagsApi {
  getFlags(env: string, project?: string): Promise<FlagRow[]>;
  getProjects(): Promise<string[]>;
}

export const growthbookFlagsApiRef = createApiRef<GrowthbookFlagsApi>({
  id: 'plugin.growthbook-flags.service',
});

export class GrowthbookFlagsClient implements GrowthbookFlagsApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  async getFlags(env: string, project?: string): Promise<FlagRow[]> {
    const baseUrl = await this.discoveryApi.getBaseUrl('growthbook-flags');
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
    const baseUrl = await this.discoveryApi.getBaseUrl('growthbook-flags');
    const response = await this.fetchApi.fetch(`${baseUrl}/projects`);
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`GrowthBook projects API error ${response.status}: ${body}`);
    }
    const body = await response.json();
    return body.projects ?? [];
  }
}
