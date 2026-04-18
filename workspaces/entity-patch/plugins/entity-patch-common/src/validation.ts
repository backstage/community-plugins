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

import { z } from 'zod';
import { CONFIG_KEYS } from './constants';

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
  mapping: z.record(z.string(), z.unknown()).optional(),
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
            ? `${CONFIG_KEYS.PATCHES}[${issue.path.join('.')}]`
            : CONFIG_KEYS.PATCHES;
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
