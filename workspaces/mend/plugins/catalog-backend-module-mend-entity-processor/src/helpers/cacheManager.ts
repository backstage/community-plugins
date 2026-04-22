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
import { CacheService, LoggerService } from '@backstage/backend-plugin-api';
import { ProjectStatisticsItem, CachedUrlToProjectIds } from './types';
import { MendApiClient } from './apiClient';

const REFRESH_LOCK_TTL_MS = 2 * 60 * 1000; // 2 minutes

export class CacheManager {
  private static readonly PROJECT_CACHE_KEY =
    'mend:catalog:projectIdsByRepoUrl';
  private static readonly PROJECT_LOCK_KEY =
    'mend:catalog:projectIdsByRepoUrl:lock';
  private readonly cacheTtlMs: number;

  constructor(
    private readonly apiClient: MendApiClient,
    private readonly cacheService: CacheService,
    private readonly logger: LoggerService,
    cacheTTL: number,
  ) {
    this.cacheTtlMs = cacheTTL * 60 * 1000;
  }

  private isCacheExpired(lastFetched: number): boolean {
    return Date.now() - lastFetched > this.cacheTtlMs;
  }

  private buildUrlToProjectIdsMap(
    projects: ProjectStatisticsItem[],
  ): Record<string, string[]> {
    const urlToProjectIdsMap: Record<string, string[]> = {};

    for (const project of projects) {
      const projectTags = project.tags as Array<{ key: string; value: string }>;
      const sourceUrlTag = projectTags?.find(tag => tag.key === 'sourceUrl');

      if (sourceUrlTag && typeof sourceUrlTag.value === 'string') {
        let sourceUrl = sourceUrlTag.value;
        if (!sourceUrl.startsWith('http')) {
          sourceUrl = `https://${sourceUrl}`;
        }

        try {
          const urlObj = new URL(sourceUrl);
          const normalizedUrl = `${
            urlObj.protocol
          }//${urlObj.host.toLowerCase()}${urlObj.pathname}`;

          if (!urlToProjectIdsMap[normalizedUrl]) {
            urlToProjectIdsMap[normalizedUrl] = [];
          }
          urlToProjectIdsMap[normalizedUrl].push(project.uuid);
        } catch (e) {
          // Invalid URL, skip
        }
      }
    }

    return urlToProjectIdsMap;
  }

  async refreshProjectCacheIfNeeded(force: boolean = false): Promise<void> {
    let now: number;
    let lockAcquired = false;
    while (!lockAcquired) {
      const cachedData = (await this.cacheService.get(
        CacheManager.PROJECT_CACHE_KEY,
      )) as CachedUrlToProjectIds | undefined;
      if (
        !force &&
        cachedData &&
        !this.isCacheExpired(cachedData.lastFetched)
      ) {
        return;
      }
      // Check for refresh lock to prevent concurrent refreshes
      const refreshLock = await this.cacheService.get<{
        locked: boolean;
        timestamp: number;
      }>(CacheManager.PROJECT_LOCK_KEY);

      now = Date.now();
      if (refreshLock && now - refreshLock.timestamp < REFRESH_LOCK_TTL_MS) {
        // Another process is refreshing, wait and retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      lockAcquired = true;
    }

    // Acquire lock
    now = Date.now();
    await this.cacheService.set(
      CacheManager.PROJECT_LOCK_KEY,
      {
        locked: true,
        timestamp: now,
      },
      { ttl: REFRESH_LOCK_TTL_MS },
    );

    try {
      const projects = await this.apiClient.fetchAllProjects();
      const urlToProjectIdsMap = this.buildUrlToProjectIdsMap(projects);

      this.logger.info(
        `[CacheManager] Cached ${
          Object.keys(urlToProjectIdsMap).length
        } repo URLs with project IDs`,
      );

      await this.cacheService.set(
        CacheManager.PROJECT_CACHE_KEY,
        {
          urlToProjectIdsMap,
          lastFetched: Date.now(),
          fetchCompleted: true,
        },
        { ttl: this.cacheTtlMs },
      );

      await this.cacheService.delete(CacheManager.PROJECT_LOCK_KEY);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error refreshing Mend projectIdsByRepoUrl cache: ${errorMessage}`,
      );
      throw error;
    } finally {
      // Always release the lock, even if an error occurred
      try {
        await this.cacheService.delete(CacheManager.PROJECT_LOCK_KEY);
      } catch (lockError) {
        this.logger.warn('Failed to release cache refresh lock:', lockError);
      }
    }
  }

  async getProjectIds(repoUrl: string): Promise<string[] | null> {
    if (!repoUrl) {
      return null;
    }

    await this.refreshProjectCacheIfNeeded();
    const cachedData = (await this.cacheService.get(
      CacheManager.PROJECT_CACHE_KEY,
    )) as CachedUrlToProjectIds | undefined;

    return cachedData?.urlToProjectIdsMap[repoUrl] || null;
  }
}
