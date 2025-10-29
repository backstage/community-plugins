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

import { Config } from '@backstage/config';
import { ScmIntegrationRegistry } from '@backstage/integration';
import {
  addFiles,
  commitAndPushBranch,
  createTemplateAction,
} from '@backstage/plugin-scaffolder-node';
import { resolveSafeChildPath } from '@backstage/backend-plugin-api';
import { getGitCredentials } from './helpers';

export const createAzureDevOpsPushRepoAction = (options: {
  integrations: ScmIntegrationRegistry;
  config: Config;
}) => {
  const { integrations, config } = options;

  return createTemplateAction({
    id: 'azure:repository:push',
    description:
      'Push the content in the workspace to a remote Azure repository.',
    schema: {
      input: {
        remoteUrl: z => z.string().describe('The Git URL to the repository.'),
        branch: z =>
          z.string().describe('The branch to checkout to.').optional(),
        // Where not set, defaults to workspacePath
        sourcePath: z =>
          z
            .string()
            .describe(
              'The subdirectory of the working directory containing the repository.',
            )
            .optional(),
        gitCommitMessage: z =>
          z
            .string()
            .describe('Sets the commit message on the repository.')
            .optional(),
        gitAuthorName: z =>
          z
            .string()
            .describe('Sets the default author name for the commit.')
            .optional(),
        gitAuthorEmail: z =>
          z
            .string()
            .describe('Sets the default author email for the commit.')
            .optional(),
        token: z =>
          z
            .string()
            .describe('The token to use for authentication.')
            .optional(),
      },
    },
    async handler(ctx) {
      const {
        remoteUrl,
        branch = 'scaffolder',
        gitCommitMessage = 'Initial commit',
        gitAuthorName,
        gitAuthorEmail,
      } = ctx.input;

      if (/\s/.test(branch)) {
        throw new Error('Branch name must not contain spaces.');
      }

      const sourcePath = resolveSafeChildPath(
        ctx.workspacePath,
        ctx.input.sourcePath ?? '.',
      );

      const gitAuthorInfo = {
        name: gitAuthorName
          ? gitAuthorName
          : config.getOptionalString('scaffolder.defaultAuthor.name'),
        email: gitAuthorEmail
          ? gitAuthorEmail
          : config.getOptionalString('scaffolder.defaultAuthor.email'),
      };

      const auth = await getGitCredentials(
        integrations,
        remoteUrl,
        ctx.input.token,
      );

      await addFiles({
        dir: sourcePath,
        filepath: '.',
        auth: auth,
        logger: ctx.logger,
      });

      await commitAndPushBranch({
        dir: sourcePath,
        auth: auth,
        logger: ctx.logger,
        commitMessage: gitCommitMessage
          ? gitCommitMessage
          : config.getOptionalString('scaffolder.defaultCommitMessage') ||
            'Initial commit',
        gitAuthorInfo,
        branch,
      });
    },
  });
};
