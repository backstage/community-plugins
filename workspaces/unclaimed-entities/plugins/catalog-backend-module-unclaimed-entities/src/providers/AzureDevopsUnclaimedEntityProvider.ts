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

import {
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
  Entity,
} from '@backstage/catalog-model';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import { Config } from '@backstage/config';
import { LoggerService, SchedulerService } from '@backstage/backend-plugin-api';

/**
 * Configuration for Azure DevOps repository discovery
 */
export interface AzureDevopsUnclaimedEntityProviderConfig {
  /** Azure DevOps organization URL */
  organization: string;
  /** Personal access token for authentication */
  personalAccessToken: string;
  /** Optional project filter - if specified, only repositories from these projects will be included */
  projects?: string[];
  /** Schedule configuration for the provider */
  schedule?: {
    frequency: { minutes?: number; hours?: number; days?: number };
    timeout?: { minutes?: number };
  };
}

/**
 * Azure DevOps repository information
 */
interface AzureDevopsRepository {
  id: string;
  name: string;
  url: string;
  webUrl: string;
  project: {
    id: string;
    name: string;
  };
  defaultBranch: string;
  remoteUrl: string;
}

/**
 * Azure DevOps project information
 */
interface AzureDevopsProject {
  id: string;
  name: string;
  description?: string;
  url: string;
  state: string;
}

/**
 * Provider that discovers Azure DevOps repositories and creates Unclaimed catalog entities
 */
export class AzureDevopsUnclaimedEntityProvider implements EntityProvider {
  private readonly config: AzureDevopsUnclaimedEntityProviderConfig;
  private readonly logger: LoggerService;
  private connection?: EntityProviderConnection;

  static fromConfig(
    config: Config,
    options: {
      logger: LoggerService;
      scheduler: SchedulerService;
    },
  ): AzureDevopsUnclaimedEntityProvider {
    const providerConfig = config.getConfig(
      'catalog.providers.azureDevopsUnclaimed',
    );

    const organization = providerConfig.getString('organization');
    const personalAccessToken = providerConfig.getString('personalAccessToken');
    const projects = providerConfig.getOptionalStringArray('projects');

    const schedule = providerConfig.getOptionalConfig('schedule');
    const scheduleConfig = schedule
      ? {
          frequency: {
            minutes: schedule.getOptionalNumber('frequency.minutes'),
            hours: schedule.getOptionalNumber('frequency.hours'),
            days: schedule.getOptionalNumber('frequency.days'),
          },
          timeout: {
            minutes: schedule.getOptionalNumber('timeout.minutes'),
          },
        }
      : undefined;

    return new AzureDevopsUnclaimedEntityProvider(
      {
        organization,
        personalAccessToken,
        projects,
        schedule: scheduleConfig,
      },
      options,
    );
  }

  constructor(
    config: AzureDevopsUnclaimedEntityProviderConfig,
    private readonly options: {
      logger: LoggerService;
      scheduler: SchedulerService;
    },
  ) {
    this.config = config;
    this.logger = options.logger.child({
      target: this.getProviderName(),
    });
  }

  getProviderName(): string {
    return `AzureDevopsUnclaimedEntityProvider:${this.config.organization}`;
  }

  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
    // Schedule the initial refresh
    if (this.config.schedule) {
      this.options.scheduler.createScheduledTaskRunner({
        frequency: this.config.schedule.frequency,
        timeout: this.config.schedule.timeout || { minutes: 10 },
      });
    }
    // Perform initial refresh
    await this.refresh();
  }

  async refresh(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    this.logger.info(
      'Discovering Azure DevOps repositories for unclaimed entities',
    );

    try {
      const repositories = await this.getRepositories();
      const entities = await this.createUnclaimedEntities(repositories);

      await this.connection.applyMutation({
        type: 'full',
        entities: entities.map(entity => ({
          entity,
          locationKey: this.getProviderName(),
        })),
      });

      this.logger.info(
        `Discovered ${entities.length} unclaimed repositories from Azure DevOps`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to refresh Azure DevOps unclaimed entities',
        error,
      );
    }
  }

  private async getRepositories(): Promise<AzureDevopsRepository[]> {
    const baseUrl = `https://dev.azure.com/${this.config.organization}`;
    const auth = Buffer.from(`:${this.config.personalAccessToken}`).toString(
      'base64',
    );

    const headers = {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    };

    let projects: AzureDevopsProject[] = [];

    if (this.config.projects && this.config.projects.length > 0) {
      // Get specific projects
      projects = await Promise.all(
        this.config.projects.map(async projectName => {
          const response = await fetch(
            `${baseUrl}/_apis/projects/${encodeURIComponent(
              projectName,
            )}?api-version=6.0`,
            { headers },
          );

          if (!response.ok) {
            throw new Error(
              `Failed to fetch project ${projectName}: ${response.status} ${response.statusText}`,
            );
          }

          return response.json();
        }),
      );
    } else {
      // Get all projects
      const projectsResponse = await fetch(
        `${baseUrl}/_apis/projects?api-version=6.0`,
        { headers },
      );

      if (!projectsResponse.ok) {
        throw new Error(
          `Failed to fetch projects: ${projectsResponse.status} ${projectsResponse.statusText}`,
        );
      }

      const projectsData = await projectsResponse.json();
      projects = projectsData.value || [];
    }

    const allRepositories: AzureDevopsRepository[] = [];

    // Get repositories for each project
    for (const project of projects) {
      try {
        const repoResponse = await fetch(
          `${baseUrl}/${project.id}/_apis/git/repositories?api-version=6.0`,
          { headers },
        );

        if (!repoResponse.ok) {
          this.logger.warn(
            `Failed to fetch repositories for project ${project.name}: ${repoResponse.status}`,
          );
          continue;
        }

        const repoData = await repoResponse.json();
        const repositories = repoData.value || [];

        allRepositories.push(...repositories);
      } catch (error) {
        this.logger.warn(
          `Error fetching repositories for project ${project.name}:`,
          error,
        );
      }
    }

    return allRepositories;
  }

  private async createUnclaimedEntities(
    repositories: AzureDevopsRepository[],
  ): Promise<Entity[]> {
    const entities: Entity[] = [];

    for (const repo of repositories) {
      try {
        // Check if repository already has a catalog-info.yaml or similar
        const hasCatalogInfo = await this.checkForCatalogInfo(repo);

        if (hasCatalogInfo) {
          this.logger.debug(
            `Repository ${repo.name} already has catalog info, skipping`,
          );
          continue;
        }

        const entity = this.createUnclaimedEntity(repo);
        entities.push(entity);
      } catch (error) {
        this.logger.warn(`Failed to process repository ${repo.name}:`, error);
      }
    }

    return entities;
  }

  private async checkForCatalogInfo(
    repo: AzureDevopsRepository,
  ): Promise<boolean> {
    const auth = Buffer.from(`:${this.config.personalAccessToken}`).toString(
      'base64',
    );
    const headers = {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    };

    const catalogFiles = [
      'catalog-info.yaml',
      'catalog-info.yml',
      '.backstage/catalog-info.yaml',
      '.backstage/catalog-info.yml',
    ];

    for (const catalogFile of catalogFiles) {
      try {
        const response = await fetch(
          `${repo.url}/items?path=${encodeURIComponent(
            catalogFile,
          )}&api-version=6.0`,
          { headers },
        );

        if (response.ok) {
          this.logger.debug(
            `Found catalog file ${catalogFile} in repository ${repo.name}`,
          );
          return true;
        }
      } catch (error) {
        // Ignore errors when checking for catalog files
      }
    }

    return false;
  }

  private createUnclaimedEntity(repo: AzureDevopsRepository): Entity {
    const name = this.normalizeEntityName(repo.name);
    const namespace = this.normalizeEntityName(repo.project.name);

    const annotations: Record<string, string> = {
      [ANNOTATION_LOCATION]: `url:${repo.webUrl}`,
      [ANNOTATION_ORIGIN_LOCATION]: `url:${repo.webUrl}`,
      'azure.com/repository-id': repo.id,
      'azure.com/project-id': repo.project.id,
      'azure.com/project-name': repo.project.name,
      'azure.com/repository-url': repo.url,
      'azure.com/web-url': repo.webUrl,
    };

    if (repo.defaultBranch) {
      annotations['azure.com/default-branch'] = repo.defaultBranch;
    }

    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Unclaimed',
      metadata: {
        name,
        namespace,
        title: repo.name,
        description: `Unclaimed repository from Azure DevOps project ${repo.project.name}`,
        annotations,
        tags: ['unclaimed', 'azure-devops'],
        labels: {
          'backstage.io/unclaimed': 'true',
          'azure.com/project': repo.project.name,
        },
      },
      spec: {
        type: 'repository',
        lifecycle: 'unknown',
        owner: 'default',
      },
    };

    return entity;
  }

  private normalizeEntityName(name: string): string {
    // Backstage entity names must match: ^[a-zA-Z]([a-zA-Z0-9\-_]*[a-zA-Z0-9])?$
    return name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\-_]/g, '-')
      .replace(/^[^a-zA-Z]+/, '')
      .replace(/[^a-zA-Z0-9]+$/, '')
      .replace(/-+/g, '-');
  }
}
