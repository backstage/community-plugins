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

export interface Config {
  /**
   * Configuration for the entity-patch plugin.
   * @deepVisibility frontend
   */
  entityPatch?: {
    /**
     * Global registry of bidirectional custom relation pairs. Each entry
     * declares a human-readable name and the two relation type strings
     * (one for each side of the pair).
     *
     * To reference a relation in a patch `mapping`, use `relations.{type}`
     * where `{type}` is the exact forward or reverse type string. The
     * processor looks up the pair by type and emits both directions.
     *
     * @example
     * ```yaml
     * relations:
     *   - name: designer
     *     forward: hasDesigner   # emitted on the source entity (e.g. Group)
     *     reverse: designerOn   # emitted on each target entity (e.g. User)
     * ```
     *
     * @visibility backend
     */
    relations?: Array<{
      /** Human-readable label for this pair (not used in mapping references). */
      name: string;
      /**
       * Relation type emitted on the **source** entity (the one being patched).
       * Use this value in `mapping` as `relations.{forward}`.
       */
      forward: string;
      /**
       * Relation type emitted on each **target** entity referenced by the field.
       * Can also be used in `mapping` as `relations.{reverse}` when patching
       * from the target entity's perspective.
       */
      reverse: string;
    }>;

    /**
     * Static schema definitions. Each entry describes a set of patchable
     * fields for a filtered group of entities. Fields may carry inline
     * `ui:*` hints following the same convention as Backstage Software
     * Templates.
     */
    patches?: Array<{
      /** Unique slug used as the key in persisted form data. Must be stable. */
      name: string;
      /**
       * Filter predicate that determines which entities this patch applies to.
       * Supports simple equality, logical operators ($all, $any, $not), and
       * value matchers ($in, $exists). See @backstage/filter-predicates for
       * the full grammar.
       * @example { kind: 'group', 'spec.type': 'team' }
       * @example { $any: [{ kind: 'group' }, { kind: 'component' }] }
       */
      filter?: { [key: string]: unknown };
      /**
       * Multi-section form definition. Each section maps to a titled group
       * of fields rendered in the form.
       */
      sections?: Array<{
        /** Optional section title displayed above the group of fields. */
        title?: string;
        /** Fields that are required in this section. */
        required?: string[];
        /**
         * JSON Schema property definitions, keyed by field name.
         * Inline `ui:*` keys (e.g. `ui:widget`, `ui:field`) are extracted
         * automatically — no separate `uiSchema` block is needed.
         */
        properties?: { [key: string]: unknown };
      }>;
      /**
       * Maps form field names to either a dot-separated entity path or a
       * `relations.{type}` reference for custom relation fields.
       *
       * - Dot-path: written directly onto the entity via `lodash.set`
       *   e.g. `{ description: 'metadata.description' }`
       * - Relation type: triggers bidirectional relation emission in
       *   `postProcessEntity` — the type must match a `forward` or `reverse`
       *   value declared in `entityPatch.relations`.
       *   e.g. `{ designers: 'relations.hasDesigner' }`
       *
       * @visibility backend
       */
      mapping?: { [key: string]: string };
    }>;
  };
}
