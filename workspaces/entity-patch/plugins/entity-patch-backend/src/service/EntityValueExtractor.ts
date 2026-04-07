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
 * Extracts form field values from a catalog entity using a field→path mapping.
 *
 * @param entity - The Backstage entity to read values from.
 * @param mapping - Map of form field names to dot-separated entity paths.
 *   e.g. `{ description: 'metadata.description', email: 'spec.profile.email' }`
 * @returns A record of field names to their current values on the entity.
 *   Fields whose path resolves to `undefined` are omitted.
 */
export function extractEntityValues(
  entity: Entity,
  mapping: Record<string, string>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [fieldName, dotPath] of Object.entries(mapping)) {
    const value = getByPath(entity, dotPath);
    if (value !== undefined) {
      result[fieldName] = value;
    }
  }
  return result;
}
