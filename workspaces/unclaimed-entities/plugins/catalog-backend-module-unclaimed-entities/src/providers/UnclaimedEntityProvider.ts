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
  /** List of catalog configuration IDs to scan for unclaimed entities */
  catalogconfigurations: string[];
  /** Schedule configuration for the provider */
  schedule?: {
    frequency: { minutes?: number; hours?: number; days?: number };
    timeout?: { minutes?: number };
  };
}

/**
 * Provider configuration extracted from existing catalog providers
 */
interface ExtractedProviderConfig {
  /** Type of provider (github or azure) */
  type: 'github' | 'azure';
  /** Configuration ID from catalog.providers */
  id: string;
  /** Host to scan (optional, defaults to provider default host) */
  host?: string;
  /** Organization/namespace to scan */
  organization?: string;
  /** Project to scan (for Azure DevOps only) */
  project?: string;
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
  ): UnclaimedEntityProvider {
    const providerConfig = config.getConfig('UnclaimedEntities');

    const catalogconfigurations = providerConfig.getStringArray(
      'catalogconfigurations',
    );

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

    const integrations = ScmIntegrations.fromConfig(config);

    // I need to return an array of UnclaimedEntityProvider instances
    // and each instance should be configured with the catalog configurations
    // https://github.com/backstage/backstage/blob/master/plugins/catalog-backend-module-azure/src/providers/AzureDevOpsEntityProvider.ts
    return new UnclaimedEntityProvider(
      {
        catalogconfigurations,
        schedule: scheduleConfig,
      },
      options,
      integrations,
      config,
    );
  }

  constructor(
    config: UnclaimedEntityProviderConfig,
    options: {
      logger: LoggerService;
      schedule?: SchedulerServiceTaskRunner;
      scheduler?: SchedulerService;
    },
    integrations: ScmIntegrationRegistry,
    private readonly rootConfig: Config,
  ) {
    this.config = config;
    this.logger = options.logger.child({
      target: this.getProviderName(),
    });
    this.integrations = integrations;
  }

  getProviderName(): string {
    return 'UnclaimedEntityProvider';
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

    this.logger.info('Discovering repositories for unclaimed entities');

    try {
      const allRepositories: Repository[] = [];

      // Extract provider configurations from existing catalog providers
      const extractedProviders = this.extractProviderConfigs();

      for (const providerConfig of extractedProviders) {
        try {
          const repositories = await this.getRepositoriesForProvider(
            providerConfig,
          );
          allRepositories.push(...repositories);
          this.logger.info(
            `Found ${repositories.length} repositories from ${providerConfig.type} provider (${providerConfig.id})`,
          );
        } catch (error) {
          this.logger.warn(
            `Failed to fetch repositories from ${providerConfig.type} provider (${providerConfig.id}):`,
            error,
          );
        }
      }

      const entities = await this.createUnclaimedEntities(allRepositories);

      await this.connection.applyMutation({
        type: 'full',
        entities: entities.map(entity => ({
          entity,
          locationKey: this.getProviderName(),
        })),
      });

      this.logger.info(
        `Discovered ${entities.length} unclaimed repositories from ${extractedProviders.length} providers`,
      );
    } catch (error) {
      this.logger.error('Failed to refresh unclaimed entities', error);
    }
  }

  private extractProviderConfigs(): ExtractedProviderConfig[] {
    const extractedProviders: ExtractedProviderConfig[] = [];

    for (const configId of this.config.catalogconfigurations) {
      try {
        // Try to find Azure DevOps provider with this ID
        const azureProviders = this.rootConfig.getOptionalConfig(
          `catalog.providers.azureDevOps.${configId}`,
        );
        if (azureProviders) {
          extractedProviders.push({
            type: 'azure',
            id: configId,
            organization: azureProviders.getOptionalString('organization'),
            project: azureProviders.getOptionalString('project'),
            host: azureProviders.getOptionalString('host') || 'dev.azure.com',
          });
          continue;
        }
      } catch (error) {
        this.logger.warn(
          `Failed to extract configuration for provider ${configId}:`,
          error,
        );
      }
    }

    if (extractedProviders.length === 0) {
      this.logger.warn(
        `No valid provider configurations found for IDs: ${this.config.catalogconfigurations.join(
          ', ',
        )}`,
      );
    }

    return extractedProviders;
  }

  private async getRepositoriesForProvider(
    providerConfig: ExtractedProviderConfig,
  ): Promise<Repository[]> {
    const integration = this.integrations.byHost(
      providerConfig.host || this.getDefaultHost(providerConfig.type),
    );

    if (!integration) {
      throw new Error(
        `No integration found for ${providerConfig.type} provider`,
      );
    }

    switch (providerConfig.type.toLowerCase()) {
      case 'github':
        return this.getGitHubRepositories(integration, providerConfig);
      case 'azure':
      case 'azuredevops':
        return this.getAzureDevOpsRepositories(integration, providerConfig);
      default:
        throw new Error(`Unsupported provider type: ${providerConfig.type}`);
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

  private async getGitHubRepositories(
    integration: any,
    providerConfig: ExtractedProviderConfig,
  ): Promise<Repository[]> {
    // For GitHub, we need to determine the organization from the integration or provider config
    // We'll try to extract it from the existing GitHub integration config
    let organization = providerConfig.organization;
    if (!organization) {
      // Try to extract organization from existing GitHub provider configurations
      try {
        const githubConfig =
          this.rootConfig.getOptionalConfig(`integrations.github`);
        if (githubConfig) {
          // This is a simplified approach - in practice you might need more sophisticated logic
          // to match the right GitHub integration based on the provider ID
          organization = this.extractOrganizationFromGitHubConfig(
            providerConfig.id,
          );
        }
      } catch (error) {
        this.logger.warn(
          `Could not extract organization for GitHub provider ${providerConfig.id}:`,
          error,
        );
      }
    }

    if (!organization) {
      throw new Error(
        `GitHub provider ${providerConfig.id} requires organization configuration`,
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

  private extractOrganizationFromGitHubConfig(
    providerId: string,
  ): string | undefined {
    // This method attempts to extract organization information from various sources

    // Try to get organization from environment variables
    try {
      // Try specific patterns for organization extraction
      const envPatterns = [
        `GITHUB_ORG_${providerId.toUpperCase().replace(/-/g, '_')}`,
        `${providerId.toUpperCase().replace(/-/g, '_')}_ORG`,
        'GITHUB_ORG',
        'GITHUB_ORGANIZATION',
      ];

      for (const pattern of envPatterns) {
        const value = process.env[pattern];
        if (value) {
          return value;
        }
      }

      // If the provider ID looks like an organization name itself
      if (
        providerId &&
        !providerId.includes('github') &&
        !providerId.includes('com')
      ) {
        return providerId;
      }
    } catch {
      // Fallback to undefined
    }

    return undefined;
  }

  private async getAzureDevOpsRepositories(
    _integration: any,
    providerConfig: ExtractedProviderConfig,
  ): Promise<Repository[]> {
    const { organization, project } = providerConfig;
    if (!organization) {
      throw new Error(
        `Azure DevOps provider ${providerConfig.id} requires organization configuration`,
      );
    }

    const host = providerConfig.host || 'dev.azure.com';
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
        host: providerConfig.host,
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
