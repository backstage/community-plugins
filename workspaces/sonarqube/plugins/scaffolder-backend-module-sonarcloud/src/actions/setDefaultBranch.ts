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
import { examples } from './setDefaultBranch.examples';

/**
 * Creates a scaffolder action that sets the default branch for a SonarCloud project.
 *
 * @public
 * @example
 * ```
 * action: sonarcloud:setDefaultBranch
 * ```
 */
export function createSonarCloudSetDefaultBranchAction(
  defaults: SonarCloudDefaults = {},
) {
  return createTemplateAction({
    id: 'sonarcloud:setDefaultBranch',
    description: 'Sets the default branch for a SonarCloud project',
    examples,
    schema: {
      input: {
        projectKey: z => z.string().min(1).describe('SonarCloud project key'),
        name: z =>
          z
            .string()
            .optional()
            .describe('Branch name to set as default (defaults to main)'),
        token: z =>
          z
            .string()
            .optional()
            .describe('SonarCloud API token (defaults to app-config)'),
      },
      output: {
        branchName: z => z.string().describe('The branch name set as default'),
      },
    },
    async handler(ctx) {
      const token = ctx.input.token || defaults.token;
      if (!token) {
        throw new Error(
          "Missing SonarCloud token: provide 'token' input or set sonarcloud.token in app-config",
        );
      }

      const { projectKey } = ctx.input;
      const name = ctx.input.name || 'main';
      const client = new SonarCloudClient({ token });

      await client.renameMainBranch({ projectKey, name });

      ctx.output('branchName', name);
    },
  });
}
