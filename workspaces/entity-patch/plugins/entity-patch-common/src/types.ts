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

import type { FilterPredicate } from '@backstage/filter-predicates';

// ─── Raw config types (as declared in app-config.yaml) ───────────────────────

/**
 * A single JSON Schema property definition.
 * Any `ui:*` key (e.g. `ui:widget`, `ui:field`, `ui:options`, `ui:autofocus`)
 * is automatically extracted into the RJSF uiSchema by `extractSchemaFromStep`,
 * so no separate uiSchema block is needed.
 * @public
 */
export interface PatchProperty {
  title?: string;
  type?: string;
  format?: string;
  description?: string;
  pattern?: string;
  items?: PatchProperty;
  /** Any RJSF ui:* hint — extracted automatically into the uiSchema at render time. */
  [key: string]: unknown;
}

/**
 * A named patch definition: a filter predicate and a single form schema.
 * @public
 */
export interface PatchDefinition {
  /**
   * Unique slug used as the key in persisted form data.
   * Must be stable — renaming it will lose saved form state.
   */
  name: string;
  /**
   * Entity filter predicate. Only entities matching this predicate will see
   * this patch. Supports simple equality (`{ kind: "group" }`), logical
   * operators (`$all`, `$any`, `$not`), and value matchers (`$in`, `$exists`).
   * See {@link @backstage/filter-predicates#FilterPredicate} for the full grammar.
   */
  filter?: FilterPredicate;
  /** Optional title displayed above the form. */
  title?: string;
  /** Optional description rendered below the title. */
  description?: string;
  /** Field names that must be non-empty before the form is valid. */
  required?: string[];
  /**
   * JSON Schema property definitions. Any `ui:*` keys (e.g. `ui:widget`,
   * `ui:field`, `ui:options`) are extracted automatically into the RJSF
   * uiSchema by `extractSchemaFromStep`. Full JSON Schema is supported:
   * scalars, nested objects (`type: "object"`), arrays, composition keywords
   * (`allOf`, `anyOf`, `if`/`then`), and custom `ui:field` extensions.
   * Nesting can be used for visual grouping — use dot-notation in the
   * `mapping` values to address nested paths.
   */
  properties?: Record<string, unknown>;
  /** ajv-errors errorMessage overrides keyed by field name. */
  errorMessage?: {
    properties?: Record<string, string>;
    [key: string]: unknown;
  };
  /**
   * Maps entity paths (or `relations.{type}`) to form field names or Nunjucks
   * template strings.
   *
   * Each key is a dot-separated path on the Backstage entity, e.g.:
   * - `metadata.description` → `description`  (writes the form field value)
   * - `metadata.annotations.slack` → `"slack.com/c/{{ channelId }}"` (Nunjucks template)
   * - `relations.hasDesigner` → `designerRef`  (emits a relation)
   *
   * Fan-out (one form field → multiple entity paths) is supported by repeating
   * the same form field name as the value for different keys.
   *
   * Both flat dot-notation keys and nested YAML objects are accepted and
   * normalised to flat dot-notation internally.
   *
   * Used exclusively by the backend — not read by the frontend form renderer.
   */
  mapping?: Record<string, unknown>;
}

// ─── Resolved types (used by the backend processor after config is parsed) ────

/**
 * A resolved bidirectional relation pair, as parsed from `entityPatch.relations`.
 * @public
 */
export interface RelationPair {
  forward: string;
  reverse: string;
}

/**
 * Configuration for a single named patch: mapping, optional filter, and form schema properties.
 * @public
 */
export interface PatchConfig {
  name: string;
  /**
   * Normalised mapping of entity path → form field name or Nunjucks template string.
   * Always flat dot-notation keys (nested YAML is flattened by `buildPatchConfigs`).
   * Values containing `{{` are Nunjucks templates; plain values are form field names.
   * Mapping values support dot-notation to address nested form data paths
   * (e.g. `componentInfo.description` reads from `formData.componentInfo.description`).
   */
  mapping: Record<string, string>;
  filter?: FilterPredicate;
  /**
   * JSON Schema properties from the patch (fieldName → schema).
   * Used to infer `multiple` for relation fields (`type: "array"`).
   * Supports arbitrary depth — use dot-notation in mapping values to address nested paths.
   */
  properties: Record<string, unknown>;
}
