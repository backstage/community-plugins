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
import { cloneDeep, set } from 'lodash';
import {
  Entity,
  parseEntityRef,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import {
  CatalogProcessor,
  CatalogProcessorCache,
  CatalogProcessorEmit,
  processingResult,
} from '@backstage/plugin-catalog-node';
import {
  AuthService,
  DiscoveryService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { evaluateFilterPredicate } from '@backstage/filter-predicates';
import {
  RelationPair,
  PatchConfig,
  buildRelationPairs,
  buildPatchConfigs,
} from '@backstage-community/plugin-entity-patch-common';

/** Raw stored patch data: patchName → { fieldName → value } */
type PatchDataMap = Record<string, Record<string, unknown>>;

interface CachedPatchData {
  data: PatchDataMap;
  /** ETag value from the last successful 200 response — used for If-None-Match. */
  etag: string;
}

/** Discriminated union returned by fetchPatchData. */
type FetchResult =
  | { status: 'data'; value: PatchDataMap; etag: string }
  | { status: 'unchanged' }
  | { status: 'error' };

/**
 * Options for constructing EntityPatchProcessor.
 * @public
 */
export interface EntityPatchProcessorOptions {
  logger: LoggerService;
  discovery: DiscoveryService;
  auth: AuthService;
  config: Config;
}

/**
 * A CatalogProcessor that applies saved entity-patch form data back onto
 * entities during catalog ingestion.
 *
 * For each entity, the processor:
 * 1. Reads patch configs from `entityPatch.patches` that match the entity via FilterPredicate
 * 2. Fetches raw saved patch data from the entity-patch API using ETag-based
 *    conditional requests (If-None-Match / 304 Not Modified) to skip unchanged data
 * 3. Applies stored scalar field values onto the entity via `lodash.set` (preProcessEntity)
 * 4. Emits custom bidirectional relations via `processingResult.relation` (postProcessEntity)
 *
 * @public
 */
export class EntityPatchProcessor implements CatalogProcessor {
  private readonly logger: LoggerService;
  private readonly discovery: DiscoveryService;
  private readonly auth: AuthService;
  private readonly patchConfigs: PatchConfig[];
  /** Lookup map: relation type (forward or reverse) → RelationPair */
  private readonly relationPairs: Map<string, RelationPair>;
  /**
   * Per-cycle in-memory cache to deduplicate the HTTP fetch between
   * preProcessEntity and postProcessEntity for the same entity.
   * Bounded by the number of entities concurrently in one processing run.
   * Entries are deleted after postProcessEntity returns.
   */
  private readonly inFlightCache = new Map<string, PatchDataMap | null>();

  constructor(options: EntityPatchProcessorOptions) {
    this.logger = options.logger;
    this.discovery = options.discovery;
    this.auth = options.auth;
    this.relationPairs = buildRelationPairs(options.config);
    this.patchConfigs = buildPatchConfigs(options.config);
  }

  static fromConfig(
    config: Config,
    options: Omit<EntityPatchProcessorOptions, 'config'>,
  ): EntityPatchProcessor {
    return new EntityPatchProcessor({ ...options, config });
  }

  getProcessorName(): string {
    return 'EntityPatchProcessor';
  }

  /**
   * Fetches raw stored patch data for an entity from the entity-patch API,
   * using ETag-based conditional requests to avoid unnecessary data transfer.
   *
   * @param entity - The entity to fetch patch data for.
   * @param cachedEtag - The ETag from a previous successful response. When
   *   provided, it is sent as `If-None-Match`; a `304 Not Modified` response
   *   causes this method to return `{ status: 'unchanged' }`.
   * @returns `{ status: 'data', value, etag }` on 200, `{ status: 'unchanged' }` on 304,
   *   or `{ status: 'error' }` on 404 / network errors.
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

  /**
   * Returns patch data from the processor cache when the remote data is
   * unchanged (ETag match), otherwise fetches fresh data and updates the cache.
   *
   * The cache stores `{ data, etag }` — no TTL. Staleness is detected by the
   * server via `If-None-Match`; a `304 Not Modified` response means the cached
   * data is still valid. This ensures that changes saved via the patch API are
   * always reflected on the very next processing loop run.
   */
  private async getCachedPatchData(
    entity: Entity,
    cache: CatalogProcessorCache,
  ): Promise<PatchDataMap | null> {
    const cacheKey = stringifyEntityRef(entity);
    const cached = (await cache.get(cacheKey)) as CachedPatchData | null;

    const result = await this.fetchPatchData(entity, cached?.etag);

    if (result.status === 'unchanged') {
      this.logger.debug('Using cached patch data (ETag match)', {
        entityRef: cacheKey,
      });
      // cached is guaranteed non-null here: 'unchanged' is only returned when
      // cachedEtag was provided, which requires cached to be non-null.
      return cached!.data;
    }

    if (result.status === 'error') {
      return null;
    }

    await cache.set(cacheKey, { data: result.value, etag: result.etag } as any);
    return result.value;
  }

  private emitRelation(
    emit: CatalogProcessorEmit,
    sourceRef: string,
    pair: RelationPair,
    targetRef: string,
  ): void {
    emit(
      processingResult.relation({
        type: pair.forward,
        source: parseEntityRef(sourceRef),
        target: parseEntityRef(targetRef),
      }),
    );
    emit(
      processingResult.relation({
        type: pair.reverse,
        source: parseEntityRef(targetRef),
        target: parseEntityRef(sourceRef),
      }),
    );
  }

  async preProcessEntity(
    entity: Entity,
    _location: any,
    _emit: any,
    _originLocation: any,
    cache: CatalogProcessorCache,
  ): Promise<Entity> {
    const matchingPatches = this.patchConfigs.filter(
      p => !p.filter || evaluateFilterPredicate(p.filter, entity),
    );

    if (matchingPatches.length === 0) {
      return entity;
    }

    const entityRef = stringifyEntityRef(entity);
    if (!this.inFlightCache.has(entityRef)) {
      this.inFlightCache.set(
        entityRef,
        await this.getCachedPatchData(entity, cache),
      );
    }
    const patchData = this.inFlightCache.get(entityRef)!;
    if (!patchData) {
      return entity;
    }

    const result = cloneDeep(entity);

    for (const { name: patchName, mapping } of matchingPatches) {
      const savedValues = patchData[patchName];
      if (!savedValues) continue;

      for (const [fieldName, value] of Object.entries(savedValues)) {
        const entityPath = mapping[fieldName];
        if (!entityPath) continue;
        // Skip relation-mapped fields — they are handled in postProcessEntity
        if (entityPath.startsWith('relations.')) continue;
        set(result, entityPath, value);
      }
    }

    this.logger.debug('Applied patch data to entity', {
      entityRef: stringifyEntityRef(entity),
    });

    return result;
  }

  async postProcessEntity(
    entity: Entity,
    _location: any,
    emit: CatalogProcessorEmit,
    cache: CatalogProcessorCache,
  ): Promise<Entity> {
    const matchingPatches = this.patchConfigs.filter(
      p => !p.filter || evaluateFilterPredicate(p.filter, entity),
    );

    if (matchingPatches.length === 0) {
      return entity;
    }

    const entityRef = stringifyEntityRef(entity);
    try {
      if (!this.inFlightCache.has(entityRef)) {
        this.inFlightCache.set(
          entityRef,
          await this.getCachedPatchData(entity, cache),
        );
      }
      const patchData = this.inFlightCache.get(entityRef);
      if (!patchData) {
        return entity;
      }

      const sourceRef = entityRef;

      for (const {
        name: patchName,
        mapping,
        sectionProperties,
      } of matchingPatches) {
        const savedValues = patchData[patchName];
        if (!savedValues) continue;

        for (const [fieldName, entityPath] of Object.entries(mapping)) {
          if (!entityPath.startsWith('relations.')) continue;

          const relType = entityPath.slice('relations.'.length);
          const pair = this.relationPairs.get(relType);
          if (!pair) {
            this.logger.warn(
              `Mapping "relations.${relType}" has no matching entry in entityPatch.relations — skipping`,
              { entityRef: sourceRef, patchName, fieldName },
            );
            continue;
          }

          const propSchema = sectionProperties[fieldName] as
            | { type?: string }
            | undefined;
          const multiple = propSchema?.type === 'array';

          const rawValue = savedValues[fieldName];
          if (rawValue === undefined || rawValue === null) continue;

          let targetRefs: unknown[];
          if (multiple) {
            targetRefs = Array.isArray(rawValue) ? rawValue : [rawValue];
          } else {
            targetRefs = [rawValue];
          }

          for (const targetRef of targetRefs) {
            if (typeof targetRef !== 'string') continue;

            try {
              parseEntityRef(targetRef);
            } catch {
              this.logger.warn(
                `Could not parse entity ref "${targetRef}" in patch "${patchName}" field "${fieldName}" — skipping`,
                { entityRef: sourceRef },
              );
              continue;
            }

            this.emitRelation(emit, sourceRef, pair, targetRef);
          }
        }
      }

      return entity;
    } finally {
      this.inFlightCache.delete(entityRef);
    }
  }
}
