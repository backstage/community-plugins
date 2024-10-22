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

import { InputError } from '@backstage/errors';
import {
  getBearerHandler,
  getPersonalAccessTokenHandler,
  WebApi,
} from 'azure-devops-node-api';
import {
  RunPipelineParameters,
  RunState,
} from 'azure-devops-node-api/interfaces/PipelinesInterfaces';
/**
 * Creates an `acme:example` Scaffolder action.
 *
 * @remarks
 *
 * See {@link https://example.com} for more information.
 *
 * @public
 */
export function runAzurePipelineAction(options: {
  integrations: ScmIntegrationRegistry;
}) {
  const { integrations } = options;

  return createTemplateAction<{
    host?: string;
    organization: string;
    pipelineId: string;
    project: string;
    branch?: string;
    token?: string;
  }>({
    id: 'azure:pipeline:run',
    schema: {
      input: {
        required: ['organization', 'pipelineId', 'project'],
        type: 'object',
        properties: {
          host: {
            type: 'string',
            title: 'Host',
            description: 'The host of Azure DevOps. Defaults to dev.azure.com',
          },
          organization: {
            type: 'string',
            title: 'Organization',
            description: 'The name of the Azure DevOps organization.',
          },
          pipelineId: {
            type: 'string',
            title: 'Pipeline ID',
            description: 'The pipeline ID.',
          },
          project: {
            type: 'string',
            title: 'Project',
            description: 'The name of the Azure project.',
          },
          branch: {
            title: 'Repository Branch',
            type: 'string',
            description: "The branch of the pipeline's repository.",
          },
        },
      },
      output: {
        type: 'object',
        required: ['pipelineRunUrl'],
        properties: {
          pipelineRunUrl: {
            type: 'string',
          },
          pipelineRunStatus: {
            type: 'string',
          },
        },
      },
    },
    async handler(ctx) {
      const {
        host = 'dev.azure.com',
        organization,
        pipelineId,
        project,
        branch,
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

      const authHandler =
        ctx.input.token || credentials?.type === 'pat'
          ? getPersonalAccessTokenHandler(ctx.input.token ?? credentials!.token)
          : getBearerHandler(credentials!.token);

      const webApi = new WebApi(url, authHandler);
      const client = await webApi.getPipelinesApi();
      const createOptions: RunPipelineParameters = {
        resources: {
          repositories: {
            self: {
              refName: branch ? `refs/heads/${branch}` : `refs/heads/main`,
            },
          },
        },
      };

      // Log the createOptions object in a readable format
      ctx.logger.debug(
        'Create options for running the pipeline:',
        JSON.stringify(createOptions, null, 2),
      );

      const pipelineRun = await client.runPipeline(
        createOptions,
        project,
        parseInt(pipelineId, 10),
      );

      // Log the pipeline run URL
      ctx.logger.info(`Pipeline run URL: ${pipelineRun._links.web.href}`);

      // Log the pipeline run state if available
      if (pipelineRun.state) {
        ctx.logger.info(`Pipeline run state: ${RunState[pipelineRun.state]}`);
      }

      // Log the pipeline run result if available
      if (pipelineRun.result) {
        ctx.logger.info(
          `Pipeline run result: ${pipelineRun.result.toString()}`,
        );
      }

      // Log the entire pipeline run object for debugging purposes
      ctx.logger.debug(
        `Pipeline run details: ${JSON.stringify(pipelineRun, null, 2)}`,
      );

      ctx.output('pipelineRunUrl', pipelineRun._links.web.href);
      ctx.output('pipelineRunStatus', pipelineRun.result?.toString());
    },
  });
}
