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
import { CatalogApi } from '@backstage/catalog-client';
import { AuthService, CacheService } from '@backstage/backend-plugin-api';
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
  // Cache keys for Backstage CacheService
  private static readonly REPO_CACHE_KEY = 'apiiro:repositories';
  private static readonly APP_CACHE_KEY = 'apiiro:applications';
  private static readonly ENTITY_REF_CACHE_KEY = 'apiiro:entity-refs';
  private static readonly REPO_LOCK_KEY = 'apiiro:repositories:lock';
  private static readonly APP_LOCK_KEY = 'apiiro:applications:lock';
  private static readonly ENTITY_REF_LOCK_KEY = 'apiiro:entity-refs:lock';

  constructor(
    private readonly apiClient: ApiiroApiClient,
    private readonly backstageUrl: string | undefined,
    private readonly cacheService: CacheService,
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

  async refreshRepositoryCacheIfNeeded(): Promise<void> {
    const cachedData = await this.cacheService.get<CachedRepositoryData>(
      CacheManager.REPO_CACHE_KEY,
    );

    if (cachedData && !this.isCacheExpired(cachedData.lastFetched)) {
      return;
    }

    const refreshLock = await this.cacheService.get<{
      locked: boolean;
      timestamp: number;
    }>(CacheManager.REPO_LOCK_KEY);
    const now = Date.now();
    if (refreshLock && now - refreshLock.timestamp < REFRESH_LOCK_TTL_MS) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.refreshRepositoryCacheIfNeeded();
      return;
    }

    await this.cacheService.set(CacheManager.REPO_LOCK_KEY, {
      locked: true,
      timestamp: now,
    });

    try {
      const urlToKeyMap = await this.fetchAndBuildRepoMap();

      await this.cacheService.set(
        CacheManager.REPO_CACHE_KEY,
        {
          urlToKeyMap,
          lastFetched: Date.now(),
          fetchCompleted: true,
        },
        { ttl: CACHE_TTL_MS },
      );

      await this.cacheService.delete(CacheManager.REPO_LOCK_KEY);
    } catch (error) {
      await this.cacheService.delete(CacheManager.REPO_LOCK_KEY);
      throw error;
    }
  }

  async getRepoKey(repoUrl: string): Promise<string | null> {
    if (!repoUrl) {
      return null;
    }

    await this.refreshRepositoryCacheIfNeeded();
    const cachedData = await this.cacheService.get<CachedRepositoryData>(
      CacheManager.REPO_CACHE_KEY,
    );
    return cachedData?.urlToKeyMap[repoUrl] || null;
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

  async refreshApplicationCacheIfNeeded(): Promise<void> {
    const cachedData = await this.cacheService.get<CachedApplicationData>(
      CacheManager.APP_CACHE_KEY,
    );

    if (cachedData && !this.isCacheExpired(cachedData.lastFetched)) {
      return;
    }

    const refreshLock = await this.cacheService.get<{
      locked: boolean;
      timestamp: number;
    }>(CacheManager.APP_LOCK_KEY);
    const now = Date.now();
    if (refreshLock && now - refreshLock.timestamp < REFRESH_LOCK_TTL_MS) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.refreshApplicationCacheIfNeeded();
      return;
    }

    await this.cacheService.set(CacheManager.APP_LOCK_KEY, {
      locked: true,
      timestamp: now,
    });

    try {
      const uidToKeyMap = await this.fetchAndBuildAppMap();
      await this.cacheService.set(
        CacheManager.APP_CACHE_KEY,
        {
          uidToKeyMap,
          lastFetched: Date.now(),
          fetchCompleted: true,
        },
        { ttl: CACHE_TTL_MS },
      );

      await this.cacheService.delete(CacheManager.APP_LOCK_KEY);
    } catch (error) {
      await this.cacheService.delete(CacheManager.APP_LOCK_KEY);
      throw error;
    }
  }

  async getApplicationId(
    entityUid: string | undefined,
  ): Promise<string | null> {
    if (!entityUid) {
      return null;
    }

    await this.refreshApplicationCacheIfNeeded();
    const cachedData = await this.cacheService.get<CachedApplicationData>(
      CacheManager.APP_CACHE_KEY,
    );
    return cachedData?.uidToKeyMap[entityUid] || null;
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

  async refreshEntityRefCacheIfNeeded(): Promise<void> {
    const cachedData = await this.cacheService.get<CachedEntityRefData>(
      CacheManager.ENTITY_REF_CACHE_KEY,
    );

    if (cachedData && !this.isCacheExpired(cachedData.lastFetched)) {
      return;
    }

    const refreshLock = await this.cacheService.get<{
      locked: boolean;
      timestamp: number;
    }>(CacheManager.ENTITY_REF_LOCK_KEY);
    const now = Date.now();
    if (refreshLock && now - refreshLock.timestamp < REFRESH_LOCK_TTL_MS) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.refreshEntityRefCacheIfNeeded();
      return;
    }

    await this.cacheService.set(CacheManager.ENTITY_REF_LOCK_KEY, {
      locked: true,
      timestamp: now,
    });

    try {
      const refToUidMap = await this.fetchAndBuildEntityRefMap();
      await this.cacheService.set(
        CacheManager.ENTITY_REF_CACHE_KEY,
        {
          refToUidMap,
          lastFetched: Date.now(),
          fetchCompleted: true,
        },
        { ttl: CACHE_TTL_MS },
      );

      await this.cacheService.delete(CacheManager.ENTITY_REF_LOCK_KEY);
    } catch (error) {
      await this.cacheService.delete(CacheManager.ENTITY_REF_LOCK_KEY);
      throw error;
    }
  }

  async invalidateEntityRefCache(): Promise<void> {
    await this.cacheService.set(CacheManager.ENTITY_REF_CACHE_KEY, {
      refToUidMap: {},
      lastFetched: 0,
      fetchCompleted: false,
    });
  }

  async getEntityUid(entityRef: string): Promise<string | null> {
    if (!entityRef) {
      return null;
    }

    await this.refreshEntityRefCacheIfNeeded();
    const cachedData = await this.cacheService.get<CachedEntityRefData>(
      CacheManager.ENTITY_REF_CACHE_KEY,
    );

    return cachedData?.refToUidMap[entityRef] || null;
  }
}
