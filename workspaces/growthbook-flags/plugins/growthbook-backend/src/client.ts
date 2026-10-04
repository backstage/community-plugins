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

import type { FlagRow } from '@backstage-community/plugin-growthbook-common';
import {
  MgmtExperiment,
  MgmtFeature,
  MgmtFeatureDetail,
  MgmtResults,
  MgmtStale,
  normalizeMgmtFlags,
} from './helpers';

export type GbProject = { id: string; name: string };

export class GrowthbookApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
    this.name = 'GrowthbookApiError';
  }
}

export type GrowthbookClientOptions = {
  baseUrl: string;
  secretKey: string;
  fetchFn?: typeof fetch;
  now?: () => number;
};

const SHORT_TTL_MS = 60_000;
const PROJECT_TTL_MS = 300_000;
const CACHE_MAX_ENTRIES = 200;
const PAGE_LIMIT = 100;

type Page = { hasMore?: boolean; nextOffset?: number | null };

export class GrowthbookClient {
  private readonly baseUrl: string;
  private readonly secretKey: string;
  private readonly fetchFn: typeof fetch;
  private readonly now: () => number;
  private readonly cache = new Map<
    string,
    { data: unknown; expiresAt: number }
  >();

  constructor(options: GrowthbookClientOptions) {
    this.baseUrl = options.baseUrl;
    this.secretKey = options.secretKey;
    this.fetchFn = options.fetchFn ?? fetch;
    this.now = options.now ?? Date.now;
  }

  async listProjects(): Promise<GbProject[]> {
    return this.cached(
      'projects',
      PROJECT_TTL_MS,
      async () => {
        const body = await this.getJson<{ projects: GbProject[] }>(
          `/api/v1/projects?limit=${PAGE_LIMIT}`,
          'projects',
        );
        return body.projects;
      },
      { pinned: true },
    );
  }

  async getFlags(env: string, projectId?: string): Promise<FlagRow[]> {
    return this.cached(
      `flags:${projectId ?? 'all'}:${env}`,
      SHORT_TTL_MS,
      async () => {
        // GrowthBook's features API has no project filter: fetch all, filter here.
        const features = await this.listFeatures();
        const scoped = projectId
          ? features.filter(f => f.project === projectId)
          : features;
        return normalizeMgmtFlags(scoped, env);
      },
    );
  }

  async listExperiments(projectId?: string): Promise<MgmtExperiment[]> {
    return this.cached(
      `experiments:${projectId ?? 'all'}`,
      SHORT_TTL_MS,
      () => {
        const params = new URLSearchParams({ archived: 'false' });
        if (projectId) params.set('projectId', projectId);
        return this.paginate<MgmtExperiment>(
          '/api/v1/experiments',
          params,
          'experiments',
          'experiments',
        );
      },
    );
  }

  async getExperimentResults(
    id: string,
  ): Promise<{ experiment: MgmtExperiment; result: MgmtResults } | undefined> {
    return this.cached(`results:${id}`, SHORT_TTL_MS, () =>
      // GrowthBook answers 400 or 404 when an experiment has no snapshot yet
      // (for example a draft), which is "no results", not a failure.
      this.getJsonOrUndefined<{
        experiment: MgmtExperiment;
        result: MgmtResults;
      }>(
        `/api/v1/experiments/${encodeURIComponent(id)}/results`,
        'results',
        [400, 404],
      ),
    );
  }

  async getFeature(id: string): Promise<MgmtFeatureDetail | undefined> {
    return this.cached(`feature:${id}`, SHORT_TTL_MS, async () => {
      const body = await this.getJsonOrUndefined<{
        feature: MgmtFeatureDetail;
      }>(`/api/v1/features/${encodeURIComponent(id)}`, 'feature');
      return body?.feature;
    });
  }

  async getStale(id: string): Promise<MgmtStale | undefined> {
    return this.cached(`stale:${id}`, SHORT_TTL_MS, async () => {
      const body = await this.getJsonOrUndefined<{
        features: Record<string, MgmtStale>;
      }>(`/api/v2/stale-features?ids=${encodeURIComponent(id)}`, 'stale');
      return body?.features?.[id];
    });
  }

  private listFeatures(): Promise<MgmtFeature[]> {
    return this.cached(
      'features',
      SHORT_TTL_MS,
      () =>
        this.paginate<MgmtFeature>(
          '/api/v1/features',
          new URLSearchParams(),
          'features',
          'features',
        ),
      { pinned: true },
    );
  }

  /**
   * `pinned` entries (shared lists every request needs) are always stored.
   * Others only while there is room, after dropping expired entries, so
   * per-id lookups can never switch off caching for the shared lists.
   * Misses (`undefined`) are not cached.
   */
  private async cached<T>(
    key: string,
    ttlMs: number,
    load: () => Promise<T>,
    options: { pinned?: boolean } = {},
  ): Promise<T> {
    const now = this.now();
    const hit = this.cache.get(key);
    if (hit && now < hit.expiresAt) return hit.data as T;
    const data = await load();
    if (
      data !== undefined &&
      (options.pinned || this.cache.has(key) || this.hasRoom(now))
    ) {
      this.cache.set(key, { data, expiresAt: now + ttlMs });
    }
    return data;
  }

  private hasRoom(now: number): boolean {
    if (this.cache.size < CACHE_MAX_ENTRIES) return true;
    for (const [key, entry] of this.cache) {
      if (entry.expiresAt <= now) this.cache.delete(key);
    }
    return this.cache.size < CACHE_MAX_ENTRIES;
  }

  private async paginate<T>(
    path: string,
    params: URLSearchParams,
    listKey: string,
    label: string,
  ): Promise<T[]> {
    const items: T[] = [];
    let offset = 0;
    let hasMore = true;
    while (hasMore) {
      const page = new URLSearchParams(params);
      page.set('limit', String(PAGE_LIMIT));
      page.set('offset', String(offset));
      const body = await this.getJson<Page & Record<string, unknown>>(
        `${path}?${page}`,
        label,
      );
      items.push(...((body[listKey] as T[] | undefined) ?? []));
      hasMore =
        Boolean(body.hasMore) &&
        body.nextOffset !== null &&
        body.nextOffset !== undefined;
      if (hasMore) offset = body.nextOffset as number;
    }
    return items;
  }

  private async getJson<T>(path: string, label: string): Promise<T> {
    const res = await this.request(path);
    if (!res.ok) {
      throw new GrowthbookApiError(
        res.status,
        `GrowthBook ${label} API returned ${res.status}`,
      );
    }
    return (await res.json()) as T;
  }

  private async getJsonOrUndefined<T>(
    path: string,
    label: string,
    missingStatuses: number[] = [404],
  ): Promise<T | undefined> {
    const res = await this.request(path);
    if (missingStatuses.includes(res.status)) return undefined;
    if (!res.ok) {
      throw new GrowthbookApiError(
        res.status,
        `GrowthBook ${label} API returned ${res.status}`,
      );
    }
    return (await res.json()) as T;
  }

  private request(path: string): Promise<Response> {
    return this.fetchFn(`${this.baseUrl}${path}`, {
      headers: { Authorization: `Bearer ${this.secretKey}` },
    });
  }
}
