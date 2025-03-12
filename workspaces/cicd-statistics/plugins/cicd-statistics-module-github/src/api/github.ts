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
import { ConfigApi, OAuthApi } from '@backstage/core-plugin-api';
import limiterFactory from 'p-limit';
import { Entity, getEntitySourceLocation } from '@backstage/catalog-model';
import { jobToStages, workflowToBuild } from './utils';

import { readGithubIntegrationConfigs } from '@backstage/integration';
import { Octokit } from '@octokit/rest';

/** @public */
export const GITHUB_ACTIONS_ANNOTATION = 'github.com/project-slug';

export const getProjectNameFromEntity = (entity: Entity) =>
  entity?.metadata.annotations?.[GITHUB_ACTIONS_ANNOTATION] ?? '';

/**
 * This type represents a initialized gitlab client with octokit
 *
 * @public
 */
export type GithubClient = {
  /* the actual API of octokit */
  api: InstanceType<typeof Octokit>;
  /* the owner the repository, retrieved from the entity source location  */
  owner: string;
  /* the repository name, retrieved from the entity source location  */
  repo: string;
};

/**
 * Extracts the CI/CD statistics from a Github repository
 *
 * @public
 */
export class CicdStatisticsApiGithub implements CicdStatisticsApi {
  readonly #githubAuthApi: OAuthApi;
  readonly #cicdDefaults: Partial<CicdDefaults>;
  readonly configApi: ConfigApi;

  constructor(
    githubAuthApi: OAuthApi,
    configApi: ConfigApi,
    cicdDefaults: Partial<CicdDefaults> = {},
  ) {
    this.#githubAuthApi = githubAuthApi;
    this.#cicdDefaults = cicdDefaults;
    this.configApi = configApi;
  }

  public async createGithubApi(
    entity: Entity,
    scopes: string[],
  ): Promise<GithubClient> {
    const entityInfo = getEntitySourceLocation(entity);
    const [owner, repo] = getProjectNameFromEntity(entity).split('/');
    const url = new URL(entityInfo.target);
    const oauthToken = await this.#githubAuthApi.getAccessToken(scopes);

    const configs = readGithubIntegrationConfigs(
      this.configApi.getOptionalConfigArray('integrations.github') ?? [],
    );
    const githubIntegrationConfig = configs.find(v => v.host === url.hostname);
    const baseUrl = githubIntegrationConfig?.apiBaseUrl;
    return {
      api: new Octokit({ auth: oauthToken, baseUrl }),
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
    const { api, owner, repo } = await this.createGithubApi(entity, [
      'read_api',
    ]);
    updateProgress(0, 0, 0);

    const branch =
      filterType === 'master'
        ? await CicdStatisticsApiGithub.getDefaultBranch(api, owner, repo)
        : undefined;

    const workflowsRuns = await api.paginate(
      api.actions.listWorkflowRunsForRepo,
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
        CicdStatisticsApiGithub.getDurationOfBuild(api, owner, repo, build),
      ),
      stages: await limiter(() =>
        CicdStatisticsApiGithub.updateBuildWithStages(api, owner, repo, build),
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
      defaults: this.#cicdDefaults,
    };
  }
}
