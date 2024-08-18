import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import {
  DefaultAzureDevOpsCredentialsProvider,
  ScmIntegrationRegistry,
} from '@backstage/integration';

import { InputError } from '@backstage/errors';
import { getBearerHandler, getPersonalAccessTokenHandler, WebApi } from 'azure-devops-node-api';
import { Config } from '@backstage/config';
import { RunPipelineParameters } from 'azure-devops-node-api/interfaces/PipelinesInterfaces';
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
  config: Config;
}) {
  const { integrations, config } = options;

  // For more information on how to define custom actions, see
  //   https://backstage.io/docs/features/software-templates/writing-custom-actions
  return createTemplateAction<{
    host?: string;
    organization: string;
    pipelineId: string;
    project: string;
    branch?: string;
    token?: string;
    pipelineParameters?: object;
    pipelineVariables?: object;
  }>({
    id: "azure:pipeline:run",
    schema: {
      input: {
        required: [
          "organization",
          "pipelineId",
          "project"
        ],
        type: "object",
        properties: {
          server: {
            type: "string",
            title: "Host",
            description: "The host of Azure DevOps. Defaults to dev.azure.com",
          },
          organization: {
            type: "string",
            title: "Organization",
            description: "The name of the Azure DevOps organization.",
          },
          pipelineId: {
            type: "string",
            title: "Pipeline ID",
            description: "The pipeline ID.",
          },
          project: {
            type: "string",
            title: "Project",
            description: "The name of the Azure project.",
          },
          branch: {
            title: "Repository Branch",
            type: "string",
            description: "The branch of the pipeline's repository.",
          },
          pipelineParameters: {
            title: "Pipeline Parameters",
            type: "object",
            description: "The values you need as parameters on the request to start a build.",
          },
        },
      },
    },
    async handler(ctx) {
      const {
        host = "dev.azure.com",
        organization,
        pipelineId,
        project,
        branch,
        pipelineParameters
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
      const createOptions: RunPipelineParameters = {  };

      const returnedRepo = await client.runPipeline(createOptions,project,parseInt(pipelineId, 10))

      if (!returnedRepo) {
        throw new InputError(
          `Unable to run the pipeline with Organization ${organization}, Project ${project}.
          Please make sure that both the Org and Project are typed corrected and exist.`,
        );
      }
      const remoteUrl = returnedRepo.url;

   
      if (!remoteUrl) {
        throw new InputError(
          'No remote URL returned from run pipeline for Azure',
        );
      }
      const pipelineRunId = returnedRepo.id;

      if (!pipelineRunId) {
        throw new InputError('No Id returned from run pipeline for Azure');
      }

      const repoContentsUrl = returnedRepo.pipeline?.url;

      if (!repoContentsUrl) {
        throw new InputError(
          'No web URL returned from run pipeline for Azure',
        );
      }
      ctx.output('remoteUrl', remoteUrl);
      ctx.output('pipelineRunUrl', returnedRepo.url);
      ctx.output('pipelineRunStatus', returnedRepo.state);
    },
  });
}
