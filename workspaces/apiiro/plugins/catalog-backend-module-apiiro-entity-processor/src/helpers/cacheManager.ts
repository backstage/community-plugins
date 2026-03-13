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
import { CatalogProcessorCache } from '@backstage/plugin-catalog-node';
import { CatalogApi } from '@backstage/catalog-client';
import { AuthService } from '@backstage/backend-plugin-api';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { ApiiroApiClient } from './apiClient';
import {
  RepositoryItem,
  ApplicationItem,
  CachedRepositoryData,
  CachedApplicationData,
  CachedEntityRefData,
  CACHE_TTL_MS,
  REFRESH_LOCK_TTL_MS,
} from './types';

export class CacheManager {
  // Static cache that persists across all entity processing calls
  private static repoCache: CachedRepositoryData | null = null;
  private static appCache: CachedApplicationData | null = null;
  private static entityRefCache: CachedEntityRefData | null = null;
  private static repoLock: { locked: boolean; timestamp: number } = {
    locked: false,
    timestamp: 0,
  };
  private static appLock: { locked: boolean; timestamp: number } = {
    locked: false,
    timestamp: 0,
  };
  private static entityRefLock: { locked: boolean; timestamp: number } = {
    locked: false,
    timestamp: 0,
  };

  constructor(
    private readonly apiClient: ApiiroApiClient,
    private readonly backstageUrl: string | undefined,
    private readonly catalogApi?: CatalogApi,
    private readonly auth?: AuthService,
  ) {}

  private isCacheExpired(lastFetched: number): boolean {
    const now = Date.now();
    return now - lastFetched > CACHE_TTL_MS;
  }

  private buildRepositoryUrlToKeyMap(
    repositories: RepositoryItem[],
  ): Record<string, string> {
    const urlToKeyMap: Record<string, string> = {};
    const tempMap = new Map<
      string,
      { key: string; isDefaultBranch: boolean }
    >();

    for (const repo of repositories) {
      if (!repo.url || !repo.key) {
        continue;
      }

      const existing = tempMap.get(repo.url);
      if (!existing || (repo.isDefaultBranch && !existing.isDefaultBranch)) {
        tempMap.set(repo.url, {
          key: repo.key,
          isDefaultBranch: repo.isDefaultBranch || false,
        });
      }
    }

    tempMap.forEach((value, key) => {
      urlToKeyMap[key] = value.key;
    });

    return urlToKeyMap;
  }

  private async fetchAndBuildRepoMap(): Promise<Record<string, string>> {
    try {
      const { items } = await this.apiClient.fetchAllRepositories();
      return this.buildRepositoryUrlToKeyMap(items);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `[CacheManager] Error fetching repositories from Apiiro API: ${errorMessage}`,
      );
      return {};
    }
  }

  async refreshRepositoryCacheIfNeeded(
    _cache: CatalogProcessorCache,
  ): Promise<void> {
    const cachedData = CacheManager.repoCache;

    if (cachedData && !this.isCacheExpired(cachedData.lastFetched)) {
      return;
    }

    const refreshLock = CacheManager.repoLock;
    const now = Date.now();
    if (refreshLock && now - refreshLock.timestamp < REFRESH_LOCK_TTL_MS) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.refreshRepositoryCacheIfNeeded(_cache);
      return;
    }
    CacheManager.repoLock = {
      locked: true,
      timestamp: now,
    };

    try {
      const urlToKeyMap = await this.fetchAndBuildRepoMap();

      CacheManager.repoCache = {
        urlToKeyMap,
        lastFetched: Date.now(),
        fetchCompleted: true,
      };

      CacheManager.repoLock = {
        locked: false,
        timestamp: 0,
      };
    } catch (error) {
      CacheManager.repoLock = {
        locked: false,
        timestamp: 0,
      };
      throw error;
    }
  }

  async getRepoKey(
    repoUrl: string,
    cache: CatalogProcessorCache,
  ): Promise<string | null> {
    if (!repoUrl) {
      return null;
    }

    await this.refreshRepositoryCacheIfNeeded(cache);
    const cachedData = CacheManager.repoCache;

    if (!cachedData?.urlToKeyMap) {
      return null;
    }

    return cachedData.urlToKeyMap[repoUrl] || null;
  }

  private buildApplicationUidToKeyMap(
    applications: ApplicationItem[],
    backstageUrl: string | undefined,
  ): Record<string, string> {
    const uidToKeyMap: Record<string, string> = {};

    for (const app of applications) {
      if (
        !app.key ||
        !app.externalSources ||
        app.externalSources.length === 0
      ) {
        continue;
      }

      for (const source of app.externalSources) {
        if (
          source.server.provider === 'Backstage' &&
          source.server.url === backstageUrl
        ) {
          uidToKeyMap[source.id] = app.key;
        }
      }
    }
    return uidToKeyMap;
  }

  private async fetchAndBuildAppMap(): Promise<Record<string, string>> {
    try {
      const { items } = await this.apiClient.fetchAllApplications();
      return this.buildApplicationUidToKeyMap(items, this.backstageUrl);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `[CacheManager] Error fetching applications from Apiiro API: ${errorMessage}`,
      );
      return {};
    }
  }

  async refreshApplicationCacheIfNeeded(
    _cache: CatalogProcessorCache,
  ): Promise<void> {
    const cachedData = CacheManager.appCache;

    if (cachedData && !this.isCacheExpired(cachedData.lastFetched)) {
      return;
    }

    const refreshLock = CacheManager.appLock;
    const now = Date.now();
    if (refreshLock && now - refreshLock.timestamp < REFRESH_LOCK_TTL_MS) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.refreshApplicationCacheIfNeeded(_cache);
      return;
    }

    CacheManager.appLock = {
      locked: true,
      timestamp: now,
    };

    try {
      const uidToKeyMap = await this.fetchAndBuildAppMap();
      CacheManager.appCache = {
        uidToKeyMap,
        lastFetched: Date.now(),
        fetchCompleted: true,
      };

      CacheManager.appLock = {
        locked: false,
        timestamp: 0,
      };
    } catch (error) {
      CacheManager.appLock = {
        locked: false,
        timestamp: 0,
      };
      throw error;
    }
  }

  async getApplicationId(
    entityUid: string | undefined,
    cache: CatalogProcessorCache,
  ): Promise<string | null> {
    if (!entityUid) {
      return null;
    }

    await this.refreshApplicationCacheIfNeeded(cache);
    const cachedData = CacheManager.appCache;

    if (!cachedData?.uidToKeyMap) {
      return null;
    }

    return cachedData.uidToKeyMap[entityUid] || null;
  }

  private async fetchAndBuildEntityRefMap(): Promise<Record<string, string>> {
    if (!this.catalogApi || !this.auth) {
      return {};
    }

    try {
      const { token } = await this.auth.getPluginRequestToken({
        onBehalfOf: await this.auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });

      const { items } = await this.catalogApi.getEntities(
        {
          filter: { kind: 'System' },
          fields: [
            'kind',
            'metadata.uid',
            'metadata.name',
            'metadata.namespace',
          ],
        },
        { token },
      );

      const refToUidMap: Record<string, string> = {};
      for (const entity of items) {
        if (entity.metadata.uid) {
          const entityRef = stringifyEntityRef({
            kind: entity.kind,
            name: entity.metadata.name,
            namespace: entity.metadata.namespace,
          });
          refToUidMap[entityRef] = entity.metadata.uid;
        }
      }

      return refToUidMap;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `[CacheManager] Error fetching entities from catalog: ${errorMessage}`,
      );
      return {};
    }
  }

  async refreshEntityRefCacheIfNeeded(
    _cache: CatalogProcessorCache,
  ): Promise<void> {
    const cachedData = CacheManager.entityRefCache;

    if (cachedData && !this.isCacheExpired(cachedData.lastFetched)) {
      return;
    }

    const refreshLock = CacheManager.entityRefLock;
    const now = Date.now();
    if (refreshLock && now - refreshLock.timestamp < REFRESH_LOCK_TTL_MS) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.refreshEntityRefCacheIfNeeded(_cache);
      return;
    }
    CacheManager.entityRefLock = {
      locked: true,
      timestamp: now,
    };

    try {
      const refToUidMap = await this.fetchAndBuildEntityRefMap();

      CacheManager.entityRefCache = {
        refToUidMap,
        lastFetched: Date.now(),
        fetchCompleted: true,
      };

      CacheManager.entityRefLock = {
        locked: false,
        timestamp: 0,
      };
    } catch (error) {
      CacheManager.entityRefLock = {
        locked: false,
        timestamp: 0,
      };
      throw error;
    }
  }

  async invalidateEntityRefCache(_cache: CatalogProcessorCache): Promise<void> {
    CacheManager.entityRefCache = {
      refToUidMap: {},
      lastFetched: 0,
      fetchCompleted: false,
    };
  }

  async getEntityUid(
    entityRef: string,
    cache: CatalogProcessorCache,
  ): Promise<string | null> {
    if (!entityRef) {
      return null;
    }

    await this.refreshEntityRefCacheIfNeeded(cache);
    const cachedData = CacheManager.entityRefCache;

    if (!cachedData?.refToUidMap) {
      return null;
    }

    return cachedData.refToUidMap[entityRef] || null;
  }
}
