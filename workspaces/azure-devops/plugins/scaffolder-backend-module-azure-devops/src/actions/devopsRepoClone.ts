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
import { InputError } from '@backstage/errors';
import {
  DefaultAzureDevOpsCredentialsProvider,
  ScmIntegrationRegistry,
} from '@backstage/integration';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

import { cloneRepo } from './helpers';

export const cloneAzureRepoAction = (options: {
  integrations: ScmIntegrationRegistry;
}) => {
  const { integrations } = options;

  return createTemplateAction({
    id: 'azure:repo:clone',
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
      const { remoteUrl, branch = 'main', targetPath = './' } = ctx.input;

      const outputDir = resolveSafeChildPath(ctx.workspacePath, targetPath);

      const provider =
        DefaultAzureDevOpsCredentialsProvider.fromIntegrations(integrations);
      const credentials = await provider.getCredentials({ url: remoteUrl });

      let auth: { username: string; password: string } | { token: string };
      if (ctx.input.token) {
        auth = { username: 'not-empty', password: ctx.input.token };
      } else if (credentials?.type === 'pat') {
        auth = { username: 'not-empty', password: credentials.token };
      } else if (credentials?.type === 'bearer') {
        auth = { token: credentials.token };
      } else {
        throw new InputError(
          `No token credentials provided for Azure repository ${remoteUrl}`,
        );
      }

      await cloneRepo({
        dir: outputDir,
        auth: auth,
        logger: ctx.logger,
        remoteUrl: remoteUrl,
        branch: branch,
      });

      ctx.output('cloneFullPath', outputDir);
    },
  });
};
