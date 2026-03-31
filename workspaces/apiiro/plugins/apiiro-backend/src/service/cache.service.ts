/*
 * Copyright 2025 The Backstage Authors
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
import { LoggerService, CacheService } from '@backstage/backend-plugin-api';
import { ApiiroDataService } from './data.service';
import {
  matchRepositoriesWithEntitiesAndAddUrl,
  filterRepositoriesById,
} from './data.service.helpers';

/**
 * Cached repository data structure
 */
export interface CachedRepositoryData extends Record<string, unknown> {
  repositories: any[];
  totalCount: number;
  lastUpdated: string; // ISO string for JSON serialization
}

/**
 * Service for caching repository data
 * Implements periodic background refresh of repository data to improve performance
 * when dealing with hundreds of thousands of repositories
 */
export class RepositoryCacheService {
  private readonly CACHE_KEY_ALL = '__ALL_REPOSITORIES__';
  private isRefreshing = false;

  constructor(
    private readonly dataService: ApiiroDataService,
    private readonly cache: CacheService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Background task to refresh all repositories cache
   * This runs on a schedule to keep the cache warm
   */
  async refreshAllRepositoriesCache(): Promise<void> {
    if (this.isRefreshing) {
      this.logger.warn(
        'Repository cache refresh already in progress, skipping...',
      );
      return;
    }

    this.isRefreshing = true;
    const startTime = Date.now();

    try {
      this.logger.debug('Starting repository cache refresh...');

      // Fetch all repositories from Apiiro API
      const result = await this.dataService.getAllRepositories();

      // Store in cache with timestamp
      const cachedData: CachedRepositoryData = {
        repositories: result.repositories,
        totalCount: result.totalCount,
        lastUpdated: new Date().toISOString(),
      };

      await this.cache.set(this.CACHE_KEY_ALL, cachedData as any);

      const duration = Date.now() - startTime;
      this.logger.info('Repository cache refresh completed', {
        totalRepositories: result.totalCount,
        durationMs: duration,
        lastUpdated: cachedData.lastUpdated,
      });
    } catch (error) {
      this.logger.error('Failed to refresh repository cache', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Reset flag before re-throwing
      this.isRefreshing = false;
      throw error;
    } finally {
      // Ensure flag is reset in all cases
      this.isRefreshing = false;
    }
  }

  /**
   * Get all repositories from cache, or fetch if cache is empty
   */
  async getAllRepositories(applicationId?: string): Promise<{
    repositories: any[];
    totalCount: number;
  }> {
    if (applicationId) {
      const result = await this.dataService.getAllRepositories(
        undefined,
        applicationId,
      );
      return {
        repositories: result.repositories,
        totalCount: result.totalCount,
      };
    }
    const cached = (await this.cache.get(this.CACHE_KEY_ALL)) as
      | CachedRepositoryData
      | undefined;

    if (cached) {
      this.logger.debug('Serving repositories from cache', {
        totalCount: cached.totalCount,
        cacheAge: Date.now() - new Date(cached.lastUpdated).getTime(),
        lastUpdated: cached.lastUpdated,
      });

      return {
        repositories: cached.repositories,
        totalCount: cached.totalCount,
      };
    }

    // Cache miss - fetch data and populate cache
    this.logger.debug('Cache miss - fetching repositories from API');
    await this.refreshAllRepositoriesCache();

    // Wait for cache to be populated if refresh was already in progress
    let attempts = 0;
    const maxAttempts = 2;
    const waitTime = 100; // 100ms between attempts

    while (attempts < maxAttempts) {
      const refreshedCache = (await this.cache.get(this.CACHE_KEY_ALL)) as
        | CachedRepositoryData
        | undefined;

      if (refreshedCache) {
        return {
          repositories: refreshedCache.repositories,
          totalCount: refreshedCache.totalCount,
        };
      }

      if (!this.isRefreshing) {
        // If refresh completed but cache is still empty, fall back to direct API call
        this.logger.warn(
          'Cache refresh completed but cache is empty, falling back to direct API call',
        );
        const result = await this.dataService.getAllRepositories();
        return {
          repositories: result.repositories,
          totalCount: result.totalCount,
        };
      }

      // Wait for refresh to complete
      await new Promise(resolve => setTimeout(resolve, waitTime));
      attempts++;
    }

    // If we've waited too long, fall back to direct API call
    this.logger.warn(
      'Cache refresh taking too long, falling back to direct API call',
    );
    const result = await this.dataService.getAllRepositories();
    return {
      repositories: result.repositories,
      totalCount: result.totalCount,
    };
  }

  /**
   * Get repositories filtered by Key, using cache
   */
  async getRepositoriesById(repositoryId: string): Promise<{
    repositories: any[];
    totalCount: number;
  }> {
    this.logger.debug('Getting repositories by key', {
      repositoryId,
    });

    const allRepositories = (await this.getAllRepositories()).repositories;

    // Apply exact URL filtering if needed
    let filteredRepositories = [];
    if (repositoryId) {
      filteredRepositories = filterRepositoriesById(
        allRepositories,
        repositoryId,
      );
    } else {
      filteredRepositories = allRepositories;
    }

    this.logger.debug('URL filtering complete', {
      beforeFilter: allRepositories.length,
      afterFilter: filteredRepositories.length,
    });

    return {
      repositories: filteredRepositories,
      totalCount: filteredRepositories.length,
    };
  }

  /**
   * Match cached repositories with Backstage entities
   * This is called per-request since entities might change
   */
  matchWithEntities(
    repositories: any[],
    entities: any[],
  ): {
    repositories: any[];
    totalCount: number;
  } {
    if (entities.length === 0 || repositories.length === 0) {
      this.logger.warn(
        'No entities provided for matching, returning empty repositories',
      );
      return {
        repositories: [],
        totalCount: 0,
      };
    }

    const matched = matchRepositoriesWithEntitiesAndAddUrl(
      entities,
      repositories,
    );

    this.logger.debug('Matched repositories with entities', {
      totalRepositories: repositories.length,
      totalEntities: entities.length,
      matchedCount: matched.length,
    });

    return {
      repositories: matched,
      totalCount: matched.length,
    };
  }

  /**
   * Get cache statistics for monitoring
   */
  async getCacheStats(): Promise<{
    isCached: boolean;
    totalCount: number;
    lastUpdated: string | null;
    cacheAgeMs: number | null;
  }> {
    const cached = (await this.cache.get(this.CACHE_KEY_ALL)) as
      | CachedRepositoryData
      | undefined;

    if (!cached) {
      return {
        isCached: false,
        totalCount: 0,
        lastUpdated: null,
        cacheAgeMs: null,
      };
    }

    return {
      isCached: true,
      totalCount: cached.totalCount,
      lastUpdated: cached.lastUpdated,
      cacheAgeMs: Date.now() - new Date(cached.lastUpdated).getTime(),
    };
  }

  /**
   * Clear the cache manually if needed
   */
  async clearCache(): Promise<void> {
    await this.cache.delete(this.CACHE_KEY_ALL);
    this.logger.info('Repository cache cleared');
  }
}
