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

import { Entity } from '@backstage/catalog-model';

// Same as examples/github-examples.yaml

export const githubExamples: Entity[] = [
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'github-example',
      annotations: {
        'npm/registry': 'github',
        'npm/package': '@github-packages-examples/npm-publish',
      },
      links: [
        {
          url: 'https://github.com/github-packages-examples',
          title: 'GitHub org',
        },
        {
          url: 'https://github.com/github-packages-examples/npm-publish',
          title: 'GitHub repo',
        },
        {
          url: 'https://github.com/github-packages-examples/npm-publish/pkgs/npm/npm-publish',
          title: 'GitHub npm packages',
        },
      ],
    },
    spec: {
      type: 'library',
      lifecycle: 'production',
      owner: 'guests',
      system: 'backstage',
    },
  },
];
