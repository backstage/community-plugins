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
import {
  WebApi,
  getPersonalAccessTokenHandler,
  getBearerHandler,
} from 'azure-devops-node-api';
import { IGitApi } from 'azure-devops-node-api/GitApi';
import { GitPullRequest } from 'azure-devops-node-api/interfaces/GitInterfaces';
import { InputError } from '@backstage/errors';
import { IRequestHandler } from 'azure-devops-node-api/interfaces/common/VsoBaseInterfaces';
import {
  DefaultAzureDevOpsCredentialsProvider,
  ScmIntegrationRegistry,
} from '@backstage/integration';

export async function createADOPullRequest({
  gitPullRequestToCreate,
  server,
  org,
  authHandler,
  repoName,
  project,
  supportsIterations,
}: {
  gitPullRequestToCreate: GitPullRequest;
  server: string;
  org: string;
  authHandler: IRequestHandler;
  repoName: string;
  project?: string;
  supportsIterations?: boolean;
}): Promise<GitPullRequest> {
  const url = `https://${server}/`;
  const orgUrl = url + org;

  const connection = new WebApi(orgUrl, authHandler);

  const gitApiObject: IGitApi = await connection.getGitApi();

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
  org,
  authHandler,
  repoName,
  project,
  pullRequestId,
}: {
  gitPullRequestToUpdate: GitPullRequest;
  server: string;
  org: string;
  authHandler: IRequestHandler;
  repoName: string;
  project?: string;
  pullRequestId: number;
}): Promise<void> {
  const url = `https://${server}/`;
  const orgUrl = url + org;

  const connection = new WebApi(orgUrl, authHandler);

  const gitApiObject: IGitApi = await connection.getGitApi();

  await gitApiObject.updatePullRequest(
    gitPullRequestToUpdate,
    repoName,
    pullRequestId,
    project,
  );
}

export async function getGitCredentials(
  integrations: ScmIntegrationRegistry,
  url: string,
  token?: string,
) {
  const credentialProvider =
    DefaultAzureDevOpsCredentialsProvider.fromIntegrations(integrations);
  const credentials = await credentialProvider.getCredentials({ url: url });

  let auth: { username: string; password: string } | { token: string };
  if (token) {
    auth = { username: 'not-empty', password: token };
  } else if (credentials?.type === 'pat') {
    auth = { username: 'not-empty', password: credentials.token };
  } else if (credentials?.type === 'bearer') {
    auth = { token: credentials.token };
  } else {
    throw new InputError(
      `No credentials provided ${url}, please check your integrations config`,
    );
  }
  return auth;
}

export async function getAuthHandler(
  integrations: ScmIntegrationRegistry,
  url: string,
  token?: string,
): Promise<IRequestHandler> {
  const credentialProvider =
    DefaultAzureDevOpsCredentialsProvider.fromIntegrations(integrations);
  const credentials = await credentialProvider.getCredentials({ url: url });

  if (credentials === undefined && token === undefined) {
    throw new InputError(
      `No credentials provided ${url}, please check your integrations config`,
    );
  }

  return token || credentials?.type === 'pat'
    ? getPersonalAccessTokenHandler(token ?? credentials!.token)
    : getBearerHandler(credentials!.token);
}

export async function linkWorkItemToADOPullRequest({
  workItemId,
  server,
  org,
  authHandler,
  logger,
  repoName,
  project,
  pullRequestId,
}: {
  workItemId: number;
  server: string;
  org: string;
  authHandler: IRequestHandler;
  logger: LoggerService;
  repoName: string;
  project: string;
  pullRequestId: number;
}): Promise<void> {
  const url = `https://${server}/`;
  const orgUrl = url + org;

  const connection = new WebApi(orgUrl, authHandler);
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
