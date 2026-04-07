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
import {
  evaluateFilterPredicate,
  FilterPredicate,
} from '@backstage/filter-predicates';
import fetch from 'node-fetch';

/** Bidirectional relation pair: forward and reverse type strings. */
interface RelationPair {
  forward: string;
  reverse: string;
}

/** Raw stored patch data: patchName → { fieldName → value } */
type PatchDataMap = Record<string, Record<string, unknown>>;

interface CachedPatchData {
  data: PatchDataMap;
  /** ETag value from the last successful 200 response — used for If-None-Match. */
  etag: string;
}

/** Sentinel returned by fetchPatchData when the server responds 304 Not Modified. */
const UNCHANGED = Symbol('UNCHANGED');

interface PatchConfig {
  name: string;
  filter?: FilterPredicate;
  /** Reverse mapping: fieldName → entity dot-path or `relations.{type}` */
  mapping: Record<string, string>;
  /**
   * Flattened JSON Schema properties from all sections (fieldName → schema).
   * Used to infer `multiple` for relation fields (`type: "array"`).
   */
  sectionProperties: Record<string, unknown>;
}

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
  private readonly config: Config;
  private readonly patchConfigs: PatchConfig[];
  /** Lookup map: relation type (forward or reverse) → RelationPair */
  private readonly relationPairs: Map<string, RelationPair>;

  constructor(options: EntityPatchProcessorOptions) {
    this.logger = options.logger;
    this.discovery = options.discovery;
    this.auth = options.auth;
    this.config = options.config;
    this.relationPairs = this.readRelationPairs();
    this.patchConfigs = this.readPatchConfigs();
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
   * Builds a lookup map from relation type string → RelationPair, indexed by
   * BOTH forward and reverse types. This allows mapping values like
   * `relations.hasDesigner` or `relations.designerOn` to resolve the same pair.
   */
  private readRelationPairs(): Map<string, RelationPair> {
    const pairs = new Map<string, RelationPair>();
    const relations =
      this.config.getOptionalConfigArray('entityPatch.relations') ?? [];
    for (const r of relations) {
      const forward = r.getString('forward');
      const reverse = r.getString('reverse');
      const pair: RelationPair = { forward, reverse };
      pairs.set(forward, pair);
      pairs.set(reverse, pair);
    }
    return pairs;
  }

  /**
   * Reads patch configs from `entityPatch.patches`. Only patches with a
   * `mapping` block are eligible for application.
   */
  private readPatchConfigs(): PatchConfig[] {
    const patches =
      this.config.getOptionalConfigArray('entityPatch.patches') ?? [];
    return patches
      .filter(p => p.has('mapping'))
      .map(p => {
        const sections =
          p
            .getOptionalConfigArray('sections')
            ?.map(
              s => s.getOptional<Record<string, unknown>>('properties') ?? {},
            ) ?? [];
        const sectionProperties = Object.assign({}, ...sections);
        return {
          name: p.getString('name'),
          filter: p.has('filter')
            ? (p.get('filter') as FilterPredicate)
            : undefined,
          mapping: p.getOptional<Record<string, string>>('mapping') ?? {},
          sectionProperties,
        };
      });
  }

  /**
   * Fetches raw stored patch data for an entity from the entity-patch API,
   * using ETag-based conditional requests to avoid unnecessary data transfer.
   *
   * @param entity - The entity to fetch patch data for.
   * @param cachedEtag - The ETag from a previous successful response. When
   *   provided, it is sent as `If-None-Match`; a `304 Not Modified` response
   *   causes this method to return the `UNCHANGED` sentinel.
   * @returns `{ data, etag }` on 200, `UNCHANGED` on 304, or `null` on
   *   404 / network errors.
   */
  private async fetchPatchData(
    entity: Entity,
    cachedEtag?: string,
  ): Promise<{ data: PatchDataMap; etag: string } | typeof UNCHANGED | null> {
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
      const url = `${baseUrl}/values/${encodeURIComponent(namespace)}/${encodeURIComponent(kind)}/${encodeURIComponent(name)}`;

      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };
      if (cachedEtag) {
        headers['If-None-Match'] = cachedEtag;
      }

      const response = await fetch(url, { headers });

      if (response.status === 304) {
        this.logger.debug('Patch data unchanged (304)', { entityRef });
        return UNCHANGED;
      }

      if (response.status === 404) {
        this.logger.debug('No patch data found for entity', { entityRef });
        return null;
      }

      if (!response.ok) {
        this.logger.warn(
          `Failed to fetch patch data for ${entityRef}: HTTP ${response.status}`,
        );
        return null;
      }

      const data = (await response.json()) as PatchDataMap;
      const etag = response.headers.get('etag') ?? '"unknown"';
      return { data, etag };
    } catch (err) {
      this.logger.debug(
        `Could not reach entity-patch API for ${entityRef}: ${err}`,
      );
      return null;
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

    if (result === UNCHANGED) {
      this.logger.debug('Using cached patch data (ETag match)', {
        entityRef: cacheKey,
      });
      // cached is guaranteed non-null here: UNCHANGED is only returned when
      // cachedEtag was provided, which requires cached to be non-null.
      return cached!.data;
    }

    if (result === null) {
      return null;
    }

    await cache.set(cacheKey, { data: result.data, etag: result.etag } as any);
    return result.data;
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

    const patchData = await this.getCachedPatchData(entity, cache);
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

    const patchData = await this.getCachedPatchData(entity, cache);
    if (!patchData) {
      return entity;
    }

    const sourceRef = stringifyEntityRef(entity);

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

          let target: { kind: string; namespace: string; name: string };
          try {
            target = parseEntityRef(targetRef);
          } catch {
            this.logger.warn(
              `Could not parse entity ref "${targetRef}" in patch "${patchName}" field "${fieldName}" — skipping`,
              { entityRef: sourceRef },
            );
            continue;
          }

          const source = parseEntityRef(sourceRef);

          // Forward relation: sourceEntity → targetEntity
          emit(
            processingResult.relation({
              type: pair.forward,
              source,
              target,
            }),
          );

          // Reverse relation: targetEntity → sourceEntity
          emit(
            processingResult.relation({
              type: pair.reverse,
              source: target,
              target: source,
            }),
          );
        }
      }
    }

    return entity;
  }
}
