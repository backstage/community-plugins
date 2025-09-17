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
import { LoggerService } from '@backstage/backend-plugin-api';
import {
  BlackDuckRestApi,
  BlackDuckConfig,
} from '@backstage-community/plugin-blackduck-node';
import { BD_CREATE_PROJECT_API_RESPONSE } from '@backstage-community/plugin-blackduck-node';

/**
 * @public
 */
export function createBlackduckProjectAction(
  blackDuckConfig: BlackDuckConfig,
  logger: LoggerService,
) {
  // For more information on how to define custom actions, see
  //   https://backstage.io/docs/features/software-templates/writing-custom-actions
  return createTemplateAction({
    id: 'blackduck:create:project',
    description: 'Create a Blackduck project',
    schema: {
      input: {
        projectName: z =>
          z.string({ description: 'Name of the project to be created' }),
        projectVersion: z =>
          z.string({ description: 'Version of the project to be created' }),
        versionPhase: z => z.string({ description: 'Phase Dev / QA / Prod' }),
        versionDistribution: z =>
          z.string({ description: 'Distribution Internal / External' }),
        instanceName: z => z.string({ description: 'Name of the Instance' }),
      },
    },

    async handler(ctx) {
      const {
        projectName,
        projectVersion,
        versionPhase = 'DEVELOPMENT',
        versionDistribution = 'INTERNAL',
        instanceName = 'default',
      } = ctx.input;

      ctx.logger.info(
        `Creating BlackDuck project: ${projectName} with 
        version: ${projectVersion} 
        & phase: ${versionPhase}, distribution: ${versionDistribution} on Instance: ${instanceName}`,
      );

      let blackduckApiUrl: string;
      let blackduckApiToken: string;

      try {
        const hostConfig = blackDuckConfig.getHostConfigByName(instanceName);
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

      const res: BD_CREATE_PROJECT_API_RESPONSE =
        await blackDuckApi.createProject(
          projectName,
          projectVersion,
          versionPhase,
          versionDistribution,
        );

      ctx.output('projectName', projectName);
      ctx.output('projectVersion', projectVersion);
      ctx.output('versionPhase', versionPhase);
      ctx.output('versionDistribution', versionDistribution);
      ctx.output('instanceName', instanceName);
      ctx.output('status', `${res.status}`);
      ctx.output('location', `${res.location}`);
    },
  });
}
