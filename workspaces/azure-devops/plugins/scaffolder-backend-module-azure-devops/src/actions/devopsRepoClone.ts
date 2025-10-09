/*
 * Copyright 2025 The Backstage Authors
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

import { resolveSafeChildPath } from '@backstage/backend-plugin-api';
import { ScmIntegrationRegistry } from '@backstage/integration';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

import { cloneRepo } from '@backstage/plugin-scaffolder-node';
import { getGitCredentials } from './helpers';

export const createAzureDevOpsCloneRepoAction = (options: {
  integrations: ScmIntegrationRegistry;
}) => {
  const { integrations } = options;

  return createTemplateAction({
    id: 'azure:repository:clone',
    description: 'Clone an Azure repository into the workspace directory.',
    schema: {
      input: {
        remoteUrl: z => z.string().describe('The Git URL to the repository.'),
        branch: z =>
          z.string().describe('The branch to checkout to.').optional(),
        targetPath: z =>
          z
            .string()
            .describe(
              'The subdirectory of the workspace to clone the repository into.',
            )
            .optional(),
        cloneDepth: z =>
          z
            .number()
            .describe(
              'Performs a shallow fetch, retrieving only the latest n commits from the repository.',
            )
            .optional(),
        token: z =>
          z
            .string()
            .describe('The token to use for authentication.')
            .optional(),
      },
      output: {
        cloneFullPath: z =>
          z
            .string()
            .describe('The directory where the repository was cloned to'),
      },
    },
    async handler(ctx) {
      const {
        remoteUrl,
        branch = 'main',
        targetPath = './',
        cloneDepth,
      } = ctx.input;

      const outputDir = resolveSafeChildPath(ctx.workspacePath, targetPath);

      const auth = await getGitCredentials(
        integrations,
        remoteUrl,
        ctx.input.token,
      );

      await cloneRepo({
        url: remoteUrl,
        dir: outputDir,
        depth: cloneDepth,
        auth: auth,
        logger: ctx.logger,
        ref: branch,
      });

      ctx.output('cloneFullPath', outputDir);
    },
  });
};
