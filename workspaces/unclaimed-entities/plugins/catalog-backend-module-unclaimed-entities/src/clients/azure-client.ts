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

import * as azdev from 'azure-devops-node-api';
import { GitRepository } from 'azure-devops-node-api/interfaces/GitInterfaces';
import { TeamProject } from 'azure-devops-node-api/interfaces/CoreInterfaces';
import { LoggerService } from '@backstage/backend-plugin-api';
import { AzureDevOpsCredentials } from '@backstage/integration';

export interface AzureRepository {
  id: string;
  name: string;
  fullName: string;
  url: string;
  webUrl: string;
  defaultBranch: string;
  host: string;
  organization: string;
  project: string;
}

export interface AzureClientConfig {
  organization: string;
  project?: string;
  host?: string;
}

export class AzureDevOpsClient {
  private readonly connection: azdev.WebApi;
  private readonly logger: LoggerService;
  private readonly config: AzureClientConfig;

  constructor(
    config: AzureClientConfig,
    logger: LoggerService,
    credentials: AzureDevOpsCredentials,
  ) {
    this.config = config;
    this.logger = logger;

    const serverUrl = `https://${config.host || 'dev.azure.com'}/${
      config.organization
    }`;

    const authHandler = azdev.getPersonalAccessTokenHandler(credentials.token);

    this.connection = new azdev.WebApi(serverUrl, authHandler);
  }

  async getRepositories(): Promise<AzureRepository[]> {
    const repositories: AzureRepository[] = [];

    try {
      if (this.config.project && this.config.project !== '*') {
        // Get repositories for specific project
        const projectRepos = await this.getRepositoriesForProject(
          this.config.project,
        );
        repositories.push(...projectRepos);
      } else {
        // Get all projects and their repositories
        const projects = await this.getAllProjects();

        for (const project of projects) {
          if (project.name) {
            try {
              const projectRepos = await this.getRepositoriesForProject(
                project.name,
              );
              repositories.push(...projectRepos);
            } catch (error) {
              this.logger.warn(
                `Failed to fetch repositories for project ${project.name}:`,
                error,
              );
            }
          }
        }
      }
    } catch (error) {
      this.logger.error('Failed to fetch Azure DevOps repositories:', error);
      throw error;
    }

    return repositories;
  }

  private async getRepositoriesForProject(
    projectName: string,
  ): Promise<AzureRepository[]> {
    const gitApi = await this.connection.getGitApi();
    const repositories: GitRepository[] = await gitApi.getRepositories(
      projectName,
    );

    if (!repositories || repositories.length === 0) {
      this.logger.warn(
        `No repositories found for project ${projectName}. Please check the project name and permissions.`,
      );
      return [];
    }

    this.logger.info(
      `Fetched ${repositories.length} repositories for project ${projectName}`,
    );

    // Filter out repositories that already have catalog-info.yaml files
    const unclaimedRepositories: AzureRepository[] = [];
    const catalogFiles = [
      'catalog-info.yaml',
      'catalog-info.yml',
      '.backstage/catalog-info.yaml',
      '.backstage/catalog-info.yml',
    ];

    for (const repo of repositories) {
      if (!repo.id) {
        continue;
      }

      let hasCatalogFile = false;

      // Check if any catalog file exists in the repository
      for (const catalogFile of catalogFiles) {
        try {
          const fileExists = await this.checkFileExists(
            projectName,
            repo.id,
            catalogFile,
          );
          if (fileExists) {
            hasCatalogFile = true;
            this.logger.debug(
              `Repository ${repo.name} has ${catalogFile}, excluding from unclaimed entities`,
            );
            break;
          }
        } catch (error) {
          // Continue checking other files if one fails
          this.logger.debug(
            `Error checking ${catalogFile} in repository ${repo.name}:`,
            error,
          );
        }
      }

      // Only include repositories that don't have catalog files
      if (!hasCatalogFile) {
        unclaimedRepositories.push(
          this.mapToAzureRepository(repo, projectName),
        );
      }
    }

    this.logger.info(
      `Found ${unclaimedRepositories.length} unclaimed repositories out of ${repositories.length} total repositories in project ${projectName}`,
    );

    return unclaimedRepositories;
  }

  private async getAllProjects(): Promise<TeamProject[]> {
    const coreApi = await this.connection.getCoreApi();
    const projects = await coreApi.getProjects();
    return projects || [];
  }

  async checkFileExists(
    projectName: string,
    repositoryId: string,
    filePath: string,
  ): Promise<boolean> {
    try {
      const gitApi = await this.connection.getGitApi();

      // Try to get the file content to check if it exists
      const item = await gitApi.getItem(repositoryId, filePath, projectName);

      return !!item;
    } catch (error) {
      // File doesn't exist or other error
      return false;
    }
  }

  private mapToAzureRepository(
    repo: GitRepository,
    projectName: string,
  ): AzureRepository {
    const organization = this.config.organization;
    const host = this.config.host || 'dev.azure.com';

    return {
      id: repo.id || '',
      name: repo.name || '',
      fullName: `${organization}/${projectName}/${repo.name}`,
      url: repo.url || '',
      webUrl: repo.webUrl || '',
      defaultBranch: repo.defaultBranch || 'main',
      host,
      organization,
      project: projectName,
    };
  }
}
