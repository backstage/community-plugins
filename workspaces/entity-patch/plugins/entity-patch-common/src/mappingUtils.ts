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

import type { Config } from '@backstage/config';
import type { FilterPredicate } from '@backstage/filter-predicates';
import { PatchConfig, RelationPair } from './types';

/**
 * Returns `true` when a mapping value is a Nunjucks template (contains `{{`).
 * Plain mapping values are form field names; template values are rendered
 * with saved form data as context before being written to the entity.
 * @public
 */
export function isMappingTemplate(value: string): boolean {
  return value.includes('{{');
}

/**
 * Recursively flattens a nested mapping object to flat dot-notation keys.
 * Keys that themselves contain dots (e.g. annotation keys like `github.com/slug`)
 * are wrapped in bracket notation so that lodash `get`/`set` treat them as a
 * single path segment rather than further nesting.
 *
 * Both styles below produce identical output:
 * ```yaml
 * # Flat dot-notation (bracket notation required for dotted annotation keys)
 * mapping:
 *   'metadata.annotations["github.com/project-slug"]': projectSlug
 *
 * # Nested YAML — flattenMapping produces the bracket-notation key automatically
 * mapping:
 *   metadata:
 *     annotations:
 *       "github.com/project-slug": projectSlug
 * ```
 * @public
 */
export function flattenMapping(
  obj: Record<string, unknown>,
  prefix = '',
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    // When appending to a prefix, wrap dotted segments in bracket notation so
    // lodash get/set treats the full key string as a single path component.
    let fullKey: string;
    if (!prefix) {
      fullKey = key;
    } else if (key.includes('.')) {
      fullKey = `${prefix}["${key}"]`;
    } else {
      fullKey = `${prefix}.${key}`;
    }
    if (typeof value === 'string') {
      result[fullKey] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(
        result,
        flattenMapping(value as Record<string, unknown>, fullKey),
      );
    }
  }
  return result;
}

/**
 * Builds a lookup map from relation type → RelationPair, indexed by both
 * forward and reverse types. Returns an empty map when no relations are configured.
 * @public
 */
export function buildRelationPairs(config: Config): Map<string, RelationPair> {
  const pairs = new Map<string, RelationPair>();
  const relations =
    config.getOptionalConfigArray('entityPatch.relations') ?? [];
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
 * Builds an array of patch configs from `entityPatch.patches`.
 * Only patches that have a `mapping` block are included.
 * @public
 */
export function buildPatchConfigs(config: Config): PatchConfig[] {
  const patches = config.getOptionalConfigArray('entityPatch.patches') ?? [];
  return patches
    .filter((p: Config) => p.has('mapping'))
    .map((p: Config) => {
      const sections =
        p
          .getOptionalConfigArray('sections')
          ?.map(
            s => s.getOptional<Record<string, unknown>>('properties') ?? {},
          ) ?? [];
      const sectionProperties = Object.assign({}, ...sections);
      const rawMapping =
        p.getOptional<Record<string, unknown>>('mapping') ?? {};
      return {
        name: p.getString('name'),
        mapping: flattenMapping(rawMapping),
        filter: p.has('filter')
          ? (p.get('filter') as FilterPredicate)
          : undefined,
        sectionProperties,
      };
    });
}
