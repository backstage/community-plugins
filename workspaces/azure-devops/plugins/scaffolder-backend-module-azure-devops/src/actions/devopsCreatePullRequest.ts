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
import { ScmIntegrationRegistry } from '@backstage/integration';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { InputError } from '@backstage/errors';
import {
  createADOPullRequest,
  updateADOPullRequest,
  linkWorkItemToADOPullRequest,
  getAuthHandler,
} from './helpers';
import {
  GitPullRequest,
  GitPullRequestCompletionOptions,
  GitPullRequestMergeStrategy,
} from 'azure-devops-node-api/interfaces/GitInterfaces';

/**
 * Creates an `azure:pr:create` Scaffolder action.
 *
 * @remarks
 *
 * This Scaffolder action will create a PR to a repository in Azure DevOps.
 *
 * @public
 */
export const createAzureDevopsCreatePullRequestAction = (options: {
  integrations: ScmIntegrationRegistry;
}) => {
  const { integrations } = options;

  return createTemplateAction({
    id: 'azure:pr:create',
    description: 'Create a PR to a repository in Azure DevOps.',
    schema: {
      input: {
        organization: z =>
          z
            .string()
            .describe('The name of the organization in Azure DevOps')
            .optional(),
        sourceBranch: z =>
          z
            .string()
            .describe('The branch to merge into the source.')
            .optional(),
        targetBranch: z =>
          z.string().describe('The branch to merge into').optional(),
        title: z => z.string().describe('The title of the pull request.'),
        description: z =>
          z
            .string()
            .describe('The description of the pull request.')
            .optional(),
        repoName: z => z.string().describe('Repo ID of the pull request.'),
        project: z => z.string().describe('The Project in Azure DevOps.'),
        supportsIterations: z =>
          z
            .boolean()
            .describe('Whether or not the PR supports iterations.')
            .optional(),
        server: z =>
          z
            .string()
            .describe('The hostname of the Azure DevOps service.')
            .optional(),
        token: z =>
          z
            .string()
            .describe('The token to use for authentication.')
            .optional(),
        autoComplete: z =>
          z
            .boolean()
            .describe(
              'Enable auto-completion of the pull request once policies are met',
            )
            .optional(),
        workItemId: z =>
          z
            .string()
            .describe('The work item ID to associate with the pull request.')
            .optional(),
      },
      output: {
        pullRequestId: z =>
          z.number().describe('The ID of the created pull request'),
      },
    },
    async handler(ctx) {
      const {
        title,
        repoName,
        server = 'dev.azure.com',
        project,
        supportsIterations,
        workItemId,
        organization = 'not-empty',
        description = '',
        autoComplete = false,
        targetBranch = 'main',
        sourceBranch = 'scaffolder',
      } = ctx.input;

      const logger = ctx.logger;

      const sourceBranchRef = `refs/heads/${sourceBranch}`;
      const targetBranchRef = `refs/heads/${targetBranch}`;

      const url = `https://${server}/${organization}`;

      const authHandler = await getAuthHandler(
        integrations,
        url,
        ctx.input.token,
      );

      let workItemIdNumber: number | undefined;
      if (workItemId) {
        workItemIdNumber = Number(workItemId);
        if (isNaN(workItemIdNumber)) {
          throw new InputError(`If specified, Work Item ID must be a number`);
        }
      }

      const pullRequest: GitPullRequest = {
        sourceRefName: sourceBranchRef,
        targetRefName: targetBranchRef,
        title: title,
        description: description,
      } as GitPullRequest;

      logger.info(
        `Creating PR to merge ${sourceBranchRef} into ${targetBranchRef}`,
      );

      const pullRequestResponse = await createADOPullRequest({
        gitPullRequestToCreate: pullRequest,
        server: server,
        org: organization,
        authHandler: authHandler,
        repoName: repoName,
        project: project,
        supportsIterations: supportsIterations,
      });

      const pullRequestId = pullRequestResponse!.pullRequestId;
      if (pullRequestId === undefined) {
        throw new InputError(
          'Failed to create pull request: No pull request ID returned',
        );
      }
      // this can't be set at creation time, so we have to update the PR to set it
      if (autoComplete) {
        const updateProperties = {
          autoCompleteSetBy: { id: pullRequestResponse.createdBy?.id },
          // the idea here is that if you want to fire-and-forget the PR by setting autocomplete, you don't also want
          // the branch to stick around afterwards.
          completionOptions: {
            deleteSourceBranch: true,
            // All new repos will accept semi-linear merges by default, and the default merge strategy (a fast-forward merge)
            // is disabled by default so we cannot use it here.
            mergeStrategy: GitPullRequestMergeStrategy.RebaseMerge,
          } as GitPullRequestCompletionOptions,
        } as GitPullRequest;

        logger.info(`Setting auto-complete on PR ${pullRequestId}`);

        await updateADOPullRequest({
          gitPullRequestToUpdate: updateProperties,
          server: server,
          org: organization,
          authHandler: authHandler,
          repoName: repoName,
          project: project,
          pullRequestId: pullRequestId,
        });
      }

      if (workItemIdNumber) {
        logger.info(
          `Associating work item ${workItemIdNumber} with PR ${pullRequestId}`,
        );
        await linkWorkItemToADOPullRequest({
          server: server,
          org: organization,
          authHandler: authHandler,
          logger: logger,
          repoName: repoName,
          pullRequestId: pullRequestId,
          project: project,
          workItemId: workItemIdNumber,
        });
      }

      ctx.output('pullRequestId', pullRequestId);
    },
  });
};
