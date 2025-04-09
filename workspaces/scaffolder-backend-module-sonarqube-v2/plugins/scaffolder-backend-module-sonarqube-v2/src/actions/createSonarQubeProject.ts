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
// @ts-expect-error to bypass the module resolution issues
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { Config } from '@backstage/config';
import { SonarQubeClient } from '../sonarqube.js';

// Define a local ActionContext type that matches what we need
export interface ActionContext {
  input: {
    projectKey: string;
    projectName: string;
    organization?: string;
  };
  logger: {
    info(message: string): void;
    error(message: string): void;
  };
}

// Use a generic type instead to avoid circular reference
export type TemplateAction = {
  id: string;
  schema: {
    input: {
      required: string[];
      type: string;
      properties: {
        [key: string]: {
          type: string;
          title?: string;
          description?: string;
        };
      };
    };
  };
  handler: (ctx: ActionContext) => Promise<void>;
};

/**
 * Creates a SonarQube project using the Backstage scaffolder.
 * @param config - The application configuration
 * @returns A scaffolder action to create SonarQube projects
 */
export function createSonarQubeProjectAction(config: Config): TemplateAction {
  return createTemplateAction<{
    projectKey: string;
    projectName: string;
    organization?: string;
  }>({
    id: 'sonarqube:create-project',
    schema: {
      input: {
        required: ['projectKey', 'projectName'],
        type: 'object',
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
        },
      },
    },
    async handler(ctx: ActionContext) {
      const sonarqube = new SonarQubeClient({
        baseUrl: config.getString('sonarqube.baseUrl'),
        token: config.getString('sonarqube.token'),
      });
      const { projectKey, projectName, organization } = ctx.input;

      try {
        await sonarqube.createProject({
          project: projectKey,
          name: projectName,
          organization,
        });

        ctx.logger.info(
          `Successfully created SonarQube project: ${projectKey}`,
        );
      } catch (error) {
        if (error instanceof Error) {
          ctx.logger.error(
            `Failed to create SonarQube project: ${error.message}`,
          );
        } else {
          ctx.logger.error('Failed to create SonarQube project: Unknown error');
        }
        throw error;
      }
    },
  });
}
