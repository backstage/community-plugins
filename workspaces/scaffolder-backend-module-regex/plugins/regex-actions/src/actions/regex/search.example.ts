/*
 * Copyright 2025 The Backstage Authors
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

import { TemplateExample } from '@backstage/plugin-scaffolder-node';

import yaml from 'yaml';

const exampleObjects = [
  { text: 'The quick brown fox jumps over the lazy dog.' },
  { text: 'A lazy dog is not quick.' },
];

const id = 'regex:search';

export const examples: TemplateExample[] = [
  {
    description: 'Search for the first occurrence of a word in objects',
    example: yaml.stringify({
      steps: [
        {
          id: 'regexSearch',
          action: id,
          name: 'Regex Search',
          input: {
            objects: exampleObjects,
            property: 'text',
            pattern: 'lazy',
            caseInsensitive: true,
            outputKey: 'match',
            firstOnly: true,
          },
        },
      ],
    }),
  },
  {
    description:
      'Search for all occurrences of a word in objects and preserve original properties',
    example: yaml.stringify({
      steps: [
        {
          id: 'regexSearch',
          action: id,
          name: 'Regex Search',
          input: {
            objects: [
              {
                id: 'item-1',
                text: 'The quick brown fox jumps over the lazy dog.',
              },
              { id: 'item-2', text: 'The dog is lazy.' },
            ],
            property: 'text',
            pattern: 'the',
            global: true,
            caseInsensitive: true,
            outputKey: 'matches',
            firstOnly: false,
          },
        },
      ],
    }),
  },
  {
    description: 'Chain multiple searches to build complex objects',
    example: yaml.stringify({
      steps: [
        {
          id: 'regexSearchEmails',
          action: id,
          name: 'Search for Emails',
          input: {
            objects: [
              {
                id: '1',
                name: 'John',
                bio: 'Contact me at john@example.com for more info',
              },
              { id: '2', name: 'Jane', bio: 'Reach out: jane.doe@company.org' },
            ],
            property: 'bio',
            pattern: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
            global: true,
            outputKey: 'emails',
            firstOnly: false,
          },
        },
        {
          id: 'regexSearchDomains',
          action: id,
          name: 'Search for Domains',
          input: {
            objects: '${{ steps.regexSearchEmails.output.results }}',
            property: 'bio',
            pattern: '(?:https?://)?([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})',
            global: true,
            caseInsensitive: true,
            outputKey: 'domains',
            firstOnly: false,
          },
        },
      ],
    }),
  },
];
