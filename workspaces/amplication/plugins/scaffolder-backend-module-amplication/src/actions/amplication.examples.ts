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
    description: 'Scaffold a new service using Amplication',
    example: yaml.stringify({
      steps: [
        {
          id: 'amplication-scaffold-service',
          action: 'amplication:scaffold-service',
          name: 'Scaffold Service (Amplication)',
          input: {
            name: 'fooService',
            description: 'Service created by Backstage',
            project_id: '1a2b3c4d5e6f7g8h9i0j',
            serviceTemplate_id: '9i8h7g6f5e4d3c2b1a0',
            workspace_id: 'f1e2d3c4b5a6978685d4',
          },
        },
      ],
    }),
  },
];
