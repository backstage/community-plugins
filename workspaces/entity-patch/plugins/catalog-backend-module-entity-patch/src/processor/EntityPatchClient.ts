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
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import {
  AuthService,
  DiscoveryService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { CatalogProcessorCache } from '@backstage/plugin-catalog-node';
import { PatchDataMap } from './EntityPatcher';
import { JsonValue } from '@backstage/types';

interface CachedPatchData {
  data: PatchDataMap;
  /** ETag value from the last successful 200 response — used for If-None-Match. */
  etag: string;
}

type FetchResult =
  | { status: 'data'; value: PatchDataMap; etag: string }
  | { status: 'unchanged' }
  | { status: 'error' };

export interface EntityPatchClientOptions {
  logger: LoggerService;
  discovery: DiscoveryService;
  auth: AuthService;
}

/**
 * Fetches saved patch data from the entity-patch API on behalf of the
 * EntityPatchProcessor. Handles auth token acquisition, ETag-based conditional
 * requests, and CatalogProcessorCache read/write.
 */
export class EntityPatchClient {
  private readonly logger: LoggerService;
  private readonly discovery: DiscoveryService;
  private readonly auth: AuthService;

  constructor({ logger, discovery, auth }: EntityPatchClientOptions) {
    this.logger = logger;
    this.discovery = discovery;
    this.auth = auth;
  }

  /**
   * Returns patch data for the entity, using the processor cache to avoid
   * redundant fetches. On a 304 Not Modified the cached value is returned
   * directly; on 200 the cache is updated. Returns `null` on 404 or errors.
   */
  async getPatchData(
    entity: Entity,
    cache: CatalogProcessorCache,
  ): Promise<PatchDataMap | null> {
    const entityRef = stringifyEntityRef(entity);
    const cached = (await cache.get(entityRef)) as CachedPatchData | null;

    const result = await this.fetchPatchData(entity, cached?.etag);

    if (result.status === 'unchanged') {
      this.logger.debug('Using cached patch data (ETag match)', { entityRef });
      // Re-write the existing cache entry so it survives the next cycle.
      // Without this, newState stays undefined and the framework falls back
      // to existingState — which works, but is implicit. Matching the pattern
      // used by UrlReaderProcessor makes the intent explicit.
      await cache.set(entityRef, cached as JsonValue);
      // cached is guaranteed non-null here: 'unchanged' is only returned when
      // cachedEtag was provided, which requires cached to be non-null.
      return cached!.data;
    }

    if (result.status === 'error') {
      return null;
    }

    await cache.set(entityRef, {
      data: result.value,
      etag: result.etag,
    } as JsonValue);
    return result.value;
  }

  /**
   * Fetches raw patch data for an entity from the entity-patch API,
   * using ETag-based conditional requests to avoid unnecessary data transfer.
   */
  private async fetchPatchData(
    entity: Entity,
    cachedEtag?: string,
  ): Promise<FetchResult> {
    const { kind, metadata } = entity;
    const namespace = metadata.namespace ?? 'default';
    const { name } = metadata;
    const entityRef = stringifyEntityRef(entity);

    try {
      const { token } = await this.auth.getPluginRequestToken({
        onBehalfOf: await this.auth.getOwnServiceCredentials(),
        targetPluginId: 'entity-patch',
      });

      const baseUrl = await this.discovery.getBaseUrl('entity-patch');
      const url = `${baseUrl}/values/${encodeURIComponent(
        namespace,
      )}/${encodeURIComponent(kind)}/${encodeURIComponent(name)}`;

      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };
      if (cachedEtag) {
        headers['If-None-Match'] = cachedEtag;
      }

      const response = await fetch(url, { headers });

      if (response.status === 304) {
        this.logger.debug('Patch data unchanged (304)', { entityRef });
        return { status: 'unchanged' };
      }

      if (response.status === 404) {
        this.logger.debug('No patch data found for entity', { entityRef });
        return { status: 'error' };
      }

      if (!response.ok) {
        this.logger.warn(
          `Failed to fetch patch data for ${entityRef}: HTTP ${response.status}`,
        );
        return { status: 'error' };
      }

      const value = (await response.json()) as PatchDataMap;
      const etag = response.headers.get('etag') ?? '"unknown"';
      return { status: 'data', value, etag };
    } catch (err) {
      this.logger.debug(
        `Could not reach entity-patch API for ${entityRef}: ${err}`,
      );
      return { status: 'error' };
    }
  }
}
