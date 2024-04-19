/*
 * Copyright 2020 The Backstage Authors
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

import { readGithubIntegrationConfigs } from '@backstage/integration';
import { ScmAuthApi } from '@backstage/integration-react';
import { GithubActionsApi } from './GithubActionsApi';
import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import { ConfigApi } from '@backstage/core-plugin-api';

/**
 * A client for fetching information about GitHub actions.
 *
 * @public
 */
export class GithubActionsClient implements GithubActionsApi {
  private readonly configApi: ConfigApi;
  private readonly scmAuthApi: ScmAuthApi;

  constructor(options: { configApi: ConfigApi; scmAuthApi: ScmAuthApi }) {
    this.configApi = options.configApi;
    this.scmAuthApi = options.scmAuthApi;
  }

  private async getOctokit(hostname: string = 'github.com'): Promise<Octokit> {
    const { token } = await this.scmAuthApi.getCredentials({
      url: `https://${hostname}/`,
      additionalScope: {
        customScopes: {
          github: ['repo'],
        },
      },
    });
    const configs = readGithubIntegrationConfigs(
      this.configApi.getOptionalConfigArray('integrations.github') ?? [],
    );
    const githubIntegrationConfig = configs.find(v => v.host === hostname);
    const baseUrl = githubIntegrationConfig?.apiBaseUrl;
    return new Octokit({ auth: token, baseUrl });
  }

  async reRunWorkflow(options: {
    hostname?: string;
    owner: string;
    repo: string;
    runId: number;
  }): Promise<any> {
    const { hostname, owner, repo, runId } = options;

    const octokit = await this.getOctokit(hostname);
    return octokit.actions.reRunWorkflow({
      owner,
      repo,
      run_id: runId,
    });
  }

  async listWorkflowRuns(options: {
    hostname?: string;
    owner: string;
    repo: string;
    pageSize?: number;
    page?: number;
    branch?: string;
  }): Promise<
    RestEndpointMethodTypes['actions']['listWorkflowRuns']['response']['data']
  > {
    const { hostname, owner, repo, pageSize = 100, page = 0, branch } = options;

    const octokit = await this.getOctokit(hostname);
    const workflowRuns = await octokit.actions.listWorkflowRunsForRepo({
      owner,
      repo,
      per_page: pageSize,
      page,
      ...(branch ? { branch } : {}),
    });

    return workflowRuns.data;
  }

  async getWorkflow(options: {
    hostname?: string;
    owner: string;
    repo: string;
    id: number;
  }): Promise<
    RestEndpointMethodTypes['actions']['getWorkflow']['response']['data']
  > {
    const { hostname, owner, repo, id } = options;

    const octokit = await this.getOctokit(hostname);
    const workflow = await octokit.actions.getWorkflow({
      owner,
      repo,
      workflow_id: id,
    });

    return workflow.data;
  }

  async getWorkflowRun(options: {
    hostname?: string;
    owner: string;
    repo: string;
    id: number;
  }): Promise<
    RestEndpointMethodTypes['actions']['getWorkflowRun']['response']['data']
  > {
    const { hostname, owner, repo, id } = options;

    const octokit = await this.getOctokit(hostname);
    const run = await octokit.actions.getWorkflowRun({
      owner,
      repo,
      run_id: id,
    });

    return run.data;
  }

  async listJobsForWorkflowRun(options: {
    hostname?: string;
    owner: string;
    repo: string;
    id: number;
    pageSize?: number;
    page?: number;
  }): Promise<
    RestEndpointMethodTypes['actions']['listJobsForWorkflowRun']['response']['data']
  > {
    const { hostname, owner, repo, id, pageSize = 100, page = 0 } = options;

    const octokit = await this.getOctokit(hostname);
    const jobs = await octokit.actions.listJobsForWorkflowRun({
      owner,
      repo,
      run_id: id,
      per_page: pageSize,
      page,
    });

    return jobs.data;
  }

  async downloadJobLogsForWorkflowRun(options: {
    hostname?: string;
    owner: string;
    repo: string;
    runId: number;
  }): Promise<
    RestEndpointMethodTypes['actions']['downloadJobLogsForWorkflowRun']['response']['data']
  > {
    const { hostname, owner, repo, runId } = options;

    const octokit = await this.getOctokit(hostname);
    const workflow = await octokit.actions.downloadJobLogsForWorkflowRun({
      owner,
      repo,
      job_id: runId,
    });

    return workflow.data;
  }

  async listBranches(options: {
    hostname?: string;
    owner: string;
    repo: string;
    page?: number;
  }): Promise<
    RestEndpointMethodTypes['repos']['listBranches']['response']['data']
  > {
    const { hostname, owner, repo, page = 0 } = options;
    const octokit = await this.getOctokit(hostname);
    const response = await octokit.rest.repos.listBranches({
      owner,
      repo,
      per_page: 100,
      page,
    });

    return response.data;
  }

  async getDefaultBranch(options: {
    hostname?: string;
    owner: string;
    repo: string;
  }): Promise<
    RestEndpointMethodTypes['repos']['get']['response']['data']['default_branch']
  > {
    const { hostname, owner, repo } = options;
    const octokit = await this.getOctokit(hostname);
    const response = await octokit.rest.repos.get({
      owner,
      repo,
    });

    return response.data.default_branch;
  }
}
