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
  SchedulerService,
  SchedulerServiceTaskRunner,
  SchedulerServiceTaskInvocationDefinition,
} from '@backstage/backend-plugin-api';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { mockServices } from '@backstage/backend-test-utils';
import { AzureResourceProvider } from './AzureResourceProvider';
import { AzureResourceGraphClient } from '@backstage-community/plugin-azure-resources-node';

/**
 * Mock task runner that persists tasks for manual execution in tests
 */
class PersistingTaskRunner implements SchedulerServiceTaskRunner {
  private tasks: SchedulerServiceTaskInvocationDefinition[] = [];

  getTasks() {
    return this.tasks;
  }

  async run(task: SchedulerServiceTaskInvocationDefinition): Promise<void> {
    this.tasks.push(task);
  }
}

describe('AzureResourceProvider', () => {
  const logger = mockServices.logger.mock();
  let mockAzureClient: jest.Mocked<AzureResourceGraphClient>;
  let entityProviderConnection: jest.Mocked<EntityProviderConnection>;
  let schedule: PersistingTaskRunner;

  beforeEach(() => {
    jest.clearAllMocks();
    schedule = new PersistingTaskRunner();

    mockAzureClient = {
      resources: jest.fn(),
    } as unknown as jest.Mocked<AzureResourceGraphClient>;

    entityProviderConnection = {
      applyMutation: jest.fn(),
      refresh: jest.fn(),
    } as unknown as jest.Mocked<EntityProviderConnection>;
  });

  const createConfig = (overrides = {}) => {
    return new ConfigReader({
      id: 'test-provider',
      query: 'Resources | where type == "microsoft.storage/storageaccounts"',
      scope: {
        subscriptions: ['sub-1', 'sub-2'],
      },
      ...overrides,
    });
  };

  const createScheduler = (): SchedulerService => {
    return {
      createScheduledTaskRunner: jest.fn().mockReturnValue(schedule),
    } as unknown as SchedulerService;
  };

  describe('fromConfig', () => {
    it('should create provider with valid configuration', () => {
      const config = createConfig();
      const scheduler = createScheduler();

      const provider = AzureResourceProvider.fromConfig(
        scheduler,
        config,
        logger,
        mockAzureClient,
      );

      expect(provider).toBeInstanceOf(AzureResourceProvider);
      expect(provider.getProviderName()).toBe(
        'azure-resource-provider-test-provider',
      );
    });

    it('should throw error when config is missing', () => {
      const config = new ConfigReader({});
      const scheduler = createScheduler();

      expect(() =>
        AzureResourceProvider.fromConfig(
          scheduler,
          config,
          logger,
          mockAzureClient,
        ),
      ).toThrowErrorMatchingInlineSnapshot(
        `"Missing required config value at 'id' in 'mock-config'"`,
      );
    });

    it('should apply default schedule when not specified', () => {
      const config = createConfig();
      const mockScheduler = {
        createScheduledTaskRunner: jest.fn().mockReturnValue(schedule),
      } as unknown as SchedulerService;

      AzureResourceProvider.fromConfig(
        mockScheduler,
        config,
        logger,
        mockAzureClient,
      );

      expect(mockScheduler.createScheduledTaskRunner).toHaveBeenCalledWith({
        frequency: { hours: 5 },
        timeout: { minutes: 10 },
      });
    });

    it('should use custom schedule from configuration', () => {
      const config = new ConfigReader({
        id: 'test-provider',
        query: 'Resources',
        scope: {
          subscriptions: ['sub-1'],
        },
        schedule: {
          frequency: { hours: 1 },
          timeout: { minutes: 5 },
        },
      });
      const mockScheduler = {
        createScheduledTaskRunner: jest.fn().mockReturnValue(schedule),
      } as unknown as SchedulerService;

      AzureResourceProvider.fromConfig(
        mockScheduler,
        config,
        logger,
        mockAzureClient,
      );

      expect(mockScheduler.createScheduledTaskRunner).toHaveBeenCalledWith({
        frequency: { hours: 1 },
        timeout: { minutes: 5 },
      });
    });
    it('should throw execution when no query is configured', async () => {
      const config = new ConfigReader({
        id: 'test-provider',
        query: '',
        scope: {
          subscriptions: ['sub-1'],
        },
      });
      const scheduler = createScheduler();

      expect(() =>
        AzureResourceProvider.fromConfig(
          scheduler,
          config,
          logger,
          mockAzureClient,
        ),
      ).toThrowErrorMatchingInlineSnapshot(
        `"Invalid type in config for key 'query' in 'mock-config', got empty-string, wanted string"`,
      );
    });
  });

  describe('connect', () => {
    it('should connect and schedule task', async () => {
      const config = createConfig();
      const scheduler = createScheduler();

      const provider = AzureResourceProvider.fromConfig(
        scheduler,
        config,
        logger,
        mockAzureClient,
      );

      await provider.connect(entityProviderConnection);

      const tasks = schedule.getTasks();
      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe('azure-resource-provider-test-provider');
    });
  });

  describe('run', () => {
    it('should throw error when run() called before connect()', async () => {
      const config = createConfig();
      const scheduler = createScheduler();

      const provider = AzureResourceProvider.fromConfig(
        scheduler,
        config,
        logger,
        mockAzureClient,
      );

      await expect(provider.run()).rejects.toThrow('Not initialized');
    });

    it('should fetch resources and apply mutation', async () => {
      const config = createConfig();
      const scheduler = createScheduler();

      const mockResources = [
        {
          id: '/subscriptions/sub-1/resourceGroups/rg-1/providers/Microsoft.Storage/storageAccounts/storage1',
          name: 'storage1',
          type: 'microsoft.storage/storageaccounts',
          location: 'eastus',
        },
      ];

      // @ts-expect-error
      mockAzureClient.resources.mockResolvedValue({
        data: mockResources,
        skipToken: undefined,
      });

      const provider = AzureResourceProvider.fromConfig(
        scheduler,
        config,
        logger,
        mockAzureClient,
      );

      await provider.connect(entityProviderConnection);
      await provider.run();

      expect(mockAzureClient.resources).toHaveBeenCalledTimes(1);
      expect(mockAzureClient.resources).toHaveBeenCalledWith({
        subscriptions: ['sub-1', 'sub-2'],
        query: 'Resources | where type == "microsoft.storage/storageaccounts"',
        options: undefined,
      });

      expect(entityProviderConnection.applyMutation).toHaveBeenCalledTimes(1);
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: expect.arrayContaining([
          expect.objectContaining({
            locationKey: 'azure-resource-provider-test-provider:test-provider',
            entity: expect.objectContaining({
              kind: 'Resource',
              metadata: expect.objectContaining({
                name: 'storage1',
              }),
            }),
          }),
        ]),
      });
    });

    it('should handle pagination with skipToken', async () => {
      const config = createConfig();
      const scheduler = createScheduler();

      const page1Resources = [
        {
          id: '/subscriptions/sub-1/resourceGroups/rg-1/providers/Microsoft.Storage/storageAccounts/storage1',
          name: 'storage1',
          type: 'microsoft.storage/storageaccounts',
          location: 'eastus',
        },
      ];

      const page2Resources = [
        {
          id: '/subscriptions/sub-1/resourceGroups/rg-1/providers/Microsoft.Storage/storageAccounts/storage2',
          name: 'storage2',
          type: 'microsoft.storage/storageaccounts',
          location: 'westus',
        },
      ];

      (mockAzureClient.resources as jest.Mock)
        .mockResolvedValueOnce({
          data: page1Resources,
          skipToken: 'next-page-token',
        })
        .mockResolvedValueOnce({
          data: page2Resources,
          skipToken: undefined,
        });

      const provider = AzureResourceProvider.fromConfig(
        scheduler,
        config,
        logger,
        mockAzureClient,
      );

      await provider.connect(entityProviderConnection);
      await provider.run();

      expect(mockAzureClient.resources).toHaveBeenCalledTimes(2);
      expect(mockAzureClient.resources).toHaveBeenNthCalledWith(1, {
        subscriptions: ['sub-1', 'sub-2'],
        query: 'Resources | where type == "microsoft.storage/storageaccounts"',
        options: undefined,
      });
      expect(mockAzureClient.resources).toHaveBeenNthCalledWith(2, {
        subscriptions: ['sub-1', 'sub-2'],
        query: 'Resources | where type == "microsoft.storage/storageaccounts"',
        options: { skipToken: 'next-page-token' },
      });

      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: expect.arrayContaining([
          expect.objectContaining({
            entity: expect.objectContaining({
              metadata: expect.objectContaining({ name: 'storage1' }),
            }),
          }),
          expect.objectContaining({
            entity: expect.objectContaining({
              metadata: expect.objectContaining({ name: 'storage2' }),
            }),
          }),
        ]),
      });
    });

    it('should handle empty results', async () => {
      const config = createConfig();
      const scheduler = createScheduler();

      // @ts-expect-error
      mockAzureClient.resources.mockResolvedValue({
        data: [],
        skipToken: undefined,
      });

      const provider = AzureResourceProvider.fromConfig(
        scheduler,
        config,
        logger,
        mockAzureClient,
      );

      await provider.connect(entityProviderConnection);
      await provider.run();

      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [],
      });
    });

    it('should stop pagination at MAX_PAGES limit', async () => {
      const config = createConfig();
      const scheduler = createScheduler();

      // Mock always returning a skipToken to simulate infinite pagination
      (mockAzureClient.resources as jest.Mock).mockResolvedValue({
        data: [
          {
            id: '/subscriptions/sub-1/resourceGroups/rg-1/providers/Microsoft.Storage/storageAccounts/storage',
            name: 'storage',
            type: 'microsoft.storage/storageaccounts',
            location: 'eastus',
          },
        ],
        skipToken: 'always-next-page',
      });

      const provider = AzureResourceProvider.fromConfig(
        scheduler,
        config,
        logger,
        mockAzureClient,
      );

      await provider.connect(entityProviderConnection);
      await provider.run();

      // Should stop at MAX_PAGES (100)
      expect(mockAzureClient.resources).toHaveBeenCalledTimes(100);
      expect(logger.warn).toHaveBeenCalledWith(
        'Reached maximum page limit for pagination',
        expect.objectContaining({
          maxPages: 100,
        }),
      );
    });

    it('should throw error when a page fails mid-pagination', async () => {
      const config = createConfig();
      const scheduler = createScheduler();

      const page1Resources = [
        {
          id: '/subscriptions/sub-1/resourceGroups/rg-1/providers/Microsoft.Storage/storageAccounts/storage1',
          name: 'storage1',
          type: 'microsoft.storage/storageaccounts',
          location: 'eastus',
        },
      ];

      (mockAzureClient.resources as jest.Mock)
        .mockResolvedValueOnce({
          data: page1Resources,
          skipToken: 'next-page-token',
        })
        .mockRejectedValueOnce(new Error('Azure API rate limit exceeded'));

      const provider = AzureResourceProvider.fromConfig(
        scheduler,
        config,
        logger,
        mockAzureClient,
      );

      await provider.connect(entityProviderConnection);

      // Should throw instead of returning partial results
      // This prevents 'full' mutation from removing entities that weren't fetched
      await expect(provider.run()).rejects.toThrow(
        'Failed to retrieve resources from Azure Resource Graph on page 2',
      );

      expect(mockAzureClient.resources).toHaveBeenCalledTimes(2);
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to fetch page from Azure Resource Graph',
        expect.objectContaining({
          page: 2,
          resourcesBeforeError: 1,
        }),
      );

      // Should NOT apply mutation when pagination fails
      expect(entityProviderConnection.applyMutation).not.toHaveBeenCalled();
    });

    it('should throw error when first page fails', async () => {
      const config = createConfig();
      const scheduler = createScheduler();

      (mockAzureClient.resources as jest.Mock).mockRejectedValue(
        new Error('Authentication failed'),
      );

      const provider = AzureResourceProvider.fromConfig(
        scheduler,
        config,
        logger,
        mockAzureClient,
      );

      await provider.connect(entityProviderConnection);

      await expect(provider.run()).rejects.toThrow(
        'Failed to retrieve resources from Azure Resource Graph on page 1',
      );
      expect(entityProviderConnection.applyMutation).not.toHaveBeenCalled();
    });

    it('should handle mapping errors gracefully', async () => {
      const config = createConfig();
      const scheduler = createScheduler();

      const mockResources = [
        {
          id: '/subscriptions/sub-1/resourceGroups/rg-1/providers/Microsoft.Storage/storageAccounts/storage1',
          name: 'storage1',
          type: 'microsoft.storage/storageaccounts',
          location: 'eastus',
        },
        {
          id: '/invalid',
          name: 'invalid-vm',
          // Missing 'type' field - this will cause mapResource to return undefined
          location: 'centralus',
        },
        {
          id: '/subscriptions/sub-1/resourceGroups/rg-1/providers/Microsoft.Storage/storageAccounts/storage2',
          name: 'storage2',
          type: 'microsoft.storage/storageaccounts',
          location: 'westus',
        },
      ];

      // @ts-expect-error
      mockAzureClient.resources.mockResolvedValue({
        data: mockResources,
        skipToken: undefined,
      });

      const provider = AzureResourceProvider.fromConfig(
        scheduler,
        config,
        logger,
        mockAzureClient,
      );

      await provider.connect(entityProviderConnection);
      await provider.run();

      // When mapResource returns undefined (not throws), entities are silently filtered
      // So we validate that only valid entities are passed through

      // Should apply mutation with only successfully mapped entities
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: expect.arrayContaining([
          expect.objectContaining({
            entity: expect.objectContaining({
              metadata: expect.objectContaining({ name: 'storage1' }),
            }),
          }),
          expect.objectContaining({
            entity: expect.objectContaining({
              metadata: expect.objectContaining({ name: 'storage2' }),
            }),
          }),
        ]),
      });

      const mutation = (entityProviderConnection.applyMutation as jest.Mock)
        .mock.calls[0][0];

      // Should have only 2 entities (1 returned undefined due to missing type)
      expect(mutation.entities).toHaveLength(2);

      // Verify that 2 valid entities were mapped despite 3 resources
      expect(logger.info).toHaveBeenCalledWith(
        'Mapped resources to entities',
        expect.objectContaining({
          entitiesMapped: 2,
          totalResources: 3,
        }),
      );
    });

    it('should log appropriate info during successful run', async () => {
      const config = createConfig();
      const scheduler = createScheduler();

      const mockResources = [
        {
          id: '/subscriptions/sub-1/resourceGroups/rg-1/providers/Microsoft.Storage/storageAccounts/storage1',
          name: 'storage1',
          type: 'microsoft.storage/storageaccounts',
          location: 'eastus',
        },
        {
          id: '/subscriptions/sub-1/resourceGroups/rg-1/providers/Microsoft.Storage/storageAccounts/storage2',
          name: 'storage2',
          type: 'microsoft.storage/storageaccounts',
          location: 'westus',
        },
      ];

      // @ts-expect-error
      mockAzureClient.resources.mockResolvedValue({
        data: mockResources,
        skipToken: undefined,
      });

      const provider = AzureResourceProvider.fromConfig(
        scheduler,
        config,
        logger,
        mockAzureClient,
      );

      await provider.connect(entityProviderConnection);
      await provider.run();

      expect(logger.info).toHaveBeenCalledWith('Starting provider run');
      expect(logger.info).toHaveBeenCalledWith(
        'Retrieved resources from Azure Resource Graph',
        expect.objectContaining({
          totalResources: 2,
          totalPages: 1,
        }),
      );
      expect(logger.info).toHaveBeenCalledWith(
        'Mapped resources to entities',
        expect.objectContaining({
          entitiesMapped: 2,
          totalResources: 2,
        }),
      );
      expect(logger.info).toHaveBeenCalledWith(
        'Successfully ingested entities',
        expect.objectContaining({
          entitiesIngested: 2,
        }),
      );
    });

    it('should handle Azure API errors and rethrow', async () => {
      const config = createConfig();
      const scheduler = createScheduler();

      (mockAzureClient.resources as jest.Mock).mockRejectedValue(
        new Error('Azure authentication failed'),
      );

      const provider = AzureResourceProvider.fromConfig(
        scheduler,
        config,
        logger,
        mockAzureClient,
      );

      await provider.connect(entityProviderConnection);

      await expect(provider.run()).rejects.toThrow(
        'Failed to retrieve resources from Azure Resource Graph on page 1',
      );

      expect(logger.error).toHaveBeenCalledWith(
        'Error retrieving resources',
        expect.any(Error),
      );
    });
  });

  describe('scope configuration', () => {
    it('should query with management groups scope', async () => {
      const config = new ConfigReader({
        id: 'test-provider',
        query: 'Resources',
        scope: {
          managementGroups: ['mg-1', 'mg-2'],
        },
      });
      const scheduler = createScheduler();

      // @ts-expect-error
      mockAzureClient.resources.mockResolvedValue({
        data: [],
        skipToken: undefined,
      });

      const provider = AzureResourceProvider.fromConfig(
        scheduler,
        config,
        logger,
        mockAzureClient,
      );

      await provider.connect(entityProviderConnection);
      await provider.run();

      expect(mockAzureClient.resources).toHaveBeenCalledWith({
        managementGroups: ['mg-1', 'mg-2'],
        query: 'Resources',
        options: undefined,
      });
    });

    it('should query with both subscriptions and management groups', async () => {
      const config = new ConfigReader({
        id: 'test-provider',
        query: 'Resources',
        scope: {
          subscriptions: ['sub-1'],
          managementGroups: ['mg-1'],
        },
      });
      const scheduler = createScheduler();

      // @ts-expect-error
      mockAzureClient.resources.mockResolvedValue({
        data: [],
        skipToken: undefined,
      });

      const provider = AzureResourceProvider.fromConfig(
        scheduler,
        config,
        logger,
        mockAzureClient,
      );

      await provider.connect(entityProviderConnection);
      await provider.run();

      expect(mockAzureClient.resources).toHaveBeenCalledWith({
        subscriptions: ['sub-1'],
        managementGroups: ['mg-1'],
        query: 'Resources',
        options: undefined,
      });
    });
  });
});
