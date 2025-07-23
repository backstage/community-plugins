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

import { LoggerService } from '@backstage/backend-plugin-api';
import * as azdev from 'azure-devops-node-api';
import * as GitApi from 'azure-devops-node-api/GitApi';
import * as GitInterfaces from 'azure-devops-node-api/interfaces/GitInterfaces';
import { AzureDevOpsCredentialsProvider } from '@backstage/integration';
import { InputError } from '@backstage/errors';
import { Git } from '../git.ts';

export async function cloneRepo({
  dir,
  auth,
  logger,
  remote = 'origin',
  remoteUrl,
  branch = 'main',
}: {
  dir: string;
  auth: { username: string; password: string } | { token: string };
  logger: LoggerService;
  remote?: string;
  remoteUrl: string;
  branch?: string;
}): Promise<void> {
  const git = Git.fromAuth({
    ...auth,
    logger,
  });

  await git.clone({
    url: remoteUrl,
    dir,
  });

  await git.addRemote({
    dir,
    remote,
    url: remoteUrl,
  });

  await git.checkout({
    dir,
    ref: branch,
  });
}

export async function commitAndPushBranch({
  dir,
  credentialsProvider,
  logger,
  remote = 'origin',
  commitMessage,
  gitAuthorInfo,
  branch = 'scaffolder',
  token,
}: {
  dir: string;
  credentialsProvider: AzureDevOpsCredentialsProvider;
  logger: LoggerService;
  remote?: string;
  commitMessage: string;
  gitAuthorInfo?: { name?: string; email?: string };
  branch?: string;
  token?: string;
}): Promise<void> {
  const authorInfo = {
    name: gitAuthorInfo?.name ?? 'Scaffolder',
    email: gitAuthorInfo?.email ?? 'scaffolder@backstage.io',
  };

  const git = Git.fromAuth({
    onAuth: async url => {
      const credentials = await credentialsProvider.getCredentials({ url });

      if (token) {
        return { username: 'not-empty', password: token };
      } else if (credentials?.type === 'pat') {
        return { username: 'not-empty', password: credentials.token };
      } else if (credentials?.type === 'bearer') {
        return {
          headers: {
            Authorization: `Bearer ${credentials.token}`,
          },
        };
      }
      throw new InputError(
        `No token credentials provided for Azure repository ${url}`,
      );
    },
    logger,
  });

  const currentBranch = await git.currentBranch({ dir });

  logger.info(`Current branch is ${currentBranch}`);
  logger.info(`Target branch is ${branch}`);

  if (currentBranch !== branch) {
    try {
      await git.branch({
        dir,
        ref: branch,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AlreadyExistsError') {
        // we safely ignore this error
      } else {
        throw err;
      }
    }

    await git.checkout({
      dir,
      ref: branch,
    });
  }

  await git.add({
    dir,
    filepath: '.',
  });

  await git.commit({
    dir,
    message: commitMessage,
    author: authorInfo,
    committer: authorInfo,
  });

  await git.push({
    dir,
    remote: remote,
    remoteRef: `refs/heads/${branch}`,
  });
}

export async function createADOPullRequest({
  gitPullRequestToCreate,
  server,
  auth,
  repoName,
  project,
  supportsIterations,
}: {
  gitPullRequestToCreate: GitInterfaces.GitPullRequest;
  server: string;
  auth: { org: string; token: string };
  repoName: string;
  project?: string;
  supportsIterations?: boolean;
}): Promise<GitInterfaces.GitPullRequest> {
  const url = `https://${server}/`;
  const orgUrl = url + auth.org;
  const token: string = auth.token || ''; // process.env.AZURE_TOKEN || "";

  const authHandler = azdev.getHandlerFromToken(token);
  const connection = new azdev.WebApi(orgUrl, authHandler);

  const gitApiObject: GitApi.IGitApi = await connection.getGitApi();

  return await gitApiObject.createPullRequest(
    gitPullRequestToCreate,
    repoName,
    project,
    supportsIterations,
  );
}

export async function updateADOPullRequest({
  gitPullRequestToUpdate,
  server,
  auth,
  repoName,
  project,
  pullRequestId,
}: {
  gitPullRequestToUpdate: GitInterfaces.GitPullRequest;
  server: string;
  auth: { org: string; token: string };
  repoName: string;
  project?: string;
  pullRequestId: number;
}): Promise<void> {
  const url = `https://${server}/`;
  const orgUrl = url + auth.org;
  const token: string = auth.token || ''; // process.env.AZURE_TOKEN || "";

  const authHandler = azdev.getHandlerFromToken(token);
  const connection = new azdev.WebApi(orgUrl, authHandler);

  const gitApiObject: GitApi.IGitApi = await connection.getGitApi();

  await gitApiObject.updatePullRequest(
    gitPullRequestToUpdate,
    repoName,
    pullRequestId,
    project,
  );
}

export async function linkWorkItemToADOPullRequest({
  workItemId,
  server,
  auth,
  logger,
  repoName,
  project,
  pullRequestId,
}: {
  workItemId: number;
  server: string;
  auth: { org: string; token: string };
  logger: LoggerService;
  repoName: string;
  project: string;
  pullRequestId: number;
}): Promise<void> {
  const url = `https://${server}/`;
  const orgUrl = url + auth.org;
  const token: string = auth.token || '';

  const authHandler = azdev.getHandlerFromToken(token);
  const connection = new azdev.WebApi(orgUrl, authHandler);
  connection.options.allowRetries = true;
  connection.options.maxRetries = 5;

  const workItemApi = await connection.getWorkItemTrackingApi();
  const projectApi = await connection.getCoreApi();
  const gitApi = await connection.getGitApi();

  const projectId = (await projectApi.getProject(project)).id;
  const repoId = (await gitApi.getRepository(repoName, projectId)).id;

  if (!repoId) {
    throw new InputError(`Repository ${repoName} not found`);
  }
  const pullRequest = await gitApi.getPullRequest(
    repoId,
    pullRequestId,
    projectId,
  );

  const document = [
    {
      op: 'add',
      path: '/relations/-',
      value: {
        rel: 'ArtifactLink',
        url: pullRequest.artifactId,
        attributes: { name: 'Pull Request' },
      },
    },
  ];

  logger.info(
    `Executing work item update with patch: ${JSON.stringify(document)}`,
  );
  await workItemApi.updateWorkItem(undefined, document, workItemId, project);
}

// For debug logging
export async function logConnectionData({
  server,
  auth,
  logger,
}: {
  server: string;
  auth: { org: string; token: string };
  logger: LoggerService;
}): Promise<void> {
  const url = `https://${server}/`;
  const orgUrl = url + auth.org;
  const token: string = auth.token || '';

  const authHandler = azdev.getHandlerFromToken(token);
  const connection = new azdev.WebApi(orgUrl, authHandler);

  const connectionData = await (
    await connection.getLocationsApi()
  ).getConnectionData();
  const userName = connectionData.authenticatedUser?.properties.Account.$value;
  const userDisplayName = connectionData.authenticatedUser?.providerDisplayName;
  logger.info(`Connected as user ${userName} (${userDisplayName})`);
}
