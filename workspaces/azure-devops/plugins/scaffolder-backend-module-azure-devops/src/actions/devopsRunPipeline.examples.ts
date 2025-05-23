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
    description: 'Run Azure Pipeline',
    example: yaml.stringify({
      steps: [
        {
          id: 'runAzurePipeline',
          action: 'azure:pipeline:run',
          name: 'Run Azure Devops Pipeline',
          input: {
            organization: 'organization',
            pipelineId: 'pipelineId',
            project: 'project',
          },
        },
      ],
    }),
  },
  {
    description: 'Run Azure Pipeline on alternative host to dev.azure.com',
    example: yaml.stringify({
      steps: [
        {
          id: 'runAzurePipeline',
          action: 'azure:pipeline:run',
          name: 'Run Azure Devops Pipeline',
          input: {
            host: 'host',
            organization: 'organization',
            pipelineId: 'pipelineId',
            project: 'project',
          },
        },
      ],
    }),
  },
  {
    description: 'Run Azure Pipeline on a target branch',
    example: yaml.stringify({
      steps: [
        {
          id: 'runAzurePipeline',
          action: 'azure:pipeline:run',
          name: 'Run Azure Devops Pipeline',
          input: {
            organization: 'organization',
            pipelineId: 'pipelineId',
            project: 'project',
            branch: 'branch',
          },
        },
      ],
    }),
  },
  {
    description: 'Run Azure Pipeline with template parameters',
    example: yaml.stringify({
      steps: [
        {
          id: 'runAzurePipeline',
          action: 'azure:pipeline:run',
          name: 'Run Azure Devops Pipeline',
          input: {
            organization: 'organization',
            pipelineId: 'pipelineId',
            project: 'project',
            branch: 'branch',
            templateParameters: {
              templateParameterKey: 'templateParameterValue',
            },
          },
        },
      ],
    }),
  },
  {
    description: 'Run Azure Pipeline with custom token',
    example: yaml.stringify({
      steps: [
        {
          id: 'runAzurePipeline',
          action: 'azure:pipeline:run',
          name: 'Run Azure Devops Pipeline (custom token) ',
          input: {
            organization: 'organization',
            pipelineId: 'pipelineId',
            project: 'project',
            token: '${{ secrets.MY_CUSTOM_TOKEN }}',
          },
        },
      ],
    }),
  },
  {
    description: 'Run Azure Pipeline and wait for completion',
    example: yaml.stringify({
      steps: [
        {
          id: 'runAzurePipeline',
          action: 'azure:pipeline:run',
          name: 'Run Azure Devops Pipeline and wait for completion',
          input: {
            organization: 'organization',
            pipelineId: 'pipelineId',
            project: 'project',
            pollingInterval: 10,
            pipelineTimeout: 300,
          },
        },
      ],
    }),
  },
];
