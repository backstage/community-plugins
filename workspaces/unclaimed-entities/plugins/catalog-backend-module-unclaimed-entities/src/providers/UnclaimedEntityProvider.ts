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
} from '@backstage/catalog-model';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import { Config } from '@backstage/config';
import {
  LoggerService,
  SchedulerService,
  SchedulerServiceTaskRunner,
} from '@backstage/backend-plugin-api';
import {
  ScmIntegrations,
  ScmIntegrationRegistry,
  DefaultAzureDevOpsCredentialsProvider,
} from '@backstage/integration';
import { UnclaimedEntity } from '../types/types';
import { AzureDevOpsClient } from '../clients/azure-client';
import { InputError } from '@backstage/errors';
/**
 * Configuration for scanning GitHub and Azure DevOps providers for unclaimed entities
 */
export interface UnclaimedEntityProviderConfig {
  /** Type of provider (github or azureDevOps) */
  providerType: 'github' | 'azureDevOps';
  /** Provider ID from the configuration */
  providerId: string;
  /** Organization/namespace to scan */
  organization: string;
  /** Project to scan (for Azure DevOps only) */
  project?: string;
  /** Host to scan (optional, defaults to provider default host) */
  host?: string;
  /** Schedule configuration for the provider */
  schedule?: {
    frequency: { minutes?: number; hours?: number; days?: number };
    timeout?: { minutes?: number };
  };
}

/**
 * Repository information from any SCM provider
 */
interface Repository {
  id: string;
  name: string;
  fullName: string;
  url: string;
  webUrl: string;
  defaultBranch: string;
  host: string;
  organization: string;
  project?: string;
}

/**
 * Generic provider that discovers repositories from existing integrations and creates Unclaimed catalog entities
 */
export class UnclaimedEntityProvider implements EntityProvider {
  private readonly config: UnclaimedEntityProviderConfig;
  private readonly logger: LoggerService;
  private readonly integrations: ScmIntegrationRegistry;
  private connection?: EntityProviderConnection;

  static fromConfig(
    config: Config,
    options: {
      logger: LoggerService;
      schedule?: SchedulerServiceTaskRunner;
      scheduler?: SchedulerService;
    },
  ): UnclaimedEntityProvider[] {
    const unclaimedEntitiesConfig = config.getConfig('UnclaimedEntities');
    const integrations = ScmIntegrations.fromConfig(config);

    const providers: UnclaimedEntityProvider[] = [];

    // Get global schedule configuration
    const globalSchedule =
      unclaimedEntitiesConfig.getOptionalConfig('schedule');
    const scheduleConfig = globalSchedule
      ? {
          frequency: {
            minutes: globalSchedule.getOptionalNumber('frequency.minutes'),
            hours: globalSchedule.getOptionalNumber('frequency.hours'),
            days: globalSchedule.getOptionalNumber('frequency.days'),
          },
          timeout: {
            minutes: globalSchedule.getOptionalNumber('timeout.minutes'),
          },
        }
      : undefined;

    // Process Azure DevOps providers
    const azureProviders =
      unclaimedEntitiesConfig.getOptionalStringArray('azureDevops') || [];
    for (const providerId of azureProviders) {
      try {
        const azureConfig = config.getConfig(
          `catalog.providers.azureDevOps.${providerId}`,
        );
        const organization = azureConfig.getString('organization');
        const project = azureConfig.getOptionalString('project');
        const host = azureConfig.getOptionalString('host') || 'dev.azure.com';

        providers.push(
          new UnclaimedEntityProvider(
            {
              providerType: 'azureDevOps',
              providerId,
              organization,
              project,
              host,
              schedule: scheduleConfig,
            },
            options,
            integrations,
          ),
        );
      } catch (error) {
        options.logger.warn(
          `Failed to create Azure DevOps provider for ${providerId}:`,
          error,
        );
      }
    }

    // Process GitHub providers
    const githubProviders =
      unclaimedEntitiesConfig.getOptionalStringArray('github') || [];
    for (const providerId of githubProviders) {
      try {
        const githubConfig = config.getConfig(
          `catalog.providers.github.${providerId}`,
        );
        const organization = githubConfig.getString('organization');
        const host = githubConfig.getOptionalString('host') || 'github.com';

        providers.push(
          new UnclaimedEntityProvider(
            {
              providerType: 'github',
              providerId,
              organization,
              host,
              schedule: scheduleConfig,
            },
            options,
            integrations,
          ),
        );
      } catch (error) {
        options.logger.warn(
          `Failed to create GitHub provider for ${providerId}:`,
          error,
        );
      }
    }

    if (providers.length === 0) {
      options.logger.warn(
        'No unclaimed entity providers were created from configuration',
      );
    } else {
      options.logger.info(
        `Created ${providers.length} unclaimed entity providers`,
      );
    }

    return providers;
  }

  constructor(
    config: UnclaimedEntityProviderConfig,
    options: {
      logger: LoggerService;
      schedule?: SchedulerServiceTaskRunner;
      scheduler?: SchedulerService;
    },
    integrations: ScmIntegrationRegistry,
  ) {
    this.config = config;
    this.logger = options.logger.child({
      target: this.getProviderName(),
    });
    this.integrations = integrations;
  }

  getProviderName(): string {
    return `UnclaimedEntityProvider:${this.config.providerType}:${this.config.providerId}`;
  }

  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
    // Perform initial refresh
    await this.refresh();
  }

  async refresh(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    this.logger.info(
      `Discovering repositories for unclaimed entities from ${this.config.providerType} provider (${this.config.providerId})`,
    );

    try {
      const repositories = await this.getRepositoriesForProvider();
      this.logger.info(
        `Found ${repositories.length} repositories from ${this.config.providerType} provider (${this.config.providerId})`,
      );

      const entities = await this.createUnclaimedEntities(repositories);

      await this.connection.applyMutation({
        type: 'full',
        entities: entities.map(entity => ({
          entity,
          locationKey: this.getProviderName(),
        })),
      });

      this.logger.info(
        `Discovered ${entities.length} unclaimed repositories from ${this.config.providerType} provider (${this.config.providerId})`,
      );
    } catch (error) {
      this.logger.error('Failed to refresh unclaimed entities', error);
    }
  }

  private async getRepositoriesForProvider(): Promise<Repository[]> {
    const integration = this.integrations.byHost(
      this.config.host || this.getDefaultHost(this.config.providerType),
    );

    if (!integration) {
      throw new Error(
        `No integration found for ${this.config.providerType} provider`,
      );
    }

    switch (this.config.providerType.toLowerCase()) {
      case 'github':
        return this.getGitHubRepositories(integration);
      case 'azuredevops':
        return this.getAzureDevOpsRepositories(integration);
      default:
        throw new Error(
          `Unsupported provider type: ${this.config.providerType}`,
        );
    }
  }

  private getDefaultHost(type: string): string {
    switch (type.toLowerCase()) {
      case 'github':
        return 'github.com';
      case 'azure':
      case 'azuredevops':
        return 'dev.azure.com';
      default:
        throw new Error(`Unknown provider type: ${type}`);
    }
  }

  private async getGitHubRepositories(integration: any): Promise<Repository[]> {
    const organization = this.config.organization;
    if (!organization) {
      throw new Error(
        `GitHub provider ${this.config.providerId} requires organization configuration`,
      );
    }

    const baseUrl = `https://api.${integration.config.host || 'github.com'}`;
    const token = integration.config.token;
    const headers = {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    };

    const response = await fetch(
      `${baseUrl}/orgs/${organization}/repos?per_page=100&type=all`,
      { headers },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch GitHub repositories: ${response.status} ${response.statusText}`,
      );
    }

    const repos = await response.json();
    return repos.map((repo: any) => ({
      id: repo.id.toString(),
      name: repo.name,
      fullName: repo.full_name,
      url: repo.url,
      webUrl: repo.html_url,
      defaultBranch: repo.default_branch,
      host: integration.config.host || 'github.com',
      organization,
    }));
  }

  private async getAzureDevOpsRepositories(
    _integration: any,
  ): Promise<Repository[]> {
    const { organization, project } = this.config;
    if (!organization) {
      throw new Error(
        `Azure DevOps provider ${this.config.providerId} requires organization configuration`,
      );
    }

    const host = this.config.host || 'dev.azure.com';
    const url = `https://${host}/${organization}`;

    const credentialProvider =
      DefaultAzureDevOpsCredentialsProvider.fromIntegrations(this.integrations);
    const credentials = await credentialProvider.getCredentials({ url: url });

    if (credentials === undefined) {
      throw new InputError(
        `No credentials provided for ${url}, please check your integrations config`,
      );
    }

    const azureClient = new AzureDevOpsClient(
      {
        organization,
        project,
        host: this.config.host,
      },
      this.logger,
      credentials,
    );

    try {
      const repositories = await azureClient.getRepositories();
      return repositories.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.fullName,
        url: repo.url,
        webUrl: repo.webUrl,
        defaultBranch: repo.defaultBranch,
        host: repo.host,
        organization: repo.organization,
        project: repo.project,
      }));
    } catch (error) {
      this.logger.error(
        `Failed to fetch repositories from Azure DevOps:`,
        error,
      );
      throw error;
    }
  }

  private async createUnclaimedEntities(
    repositories: Repository[],
  ): Promise<UnclaimedEntity[]> {
    const entities: UnclaimedEntity[] = [];

    for (const repo of repositories) {
      try {
        // Check if repository already has a catalog-info.yaml or similar
        const hasCatalogInfo = await this.checkForCatalogInfo(repo);

        if (hasCatalogInfo) {
          this.logger.debug(
            `Repository ${repo.fullName} already has catalog info, skipping`,
          );
          continue;
        }

        const entity = this.createUnclaimedEntity(repo);
        entities.push(entity);
      } catch (error) {
        this.logger.warn(
          `Failed to process repository ${repo.fullName}:`,
          error,
        );
      }
    }

    return entities;
  }

  private async checkForCatalogInfo(repo: Repository): Promise<boolean> {
    const integration = this.integrations.byHost(repo.host);
    if (!integration) {
      return false;
    }

    const catalogFiles = [
      'catalog-info.yaml',
      'catalog-info.yml',
      '.backstage/catalog-info.yaml',
      '.backstage/catalog-info.yml',
    ];

    // For Azure DevOps repositories, use the Azure client to check for files
    if (repo.host === 'dev.azure.com' || repo.host?.includes('azure')) {
      try {
        const url = `https://${repo.host}/${repo.organization}`;
        const credentialProvider =
          DefaultAzureDevOpsCredentialsProvider.fromIntegrations(
            this.integrations,
          );
        const credentials = await credentialProvider.getCredentials({ url });

        if (credentials) {
          const azureClient = new AzureDevOpsClient(
            {
              organization: repo.organization,
              project: repo.project,
              host: repo.host,
            },
            this.logger,
            credentials,
          );

          for (const catalogFile of catalogFiles) {
            try {
              const fileExists = await azureClient.checkFileExists(
                repo.project || repo.organization,
                repo.id,
                catalogFile,
              );
              if (fileExists) {
                this.logger.debug(
                  `Found catalog file ${catalogFile} in repository ${repo.fullName}`,
                );
                return true;
              }
            } catch (error) {
              // Continue checking other files
              this.logger.debug(
                `Error checking ${catalogFile} in repository ${repo.fullName}:`,
                error,
              );
            }
          }
        }
      } catch (error) {
        this.logger.debug(
          `Failed to check catalog files for Azure DevOps repository ${repo.fullName}:`,
          error,
        );
      }
    }

    // For other providers, implement basic checks (placeholder for now)
    for (const catalogFile of catalogFiles) {
      try {
        // This is a simplified check - in practice, you'd need to implement
        // provider-specific file checking logic for GitHub, GitLab, etc.
        const hasFile = false;
        if (hasFile) {
          this.logger.debug(
            `Found catalog file ${catalogFile} in repository ${repo.fullName}`,
          );
          return true;
        }
      } catch (error) {
        // Ignore errors when checking for catalog files
      }
    }

    return false;
  }

  private createUnclaimedEntity(repo: Repository): UnclaimedEntity {
    const name = this.normalizeEntityName(repo.name);
    const namespace = this.normalizeEntityName(repo.organization);

    const annotations: Record<string, string> = {
      [ANNOTATION_LOCATION]: `url:${repo.webUrl}`,
      [ANNOTATION_ORIGIN_LOCATION]: `url:${repo.webUrl}`,
      'scm.host': repo.host,
      'scm.organization': repo.organization,
      'scm.repository-id': repo.id,
      'scm.repository-url': repo.url,
      'scm.web-url': repo.webUrl,
    };

    if (repo.defaultBranch) {
      annotations['scm.default-branch'] = repo.defaultBranch;
    }

    if (repo.project) {
      annotations['scm.project'] = repo.project;
    }

    const entity: UnclaimedEntity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Unclaimed',
      metadata: {
        name,
        namespace,
        title: repo.name,
        description: `Unclaimed repository from ${repo.host}/${repo.fullName}`,
        annotations,
        tags: ['repository'],
        labels: {
          'backstage.io/unclaimed': 'true',
          'scm.host': repo.host,
          'scm.organization': repo.organization,
        },
      },
      spec: {
        type: 'repository',
        lifecycle: 'unknown',
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
