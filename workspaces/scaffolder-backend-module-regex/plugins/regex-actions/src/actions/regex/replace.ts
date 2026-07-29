/*
 * Copyright 2024 The Backstage Authors
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
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

import { examples } from './replace.example';
import { regExpsSchema } from './replace.schema';

const id = 'regex:replace';

/**
 * @public
 */
export const createReplaceAction = () => {
  return createTemplateAction({
    id,
    description:
      'Replaces strings that match a regular expression pattern with a specified replacement string',
    examples,
    schema: {
      input: {
        regExps: regExpsSchema,
      },
    },

    async handler(ctx) {
      const input = ctx.input;

      const values: Record<string, string> = {};

      for (const {
        pattern,
        flags: flagsInput,
        replacement,
        values: valuesInput,
      } of input.regExps) {
        // remove duplicates from the flags input array
        const flags = flagsInput
          ? Array.from(new Set(flagsInput)).join('')
          : '';
        const regex = new RegExp(pattern, flags);

        for (const { key, value } of valuesInput) {
          const match = value.replace(regex, replacement);

          if (values.hasOwnProperty(key)) {
            throw new Error(
              `The key '${key}' is used more than once in the input.`,
            );
          }

          values[key] = match;
        }
      }

      ctx.output('values', values);
    },
  });
};
