import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { LoggerService } from '@backstage/backend-plugin-api';
import { BlackDuckRestApi } from '@backstage-community/plugin-blackduck-backend';
import { BlackDuckConfig } from '@backstage-community/plugin-blackduck-backend';

/**
 * @public
 */
export function createBlackduckProjectAction(
  blackDuckConfig: BlackDuckConfig,
  logger: LoggerService,
) {
  // For more information on how to define custom actions, see
  //   https://backstage.io/docs/features/software-templates/writing-custom-actions
  return createTemplateAction<{
    projectName: string;
    projectVersion?: string;
    versionPhase?: string;
    versionDistribution?: string;
    instancName?: string;
  }>({
    id: 'blackduck:create:project',
    description: 'Create a Blackduck project',
    schema: {
      input: {
        type: 'object',
        required: ['projectName'],
        properties: {
          projectName: {
            title: 'Project Name',
            description: 'Name of the project to be created',
            type: 'string',
          },
          projectVersion: {
            title: 'Project Version',
            description: 'Version of the project to be created',
            type: 'string',
          },
          versionPhase: {
            title: 'Version Phase',
            description: 'Phase Dev / QA / Prod',
            type: 'string',
          },
          versionDistribution: {
            title: 'Version Distribution',
            description: 'Distribution Internal / External',
            type: 'string',
          },
          instancName: {
            title: 'Instance',
            description: 'Name of the Instance',
            type: 'string',
          },
        },
      },
    },
    async handler(ctx) {
      ctx.logger.info(
        `Creating BlackDuck project: ${ctx.input.projectName} with 
        version: ${ctx.input.projectVersion} 
        & phase: ${ctx.input.versionPhase}, distribution: ${
          ctx.input.versionDistribution
        } on Instance: ${ctx.input.instancName ?? 'default'}`,
      );

      let blackduckApiUrl: string;
      let blackduckApiToken: string;

      try {
        const hostConfig = blackDuckConfig.getHostConfigByName(
          ctx.input.instancName ?? 'default',
        );
        blackduckApiUrl = hostConfig.host;
        blackduckApiToken = hostConfig.token;
      } catch (error) {
        throw new Error('BlackDuck Config is not valid.');
      }

      if (!blackduckApiUrl || !blackduckApiToken) {
        throw new Error('Blackduck API URL or Token not configured!');
      }

      const blackDuckApi = new BlackDuckRestApi(
        logger,
        blackduckApiUrl,
        blackduckApiToken,
      );

      await blackDuckApi.auth();

      await blackDuckApi.createProject(
        ctx.input.projectName,
        ctx.input.projectVersion,
        ctx.input.versionPhase,
        ctx.input.versionDistribution,
      );

      ctx.output('projectName', ctx.input.projectName);
      ctx.output('projectVersion', ctx.input.projectVersion);
      ctx.output('versionPhase', ctx.input.versionPhase);
      ctx.output('versionDistribution', ctx.input.versionDistribution);
      ctx.output('instanceName', ctx.input.instancName);
    },
  });
}
