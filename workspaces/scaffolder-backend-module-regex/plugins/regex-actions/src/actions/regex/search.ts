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

import { examples } from './search.example';

const id = 'regex:search';

/**
 * @public
 */
export const createSearchAction = () => {
  return createTemplateAction({
    id,
    description:
      'Searches for strings that match a regular expression pattern in JSON objects',
    examples,
    schema: {
      input: {
        objects: z =>
          z
            .array(z.record(z.any()))
            .describe('An array of JSON objects to search in'),
        property: z =>
          z.string().describe('The property name to search in each object'),
        pattern: z =>
          z
            .string()
            .refine(value => !value.startsWith('/') && !value.endsWith('/'), {
              message:
                'The RegExp constructor cannot take a string pattern with a leading and trailing forward slash.',
            })
            .describe(
              'The regex pattern to match the value like in String.prototype.match()',
            ),
        global: z =>
          z
            .boolean()
            .optional()
            .describe(
              'Global flag - find all matches instead of stopping after the first match',
            ),
        multiline: z =>
          z
            .boolean()
            .optional()
            .describe(
              'Multiline flag - ^ and $ match the beginning and end of each line',
            ),
        caseInsensitive: z =>
          z
            .boolean()
            .optional()
            .describe('Case insensitive flag - ignore case when matching'),
        sticky: z =>
          z
            .boolean()
            .optional()
            .describe('Sticky flag - match must start at lastIndex'),
        unicode: z =>
          z
            .boolean()
            .optional()
            .describe('Unicode flag - treat pattern as unicode'),
        dotAll: z =>
          z.boolean().optional().describe('DotAll flag - . matches newlines'),
        hasIndices: z =>
          z
            .boolean()
            .optional()
            .describe(
              'HasIndices flag - match indices are included in the result',
            ),
        outputKey: z =>
          z
            .string()
            .describe('The key to use for the matches in the output objects'),
        firstOnly: z =>
          z
            .boolean()
            .describe(
              'If true, return only the first match as a string; if false, return all matches as an array of strings',
            ),
      },
    },

    async handler(ctx) {
      const input = ctx.input;

      const {
        objects,
        property,
        pattern,
        global,
        multiline,
        caseInsensitive,
        sticky,
        unicode,
        dotAll,
        hasIndices,
        outputKey,
        firstOnly,
      } = input;

      // Build flags string from boolean inputs
      let flags = '';
      if (global) flags += 'g';
      if (multiline) flags += 'm';
      if (caseInsensitive) flags += 'i';
      if (sticky) flags += 'y';
      if (unicode) flags += 'u';
      if (dotAll) flags += 's';
      if (hasIndices) flags += 'd';

      const regex = new RegExp(pattern, flags);

      const results = objects.map(obj => {
        const value = obj[property];
        if (typeof value !== 'string') {
          return { ...obj, [outputKey]: firstOnly ? '' : [] };
        }

        const matches = [];
        let match = regex.exec(value);

        if (global) {
          while (match !== null) {
            matches.push(match[0]);
            if (!regex.global) break;
            match = regex.exec(value);
          }
        } else {
          if (match) matches.push(match[0]);
        }

        if (firstOnly) {
          return { ...obj, [outputKey]: matches.length > 0 ? matches[0] : '' };
        }
        return { ...obj, [outputKey]: matches };
      });

      ctx.output('results', results);
    },
  });
};
