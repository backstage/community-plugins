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
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { ScmIntegrationRegistry } from '@backstage/integration';
import { examples } from './devopsRunPipeline.examples';
import { WebApi } from 'azure-devops-node-api';
import {
  AgentPoolQueue,
  BuildDefinition,
  ContinuousIntegrationTrigger,
  DefinitionTriggerType,
  YamlProcess,
} from 'azure-devops-node-api/interfaces/BuildInterfaces';
import { getAuthHandler } from './helpers';
/**
 * Creates an `azure:pipeline:create` Scaffolder action.
 *
 * @public
 */
export function createAzureDevopsCreatePipelineAction(options: {
  integrations: ScmIntegrationRegistry;
}) {
  const { integrations } = options;

  return createTemplateAction({
    id: 'azure:pipeline:create',
    description:
      'Creates a pipeline definition in Azure DevOps from a YAML file.',
    examples,
    schema: {
      input: {
        host: d =>
          d
            .string()
            .describe('The host of Azure DevOps. Defaults to dev.azure.com')
            .optional(),
        organization: d =>
          d.string().describe('The name of the Azure DevOps organization.'),
        pipelineYamlFile: d =>
          d.string().describe('The path to the pipeline YAML file.'),
        repository: d => d.string().describe('The repository of the pipeline.'),
        pipelineName: d => d.string().describe('The name of the pipeline.'),
        project: d => d.string().describe('The name of the Azure project.'),
        branch: d =>
          d
            .string()
            .describe("The branch of the pipeline's repository.")
            .optional(),
        token: d =>
          d.string().describe('Token to use for Ado REST API.').optional(),

        pipelineFolder: d =>
          d.string().describe('The folder of the pipeline.').optional(),
        pipelineAgentPoolName: d =>
          d.string().describe('The name of the agent pool.').optional(),
      },
      output: {
        pipelineUrl: d => d.string().describe('Url of the pipeline'),
        pipelineId: d => d.string().describe('The pipeline ID.'),
      },
    },
    async handler(ctx) {
      const {
        host = 'dev.azure.com',
        organization,
        pipelineName,
        pipelineYamlFile,
        pipelineFolder = '/',
        repository,
        project,
        branch = 'main',
        pipelineAgentPoolName = 'Azure Pipelines',
      } = ctx.input;

      const url = `https://${host}/${organization}`;
      const authHandler = await getAuthHandler(
        integrations,
        url,
        ctx.input.token,
      );

      const webApi = new WebApi(url, authHandler);
      const client = await webApi.getBuildApi();
      const process: YamlProcess = {
        yamlFilename: pipelineYamlFile,
      };

      // According to the source code of the Azure DevOps Terraform provider,
      // https://github.com/microsoft/terraform-provider-azuredevops/blob/3299931b38e00cc3c573023b577783880137b447/azuredevops/internal/service/build/resource_build_definition.go#L1179,
      // the trigger settings should be the following for a Yaml pipeline:
      const continuousIntegrationTrigger: ContinuousIntegrationTrigger = {
        branchFilters: [],
        batchChanges: false,
        maxConcurrentBuildsPerBranch: 1,
        pathFilters: [],
        pollingInterval: 0,
        triggerType: DefinitionTriggerType.ContinuousIntegration,
        settingsSourceType: 2,
      };

      // Define the agent pool queue
      const agentPoolQueue: AgentPoolQueue = {
        name: pipelineAgentPoolName,
        pool: {
          name: pipelineAgentPoolName,
        },
      };

      // Define the build definition
      const buildDefinition: BuildDefinition = {
        path: pipelineFolder,
        name: pipelineName,
        repository: {
          name: repository,
          type: 'TfsGit',
          defaultBranch: branch,
        },
        process: process,
        triggers: [continuousIntegrationTrigger],
        queue: agentPoolQueue,
      };

      // Create the pipeline definition
      const pipeline = await client.createDefinition(buildDefinition, project);

      // Log the pipeline object in a readable format
      ctx.logger.debug('Pipeline object:', {
        pipeline: JSON.stringify(pipeline, null, 2),
      });

      ctx.output('pipelineUrl', pipeline._links.web.href);
      ctx.output('pipelineId', pipeline.id!.toString());
    },
  });
}
