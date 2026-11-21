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

export const examples: TemplateExample[] = [
  {
    description:
      'Create a new SonarQube project using all the input parameters',
    example: yaml.stringify({
      steps: [
        {
          action: 'sonarqube:create-project',
          id: 'create-sonar-project',
          name: 'Create SonarQube Project',
          input: {
            baseUrl: 'https://sonarqube.com',
            token: '4518a13e-093f-4b66-afac-46a1aece3149',
            name: 'My SonarQube Project',
            key: 'my-sonarqube-project',
            branch: 'main',
            visibility: 'public',
          },
        },
      ],
    }),
  },
  {
    description:
      'Create a new SonarQube project using only required parameters',
    example: yaml.stringify({
      steps: [
        {
          action: 'sonarqube:create-project',
          id: 'create-sonar-project',
          name: 'Create SonarQube Project',
          input: {
            baseUrl: 'https://sonarqube.com',
            token: '4518a13e-093f-4b66-afac-46a1aece3149',
            name: 'My SonarQube Project',
            key: 'my-sonarqube-project',
          },
        },
      ],
    }),
  },
];
