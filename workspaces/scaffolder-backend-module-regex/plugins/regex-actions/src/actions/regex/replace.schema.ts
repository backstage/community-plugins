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
import type { z as zType } from 'zod/v3';

/**
 * The `regExps` input schema for the `regex:replace` action, extracted so
 * that it can be exercised directly in tests. Calling the action handler in
 * a mock environment does not run Zod validation, so the `pattern` refine
 * below would otherwise have no coverage.
 */
export const regExpsSchema = (z: typeof zType) =>
  z.array(
    z.object({
      pattern: z
        .string()
        .refine(
          // You should not parse a regex (regular language) with a regex (regular language),
          // you actually need a context free grammar to parse a regex (regular language).
          // Hence, we are using a string comparison here.
          {
            message:
              'The RegExp constructor cannot take a string pattern with a leading and/or trailing forward slash.',
          }
        )
        .describe(
          'The regex pattern to match the value like in String.prototype.replace()',
        ),
      flags: z
        .array(
          // Prefer array over set here because input values are normally defined in YAML which doesn't support Sets.
          z.enum(['g', 'm', 'i', 'y', 'u', 's', 'd'], {
            invalid_type_error:
              'Invalid flag, possible values are: g, m, i, y, u, s, d',
          }),
        )
        .optional()
        .describe('The flags for the regex'),
      replacement: z
        .string()
        .describe(
          'The replacement value for the regex like in String.prototype.replace()',
        ),
      values: z.array(
        z.object({
          key: z.string().describe('The key to access the regex value'),
          value: z.string().describe('The input value of the regex'),
        }),
      ),
    }),
  );
