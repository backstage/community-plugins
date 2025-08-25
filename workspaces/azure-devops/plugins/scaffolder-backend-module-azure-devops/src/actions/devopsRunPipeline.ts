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
  RunPipelineParameters,
  RunState,
} from 'azure-devops-node-api/interfaces/PipelinesInterfaces';
import { getAuthHandler } from './helpers';
/**
 * Creates an `azure:pipeline:run` Scaffolder action.
 *
 * @public
 */
export function createAzureDevopsRunPipelineAction(options: {
  integrations: ScmIntegrationRegistry;
}) {
  const { integrations } = options;

  return createTemplateAction({
    id: 'azure:pipeline:run',
    description: '',
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
        pipelineId: d => d.string().describe('The pipeline ID.'),
        project: d => d.string().describe('The name of the Azure project.'),
        branch: d =>
          d
            .string()
            .describe("The branch of the pipeline's repository.")
            .optional(),
        token: d =>
          d.string().describe('Token to use for Ado REST API.').optional(),
        pollingInterval: d =>
          d
            .number()
            .describe(
              'Seconds between each poll for pipeline update. 0 = no polling.',
            )
            .optional(),
        pipelineTimeout: d =>
          d
            .number()
            .describe(
              'Max. seconds to wait for pipeline completion. Only effective if `poolingInterval` is greater than zero.',
            )
            .optional(),
        templateParameters: d =>
          d
            .record(d.string(), d.string())
            .describe(
              'Azure DevOps pipeline template parameters in key-value pairs.',
            )
            .optional(),
      },
      output: {
        pipelineRunUrl: d => d.string().describe('Url of the pipeline'),
        pipelineRunStatus: d =>
          d
            .enum(['canceled', 'failed', 'succeeded', 'unknown'])
            .describe('Pipeline Run status'),
        pipelineRunId: d =>
          d.number().describe('The pipeline Run ID.').optional(),
        pipelineTimeoutExceeded: d =>
          d
            .boolean()
            .describe(
              'True if the pipeline did not complete within the defined timespan.',
            ),
        pipelineOutput: d =>
          d
            .record(
              d.string(),
              d.object({
                isSecret: d.boolean().optional(),
                value: d.string().optional(),
              }),
            )
            .describe('Object containing output variables')
            .optional(),
      },
    },
    async handler(ctx) {
      const {
        host = 'dev.azure.com',
        organization,
        pipelineId,
        project,
        branch,
        templateParameters,
        pollingInterval,
        pipelineTimeout,
      } = ctx.input;

      const url = `https://${host}/${organization}`;
      const authHandler = await getAuthHandler(
        integrations,
        url,
        ctx.input.token,
      );

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

      // Add template parameters to RunPipelineParameters if available
      if (templateParameters) {
        // Log the templateParameters if available
        ctx.logger.info(
          `Template parameters: ${JSON.stringify(templateParameters, null, 2)}`,
        );
        createOptions.templateParameters = templateParameters;
      }

      // Log the createOptions object in a readable format
      ctx.logger.debug('Create options for running the pipeline:', {
        RunPipelineParameters: JSON.stringify(createOptions, null, 2),
      });

      const pipelineIdAsInt = parseInt(pipelineId, 10);

      let pipelineRun = await client.runPipeline(
        createOptions,
        project,
        pipelineIdAsInt,
      );

      // Log the pipeline run URL
      ctx.logger.info(`Pipeline run URL: ${pipelineRun._links.web.href}`);

      // Log the pipeline run state if available
      if (pipelineRun.state) {
        ctx.logger.info(`Pipeline run state: ${RunState[pipelineRun.state]}`);
      }

      let timeoutExceeded = false;
      if ((pollingInterval || 0) > 0) {
        let totalRunningTime = 0;
        const delayInSec = pollingInterval!;
        do {
          await new Promise(f => setTimeout(f, delayInSec * 1000));

          pipelineRun = await client.getRun(
            project,
            pipelineIdAsInt,
            pipelineRun.id!,
          );
          ctx.logger.info(
            `Pipeline run state: ${
              pipelineRun.state ? RunState[pipelineRun.state] : RunState.Unknown
            }`,
          );

          totalRunningTime += delayInSec;
          timeoutExceeded =
            pipelineTimeout !== undefined && totalRunningTime > pipelineTimeout;
        } while (pipelineRun.state === RunState.InProgress && !timeoutExceeded);
      }

      pipelineRun = await client.getRun(
        project,
        pipelineIdAsInt,
        pipelineRun.id!,
      );
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
      ctx.output('pipelineRunId', pipelineRun.id!);
      ctx.output('pipelineRunStatus', pipelineRun.result?.toString());
      ctx.output('pipelineTimeoutExceeded', timeoutExceeded);
      ctx.output('pipelineOutput', pipelineRun.variables);
    },
  });
}
