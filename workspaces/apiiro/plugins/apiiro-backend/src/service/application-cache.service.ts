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
import { LoggerService, CacheService } from '@backstage/backend-plugin-api';
import { ApiiroDataService } from './data.service';
import { ApplicationItem } from './data.service.types';
import { matchApplicationsWithEntitiesAndAddUrl } from './data.service.helpers';

/**
 * Cached application data structure
 */
export interface CachedApplicationData extends Record<string, unknown> {
  applications: ApplicationItem[];
  totalCount: number;
  lastUpdated: string; // ISO string for JSON serialization
}

/**
 * Service for caching application data
 * Implements periodic background refresh of application data to improve performance
 */
export class ApplicationCacheService {
  private readonly CACHE_KEY_ALL = '__ALL_APPLICATIONS__';
  private isRefreshing = false;

  constructor(
    private readonly dataService: ApiiroDataService,
    private readonly cache: CacheService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Background task to refresh all applications cache
   * This runs on a schedule to keep the cache warm
   */
  async refreshAllApplicationsCache(): Promise<void> {
    if (this.isRefreshing) {
      this.logger.warn(
        'Application cache refresh already in progress, skipping...',
      );
      return;
    }

    this.isRefreshing = true;
    const startTime = Date.now();

    try {
      this.logger.debug('Starting application cache refresh...');

      // Fetch all applications from Apiiro API
      const result = await this.dataService.getAllApplications();

      // Store in cache with timestamp
      const cachedData: CachedApplicationData = {
        applications: result.applications,
        totalCount: result.totalCount,
        lastUpdated: new Date().toISOString(),
      };

      await this.cache.set(this.CACHE_KEY_ALL, cachedData as any);

      const duration = Date.now() - startTime;
      this.logger.info('Application cache refresh completed', {
        totalApplications: result.totalCount,
        durationMs: duration,
        lastUpdated: cachedData.lastUpdated,
      });
    } catch (error) {
      this.logger.error('Failed to refresh application cache', {
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
   * Get all applications from cache, or fetch if cache is empty
   */
  async getAllApplications(): Promise<{
    applications: ApplicationItem[];
    totalCount: number;
  }> {
    const cached = (await this.cache.get(this.CACHE_KEY_ALL)) as
      | CachedApplicationData
      | undefined;

    if (cached) {
      this.logger.debug('Serving applications from cache', {
        totalCount: cached.totalCount,
        cacheAge: Date.now() - new Date(cached.lastUpdated).getTime(),
        lastUpdated: cached.lastUpdated,
      });

      return {
        applications: cached.applications,
        totalCount: cached.totalCount,
      };
    }

    // Cache miss - fetch data and populate cache
    this.logger.debug('Cache miss - fetching applications from API');
    await this.refreshAllApplicationsCache();

    // Wait for cache to be populated if refresh was already in progress
    let attempts = 0;
    const maxAttempts = 2;
    const waitTime = 100; // 100ms between attempts

    while (attempts < maxAttempts) {
      const refreshedCache = (await this.cache.get(this.CACHE_KEY_ALL)) as
        | CachedApplicationData
        | undefined;

      if (refreshedCache) {
        return {
          applications: refreshedCache.applications,
          totalCount: refreshedCache.totalCount,
        };
      }

      if (!this.isRefreshing) {
        // If refresh completed but cache is still empty, fall back to direct API call
        this.logger.warn(
          'Cache refresh completed but cache is empty, falling back to direct API call',
        );
        const result = await this.dataService.getAllApplications();
        return {
          applications: result.applications,
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
    const result = await this.dataService.getAllApplications();
    return {
      applications: result.applications,
      totalCount: result.totalCount,
    };
  }

  /**
   * Get a single application by its key, using cache when possible
   */
  async getApplicationById(applicationId: string): Promise<{
    applications: any[];
    totalCount: number;
  }> {
    this.logger.debug('Getting application by key', {
      applicationId,
    });

    // Try to get from cache first
    const cached = (await this.cache.get(this.CACHE_KEY_ALL)) as
      | CachedApplicationData
      | undefined;

    let allApplications: ApplicationItem[];

    if (cached) {
      this.logger.debug('Using cache for applicationId lookup');
      allApplications = cached.applications;
    } else {
      this.logger.debug('Cache miss - fetching applications from API');
      try {
        const result = await this.dataService.getApplicationById(applicationId);
        return {
          applications: result ? [result] : [],
          totalCount: result ? 1 : 0,
        };
      } catch (error: any) {
        // Handle 404 error gracefully - return empty result instead of throwing
        if (error?.status === 404) {
          this.logger.debug(
            `Application with ID ${applicationId} not found in Apiiro, returning empty result`,
          );
          return { applications: [], totalCount: 0 };
        }
        // Re-throw other errors
        throw error;
      }
    }

    const application = allApplications.find(app => app.key === applicationId);

    this.logger.debug('Application key lookup complete', {
      applicationId,
      found: !!application,
    });

    return {
      applications: application ? [application] : [],
      totalCount: application ? 1 : 0,
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
      | CachedApplicationData
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
    this.logger.info('Application cache cleared');
  }

  /**
   * Match cached applications with Backstage entities
   * This is called per-request since entities might change
   */
  matchWithEntities(
    applications: any[],
    entities: any[],
  ): {
    applications: any[];
    totalCount: number;
  } {
    if (entities.length === 0 || applications.length === 0) {
      this.logger.warn(
        'No entities provided for matching, returning empty applications',
      );
      return {
        applications: [],
        totalCount: 0,
      };
    }

    const matched = matchApplicationsWithEntitiesAndAddUrl(
      entities,
      applications,
    );

    this.logger.debug('Matched applications with entities', {
      totalApplications: applications.length,
      totalEntities: entities.length,
      matchedCount: matched.length,
    });

    return {
      applications: matched,
      totalCount: matched.length,
    };
  }
}
