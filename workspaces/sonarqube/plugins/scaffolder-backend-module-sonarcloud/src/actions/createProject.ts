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
import { SonarCloudClient, SonarCloudApiError } from '../lib';
import type { SonarCloudDefaults } from '../lib';
import { requireToken, requireOrganization } from './resolve';
import { examples } from './createProject.examples';

const SONARCLOUD_BASE_URL = 'https://sonarcloud.io';

/**
 * Creates a scaffolder action that provisions a new SonarCloud project.
 *
 * @public
 * @example
 * ```
 * action: sonarcloud:project:create
 * ```
 */
export function createSonarCloudCreateProjectAction(
  defaults: SonarCloudDefaults = {},
) {
  return createTemplateAction({
    id: 'sonarcloud:project:create',
    description: 'Creates a new project in SonarCloud',
    examples,
    schema: {
      input: {
        name: z => z.string().min(1).describe('Project display name'),
        key: z => z.string().min(1).describe('Project key (unique within org)'),
        visibility: z =>
          z
            .enum(['private', 'public'])
            .optional()
            .describe('Project visibility (defaults to org setting)'),
      },
      output: {
        projectKey: z => z.string().describe('The created project key'),
        projectId: z =>
          z
            .string()
            .describe('Internal project UUID (needed for bind-project)'),
        projectUrl: z => z.string().describe('URL to the SonarCloud project'),
      },
    },
    async handler(ctx) {
      const token = requireToken(defaults);
      const organization = requireOrganization(defaults);

      const { name, key, visibility } = ctx.input;
      const client = new SonarCloudClient({ token });

      try {
        const result = await client.createProject({
          organization,
          name,
          key,
          visibility,
        });
        ctx.output('projectKey', result.projectKey);
        ctx.output('projectId', result.projectId);
        ctx.output('projectUrl', result.projectUrl);
      } catch (error) {
        if (
          error instanceof SonarCloudApiError &&
          error.status === 400 &&
          error.messages.some(m => m.includes('already exists'))
        ) {
          ctx.logger.warn(
            `SonarCloud project '${key}' already exists in organization '${organization}' — skipping creation`,
          );
          const existingId = await client.getProjectId(key);
          ctx.output('projectKey', key);
          ctx.output('projectId', existingId);
          ctx.output(
            'projectUrl',
            `${SONARCLOUD_BASE_URL}/project/overview?id=${encodeURIComponent(
              key,
            )}`,
          );
          return;
        }
        throw error;
      }
    },
  });
}
