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
  CopilotSeats,
  TeamInfo,
} from '@backstage-community/plugin-copilot-common';
import { Octokit } from '@octokit/rest';
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
  private enterpriseOctokit?: Octokit;
  private organizationOctokit?: Octokit;

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

  private async getOctokit(
    type: 'enterprise' | 'organization',
  ): Promise<Octokit> {
    const credentials = await this.getCredentials();
    const headers = credentials[type]?.headers || {};

    return new Octokit({
      baseUrl: this.copilotConfig.apiBaseUrl,
      auth: headers.Authorization?.replace('Bearer ', '') || '',
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
  }

  private async getEnterpriseOctokit(): Promise<Octokit> {
    if (!this.enterpriseOctokit) {
      this.enterpriseOctokit = await this.getOctokit('enterprise');
    }
    return this.enterpriseOctokit;
  }

  private async getOrganizationOctokit(): Promise<Octokit> {
    if (!this.organizationOctokit) {
      this.organizationOctokit = await this.getOctokit('organization');
    }
    return this.organizationOctokit;
  }

  async fetchEnterpriseCopilotMetrics(): Promise<CopilotMetrics[]> {
    const octokit = await this.getEnterpriseOctokit();
    const path = `/enterprises/${this.copilotConfig.enterprise}/copilot/metrics`;

    try {
      const response = await octokit.request(`GET ${path}`);
      return response.data as CopilotMetrics[];
    } catch (error) {
      throw ResponseError.fromResponse(error.response || error);
    }
  }

  async fetchEnterpriseTeamCopilotMetrics(
    teamId: string,
  ): Promise<CopilotMetrics[]> {
    const octokit = await this.getEnterpriseOctokit();
    const path = `/enterprises/${this.copilotConfig.enterprise}/team/${teamId}/copilot/metrics`;

    try {
      const response = await octokit.request(`GET ${path}`);
      return response.data as CopilotMetrics[];
    } catch (error) {
      throw ResponseError.fromResponse(error.response || error);
    }
  }

  async fetchEnterpriseTeams(): Promise<TeamInfo[]> {
    const octokit = await this.getEnterpriseOctokit();

    try {
      const teams: TeamInfo[] = [];
      let cursor: string | null = null;
      let hasNextPage = true;

      while (hasNextPage) {
        const query = `
          query($enterprise: String!, $cursor: String) {
            enterprise(slug: $enterprise) {
              organizations(first: 100) {
                nodes {
                  teams(first: 100, after: $cursor) {
                    pageInfo {
                      hasNextPage
                      endCursor
                    }
                    nodes {
                      id
                      databaseId
                      slug
                      name
                      members {
                        totalCount
                      }
                    }
                  }
                }
              }
            }
          }
        `;

        const variables = {
          enterprise: this.copilotConfig.enterprise,
          cursor,
        };

        const response: any = await octokit.graphql(query, variables);

        // Flatten teams from all organizations in the enterprise
        const allTeams = response.enterprise.organizations.nodes.flatMap(
          (org: any) => org.teams.nodes,
        );

        // Filter teams with 5 or more members
        const filteredTeams = allTeams
          .filter((team: any) => team.members.totalCount >= 5)
          .map((team: any) => ({
            id: team.databaseId,
            slug: team.slug,
            name: team.name,
          }));

        teams.push(...filteredTeams);

        // Check if any organization has more teams to fetch
        hasNextPage = response.enterprise.organizations.nodes.some(
          (org: any) => org.teams.pageInfo.hasNextPage,
        );

        if (hasNextPage) {
          cursor = response.enterprise.organizations.nodes.find(
            (org: any) => org.teams.pageInfo.hasNextPage,
          )?.teams.pageInfo.endCursor;
        }
      }

      return teams;
    } catch (error) {
      throw ResponseError.fromResponse(error.response || error);
    }
  }

  async fetchEnterpriseSeats(): Promise<any> {
    const octokit = await this.getEnterpriseOctokit();
    const path = `/enterprises/${this.copilotConfig.enterprise}/copilot/billing/seats`;

    try {
      const seats = await octokit.paginate(`GET ${path}`, {
        per_page: 100, // Maximum allowed per page
      });

      return this.mergePaginationResult(seats as CopilotSeats[]);
    } catch (error) {
      throw ResponseError.fromResponse(error.response || error);
    }
  }

  async fetchOrganizationCopilotMetrics(): Promise<CopilotMetrics[]> {
    const octokit = await this.getOrganizationOctokit();
    const path = `/orgs/${this.copilotConfig.organization}/copilot/metrics`;

    try {
      const response = await octokit.request(`GET ${path}`);
      return response.data as CopilotMetrics[];
    } catch (error) {
      throw ResponseError.fromResponse(error.response || error);
    }
  }

  async fetchOrganizationTeamCopilotMetrics(
    teamId: string,
  ): Promise<CopilotMetrics[]> {
    const octokit = await this.getOrganizationOctokit();
    const path = `/orgs/${this.copilotConfig.organization}/team/${teamId}/copilot/metrics`;

    try {
      const response = await octokit.request(`GET ${path}`);
      return response.data as CopilotMetrics[];
    } catch (error) {
      throw ResponseError.fromResponse(error.response || error);
    }
  }

  async fetchOrganizationTeams(): Promise<TeamInfo[]> {
    const octokit = await this.getOrganizationOctokit();

    try {
      const teams: TeamInfo[] = [];
      let cursor: string | null = null;
      let hasNextPage = true;

      while (hasNextPage) {
        const query = `
          query($org: String!, $cursor: String) {
            organization(login: $org) {
              teams(first: 100, after: $cursor) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  id
                  databaseId
                  slug
                  name
                  members {
                    totalCount
                  }
                }
              }
            }
          }
        `;

        const variables = {
          org: this.copilotConfig.organization,
          cursor,
        };

        const response: any = await octokit.graphql(query, variables);
        const teamsData = response.organization.teams;

        // Filter teams with 5 or more members
        const filteredTeams = teamsData.nodes
          .filter((team: any) => team.members.totalCount >= 5)
          .map((team: any) => ({
            id: team.databaseId,
            slug: team.slug,
            name: team.name,
          }));

        teams.push(...filteredTeams);

        hasNextPage = teamsData.pageInfo.hasNextPage;
        cursor = teamsData.pageInfo.endCursor;
      }

      return teams;
    } catch (error) {
      throw ResponseError.fromResponse(error.response || error);
    }
  }

  async fetchOrganizationSeats(): Promise<CopilotSeats> {
    const octokit = await this.getOrganizationOctokit();

    try {
      const seats = await octokit.paginate(octokit.copilot.listCopilotSeats, {
        org: this.copilotConfig.organization!,
        per_page: 100, // Maximum allowed per page
      });

      return this.mergePaginationResult(seats as CopilotSeats[]);
    } catch (error) {
      throw ResponseError.fromResponse(error.response || error);
    }
  }

  /**
   * This function is used to merge paginated results from the GitHub API
   * that does not work as one would expect. If the api returns a object which
   * contains paginated results, we get an array of the objects instead of merged data.
   * So this function merges this data into one object where the property "seats" are
   * merged into a single array.
   * @param data
   * @returns paginated result as one would expect
   */
  mergePaginationResult(data: CopilotSeats[]): CopilotSeats {
    if (data.length === 0) {
      return {
        total_seats: 0,
        seats: [],
      };
    }

    // total_seats is the same for all pages, so we can just take it from the first page
    // and merge the seats from all pages into one array
    const totalSeats = data[0].total_seats;
    const seats = data.map(seat => seat.seats).flat();

    return {
      total_seats: totalSeats,
      seats: seats,
    };
  }
}
