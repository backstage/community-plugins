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
import {
  CacheService,
  LoggerService,
  SchedulerService,
} from '@backstage/backend-plugin-api';
import type { Config } from '@backstage/config';
import { MendDataService } from './data.service';
import {
  ProjectStatisticsSuccessResponseData,
  Project,
} from './data.service.types';
import {
  fetchQueryPagination,
  dataProjectParser,
} from './data.service.helpers';

const REFRESH_LOCK_TTL_MS = 2 * 60 * 1000; // 2 minutes
const MAX_WAIT_RETRIES = 30;
const RETRY_DELAY_MS = 1000;

interface CachedProjectData {
  projectsById: Record<string, Project>;
  lastFetched: number;
  fetchCompleted: boolean;
}

export class MendCacheManager {
  private static readonly PROJECT_CACHE_KEY = 'mend:backend:projects';
  private static readonly PROJECT_LOCK_KEY = 'mend:backend:projects:lock';

  private schedulerStarted: boolean = false;
  private readonly scheduleIntervalMinutes: number;
  private readonly permissionControl: Config | undefined;
  private readonly cacheTtlMs: number;

  constructor(
    private readonly config: Config,
    private readonly cacheService: CacheService,
    private readonly logger: LoggerService,
    private readonly scheduler: SchedulerService,
    private readonly mendDataService: MendDataService,
  ) {
    this.scheduleIntervalMinutes =
      this.config.getOptionalNumber('mend.cacheRefresh') ?? 240;
    this.permissionControl = this.config.getOptionalConfig(
      'mend.permissionControl',
    );
    this.cacheTtlMs = this.scheduleIntervalMinutes * 60 * 1000;
    MendDataService.connect()
      .then(() => this.startScheduler())
      .catch(err => {
        const errorMessage =
          err instanceof Error ? err?.message : err?.statusText;
        this.logger.error(
          errorMessage ||
            'Oops! Unauthorized. Please provide valid mend Activation Key!',
        );
      });
  }

  private async startScheduler(): Promise<void> {
    if (this.schedulerStarted) {
      return;
    }

    this.schedulerStarted = true;

    await this.scheduler.scheduleTask({
      id: 'mend-backend-project-cache-refresh',
      frequency: { minutes: this.scheduleIntervalMinutes },
      timeout: { minutes: 10 },
      initialDelay: { seconds: 20 },
      fn: async () => {
        this.logger.info(
          'Starting scheduled Mend backend project cache refresh',
        );
        await this.refreshProjectCacheIfNeeded(true);
      },
    });
  }

  private isCacheExpired(lastFetched: number): boolean {
    return Date.now() - lastFetched > this.cacheTtlMs;
  }

  async refreshProjectCacheIfNeeded(force: boolean = false): Promise<void> {
    const cachedData = (await this.cacheService.get(
      MendCacheManager.PROJECT_CACHE_KEY,
    )) as CachedProjectData | undefined;

    if (!force && cachedData && !this.isCacheExpired(cachedData.lastFetched)) {
      return;
    }

    // Check for refresh lock to prevent concurrent refreshes
    // Use iterative retry loop instead of recursion to prevent stack overflow
    let retryCount = 0;
    while (retryCount < MAX_WAIT_RETRIES) {
      const refreshLock = await this.cacheService.get<{
        locked: boolean;
        timestamp: number;
      }>(MendCacheManager.PROJECT_LOCK_KEY);

      const now = Date.now();
      if (!refreshLock || now - refreshLock.timestamp >= REFRESH_LOCK_TTL_MS) {
        // No lock or lock has expired, proceed with refresh
        break;
      }

      // Another process is refreshing, wait and retry
      this.logger.debug(
        `Cache refresh lock detected, waiting... (attempt ${
          retryCount + 1
        }/${MAX_WAIT_RETRIES})`,
      );
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      retryCount++;
    }

    if (retryCount >= MAX_WAIT_RETRIES) {
      this.logger.warn(
        'Maximum lock wait retries exceeded, proceeding with cache refresh anyway',
      );
    }

    // Acquire lock
    await this.cacheService.set(
      MendCacheManager.PROJECT_LOCK_KEY,
      {
        locked: true,
        timestamp: Date.now(),
      },
      { ttl: REFRESH_LOCK_TTL_MS },
    );

    try {
      if (!MendDataService.getOrganizationUuid()) {
        const configurationError = MendDataService.getConfigurationError();
        const errorMessage =
          configurationError ||
          'Mend organization UUID not found. Authentication may have failed.';
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
      }

      this.logger.info('Fetching all Mend projects for cache...');

      const projectStatistics =
        await fetchQueryPagination<ProjectStatisticsSuccessResponseData>(
          this.mendDataService.getProjectStatistics.bind(this.mendDataService),
        );

      // Parse projects using dataProjectParser and store by projectId
      const parsedData = dataProjectParser(projectStatistics);
      const projectsById: Record<string, Project> = {};
      for (const project of parsedData.projectList) {
        if (await this.isProjectAllowedByPermissionControl(project.uuid)) {
          projectsById[project.uuid] = project;
        }
      }

      this.logger.info(
        `Cached ${
          Object.keys(projectsById).length
        } Mend projects with statistics`,
      );

      await this.cacheService.set(
        MendCacheManager.PROJECT_CACHE_KEY,
        {
          projectsById,
          lastFetched: Date.now(),
          fetchCompleted: true,
        },
        { ttl: this.cacheTtlMs },
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error refreshing Mend project cache: ${errorMessage}`);
      throw error;
    } finally {
      // Always release the lock, even if an error occurred
      try {
        await this.cacheService.delete(MendCacheManager.PROJECT_LOCK_KEY);
      } catch (lockError) {
        this.logger.warn('Failed to release cache refresh lock:', lockError);
      }
    }
  }

  /**
   * Get all cached projects indexed by projectId
   */
  async getProjectsById(): Promise<Record<string, Project>> {
    await this.refreshProjectCacheIfNeeded();
    const cachedData = (await this.cacheService.get(
      MendCacheManager.PROJECT_CACHE_KEY,
    )) as CachedProjectData | undefined;
    return cachedData?.projectsById || {};
  }

  /**
   * Get projects by their IDs from cache
   * @param projectIds - Array of project UUIDs to fetch
   * @returns Array of Project objects
   */
  async getProjectsByIds(projectIds: string[]): Promise<Project[]> {
    const projectsById = await this.getProjectsById();
    return projectIds
      .map(id => projectsById[id])
      .filter((p): p is Project => p !== undefined);
  }

  /**
   * Check if a project ID is allowed by permission control
   * @param projectId - Project UUID to check
   * @returns true if allowed, false otherwise
   */
  async isProjectAllowedByPermissionControl(
    projectId: string,
  ): Promise<boolean> {
    if (!this.permissionControl) {
      return true; // No permission control configured, allow all
    }

    const ids = this.permissionControl.getOptionalStringArray('ids') || [];
    const exclude =
      this.permissionControl.getOptionalBoolean('exclude') ?? true;

    if (ids.length === 0) {
      return true; // No IDs configured, allow all
    }

    const isInList = ids.includes(projectId);
    // If exclude is true (blocklist mode): filter out items in the list
    // If exclude is false (allowlist mode): only include items in the list
    return exclude ? !isInList : isInList;
  }
}
