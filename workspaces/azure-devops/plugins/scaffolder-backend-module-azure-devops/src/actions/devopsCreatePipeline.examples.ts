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
    description: 'Create Azure Pipeline',
    example: yaml.stringify({
      steps: [
        {
          id: 'createAzurePipeline',
          action: 'azure:pipeline:create',
          name: 'Create Azure Devops Pipeline',
          input: {
            organization: 'org',
            repository: 'repo',
            pipelineName: 'pipeline',
            pipelineYamlFile: 'pipeline.yaml',
            project: 'project',
          },
        },
      ],
    }),
  },
  {
    description: 'Create Azure Pipeline on alternative host to dev.azure.com',
    example: yaml.stringify({
      steps: [
        {
          id: 'createAzurePipeline',
          action: 'azure:pipeline:create',
          name: 'create Azure Devops Pipeline',
          input: {
            host: 'azure.com',
            organization: 'org',
            repository: 'repo',
            pipelineName: 'pipeline',
            pipelineYamlFile: 'pipeline.yaml',
            project: 'project',
          },
        },
      ],
    }),
  },
  {
    description: 'Create Azure Pipeline from a target branch',
    example: yaml.stringify({
      steps: [
        {
          id: 'createAzurePipeline',
          action: 'azure:pipeline:create',
          name: 'Create Azure Devops Pipeline',
          input: {
            organization: 'org',
            repository: 'repo',
            pipelineName: 'pipeline',
            pipelineYamlFile: 'pipeline.yaml',
            project: 'project',
            branch: 'branch',
          },
        },
      ],
    }),
  },
  {
    description: 'Create Azure Pipeline inside a folder',
    example: yaml.stringify({
      steps: [
        {
          id: 'createAzurePipeline',
          action: 'azure:pipeline:create',
          name: 'Create Azure Devops Pipeline',
          input: {
            organization: 'org',
            repository: 'repo',
            pipelineName: 'pipeline',
            pipelineYamlFile: 'pipeline.yaml',
            project: 'project',
            pipelineFolder: 'folder',
          },
        },
      ],
    }),
  },
  {
    description: 'Create Azure Pipeline with custom token',
    example: yaml.stringify({
      steps: [
        {
          id: 'createAzurePipeline',
          action: 'azure:pipeline:create',
          name: 'Create Azure Devops Pipeline (custom token) ',
          input: {
            organization: 'org',
            repository: 'repo',
            pipelineName: 'pipeline',
            pipelineYamlFile: 'pipeline.yaml',
            project: 'project',
            token: '${{ secrets.MY_CUSTOM_TOKEN }}',
          },
        },
      ],
    }),
  },
  {
    description: 'Create Azure Pipeline with custom agent pool',
    example: yaml.stringify({
      steps: [
        {
          id: 'createAzurePipeline',
          action: 'azure:pipeline:create',
          name: 'Create Azure Devops Pipeline (custom agent pool)',
          input: {
            oorganization: 'org',
            repository: 'repo',
            pipelineName: 'pipeline',
            pipelineYamlFile: 'pipeline.yaml',
            project: 'project',
            pipelineAgentPoolName: 'my-agent-pool',
          },
        },
      ],
    }),
  },
];
