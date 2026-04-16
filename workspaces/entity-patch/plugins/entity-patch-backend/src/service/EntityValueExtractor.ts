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
import { get } from 'lodash';
import { Entity } from '@backstage/catalog-model';
import type { RelationPair } from '@backstage-community/plugin-entity-patch-common';
import { isMappingTemplate } from '@backstage-community/plugin-entity-patch-common';

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
 * Extracts form field values from a catalog entity using an entity-path → field mapping.
 *
 * Each key is a dot-separated entity path or `relations.{type}` reference;
 * each value is the form field name to populate, or a Nunjucks template string.
 *
 * Template-mapped paths (values containing `{{`) are skipped — the rendered
 * result lives on the entity but cannot be reverse-engineered into the original
 * form field values. The form will instead load those fields from the DB overlay.
 *
 * Multiple entity paths may share the same form field name (fan-out writes).
 * When reading back, the last entity path with a defined value wins.
 *
 * @param entity - The Backstage entity to read values from.
 * @param mapping - Map of entity paths → form field names or Nunjucks templates.
 *   e.g. `{ "metadata.description": "description", "relations.hasDesigner": "designerRef" }`
 * @param options.relationPairs - Lookup map from relation type → RelationPair.
 *   Required for resolving `relations.` values; ignored for plain dot-paths.
 * @param options.sectionProperties - Raw JSON Schema properties map keyed by
 *   field name. Used to infer `multiple` (`type: "array"`) for relation fields.
 * @returns A record of field names to their current values on the entity.
 *   Fields whose path resolves to `undefined` are omitted.
 */
export function extractEntityValues(
  entity: Entity,
  mapping: Record<string, string>,
  options: {
    relationPairs?: Map<string, RelationPair>;
    sectionProperties?: Record<string, unknown>;
  } = {},
): Record<string, unknown> {
  const { relationPairs, sectionProperties } = options;
  const result: Record<string, unknown> = {};

  for (const [entityPath, fieldOrTemplate] of Object.entries(mapping)) {
    // Template values are rendered by the processor at write time using saved
    // form data — we cannot reverse them to individual field values here.
    if (isMappingTemplate(fieldOrTemplate)) continue;

    const fieldName = fieldOrTemplate;

    if (entityPath.startsWith('relations.')) {
      if (!relationPairs) continue;
      const relType = entityPath.slice('relations.'.length);
      if (!relationPairs.has(relType)) continue;

      const propSchema = sectionProperties?.[fieldName] as
        | { type?: string }
        | undefined;
      const multiple = propSchema?.type === 'array';
      const value = extractRelationValues(entity, relType, multiple);
      if (value !== undefined) {
        result[fieldName] = value;
      }
    } else {
      const value = getByPath(entity, entityPath);
      if (value !== undefined) {
        result[fieldName] = value;
      }
    }
  }
  return result;
}
