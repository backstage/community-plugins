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
import {
  CopilotMetrics,
  TeamInfo,
} from '@backstage-community/plugin-copilot-common';
import fetch from 'node-fetch';
import {
  CopilotConfig,
  CopilotCredentials,
  getCopilotConfig,
  getGithubCredentials,
} from '../utils/GithubUtils';

interface GithubApi {
  fetchEnterpriseCopilotMetrics: () => Promise<CopilotMetrics[]>;
  fetchEnterpriseTeamCopilotMetrics: (
    teamId: string,
  ) => Promise<CopilotMetrics[]>;
  fetchOrganizationCopilotMetrics: () => Promise<CopilotMetrics[]>;
  fetchOrganizationTeamCopilotMetrics: (
    teamId: string,
  ) => Promise<CopilotMetrics[]>;

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

  async fetchEnterpriseTeamCopilotMetrics(
    teamId: string,
  ): Promise<CopilotMetrics[]> {
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

  async fetchOrganizationTeamCopilotMetrics(
    teamId: string,
  ): Promise<CopilotMetrics[]> {
    const path = `/orgs/${this.copilotConfig.organization}/team/${teamId}/copilot/metrics`;
    return this.get(path);
  }

  async fetchOrganizationTeams(): Promise<TeamInfo[]> {
    // Start with the initial URL
    let url = `/orgs/${this.copilotConfig.organization}/teams?per_page=100`;
    let allTeams: TeamInfo[] = [];
    let hasNextPage = true;
    const nextPattern = /(?<=<)([\S]*)(?=>; rel="next")/i;

    console.log(`[fetchOrganizationTeams] Starting to fetch teams for org: ${this.copilotConfig.organization}`);
    let pageCount = 1;

    while (hasNextPage) {
      console.debug(`[fetchOrganizationTeams] Fetching page ${pageCount} from: ${url}`);
      
      // Don't append per_page again - use the URL directly
      const response = await this.getRaw(url);
      const teams = (await response.json()) as TeamInfo[];

      if (Array.isArray(teams)) {
        allTeams = [...allTeams, ...teams];
        console.debug(`[fetchOrganizationTeams] Page ${pageCount}: Received ${teams.length} teams. Total collected: ${allTeams.length}`);
      } else {
        console.warn(`[fetchOrganizationTeams] Page ${pageCount}: Received non-array response:`, teams);
      }

      // Extract Link header and check for next page
      const linkHeader = response.headers.get('link');
      console.debug(`[fetchOrganizationTeams] Page ${pageCount} Link header: ${linkHeader}`);

      if (linkHeader && linkHeader.includes('rel="next"')) {
        const match = linkHeader.match(nextPattern);
        if (match && match[0]) {
          const fullNextUrl = match[0];
          
          // Parse the full URL to get just the path and query part
          try {
            const parsedUrl = new URL(fullNextUrl);
            // Get just the pathname and search parts
            url = parsedUrl.pathname + parsedUrl.search;
            console.debug(`[fetchOrganizationTeams] Next page URL: ${url}`);
          } catch (error) {
            // If URL parsing fails, try to extract path directly
            console.debug(`[fetchOrganizationTeams] Error parsing next URL: ${error}. Using raw URL: ${fullNextUrl}`);
            
            // Extract URL path from GitHub API URL
            const apiBase = this.copilotConfig.apiBaseUrl;
            if (fullNextUrl.startsWith(apiBase)) {
              url = fullNextUrl.substring(apiBase.length);
              console.debug(`[fetchOrganizationTeams] Extracted path from full URL: ${url}`);
            } else {
              url = fullNextUrl; // Use as-is if parsing fails
              console.debug(`[fetchOrganizationTeams] Using full URL as-is: ${url}`);
            }
          }
          pageCount++;
        } else {
          console.warn(`[fetchOrganizationTeams] Found 'next' in Link header but couldn't extract URL`);
          hasNextPage = false;
        }
      } else {
        hasNextPage = false;
        console.debug('[fetchOrganizationTeams] No more pages to fetch');
      }
    }

    console.log(`[fetchOrganizationTeams] Finished fetching teams. Total teams found: ${allTeams.length}`);
    return allTeams;
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

  // Add this new private method to handle raw responses
  private async getRaw(path: string): Promise<Response> {
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

    return response;
  }
}
