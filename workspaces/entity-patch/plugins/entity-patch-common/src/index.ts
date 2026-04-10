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
import { z } from 'zod';

// ─── Frontend types ──────────────────────────────────────────────────────────

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
 * A titled group of fields that renders as one `<Form>` section.
 * @public
 */
export interface PatchSection {
  /** Optional heading displayed above the fields. */
  title?: string;
  /** Optional description rendered below the title. */
  description?: string;
  /** Field names that must be non-empty before the form is valid. */
  required?: string[];
  /** JSON Schema property definitions keyed by field name. */
  properties?: Record<string, PatchProperty>;
  /** ajv-errors errorMessage overrides keyed by field name. */
  errorMessage?: {
    properties?: Record<string, string>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * A named patch definition: a filter predicate and one or more form sections.
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
  /** One or more sections that make up the form for this patch. */
  sections: PatchSection[];
  /**
   * Maps form field names to dot-separated paths on the Backstage entity
   * (e.g. `{ description: "metadata.description", email: "spec.profile.email" }`).
   * Used exclusively by the backend when applying the patch — not read by
   * the frontend form renderer.
   */
  mapping?: Record<string, string>;
}

// ─── Backend types ────────────────────────────────────────────────────────────

/**
 * A resolved bidirectional relation pair, as parsed from `entityPatch.relations`.
 * @public
 */
export interface RelationPair {
  forward: string;
  reverse: string;
}

/**
 * Configuration for a single named patch: mapping, optional filter, and section schema.
 * @public
 */
export interface PatchConfig {
  name: string;
  mapping: Record<string, string>;
  filter?: FilterPredicate;
  /**
   * Flattened JSON Schema properties from all sections (fieldName → schema).
   * Used to infer `multiple` for relation fields (`type: "array"`).
   */
  sectionProperties: Record<string, unknown>;
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
      return {
        name: p.getString('name'),
        mapping: p.getOptional('mapping') as Record<string, string>,
        filter: p.has('filter')
          ? (p.get('filter') as FilterPredicate)
          : undefined,
        sectionProperties,
      };
    });
}

// ─── Validation ───────────────────────────────────────────────────────────────

const patchSectionSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    required: z.array(z.string()).optional(),
    properties: z.record(z.string(), z.unknown()).optional(),
    errorMessage: z
      .object({ properties: z.record(z.string(), z.string()).optional() })
      .loose()
      .optional(),
  })
  .loose();

const patchDefinitionSchema = z.object({
  name: z.string().min(1, 'name must be a non-empty string'),
  filter: z.unknown().optional(),
  sections: z
    .array(patchSectionSchema)
    .min(1, 'at least one section is required'),
  mapping: z.record(z.string(), z.string()).optional(),
});

const patchesSchema = z.array(patchDefinitionSchema);

/**
 * Validates the entityPatch config block at startup.
 * Throws a descriptive Error if the configuration is invalid so that
 * misconfigured patches surface as boot-time errors rather than silent
 * runtime failures.
 * @public
 */
export function validatePatchConfig(patches: unknown[]): void {
  const result = patchesSchema.safeParse(patches);

  if (!result.success) {
    const messages = result.error.issues
      .map(issue => {
        const path =
          issue.path.length > 0
            ? `entityPatch.patches[${issue.path.join('.')}]`
            : 'entityPatch.patches';
        return `  ${path}: ${issue.message}`;
      })
      .join('\n');
    throw new Error(`entity-patch config errors:\n${messages}`);
  }

  const seen = new Set<string>();
  for (const patch of result.data) {
    if (seen.has(patch.name)) {
      throw new Error(
        `entity-patch config error: duplicate patch name '${patch.name}'. Each patch must have a unique name.`,
      );
    }
    seen.add(patch.name);
  }
}
