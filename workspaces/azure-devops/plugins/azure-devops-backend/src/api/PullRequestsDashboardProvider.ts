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
  DashboardPullRequest,
  PullRequestOptions,
  Team,
  TeamMember,
} from '@backstage-community/plugin-azure-devops-common';

import { AzureDevOpsApi } from './AzureDevOpsApi';
import limiterFactory from 'p-limit';
import { LoggerService } from '@backstage/backend-plugin-api';

export const DEFAULT_TEAMS_LIMIT = 100;

export class PullRequestsDashboardProvider {
  // Cache keys are in format: "host:org" (e.g., "dev.azure.com:myorg")
  private teams = new Map<string, Map<string, Team>>();

  private teamMembers = new Map<string, Map<string, TeamMember>>();

  private constructor(
    private readonly logger: LoggerService,
    private readonly azureDevOpsApi: AzureDevOpsApi,
  ) {}

  public static async create(
    logger: LoggerService,
    azureDevOpsApi: AzureDevOpsApi,
  ): Promise<PullRequestsDashboardProvider> {
    const provider = new PullRequestsDashboardProvider(logger, azureDevOpsApi);
    return provider;
  }

  private getCacheKey(host?: string, org?: string): string {
    return `${host ?? 'default'}:${org ?? 'default'}`;
  }

  public async readTeams(
    limit?: number,
    host?: string,
    org?: string,
  ): Promise<void> {
    const cacheKey = this.getCacheKey(host, org);
    this.logger.info(`Reading teams for ${cacheKey}.`);

    let teams = await this.azureDevOpsApi.getAllTeams({ limit, host, org });

    // This is used to filter out the default Azure Devops project teams.
    teams = teams.filter(team =>
      team.name && team.projectName
        ? team.name !== `${team.projectName} Team`
        : true,
    );

    const teamsCache = new Map<string, Team>();
    const teamMembersCache = new Map<string, TeamMember>();

    const limiter = limiterFactory(5);

    await Promise.all(
      teams.map(team =>
        limiter(async () => {
          const teamId = team.id;
          const projectId = team.projectId;

          if (teamId) {
            let teamMembers: TeamMember[] | undefined;

            if (projectId) {
              teamMembers = await this.azureDevOpsApi.getTeamMembers({
                projectId,
                teamId,
                host,
                org,
              });
            }

            if (teamMembers) {
              team.members = teamMembers.reduce((arr, teamMember) => {
                const teamMemberId = teamMember.id;

                if (teamMemberId) {
                  arr.push(teamMemberId);
                  const memberOf = [
                    ...(teamMembersCache.get(teamMemberId)?.memberOf ?? []),
                    teamId,
                  ];
                  teamMembersCache.set(teamMemberId, {
                    ...teamMember,
                    memberOf,
                  });
                }

                return arr;
              }, [] as string[]);

              teamsCache.set(teamId, team);
            }
          }
        }),
      ),
    );

    this.teams.set(cacheKey, teamsCache);
    this.teamMembers.set(cacheKey, teamMembersCache);
  }

  public async getDashboardPullRequests(
    projectName: string,
    options: PullRequestOptions,
    host?: string,
    org?: string,
  ): Promise<DashboardPullRequest[]> {
    const dashboardPullRequests =
      await this.azureDevOpsApi.getDashboardPullRequests(
        projectName,
        options,
        host,
        org,
      );

    await this.getAllTeams({ limit: options.teamsLimit, host, org }); // Make sure team members are loaded for the correct org

    const cacheKey = this.getCacheKey(host, org);
    const teamsCache = this.teams.get(cacheKey) ?? new Map<string, Team>();
    const teamMembersCache =
      this.teamMembers.get(cacheKey) ?? new Map<string, TeamMember>();

    return dashboardPullRequests.map(pr => {
      if (pr.createdBy?.id) {
        const teamIds = teamMembersCache.get(pr.createdBy.id)?.memberOf;
        pr.createdBy.teamIds = teamIds;
        pr.createdBy.teamNames = teamIds?.map(
          teamId => teamsCache.get(teamId)?.name ?? '',
        );
      }

      return pr;
    });
  }

  public async getUserTeamIds(
    email: string,
    host?: string,
    org?: string,
  ): Promise<string[]> {
    await this.getAllTeams({ host, org }); // Make sure team members are loaded for the correct org

    const cacheKey = this.getCacheKey(host, org);
    const teamMembersCache =
      this.teamMembers.get(cacheKey) ?? new Map<string, TeamMember>();

    return (
      Array.from(teamMembersCache.values()).find(
        teamMember => teamMember.uniqueName === email,
      )?.memberOf ?? []
    );
  }

  public async getAllTeams(options: {
    limit?: number;
    host?: string;
    org?: string;
  }): Promise<Team[]> {
    const cacheKey = this.getCacheKey(options.host, options.org);
    const teamsCache = this.teams.get(cacheKey);

    if (!teamsCache || teamsCache.size === 0) {
      const maxTeams = options?.limit ?? DEFAULT_TEAMS_LIMIT;
      await this.readTeams(maxTeams, options.host, options.org);
    }

    return Array.from(this.teams.get(cacheKey)?.values() ?? []);
  }
}
