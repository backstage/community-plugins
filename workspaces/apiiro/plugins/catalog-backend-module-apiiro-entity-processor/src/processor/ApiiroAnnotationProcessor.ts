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
  CatalogProcessor,
  CatalogProcessorEmit,
  CatalogProcessorCache,
} from '@backstage/plugin-catalog-node';
import type { LocationSpec } from '@backstage/plugin-catalog-common';
import { Entity } from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import fetch from 'node-fetch';
import {
  APIIRO_METRICS_VIEW_ANNOTATION,
  APIIRO_PROJECT_ANNOTATION,
  APIIRO_DEFAULT_BASE_URL,
} from '@backstage-community/plugin-apiiro-common';

interface RepositoryItem {
  name?: string | null;
  key?: string | null;
  url?: string | null;
  isDefaultBranch?: boolean;
  branchName?: string | null;
  [key: string]: unknown;
}

interface ApiiroRepositoriesResponse {
  items: RepositoryItem[];
  next?: string | null;
}

interface RepoCache {
  data: Map<string, { key: string; isDefaultBranch: boolean }>;
  lastFetched: number;
  isRefreshing: boolean;
}

const BACKSTAGE_SOURCE_LOCATION_ANNOTATION = 'backstage.io/source-location';

export class ApiiroAnnotationProcessor implements CatalogProcessor {
  private static readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
  private static readonly PAGE_LIMIT = 1000;
  private static readonly MAX_PAGES = 1000;
  private static readonly DEFAULT_NAMESPACE = 'default';

  private repoCache: RepoCache = {
    data: new Map(),
    lastFetched: 0,
    isRefreshing: false,
  };

  constructor(private readonly config: Config) {}

  getProcessorName(): string {
    return 'ApiiroAnnotationProcessor';
  }

  /**
   * Determines if an entity should be processed by this processor.
   * Only Component entities are processed.
   */
  private shouldProcessEntity(entity: Entity): boolean {
    return entity.kind === 'Component';
  }

  /**
   * Retrieves the Apiiro access token from configuration.
   * @throws {Error} If the access token is not configured
   */
  private getAccessToken(): string {
    const accessToken = this.config.getOptionalString('apiiro.accessToken');
    if (!accessToken) {
      throw new Error(
        'Apiiro access token not configured. Please set apiiro.accessToken in your app-config.',
      );
    }
    return accessToken;
  }

  /**
   * Fetches a single page of repositories from the Apiiro API.
   * @param pageCursor - Optional cursor for pagination
   * @returns Page of repositories with next cursor
   */
  private async fetchRepositoriesPage(
    pageCursor?: string,
  ): Promise<ApiiroRepositoriesResponse> {
    const accessToken = this.getAccessToken();
    const baseUrl = APIIRO_DEFAULT_BASE_URL;

    const params = new URLSearchParams();
    params.append('limit', ApiiroAnnotationProcessor.PAGE_LIMIT.toString());
    if (pageCursor) {
      params.append('next', pageCursor);
    }

    const url = `${baseUrl}/rest-api/v2/repositories?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorMessage = `Failed to fetch repositories from Apiiro API. Status: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data = (await response.json()) as ApiiroRepositoriesResponse;
    return {
      items: data.items || [],
      next: data.next || null,
    };
  }

  /**
   * Fetches all repositories from the Apiiro API with pagination.
   * @returns All repositories with total count
   * @throws {Error} If pagination limit is exceeded
   */
  private async fetchAllRepositories(): Promise<{
    items: RepositoryItem[];
    totalCount: number;
  }> {
    const items: RepositoryItem[] = [];
    let nextCursor: string | null | undefined = undefined;
    let pageCount = 0;

    do {
      pageCount++;

      if (pageCount > ApiiroAnnotationProcessor.MAX_PAGES) {
        throw new Error(
          `Pagination limit exceeded: Maximum of ${ApiiroAnnotationProcessor.MAX_PAGES} pages allowed. ` +
            `This may indicate an infinite loop or an unexpectedly large dataset. ` +
            `Fetched ${items.length} repositories so far.`,
        );
      }

      const page = await this.fetchRepositoriesPage(nextCursor ?? undefined);
      items.push(...page.items);
      nextCursor = page.next;
    } while (nextCursor);

    return { items, totalCount: items.length };
  }

  /**
   * Optimized method that combines default branch selection and map building in a single loop.
   * Groups repositories by URL, selects the best branch for each, and builds the URL->key mapping.
   * @param repositories Array of all repository items
   * @returns Map of repository URLs to repository keys
   */
  private buildRepositoryMapWithDefaultBranches(
    repositories: RepositoryItem[],
  ): Map<string, { key: string; isDefaultBranch: boolean }> {
    const repoMap = new Map<
      string,
      { key: string; isDefaultBranch: boolean }
    >();

    // Single loop: Group repositories by URL
    for (const repo of repositories) {
      if (!repo.url) {
        continue; // Skip items without URL
      }
      if (repoMap.has(repo.url)) {
        if (repo.isDefaultBranch) {
          repoMap.set(repo.url, {
            key: repo.key!,
            isDefaultBranch: repo.isDefaultBranch!,
          });
        }
        continue;
      } else {
        repoMap.set(repo.url, {
          key: repo.key!,
          isDefaultBranch: repo.isDefaultBranch!,
        });
      }
    }

    return repoMap;
  }

  /**
   * Fetches all repositories and builds a name->key mapping.
   * Automatically filters to default branches only.
   * @returns Map of repository names to repository keys
   */
  private async fetchAllRepos(): Promise<
    Map<string, { key: string; isDefaultBranch: boolean }>
  > {
    try {
      // Fetch all repositories with pagination
      const { items } = await this.fetchAllRepositories();

      // Combine default branch selection and map building in a single operation
      return this.buildRepositoryMapWithDefaultBranches(items);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `[ApiiroAnnotationProcessor] Error fetching repositories from Apiiro API: ${errorMessage}`,
      );
      return new Map();
    }
  }

  /**
   * Checks if the cache is expired.
   */
  private isCacheExpired(): boolean {
    const now = Date.now();
    return (
      now - this.repoCache.lastFetched >
        ApiiroAnnotationProcessor.CACHE_TTL_MS || this.repoCache.data.size === 0
    );
  }

  /**
   * Refreshes the repository cache from the Apiiro API.
   * Prevents concurrent refreshes using a flag.
   */
  private async refreshCacheIfNeeded(): Promise<void> {
    if (!this.isCacheExpired() || this.repoCache.isRefreshing) {
      return;
    }

    this.repoCache.isRefreshing = true;

    try {
      const newData = await this.fetchAllRepos();
      this.repoCache.data = newData;
      this.repoCache.lastFetched = Date.now();
    } finally {
      this.repoCache.isRefreshing = false;
    }
  }

  /**
   * Retrieves the repository key for a given entity name.
   * Uses a cached map that refreshes automatically when expired.
   * @param entityName - The name of the entity/repository
   * @returns Repository key or null if not found
   */
  private async getRepoKey(repoUrl: string): Promise<string | null> {
    await this.refreshCacheIfNeeded();
    return this.repoCache.data.get(repoUrl)?.key || null;
  }

  /**
   * Creates an entity reference string in the format: kind:namespace/name
   */
  private createEntityReference(entity: Entity): string {
    const kind = entity.kind?.toLowerCase() || 'component';
    const namespace =
      entity.metadata.namespace || ApiiroAnnotationProcessor.DEFAULT_NAMESPACE;
    const name = entity.metadata.name;
    return `${kind}:${namespace}/${name}`;
  }

  /**
   * Determines if an entity should have the metrics view annotation.
   * Based on permission control configuration (exclude/include list).
   */
  private shouldAllowMetricsView(entity: Entity): boolean {
    const exclude =
      this.config.getOptionalBoolean('apiiro.permissionControl.exclude') ??
      true;
    const entityNames =
      this.config.getOptionalStringArray(
        'apiiro.permissionControl.entityNames',
      ) ?? [];

    const entityRef = this.createEntityReference(entity);
    const isInList = entityNames.includes(entityRef);

    // If exclude=true: allow all except those in list
    // If exclude=false: allow only those in list
    return exclude ? !isInList : isInList;
  }

  /**
   * Adds Apiiro annotations to an entity if they don't already exist.
   */
  private addApiiroAnnotations(
    entity: Entity,
    repoKey: string | null,
    allowMetricsView: boolean,
  ): Record<string, string> {
    const annotations: Record<string, string> = {
      ...entity.metadata?.annotations,
    };

    // Add project annotation if repo key exists and annotation not already set
    if (
      repoKey &&
      !Object.keys(annotations).includes(APIIRO_PROJECT_ANNOTATION)
    ) {
      annotations[APIIRO_PROJECT_ANNOTATION] = repoKey;
    }

    // Add metrics view annotation if allowed and not already set
    if (
      allowMetricsView &&
      !Object.keys(annotations).includes(APIIRO_METRICS_VIEW_ANNOTATION)
    ) {
      annotations[APIIRO_METRICS_VIEW_ANNOTATION] = 'true';
    }

    return annotations;
  }

  /**
   * Preprocesses an entity to add Apiiro-specific annotations.
   * Only processes Component entities.
   */
  async preProcessEntity(
    entity: Entity,
    _location: LocationSpec,
    _emit: CatalogProcessorEmit,
    _originLocation: LocationSpec,
    _cache: CatalogProcessorCache,
  ): Promise<Entity> {
    if (!this.shouldProcessEntity(entity)) {
      return entity;
    }

    // Determine if metrics view should be allowed
    const allowMetricsView = this.shouldAllowMetricsView(entity);

    // Get repository key from cache (refreshes automatically if needed)
    const repoKey = await this.getRepoKey(
      entity.metadata.annotations?.[
        BACKSTAGE_SOURCE_LOCATION_ANNOTATION
      ]?.split('url:')[1] || '',
    );

    // Add Apiiro annotations
    const annotations = this.addApiiroAnnotations(
      entity,
      repoKey,
      allowMetricsView,
    );

    return {
      ...entity,
      metadata: {
        ...entity.metadata,
        annotations,
      },
    };
  }
}
