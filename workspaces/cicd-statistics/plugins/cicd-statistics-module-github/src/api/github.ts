/*
 * Copyright 2022 The Backstage Authors
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

import {
  CicdStatisticsApi,
  CicdState,
  CicdConfiguration,
  CicdDefaults,
  Build,
  FetchBuildsOptions,
  Stage,
} from '@backstage-community/plugin-cicd-statistics';
import { ConfigApi } from '@backstage/core-plugin-api';
import limiterFactory from 'p-limit';
import { Entity, getEntitySourceLocation } from '@backstage/catalog-model';
import { jobToStages, workflowToBuild } from './utils';

import { readGithubIntegrationConfigs } from '@backstage/integration';
import { ScmAuthApi } from '@backstage/integration-react';
import { Octokit } from '@octokit/rest';

/** @public */
export const GITHUB_ACTIONS_ANNOTATION = 'github.com/project-slug';

export const getProjectNameFromEntity = (entity: Entity) =>
  entity?.metadata.annotations?.[GITHUB_ACTIONS_ANNOTATION] ?? '';

/**
 * This type represents an initialized github client with octokit
 *
 * @public
 */
export type GithubClient = {
  /* the octokit instance for making GitHub API calls */
  octokit: InstanceType<typeof Octokit>;
  /* the owner of the repository, retrieved from the entity source location */
  owner: string;
  /* the repository name, retrieved from the entity source location */
  repo: string;
};

/**
 * Extracts the CI/CD statistics from a Github repository
 *
 * @public
 */
export class CicdStatisticsApiGithub implements CicdStatisticsApi {
  private readonly scmAuthApi: ScmAuthApi;
  private readonly configApi: ConfigApi;
  private readonly cicdDefaults: Partial<CicdDefaults>;

  constructor(options: {
    scmAuthApi: ScmAuthApi;
    configApi: ConfigApi;
    cicdDefaults?: Partial<CicdDefaults>;
  }) {
    this.scmAuthApi = options.scmAuthApi;
    this.configApi = options.configApi;
    this.cicdDefaults = options.cicdDefaults ?? {};
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

  public async createGithubClient(entity: Entity): Promise<GithubClient> {
    const entityInfo = getEntitySourceLocation(entity);
    const [owner, repo] = getProjectNameFromEntity(entity).split('/');
    const url = new URL(entityInfo.target);
    const hostname = url.hostname;

    const octokit = await this.getOctokit(hostname);
    return {
      octokit,
      owner,
      repo,
    };
  }

  private static async updateBuildWithStages(
    octokit: InstanceType<typeof Octokit>,
    owner: string,
    repo: string,
    build: Build,
  ): Promise<Stage[]> {
    const jobs = await octokit.actions.listJobsForWorkflowRun({
      repo,
      owner,
      run_id: parseInt(build.id, 10),
    });
    const stages = jobs.data.jobs.map(jobToStages);
    return stages;
  }

  private static async getDurationOfBuild(
    octokit: InstanceType<typeof Octokit>,
    owner: string,
    repo: string,
    build: Build,
  ): Promise<number> {
    const workflow = await octokit.actions.getWorkflowRunUsage({
      owner,
      repo,
      run_id: parseInt(build.id, 10),
    });
    return workflow.data?.run_duration_ms ?? 0;
  }

  private static async getDefaultBranch(
    octokit: InstanceType<typeof Octokit>,
    owner: string,
    repo: string,
  ): Promise<string | undefined> {
    const repository = await octokit.repos.get({
      owner,
      repo,
    });
    return repository.data.default_branch;
  }

  public async fetchBuilds(options: FetchBuildsOptions): Promise<CicdState> {
    const {
      entity,
      updateProgress,
      timeFrom,
      timeTo,
      filterStatus = ['all'],
      filterType = 'all',
    } = options;
    const { octokit, owner, repo } = await this.createGithubClient(entity);
    updateProgress(0, 0, 0);

    const branch =
      filterType === 'master'
        ? await CicdStatisticsApiGithub.getDefaultBranch(octokit, owner, repo)
        : undefined;

    const workflowsRuns = await octokit.paginate(
      octokit.actions.listWorkflowRunsForRepo,
      {
        owner,
        repo,
        per_page: 1000, // max items per page
        ...(branch ? { branch } : {}),
        created: `${timeFrom.toISOString()}..${timeTo.toISOString()}`, // see https://docs.github.com/en/search-github/getting-started-with-searching-on-github/understanding-the-search-syntax#query-for-dates
      },
      response => response.data.map(workflowToBuild),
    );

    const limiter = limiterFactory(10);
    const builds = workflowsRuns.map(async build => ({
      ...build,
      duration: await limiter(() =>
        CicdStatisticsApiGithub.getDurationOfBuild(octokit, owner, repo, build),
      ),
      stages: await limiter(() =>
        CicdStatisticsApiGithub.updateBuildWithStages(
          octokit,
          owner,
          repo,
          build,
        ),
      ),
    }));
    const promisedBuilds = (await Promise.all(builds)).filter(b =>
      filterStatus.includes(b.status),
    );

    return { builds: promisedBuilds };
  }

  public async getConfiguration(): Promise<Partial<CicdConfiguration>> {
    return {
      availableStatuses: [
        'succeeded',
        'running',
        'aborted',
        'failed',
        'unknown',
        'stalled',
        'expired',
        'enqueued',
        'scheduled',
      ] as const,
      defaults: this.cicdDefaults,
    };
  }
}
