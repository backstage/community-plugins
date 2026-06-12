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
import { examples } from './createProject.examples';

/**
 * Creates a scaffolder action that provisions a new SonarCloud project.
 *
 * @public
 * @example
 * ```
 * action: sonarcloud:createProject
 * ```
 */
export function createSonarCloudCreateProjectAction(
  defaults: SonarCloudDefaults = {},
) {
  return createTemplateAction({
    id: 'sonarcloud:createProject',
    description: 'Creates a new project in SonarCloud',
    examples,
    schema: {
      input: {
        organization: z =>
          z
            .string()
            .optional()
            .describe('SonarCloud organization key (defaults to app-config)'),
        name: z => z.string().min(1).describe('Project display name'),
        key: z => z.string().min(1).describe('Project key (unique within org)'),
        visibility: z =>
          z
            .enum(['private', 'public'])
            .optional()
            .describe('Project visibility (defaults to org setting)'),
        token: z =>
          z
            .string()
            .optional()
            .describe('SonarCloud API token (defaults to app-config)'),
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
      const token = ctx.input.token || defaults.token;
      const organization = ctx.input.organization || defaults.organization;

      if (!token) {
        throw new Error(
          "Missing SonarCloud token: provide 'token' input or set sonarcloud.token in app-config",
        );
      }
      if (!organization) {
        throw new Error(
          "Missing SonarCloud organization: provide 'organization' input or set sonarcloud.organization in app-config",
        );
      }

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
            `https://sonarcloud.io/project/overview?id=${encodeURIComponent(
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
