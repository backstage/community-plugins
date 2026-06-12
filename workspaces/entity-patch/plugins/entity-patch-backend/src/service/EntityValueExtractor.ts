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
import { get, set } from 'lodash';
import { Entity } from '@backstage/catalog-model';
import type {
  BackstageCredentials,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { NotFoundError } from '@backstage/errors';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { evaluateFilterPredicate } from '@backstage/filter-predicates';
import type {
  PatchConfig,
  RelationPair,
} from '@backstage-community/plugin-entity-patch-common';
import {
  isMappingTemplate,
  buildRelationPairs,
  buildPatchConfigs,
  RELATION_KEY_PREFIX,
} from '@backstage-community/plugin-entity-patch-common';

/**
 * Reads a value from a deeply nested object using a dot-separated path.
 * Delegates to lodash `get`, which supports:
 * - Plain dot notation: `metadata.description`
 * - Bracket notation for keys with dots: `metadata.annotations["pagerduty.com/integration-key"]`
 */
export function getByPath(obj: unknown, path: string): unknown {
  return get(obj, path);
}

/**
 * Reads relation target refs from `entity.relations[]` filtered by type.
 *
 * @param entity - The Backstage entity to read relations from.
 * @param type - The relation type to filter by (e.g. `"hasDesigner"`).
 * @param multiple - When `true`, returns a `string[]`; when `false`, returns
 *   a single `string` (the first match) or `undefined`.
 */
export function extractRelationValues(
  entity: Entity,
  type: string,
  multiple: boolean,
): string[] | string | undefined {
  const matches = (entity.relations ?? [])
    .filter(r => r.type === type)
    .map(r => r.targetRef);
  if (multiple) {
    return matches.length > 0 ? matches : undefined;
  }
  return matches[0];
}

/**
 * Extracts form field values from catalog entities across all configured patches.
 * Created once at startup via `fromConfig`; `getValues` is called per request.
 *
 * Each patch mapping key is a dot-separated entity path or `relations.{type}` ref;
 * each value is the form field name to populate, or a Nunjucks template string.
 *
 * Template-mapped paths (values containing `{{`) are skipped — the rendered
 * result lives on the entity but cannot be reverse-engineered into the original
 * form field values. The form will instead load those fields from the DB overlay.
 *
 * Multiple entity paths may share the same form field name (fan-out writes).
 * When reading back, the last entity path with a defined value wins.
 *
 * @example
 * // At startup:
 * const extractor = EntityValueExtractor.fromConfig(config, { auth, catalogClient });
 * // Per request:
 * const catalogValues = await extractor.getValues(entityRef, credentials);
 */
export class EntityValueExtractor {
  private constructor(
    private readonly patches: PatchConfig[],
    private readonly relationPairs: Map<string, RelationPair> | undefined,
    private readonly catalogService: CatalogService | undefined,
  ) {}

  /**
   * Builds the extractor from app config with all catalog dependencies.
   * Call once at plugin startup.
   */
  static fromConfig(
    config: RootConfigService,
    deps: { catalogService: CatalogService },
  ): EntityValueExtractor {
    return new EntityValueExtractor(
      buildPatchConfigs(config),
      buildRelationPairs(config),
      deps.catalogService,
    );
  }

  /**
   * Fetches the entity from the catalog and extracts values for all matching
   * patches. Returns a map of patch name → field values.
   */
  async getValues(
    entityRef: string,
    credentials: BackstageCredentials,
  ): Promise<Record<string, Record<string, unknown>>> {
    const entity = await this.catalogService!.getEntityByRef(entityRef, {
      credentials,
    });
    if (!entity)
      throw new NotFoundError(`Entity '${entityRef}' not found in catalog`);
    return this.extractAll(entity);
  }

  /**
   * Fetches catalog values for all matching patches and merges them with the
   * DB overlay (DB wins). Returns a map of patch name → field values.
   */
  async mergeWithCatalog(
    entityRef: string,
    dbOverlay: Record<string, Record<string, unknown>>,
    credentials: BackstageCredentials,
  ): Promise<Record<string, Record<string, unknown>>> {
    const catalogValues = await this.getValues(entityRef, credentials);
    return Object.fromEntries(
      Object.entries(catalogValues).map(([name, vals]) => [
        name,
        { ...vals, ...(dbOverlay[name] ?? {}) },
      ]),
    );
  }

  /**
   * Extracts values from a pre-fetched entity for all matching patches.
   * Useful in tests where you already have an entity object.
   */
  extractAll(entity: Entity): Record<string, Record<string, unknown>> {
    const result: Record<string, Record<string, unknown>> = {};
    for (const patch of this.patches) {
      if (patch.filter && !evaluateFilterPredicate(patch.filter, entity))
        continue;
      result[patch.name] = this.extractPatch(entity, patch);
    }
    return result;
  }

  private extractPatch(
    entity: Entity,
    patch: PatchConfig,
  ): Record<string, unknown> {
    const patchResult: Record<string, unknown> = {};
    for (const [entityPath, fieldOrTemplate] of Object.entries(patch.mapping)) {
      // Template values are rendered by the processor at write time using saved
      // form data — we cannot reverse them to individual field values here.
      if (isMappingTemplate(fieldOrTemplate)) continue;
      const value = this.getValue(
        entity,
        entityPath,
        fieldOrTemplate,
        patch.properties,
      );
      if (value !== undefined) {
        // Use lodash set to support dot-notation paths in mapping values
        // (e.g. "componentInfo.description" sets nested form data correctly)
        set(patchResult, fieldOrTemplate, value);
      }
    }
    return patchResult;
  }

  private getValue(
    entity: Entity,
    entityPath: string,
    fieldName: string,
    properties: Record<string, unknown>,
  ): unknown {
    if (entityPath.startsWith(RELATION_KEY_PREFIX))
      return this.getRelationValue(
        entity,
        entityPath.slice(RELATION_KEY_PREFIX.length),
        fieldName,
        properties,
      );
    return getByPath(entity, entityPath);
  }

  private getRelationValue(
    entity: Entity,
    relType: string,
    fieldName: string,
    properties: Record<string, unknown>,
  ): unknown {
    if (!this.relationPairs?.has(relType)) return undefined;
    // Use lodash get to support dot-notation field names in relation schema lookup
    const schema = get(properties, fieldName) as { type?: string } | undefined;
    return extractRelationValues(entity, relType, schema?.type === 'array');
  }
}
