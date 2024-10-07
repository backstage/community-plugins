import {
  ConfigApi,
  createApiRef,
  DiscoveryApi,
  IdentityApi,
} from '@backstage/core-plugin-api';

import {
  NEXUS_REPOSITORY_MANAGER_ANNOTATIONS,
  NEXUS_REPOSITORY_MANAGER_EXPERIMENTAL_ANNOTATIONS,
} from '../../annotations';
import { OpenAPI, SearchService } from '../../generated';
import type {
  Annotation,
  AssetXO,
  ComponentXO,
  DockerManifest,
  SearchServiceQuery,
} from '../../types';
import { isPrimaryAsset } from '../../utils';

const DEFAULT_PROXY_PATH = '/nexus-repository-manager' as const;
const NEXUS_REPOSITORY_MANAGER_CONFIG = {
  proxyPath: 'nexusRepositoryManager.proxyPath',
  experimentalAnnotations: 'nexusRepositoryManager.experimentalAnnotations',
} as const;

/**
 * Indicates that we want manifest v2 schema 2 if possible. It's faster
 * for supporting servers to return and contains size information.
 * @see {@link https://docs.docker.com/registry/spec/manifest-v2-2/#backward-compatibility|Backward compatibility}
 */
const DOCKER_MANIFEST_HEADERS = {
  Accept: [
    'application/vnd.docker.distribution.manifest.v2+json',
    'application/vnd.docker.distribution.manifest.v1+json;q=0.9',
    '*/*;q=0.8',
  ].join(', '),
} as const satisfies HeadersInit;

function getAdditionalHeaders(format?: string): HeadersInit {
  switch (format /* NOSONAR - use switch for expandability */) {
    case 'docker':
      return DOCKER_MANIFEST_HEADERS;
    default:
      return {};
  }
}

// Whether an asset has data we might want to fetch
function shouldFetchSize(asset: AssetXO) {
  if (asset.format !== 'maven2') {
    return false;
  }

  if (!asset.maven2) {
    return false;
  }
  return (
    // Choosing not to care about the size of e.g. sources or javadoc
    asset.maven2.classifier || !isPrimaryAsset(asset)
  );
}

export type NexusRepositoryManagerApiV1 = {
  getComponents(query: SearchServiceQuery): Promise<{
    components: {
      component: ComponentXO;
      dockerManifests: (DockerManifest | null)[];
    }[];
  }>;
  getAnnotations(): { ANNOTATIONS: Readonly<Annotation[]> };
};

export const NexusRepositoryManagerApiRef =
  createApiRef<NexusRepositoryManagerApiV1>({
    id: 'plugin.nexus-repository-manager.service',
  });

export type NexusRepositoryManagerApiClientOptions = {
  discoveryApi: DiscoveryApi;
  configApi: ConfigApi;
  identityApi: IdentityApi;
};

export class NexusRepositoryManagerApiClient
  implements NexusRepositoryManagerApiV1
{
  private readonly discoveryApi: DiscoveryApi;
  private readonly configApi: ConfigApi;
  private readonly identityApi: IdentityApi;
  private baseUrl = '';

  constructor(options: NexusRepositoryManagerApiClientOptions) {
    this.discoveryApi = options.discoveryApi;
    this.configApi = options.configApi;
    this.identityApi = options.identityApi;
  }

  private async getBaseUrl() {
    if (this.baseUrl) {
      return this.baseUrl;
    }

    const proxyPath =
      this.configApi.getOptionalString(
        NEXUS_REPOSITORY_MANAGER_CONFIG.proxyPath,
      ) ?? DEFAULT_PROXY_PATH;
    this.baseUrl = `${await this.discoveryApi.getBaseUrl('proxy')}${proxyPath}`;
    return this.baseUrl;
  }

  private async proxiedDownloadUrl(asset: AssetXO) {
    const proxyUrl = await this.getBaseUrl();
    // remove leading forward slash for newer versions of Nexus API
    const assetPath = asset.path?.replaceAll(/^\//g, '');
    return `${proxyUrl}/repository/${asset.repository}/${assetPath}`;
  }

  private async searchServiceFetcher(url: string, query: SearchServiceQuery) {
    const { token: idToken } = await this.identityApi.getCredentials();

    OpenAPI.BASE = url;
    OpenAPI.TOKEN = idToken;

    return await SearchService.search(query);
  }

  private async fetcher(
    url: string,
    additionalHeaders: HeadersInit = {},
    method: string = 'GET',
  ) {
    const { token: idToken } = await this.identityApi.getCredentials();

    const headers = new Headers(additionalHeaders);

    if (idToken) {
      headers.set('Authorization', `Bearer ${idToken}`);
    }

    const response = await fetch(url, { headers, method });
    if (!response.ok) {
      throw new Error(
        `failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
    }
    return response;
  }

  /**
   * Use HEAD requests to get the size of each asset we care about, as nexus
   * doesn't return that information in the search API.
   * Only supports maven for now.
   */
  private async addFileSizes(component: ComponentXO): Promise<ComponentXO> {
    if (component.format !== 'maven2' || !component.assets) {
      return component;
    }

    const headers = getAdditionalHeaders(component.format);

    const updatedAssets = await Promise.all(
      component.assets.map(async asset => {
        // Save a request if Nexus decides to return a size (unknown if possible)
        if (asset.fileSize !== 0 || shouldFetchSize(asset)) {
          return asset;
        }

        const response = await this.fetcher(
          await this.proxiedDownloadUrl(asset),
          headers,
          'HEAD',
        );

        return {
          ...asset,
          fileSize: Number(response.headers.get('Content-Length')) || 0,
        };
      }),
    );

    return {
      ...component,
      assets: updatedAssets,
    };
  }

  private async getDockerManifests(component: ComponentXO) {
    // We only need to fetch the actual assets (manifests) for docker
    if (component.format !== 'docker') {
      return [];
    }

    const additionalHeaders = getAdditionalHeaders(component.format);

    const assets = await Promise.all(
      component.assets?.map(
        async asset =>
          (
            await this.fetcher(
              await this.proxiedDownloadUrl(asset),
              additionalHeaders,
            )
          ).json() as Promise<DockerManifest>,
        // Create a dummy promise to avoid Promise.all() from failing
      ) ?? [new Promise<null>(() => null)],
    );

    return assets;
  }

  async getComponents(query: SearchServiceQuery) {
    const proxyUrl = await this.getBaseUrl();

    const components: ComponentXO[] = [];
    let continuationToken: undefined | string;

    do {
      const res = await this.searchServiceFetcher(`${proxyUrl}/service/rest`, {
        ...query,
        continuationToken,
      });

      continuationToken = res.continuationToken;
      components.push(...(res.items ?? []));
    } while (continuationToken);

    // TODO make resilient to individual errors
    // We're seeing intermittent 504s that stop the whole request
    const values = await Promise.all(
      components.map(async component => ({
        component: await this.addFileSizes(component),
        dockerManifests: await this.getDockerManifests(component),
      })),
    );

    const filteredValues = values.filter(v =>
      v.component?.assets?.some(asset => isPrimaryAsset(asset)),
    );

    return {
      components: filteredValues,
    };
  }

  getAnnotations() {
    const usesExperimental = this.configApi.getOptionalBoolean(
      NEXUS_REPOSITORY_MANAGER_CONFIG.experimentalAnnotations,
    );

    if (usesExperimental) {
      return {
        ANNOTATIONS: [
          ...NEXUS_REPOSITORY_MANAGER_ANNOTATIONS,
          ...NEXUS_REPOSITORY_MANAGER_EXPERIMENTAL_ANNOTATIONS,
        ],
      };
    }

    return { ANNOTATIONS: NEXUS_REPOSITORY_MANAGER_ANNOTATIONS };
  }
}
