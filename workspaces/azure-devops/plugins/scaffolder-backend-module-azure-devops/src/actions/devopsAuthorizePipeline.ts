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
import {
  DefaultAzureDevOpsCredentialsProvider,
  ScmIntegrationRegistry,
} from '@backstage/integration';
import { examples } from './devopsRunPipeline.examples';

import { InputError } from '@backstage/errors';
import {
  getBearerHandler,
  getPersonalAccessTokenHandler,
  WebApi,
} from 'azure-devops-node-api';
/**
 * Creates an `acme:example` Scaffolder action.
 *
 * @remarks
 *
 * See {@link https://example.com} for more information.
 *
 * @public
 */
export function createAzureDevopsAuthorizePipelineAction(options: {
  integrations: ScmIntegrationRegistry;
}) {
  const { integrations } = options;

  return createTemplateAction({
    id: 'azure:pipeline:authorize',
    description: 'Authorizes a pipeline in Azure DevOps to Run.',
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
        project: d => d.string().describe('The name of the Azure project.'),
        apiVersion: d =>
          d
            .string()
            .describe(
              'The API version to use for authorization. Defaults 7.1-preview.1',
            )
            .default('7.1-preview.1')
            .optional(),
        repository: d => d.string().describe('The repository of the pipeline.'),
        authorized: d =>
          d
            .boolean()
            .describe('Whether the pipeline is authorized.')
            .default(true),
        pipelineId: d => d.string().describe('The ID of the pipeline.'),
        resourceId: d => d.string().describe('The ID of the resource.'),
        resourceType: d =>
          d.string().describe('The type of the resource (e.g. endpoint)'),
        token: d =>
          d.string().describe('Token to use for Ado REST API.').optional(),
      },
      //   output: {
      //     pipelineUrl: d => d.string().describe('Url of the pipeline'),
      //     pipelineId: d => d.string().describe('The pipeline ID.'),
      //   },
    },
    async handler(ctx) {
      const {
        host = 'dev.azure.com',
        organization,
        pipelineId,
        project,
        repository,
        authorized,
        resourceId,
        resourceType = 'endpoint',
        apiVersion = '7.1-preview.1',
      } = ctx.input;

      const url = `https://${host}/${organization}`;
      const credentialProvider =
        DefaultAzureDevOpsCredentialsProvider.fromIntegrations(integrations);
      const credentials = await credentialProvider.getCredentials({ url: url });

      if (credentials === undefined && ctx.input.token === undefined) {
        throw new InputError(
          `No credentials provided ${url}, please check your integrations config`,
        );
      }
      if (!organization) {
        throw new InputError('organization is required');
      }
      if (!project) {
        throw new InputError('project is required');
      }
      if (!repository) {
        throw new InputError('repository is required');
      }

      const authHandler =
        ctx.input.token || credentials?.type === 'pat'
          ? getPersonalAccessTokenHandler(ctx.input.token ?? credentials!.token)
          : getBearerHandler(credentials!.token);

      const webApi = new WebApi(url, authHandler);
      const client = webApi.rest.client;

      const authorizeOptions = {
        pipelines: [
          {
            id: parseInt(pipelineId, 10),
            authorized: authorized,
          },
        ],
      };

      // See the Azure DevOps documentation for more information about the REST API:
      // https://learn.microsoft.com/en-us/rest/api/azure/devops/approvalsandchecks/pipeline-permissions/update-pipeline-permisions-for-resource?view=azure-devops-rest-7.1&tabs=HTTP#resourcepipelinepermissions
      const requestUrl = `${project}/_apis/pipelines/pipelinepermissions/${resourceType}/${resourceId}?api-version=${apiVersion}`;
      const response = await client.request(
        'PATCH',
        requestUrl,
        JSON.stringify(authorizeOptions),
        {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      );

      // Log the pipeline object in a readable format
      ctx.logger.debug('Pipeline object:', {
        pipeline: JSON.stringify(response, null, 2),
      });

      //   ctx.output('pipelineUrl', pipeline.);
      //   ctx.output('pipelineId', pipeline.id!.toString());
    },
  });
}
