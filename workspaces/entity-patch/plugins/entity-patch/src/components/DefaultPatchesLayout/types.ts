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

import { FilterPredicate } from '@backstage/filter-predicates';

/**
 * A single JSON Schema property definition.
 * Any `ui:*` key (e.g. `ui:widget`, `ui:field`, `ui:options`, `ui:autofocus`)
 * is automatically extracted into the RJSF uiSchema by `extractSchemaFromStep`,
 * so no separate uiSchema block is needed.
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

/** A titled group of fields that renders as one <Form> section. */
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

/** A named patch definition: a filter predicate and one or more form sections. */
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
