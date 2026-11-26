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

const id = 'servicenow:now:table:modifyRecord';

export const examples: TemplateExample[] = [
  {
    description: 'Modify a record in the incident table',
    example: yaml.stringify({
      steps: [
        {
          id: 'modifyRecord',
          action: id,
          name: 'Modify Record',
          input: {
            tableName: 'incident',
            sysId: '8e67d33b97d1b5108686b680f053af2b',
            requestBody: {
              short_description: 'Updated short description',
            },
          },
        },
      ],
    }),
  },
];
