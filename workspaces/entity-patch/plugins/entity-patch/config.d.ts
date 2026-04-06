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
       * Maps form field names to dot-separated entity paths.
       * Used only by the backend when persisting the patch.
       * @example { description: 'metadata.description', email: 'spec.profile.email' }
       * @visibility backend
       */
      mapping?: { [key: string]: string };
    }>;
  };
}
