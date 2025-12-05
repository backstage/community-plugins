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
import { LoggerService } from '@backstage/backend-plugin-api';
import { ApiiroDataService } from './data.service';
import {
  matchRepositoriesWithEntitiesAndAddUrl,
  filterRepositoriesByKey,
} from './data.service.helpers';

/**
 * Cached repository data structure
 */
export interface CachedRepositoryData {
  repositories: any[];
  totalCount: number;
  lastUpdated: Date;
}

/**
 * Service for caching repository data
 * Implements periodic background refresh of repository data to improve performance
 * when dealing with hundreds of thousands of repositories
 */
export class RepositoryCacheService {
  private cache: Map<string, CachedRepositoryData> = new Map();
  private readonly CACHE_KEY_ALL = '__ALL_REPOSITORIES__';
  private isRefreshing = false;

  constructor(
    private readonly dataService: ApiiroDataService,
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
        lastUpdated: new Date(),
      };

      this.cache.set(this.CACHE_KEY_ALL, cachedData);

      const duration = Date.now() - startTime;
      this.logger.info('Repository cache refresh completed', {
        totalRepositories: result.totalCount,
        durationMs: duration,
        lastUpdated: cachedData.lastUpdated.toISOString(),
      });
    } catch (error) {
      this.logger.error('Failed to refresh repository cache', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Get all repositories from cache, or fetch if cache is empty
   */
  async getAllRepositories(): Promise<{
    repositories: any[];
    totalCount: number;
  }> {
    const cached = this.cache.get(this.CACHE_KEY_ALL);

    if (cached) {
      this.logger.debug('Serving repositories from cache', {
        totalCount: cached.totalCount,
        cacheAge: Date.now() - cached.lastUpdated.getTime(),
        lastUpdated: cached.lastUpdated.toISOString(),
      });

      return {
        repositories: cached.repositories,
        totalCount: cached.totalCount,
      };
    }

    // Cache miss - fetch data and populate cache
    this.logger.debug('Cache miss - fetching repositories from API');
    await this.refreshAllRepositoriesCache();

    const refreshedCache = this.cache.get(this.CACHE_KEY_ALL);
    if (!refreshedCache) {
      throw new Error('Failed to populate cache after fetch');
    }

    return {
      repositories: refreshedCache.repositories,
      totalCount: refreshedCache.totalCount,
    };
  }

  /**
   * Get repositories filtered by Key, using cache when possible
   */
  async getRepositoriesByKey(repositoryKey: string): Promise<{
    repositories: any[];
    totalCount: number;
  }> {
    this.logger.debug('Getting repositories by key', {
      repositoryKey,
    });

    // Try to get from cache first
    const cached = this.cache.get(this.CACHE_KEY_ALL);

    let allRepositories: any[];

    if (cached && repositoryKey) {
      // Use cache and filter in memory
      this.logger.debug('Using cache for repositoryKey');
      allRepositories = cached.repositories;
    } else {
      // Fetch with server-side filtering if we have a repository name
      this.logger.debug('Fetching with server-side filtering', {
        repositoryKey,
      });
      const result = await this.dataService.getAllRepositories(
        undefined,
        repositoryKey || undefined,
      );
      allRepositories = result.repositories;
    }

    // Apply exact URL filtering if needed
    let filteredRepositories = [];
    if (repositoryKey) {
      filteredRepositories = filterRepositoriesByKey(
        allRepositories,
        repositoryKey,
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
    if (entities.length === 0) {
      this.logger.warn(
        'No entities provided for matching, returning all repositories',
      );
      return {
        repositories,
        totalCount: repositories.length,
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
  getCacheStats(): {
    isCached: boolean;
    totalCount: number;
    lastUpdated: Date | null;
    cacheAgeMs: number | null;
  } {
    const cached = this.cache.get(this.CACHE_KEY_ALL);

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
      cacheAgeMs: Date.now() - cached.lastUpdated.getTime(),
    };
  }

  /**
   * Clear the cache manually if needed
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.info('Repository cache cleared');
  }
}
