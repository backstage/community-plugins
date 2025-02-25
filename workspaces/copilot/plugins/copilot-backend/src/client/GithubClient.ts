/*
 * Copyright 2024 The Backstage Authors
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

import { ResponseError } from '@backstage/errors';
import { Config } from '@backstage/config';
import { CopilotMetrics, TeamInfo } from '@backstage-community/plugin-copilot-common';
import fetch from 'node-fetch';
import { CopilotConfig, CopilotCredentials, getCopilotConfig, getGithubCredentials } from '../utils/GithubUtils';

interface GithubApi {
  fetchEnterpriseCopilotMetrics: () => Promise<CopilotMetrics[]>;
  fetchEnterpriseTeamCopilotMetrics: (teamId: string) => Promise<CopilotMetrics[]>;
  fetchOrganizationCopilotMetrics: () => Promise<CopilotMetrics[]>;
  fetchOrganizationTeamCopilotMetrics: (teamId: string) => Promise<CopilotMetrics[]>;

  fetchEnterpriseTeams: () => Promise<TeamInfo[]>;
  fetchOrganizationTeams: () => Promise<TeamInfo[]>;
}

export class GithubClient implements GithubApi {
  constructor(
    private readonly copilotConfig: CopilotConfig,
    private readonly config: Config,
  ) {}

  static async fromConfig(config: Config) {
    const info = getCopilotConfig(config);
    return new GithubClient(info, config);
  }

  private async getCredentials(): Promise<CopilotCredentials> {
    return await getGithubCredentials(this.config, this.copilotConfig);
  }

  async fetchEnterpriseCopilotMetrics(): Promise<CopilotMetrics[]> {
    const path = `/enterprises/${this.copilotConfig.enterprise}/copilot/metrics`;
    return this.get(path);
  }

  async fetchEnterpriseTeamCopilotMetrics(teamId: string): Promise<CopilotMetrics[]> {
    const path = `/enterprises/${this.copilotConfig.enterprise}/team/${teamId}/copilot/metrics`;
    return this.get(path);
  }

  async fetchEnterpriseTeams(): Promise<TeamInfo[]> {
    const path = `/enterprises/${this.copilotConfig.enterprise}/teams`;
    return this.get(path);
  }

  async fetchOrganizationCopilotMetrics(): Promise<CopilotMetrics[]> {
    const path = `/orgs/${this.copilotConfig.organization}/copilot/metrics`;
    return this.get(path);
  }

  async fetchOrganizationTeamCopilotMetrics(teamId: string): Promise<CopilotMetrics[]> {
    const path = `/orgs/${this.copilotConfig.organization}/team/${teamId}/copilot/metrics`;
    return this.get(path);
  }

  async fetchOrganizationTeams(): Promise<TeamInfo[]> {
    const path = `/orgs/${this.copilotConfig.organization}/teams`;
    return this.get(path);
  }

  private async get<T>(path: string): Promise<T> {
    const credentials = await this.getCredentials();
    const headers = path.startsWith('/enterprises')
      ? credentials.enterprise?.headers
      : credentials.organization?.headers;

    const response = await fetch(`${this.copilotConfig.apiBaseUrl}${path}`, {
      headers: {
        ...headers,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    return response.json() as Promise<T>;
  }
}
