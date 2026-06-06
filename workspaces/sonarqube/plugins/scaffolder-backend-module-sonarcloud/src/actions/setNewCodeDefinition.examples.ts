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
    description: 'Set new code definition to previous version',
    example: yaml.stringify({
      steps: [
        {
          action: 'sonarcloud:setNewCodeDefinition',
          id: 'set-new-code-previous',
          name: 'Set New Code Definition',
          input: {
            projectKey: 'my-org_my-service',
            type: 'previous_version',
            token: '${{ secrets.SONARCLOUD_TOKEN }}',
          },
        },
      ],
    }),
  },
  {
    description: 'Set new code definition to number of days',
    example: yaml.stringify({
      steps: [
        {
          action: 'sonarcloud:setNewCodeDefinition',
          id: 'set-new-code-days',
          name: 'Set New Code Definition (30 days)',
          input: {
            projectKey: 'my-org_my-service',
            type: 'number_of_days',
            value: '30',
            token: '${{ secrets.SONARCLOUD_TOKEN }}',
          },
        },
      ],
    }),
  },
];
