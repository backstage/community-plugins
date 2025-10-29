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
    description: 'Clone Repository into current directory',
    example: yaml.stringify({
      steps: [
        {
          id: 'cloneAzureDevOpsRepository',
          action: 'azure:repository:clone',
          name: 'Clone Azure DevOps Repository',
          input: {
            remoteUrl:
              'https://dev.azure.com/{organization}/{project}/_git/{repository}',
            token: '${{ secrets.USER_OAUTH_TOKEN }}',
          },
        },
      ],
    }),
  },
  {
    description: 'Clone Repository from a specific branch into a subdirectory',
    example: yaml.stringify({
      steps: [
        {
          id: 'cloneAzureDevOpsRepository',
          action: 'azure:repository:clone',
          name: 'Clone Azure DevOps Repository',
          input: {
            remoteUrl:
              'https://dev.azure.com/{organization}/{project}/_git/{repository}',
            branch: 'main',
            targetPath: './my-repo',
            token: '${{ secrets.USER_OAUTH_TOKEN }}',
          },
        },
      ],
    }),
  },
  {
    description: 'Clone Repository with shallow clone depth',
    example: yaml.stringify({
      steps: [
        {
          id: 'cloneAzureDevOpsRepository',
          action: 'azure:repository:clone',
          name: 'Clone Azure DevOps Repository',
          input: {
            remoteUrl:
              'https://dev.azure.com/{organization}/{project}/_git/{repository}',
            cloneDepth: 1,
            token: '${{ secrets.USER_OAUTH_TOKEN }}',
          },
        },
      ],
    }),
  },
];
