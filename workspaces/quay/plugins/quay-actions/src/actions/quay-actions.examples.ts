/*
 * Copyright 2023 The Backstage Authors
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

export const examples: TemplateExample[] = [
  {
    description: 'Creates a public repository on Quay with basic details.',
    example: yaml.stringify({
      steps: [
        {
          id: 'create-quay-repo',
          action: 'quay:create-repository',
          name: 'Create Quay Repository',
          input: {
            baseUrl: 'https://quay.io',
            token: 'YOUR_AUTH_TOKEN',
            name: 'example-repo',
            visibility: 'public',
            description: 'An example public repository on Quay',
          },
        },
      ],
    }),
  },
  {
    description:
      'Creates a private repository in a specific namespace on Quay.',
    example: yaml.stringify({
      steps: [
        {
          id: 'create-quay-repo',
          action: 'quay:create-repository',
          name: 'Create Private Quay Repository',
          input: {
            baseUrl: 'https://quay.io',
            token: 'YOUR_AUTH_TOKEN',
            name: 'private-repo',
            visibility: 'private',
            description: 'Private repository for internal projects',
            namespace: 'example-namespace',
          },
        },
      ],
    }),
  },
  {
    description: 'Creates a Quay repository with a specified repository kind.',
    example: yaml.stringify({
      steps: [
        {
          id: 'create-quay-repo',
          action: 'quay:create-repository',
          name: 'Create Application Repository on Quay',
          input: {
            baseUrl: 'https://quay.io',
            token: 'YOUR_AUTH_TOKEN',
            name: 'app-repo',
            visibility: 'public',
            description: 'Application repository on Quay',
            repoKind: 'application',
          },
        },
      ],
    }),
  },
];
