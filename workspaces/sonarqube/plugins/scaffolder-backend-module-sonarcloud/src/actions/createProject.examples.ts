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

import { TemplateExample } from '@backstage/plugin-scaffolder-node';
import yaml from 'yaml';

export const examples: TemplateExample[] = [
  {
    description: 'Create a SonarCloud project with required fields only',
    example: yaml.stringify({
      steps: [
        {
          action: 'sonarcloud:createProject',
          id: 'create-sonarcloud-project',
          name: 'Create SonarCloud Project',
          input: {
            organization: 'my-org',
            name: 'My Service',
            key: 'my-org_my-service',
            token: '${{ secrets.SONARCLOUD_TOKEN }}',
          },
        },
      ],
    }),
  },
  {
    description: 'Create a private SonarCloud project',
    example: yaml.stringify({
      steps: [
        {
          action: 'sonarcloud:createProject',
          id: 'create-private-project',
          name: 'Create Private SonarCloud Project',
          input: {
            organization: 'my-org',
            name: 'Internal Service',
            key: 'my-org_internal-service',
            visibility: 'private',
            token: '${{ secrets.SONARCLOUD_TOKEN }}',
          },
        },
      ],
    }),
  },
];
