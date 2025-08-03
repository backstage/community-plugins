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
    private readonly credentials: AzureDevOpsCredentials,
  ) {
    this.config = config;
    this.logger = logger;
    this.credentials = credentials;

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

    return repositories.map(repo =>
      this.mapToAzureRepository(repo, projectName),
    );
  }

  private async getAllProjects(): Promise<TeamProject[]> {
    const coreApi = await this.connection.getCoreApi();
    const projects = await coreApi.getProjects();
    this.logger.error(`Fetched projects: ${projects.length}`);
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
      const item = await gitApi.getItem(
        repositoryId,
        filePath,
        projectName,
        undefined, // scopePath
        undefined, // recursionLevel
        false, // includeContentMetadata
        false, // latestProcessedChange
        false, // download
        undefined, // versionDescriptor
        false, // includeContent
        false, // resolveLfs
      );

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
