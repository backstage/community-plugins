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
import { Config } from '@backstage/config';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { SonarQubeClient } from '../sonarqube';

export const CREATE_CONFIGURED_SONARQUBE_PROJECT_ID =
  'sonarqube:project:create';

/**
 * Creates a SonarQube project using the shared Backstage configuration.
 *
 * This is the recommended action going forward as it avoids passing SonarQube
 * credentials in template inputs.
 *
 * @public
 */
export const createConfiguredSonarQubeProjectAction = (config: Config) => {
  return createTemplateAction<{
    projectKey: string;
    projectName: string;
    organization?: string;
    visibility?: 'public' | 'private';
  }>({
    id: CREATE_CONFIGURED_SONARQUBE_PROJECT_ID,
    description:
      'Creates a new SonarQube project using the configured SonarQube credentials',
    schema: {
      input: {
        type: 'object',
        required: ['projectKey', 'projectName'],
        properties: {
          projectKey: {
            type: 'string',
            title: 'Project Key',
            description: 'The unique key of the SonarQube project',
          },
          projectName: {
            type: 'string',
            title: 'Project Name',
            description: 'The display name of the SonarQube project',
          },
          organization: {
            type: 'string',
            title: 'Organization',
            description: 'The SonarQube organization key (optional)',
          },
          visibility: {
            type: 'string',
            enum: ['public', 'private'],
            title: 'Visibility',
            description: 'Whether the project will be private or public',
          },
        },
      },
      output: {
        projectUrl: {
          type: 'string',
          description: 'URL of the SonarQube project dashboard',
        },
      },
    },
    async handler(ctx) {
      const baseUrl = config.getString('sonarqube.baseUrl');
      const token = config.getString('sonarqube.token');
      const { projectKey, projectName, organization, visibility } = ctx.input;

      const sonarqube = new SonarQubeClient({
        baseUrl,
        token,
      });

      ctx.logger.info(`Creating SonarQube project "${projectKey}"`);

      await sonarqube.createProject({
        project: projectKey,
        name: projectName,
        organization,
        visibility,
      });

      ctx.logger.info(
        `Successfully created SonarQube project "${projectKey}" via ${CREATE_CONFIGURED_SONARQUBE_PROJECT_ID}`,
      );

      ctx.output('projectUrl', `${baseUrl}/dashboard?id=${projectKey}`);
    },
  });
};
