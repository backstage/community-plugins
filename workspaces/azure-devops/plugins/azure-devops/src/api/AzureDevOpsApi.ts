/*
 * Copyright 2021 The Backstage Authors
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
  BuildRun,
  BuildRunOptions,
  DashboardPullRequest,
  GitTag,
  PullRequest,
  PullRequestOptions,
  Readme,
  ReadmeConfig,
  RepoBuild,
  RepoBuildOptions,
  Team,
} from '@backstage-community/plugin-azure-devops-common';

import { createApiRef } from '@backstage/core-plugin-api';

/** @public */
export const azureDevOpsApiRef = createApiRef<AzureDevOpsApi>({
  id: 'plugin.azure-devops.service',
});

/** @public */
export interface AzureDevOpsApi {
  getRepoBuilds(
    projectName: string,
    repoName: string,
    host?: string,
    org?: string,
    options?: RepoBuildOptions,
  ): Promise<{ items: RepoBuild[] }>;

  getGitTags(
    projectName: string,
    repoName: string,
    entityRef: string,
    host?: string,
    org?: string,
  ): Promise<{ items: GitTag[] }>;

  getPullRequests(
    projectName: string,
    repoName: string,
    entityRef: string,
    host?: string,
    org?: string,
    options?: PullRequestOptions,
  ): Promise<{ items: PullRequest[] }>;

  getDashboardPullRequests(
    projectName: string,
    teamsLimit?: number,
  ): Promise<DashboardPullRequest[]>;

  getAllTeams(limit?: number): Promise<Team[]>;

  getUserTeamIds(userId: string): Promise<string[]>;

  getBuildRuns(
    projectName: string,
    entityRef: string,
    repoName?: string,
    definitionName?: string,
    host?: string,
    org?: string,
    options?: BuildRunOptions,
  ): Promise<{ items: BuildRun[] }>;

  getReadme(opts: ReadmeConfig): Promise<Readme>;
}
