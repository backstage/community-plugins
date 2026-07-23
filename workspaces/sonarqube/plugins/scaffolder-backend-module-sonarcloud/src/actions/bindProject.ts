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
import { requireToken } from './resolve';
import { examples } from './bindProject.examples';

const SONARCLOUD_BASE_URL = 'https://sonarcloud.io';

/**
 * Creates a scaffolder action that binds a SonarCloud project to a repository.
 *
 * @public
 * @example
 * ```
 * action: sonarcloud:project:bind
 * ```
 */
export function createSonarCloudBindProjectAction(
  defaults: SonarCloudDefaults = {},
) {
  return createTemplateAction({
    id: 'sonarcloud:project:bind',
    description: 'Binds a SonarCloud project to a repository',
    examples,
    schema: {
      input: {
        projectId: z => z.string().min(1).describe('SonarCloud project UUID'),
        projectKey: z =>
          z
            .string()
            .min(1)
            .describe('SonarCloud project key (for building project URL)'),
        repositoryId: z =>
          z
            .string()
            .min(1)
            .describe('Repository as "owner/repo" (e.g., "my-org/my-service")'),
      },
      output: {
        repositoryId: z => z.string().describe('The repository that was bound'),
        projectUrl: z =>
          z.string().describe('URL to the SonarCloud project overview'),
      },
    },
    async handler(ctx) {
      const token = requireToken(defaults);

      const { projectId, projectKey, repositoryId } = ctx.input;
      const client = new SonarCloudClient({ token });

      await client.bindProject({ projectId, repositoryId });

      ctx.logger.info(
        `SonarCloud project bound to repository '${repositoryId}'`,
      );

      ctx.output('repositoryId', repositoryId);
      ctx.output(
        'projectUrl',
        `${SONARCLOUD_BASE_URL}/project/overview?id=${encodeURIComponent(
          projectKey,
        )}`,
      );
    },
  });
}
