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
import { Entity } from '@backstage/catalog-model';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import {
  LoggerService,
  SchedulerService,
  SchedulerServiceTaskRunner,
} from '@backstage/backend-plugin-api';
import { AzureResourceGraphClient } from '@backstage-community/plugin-azure-resources-node';
import type { Config } from '@backstage/config';
import { mapResource } from '../mapper/default-resource-mapper';
import {
  AzureResourcesProviderConfig,
  readProviderConfig,
} from '../lib/config';
import * as uuid from 'uuid';

const DEFAULT_SCHEDULE = {
  frequency: { hours: 5 },
  timeout: { minutes: 10 },
};

/**
 * Default maximum number of pages to fetch from Azure Resource Graph to prevent infinite loops.
 * With a default page size of 1000, this allows up to 100,000 resources.
 */
const DEFAULT_MAX_PAGES = 100;

/**
 * Provides entities from Azure resources based on custom KQL queries.
 * Uses ResourceMapper pattern to transform Azure resources into Backstage entities.
 */
export class AzureResourceProvider implements EntityProvider {
  private connection?: EntityProviderConnection;
  private readonly taskRunner: SchedulerServiceTaskRunner;
  private readonly config: AzureResourcesProviderConfig;
  private readonly logger: LoggerService;
  private readonly azureClient: AzureResourceGraphClient;

  static fromConfig(
    scheduler: SchedulerService,
    config: Config,
    logger: LoggerService,
    azureClient: AzureResourceGraphClient,
  ): AzureResourceProvider {
    const providerConfig = readProviderConfig(config);

    const taskRunner = scheduler.createScheduledTaskRunner(
      providerConfig.schedule ?? DEFAULT_SCHEDULE,
    );

    return new AzureResourceProvider({
      taskRunner,
      config: providerConfig,
      logger,
      azureClient,
    });
  }
  constructor(options: {
    taskRunner: SchedulerServiceTaskRunner;
    config: AzureResourcesProviderConfig;
    logger: LoggerService;
    azureClient: AzureResourceGraphClient;
  }) {
    this.taskRunner = options.taskRunner;
    this.config = options.config;
    this.logger = options.logger;
    this.azureClient = options.azureClient;
  }

  /**
   * Gets the provider name, using the config ID if available.
   */
  getProviderName(): string {
    return this.config.id
      ? `azure-resource-provider-${this.config.id}`
      : 'azure-resource-provider';
  }

  /**
   * Connects to the catalog and schedules the provider to run.
   */
  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
    const id = `${this.getProviderName()}:refresh`;
    await this.taskRunner.run({
      id: this.getProviderName(),
      fn: async () => {
        const logger = this.logger.child({
          class: AzureResourceProvider.prototype.constructor.name,
          taskId: id,
          taskInstanceId: uuid.v4(),
        });

        try {
          await this.run();
        } catch (error) {
          logger.error('Failed to run Azure resource provider', error);
          // Re-throw to let the scheduler handle the error
          throw error;
        }
      },
    });
  }

  /**
   * Retrieves all resources from Azure Resource Graph with automatic pagination.
   * Handles the skipToken to fetch all pages of results.
   *
   * @private
   * @returns Promise<any[]> All resources across all pages
   * @throws Error if the Azure Resource Graph API fails and no resources were retrieved
   */
  private async getResources(): Promise<any[]> {
    const allResources: any[] = [];
    let skipToken: string | undefined;
    let pageCount = 0;
    const maxPages = this.config.maxPages ?? DEFAULT_MAX_PAGES;

    try {
      do {
        pageCount++;

        // Safety check to prevent infinite loops
        if (pageCount > maxPages) {
          this.logger.warn('Reached maximum page limit for pagination', {
            maxPages,
            resourcesCollected: allResources.length,
          });
          break;
        }

        this.logger.debug('Fetching resources page', {
          page: pageCount,
          hasSkipToken: !!skipToken,
        });

        try {
          const response = await this.azureClient.resources({
            ...this.config.scope,
            query: this.config.query,
            options: skipToken ? { skipToken } : undefined,
          });

          // Extract resources from the response data property
          const resources = response.data || [];
          const resultCount = resources.length;

          allResources.push(...resources);

          // Get the skipToken from the response for the next page
          skipToken = response.skipToken;

          this.logger.debug('Fetched resources page', {
            page: pageCount,
            resourcesInPage: resultCount,
            totalResources: allResources.length,
            hasMorePages: !!skipToken,
          });
        } catch (pageError) {
          this.logger.error('Failed to fetch page from Azure Resource Graph', {
            page: pageCount,
            resourcesBeforeError: allResources.length,
            details: pageError?.body?.error?.details,
          });

          // Always throw on pagination failure to prevent partial data from being applied
          // Using 'full' mutation type with partial data would remove existing entities
          throw new Error(
            `Failed to retrieve resources from Azure Resource Graph on page ${pageCount}: ${
              pageError instanceof Error ? pageError.message : String(pageError)
            }`,
          );
        }
      } while (skipToken);

      this.logger.info('Retrieved resources from Azure Resource Graph', {
        totalResources: allResources.length,
        totalPages: pageCount,
      });

      return allResources;
    } catch (error) {
      this.logger.error('Error retrieving resources', error);
      throw error;
    }
  }

  /**
   * Executes the provider: queries Azure resources and applies them to the catalog.
   * Handles errors gracefully for individual resource mapping failures.
   */
  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    if (!this.config.query) {
      this.logger.warn('No query configured, skipping execution');
      return;
    }

    this.logger.info('Starting provider run');

    const resources = await this.getResources();

    // Map each Azure resource to a Backstage entity, filtering out undefined results
    let mappingErrors = 0;
    const entities: Entity[] = resources
      .map(res => {
        try {
          return mapResource(
            res,
            this.config.id,
            this.config.mapping,
            this.config.defaultOwner,
          );
        } catch (mappingError) {
          mappingErrors++;
          this.logger.warn('Failed to map resource to entity', {
            resourceId: res.id || 'unknown',
            resourceType: res.type,
          });
          return undefined;
        }
      })
      .filter(
        (entity: Entity | undefined): entity is Entity => entity !== undefined,
      );

    if (mappingErrors > 0) {
      this.logger.warn('Skipped resources due to mapping errors', {
        mappingErrors,
        totalResources: resources.length,
      });
    }

    this.logger.info('Mapped resources to entities', {
      entitiesMapped: entities.length,
      totalResources: resources.length,
    });

    // Apply the full mutation to the catalog
    await this.connection.applyMutation({
      type: 'full',
      entities: entities.map(entity => ({
        entity,
        locationKey: `${this.getProviderName()}:${this.config.id}`,
      })),
    });

    this.logger.info('Successfully ingested entities', {
      entitiesIngested: entities.length,
    });
  }
}
