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
    description: 'Authorize Service Connection for Pipeline',
    example: yaml.stringify({
      steps: [
        {
          id: 'permitServiceConnection',
          action: 'azure:pipeline:permit',
          name: 'Authorize Service Connection',
          input: {
            organization: 'org',
            project: 'project',
            pipelineId: '123',
            resourceId: 'service-connection-uuid',
            resourceType: 'endpoint',
            authorized: true,
          },
        },
      ],
    }),
  },
  {
    description: 'Authorize Repository Access for Pipeline',
    example: yaml.stringify({
      steps: [
        {
          id: 'permitRepository',
          action: 'azure:pipeline:permit',
          name: 'Authorize Repository Access',
          input: {
            organization: 'org',
            project: 'project',
            pipelineId: '456',
            resourceId: 'repo-guid-1234',
            resourceType: 'repository',
            authorized: true,
          },
        },
      ],
    }),
  },
  {
    description: 'Authorize Variable Group for Pipeline',
    example: yaml.stringify({
      steps: [
        {
          id: 'permitVariableGroup',
          action: 'azure:pipeline:permit',
          name: 'Authorize Variable Group',
          input: {
            organization: 'org',
            project: 'project',
            pipelineId: '789',
            resourceId: '42',
            resourceType: 'variablegroup',
            authorized: true,
          },
        },
      ],
    }),
  },
  {
    description: 'Complete Pipeline Creation and Authorization Workflow',
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
        {
          id: 'permitPipelineResources',
          action: 'azure:pipeline:permit',
          name: 'Authorize Pipeline Resources',
          input: {
            organization: 'org',
            project: 'project',
            pipelineId: '${{ steps.createPipeline.output.pipelineId }}',
            resourceId: '${{ parameters.serviceConnectionId }}',
            resourceType: 'endpoint',
            authorized: true,
          },
        },
      ],
    }),
  },
  {
    description: 'Revoke Pipeline Resource Authorization',
    example: yaml.stringify({
      steps: [
        {
          id: 'revokePipelineAccess',
          action: 'azure:pipeline:permit',
          name: 'Revoke Pipeline Access',
          input: {
            organization: 'myorg',
            project: 'myproject',
            pipelineId: '999',
            resourceId: 'sensitive-service-connection',
            resourceType: 'endpoint',
            authorized: false,
          },
        },
      ],
    }),
  },
  {
    description: 'Custom Azure DevOps Instance with Token',
    example: yaml.stringify({
      steps: [
        {
          id: 'permitCustomInstance',
          action: 'azure:pipeline:permit',
          name: 'Authorize on Custom Azure DevOps',
          input: {
            host: 'azure.company.com',
            organization: 'enterprise-org',
            project: 'enterprise-project',
            pipelineId: '555',
            resourceId: 'company-service-connection',
            resourceType: 'endpoint',
            authorized: true,
            token: '${{ secrets.AZURE_DEVOPS_TOKEN }}',
            apiVersion: '7.1-preview.1',
          },
        },
      ],
    }),
  },
  {
    description: 'Multiple Resource Authorization for Single Pipeline',
    example: yaml.stringify({
      steps: [
        {
          id: 'permitServiceConnection',
          action: 'azure:pipeline:permit',
          name: 'Authorize Service Connection',
          input: {
            organization: 'myorg',
            project: 'myproject',
            pipelineId: '777',
            resourceId: 'docker-registry-connection',
            resourceType: 'endpoint',
            authorized: true,
          },
        },
        {
          id: 'permitSharedRepo',
          action: 'azure:pipeline:permit',
          name: 'Authorize Shared Repository',
          input: {
            organization: 'myorg',
            project: 'myproject',
            pipelineId: '777',
            resourceId: 'shared-templates-repo-id',
            resourceType: 'repository',
            authorized: true,
          },
        },
        {
          id: 'permitVariables',
          action: 'azure:pipeline:permit',
          name: 'Authorize Variable Group',
          input: {
            organization: 'myorg',
            project: 'myproject',
            pipelineId: '777',
            resourceId: '15',
            resourceType: 'variablegroup',
            authorized: true,
          },
        },
      ],
    }),
  },
];
