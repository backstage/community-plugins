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

// Same as examples/gitlab-examples.yaml

export const gitlabExamples: Entity[] = [
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'gitlab-example',
      annotations: {
        'npm/registry': 'gitlab',
        'npm/package': '@gitlab-examples/semantic-release-npm',
      },
      links: [
        {
          url: 'https://gitlab.com/gitlab-examples',
          title: 'GitLab org',
        },
        {
          url: 'https://gitlab.com/gitlab-examples/semantic-release-npm',
          title: 'GitLab repo',
        },
        {
          url: 'https://gitlab.com/gitlab-examples/semantic-release-npm/-/packages',
          title: 'GitLab npm packages',
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
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'gitlab-private-example',
      annotations: {
        'npm/registry': 'gitlab-private',
        'npm/package': '@gitlab-examples/semantic-release-npm',
      },
      links: [
        {
          url: 'https://gitlab.com/gitlab-examples',
          title: 'GitLab org',
        },
        {
          url: 'https://gitlab.com/gitlab-examples/semantic-release-npm',
          title: 'GitLab repo',
        },
        {
          url: 'https://gitlab.com/gitlab-examples/semantic-release-npm/-/packages',
          title: 'GitLab npm packages',
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
