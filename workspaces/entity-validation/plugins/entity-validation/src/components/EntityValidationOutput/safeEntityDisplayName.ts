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
import { Entity } from '@backstage/catalog-model';

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Safely produce a display name for an entity, falling back gracefully
 * when kind or metadata.name are missing or not strings. The fallback
 * labels which field is missing so the user can tell what is wrong with
 * the entity.
 *
 * Non-string values (e.g. YAML 1.1 booleans like `kind: on`) are treated
 * as missing rather than stringified, since they rarely match the intent
 * of the YAML author.
 */
export function safeEntityDisplayName(entity: Entity): string {
  const kind = entity?.kind;
  const name = entity?.metadata?.name;

  const kindLabel = isNonEmptyString(kind)
    ? kind.toLocaleLowerCase('en-US')
    : '<missing kind>';
  const nameLabel = isNonEmptyString(name) ? name : '<missing name>';
  return `${kindLabel}:${nameLabel}`;
}

/**
 * Safely get the lowercased kind string for an entity, returning
 * 'missing' when the kind field is not set or not a string.
 */
export function safeEntityKind(entity: Entity): string {
  const kind = entity?.kind;
  return isNonEmptyString(kind) ? kind.toLocaleLowerCase('en-US') : 'missing';
}
