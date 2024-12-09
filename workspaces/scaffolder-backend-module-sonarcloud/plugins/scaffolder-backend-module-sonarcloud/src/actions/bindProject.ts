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
import { SonarCloudClient } from '../lib';
import type { SonarCloudDefaults } from '../lib';
import { examples } from './bindProject.examples';

/**
 * Creates a scaffolder action that binds a SonarCloud project to a repository.
 *
 * @public
 * @example
 * ```
 * action: sonarcloud:bind-project
 * ```
 */
export function createSonarCloudBindProjectAction(
  defaults: SonarCloudDefaults = {},
) {
  return createTemplateAction({
    id: 'sonarcloud:bind-project',
    description: 'Binds a SonarCloud project to a repository',
    examples,
    schema: {
      input: {
        projectId: z =>
          z
            .string()
            .min(1)
            .describe('SonarCloud project UUID from create-project output'),
        projectKey: z =>
          z
            .string()
            .min(1)
            .describe('SonarCloud project key (for building project URL)'),
        repositoryId: z =>
          z
            .string()
            .min(1)
            .describe(
              'Repository as "owner/repo" (e.g., "Cibahealth/my-service")',
            ),
        token: z =>
          z
            .string()
            .optional()
            .describe('SonarCloud API token (defaults to app-config)'),
      },
      output: {
        repositoryId: z => z.string().describe('The repository that was bound'),
        projectUrl: z =>
          z.string().describe('URL to the SonarCloud project overview'),
      },
    },
    async handler(ctx) {
      const token = ctx.input.token || defaults.token;
      if (!token) {
        throw new Error(
          "Missing SonarCloud token: provide 'token' input or set sonarcloud.token in app-config",
        );
      }

      const { projectId, projectKey, repositoryId } = ctx.input;
      const client = new SonarCloudClient({ token });

      await client.bindProject({ projectId, repositoryId });

      ctx.logger.info(
        `SonarCloud project bound to repository '${repositoryId}'`,
      );

      ctx.output('repositoryId', repositoryId);
      ctx.output(
        'projectUrl',
        `https://sonarcloud.io/project/overview?id=${encodeURIComponent(
          projectKey,
        )}`,
      );
    },
  });
}
