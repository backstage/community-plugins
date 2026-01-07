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

import type { Entity } from '@backstage/catalog-model';
import { CatalogClient } from '@backstage/catalog-client';
import type { NotificationService } from '@backstage/plugin-notifications-node';
import { mockServices } from '@backstage/backend-test-utils';

import {
  handleTemplateUpdateNotifications,
  readScaffolderRelationProcessorConfig,
} from './templateVersionUtils';
import {
  DEFAULT_NOTIFICATION_DESCRIPTION,
  DEFAULT_NOTIFICATION_DESCRIPTION_WITH_PR,
  DEFAULT_NOTIFICATION_ENABLED,
  DEFAULT_NOTIFICATION_TITLE,
  DEFAULT_NOTIFICATION_TITLE_WITH_PR,
  DEFAULT_PR_ENABLED,
} from './constants';
import { VcsProviderRegistry } from './pullRequests/vcs/VcsProviderRegistry';
import * as pullRequestsModule from './pullRequests';

// Mock the pullRequests module
jest.mock('./pullRequests');

// Mock external dependencies
jest.mock('@backstage/catalog-client');

describe('templateVersionUtils', () => {
  let mockCatalogClient: jest.Mocked<CatalogClient>;
  let mockNotificationService: jest.Mocked<NotificationService>;
  let mockVcsRegistry: VcsProviderRegistry;
  const mockAuthService = mockServices.auth();
  const mockLogger = mockServices.logger.mock();
  const mockUrlReader = mockServices.urlReader.mock();
  const mockConfig = mockServices.rootConfig();
  const mockProcessorConfig = {
    notifications: {
      templateUpdate: {
        enabled: DEFAULT_NOTIFICATION_ENABLED,
        message: {
          title: DEFAULT_NOTIFICATION_TITLE,
          description: DEFAULT_NOTIFICATION_DESCRIPTION,
        },
      },
    },
    pullRequests: {
      templateUpdate: {
        enabled: DEFAULT_PR_ENABLED,
      },
    },
  };

  const mockProcessorConfigWithNotificationsEnabled = {
    notifications: {
      templateUpdate: {
        enabled: true,
        message: {
          title: DEFAULT_NOTIFICATION_TITLE,
          description: DEFAULT_NOTIFICATION_DESCRIPTION,
        },
      },
    },
    pullRequests: {
      templateUpdate: {
        enabled: false,
      },
    },
  };

  const mockProcessorConfigWithPRsEnabled = {
    notifications: {
      templateUpdate: {
        enabled: true,
        message: {
          title: DEFAULT_NOTIFICATION_TITLE_WITH_PR,
          description: DEFAULT_NOTIFICATION_DESCRIPTION_WITH_PR,
        },
      },
    },
    pullRequests: {
      templateUpdate: {
        enabled: true,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockCatalogClient = jest.mocked(
      new CatalogClient({
        discoveryApi: mockServices.discovery(),
      }),
    );

    mockNotificationService = {
      send: jest.fn().mockResolvedValue(undefined),
    };

    mockVcsRegistry = new VcsProviderRegistry();

    // Reset the mock for handleTemplateUpdatePullRequest
    (
      pullRequestsModule.handleTemplateUpdatePullRequest as jest.Mock
    ).mockResolvedValue(new Map());
  });

  describe('handleTemplateUpdateNotifications', () => {
    const payload = {
      entityRef: 'template:default/test-template',
      previousVersion: '1.0.0',
      currentVersion: '2.0.0',
    };

    const createMockEntity = (
      name: string,
      kind: string = 'Component',
      namespace: string = 'default',
      ownerRefs: string[] = [],
    ): Entity => ({
      apiVersion: 'backstage.io/v1alpha1',
      kind,
      metadata: {
        name,
        namespace,
      },
      relations: ownerRefs.map(ownerRef => ({
        type: 'ownedBy',
        targetRef: ownerRef,
      })),
    });

    it('should send individual notifications to entity owners', async () => {
      const entities = [
        createMockEntity('service-a', 'Component', 'default', [
          'user:default/john',
        ]),
        createMockEntity('service-b', 'Component', 'default', [
          'user:default/jane',
        ]),
        createMockEntity('service-c', 'Component', 'default', [
          'user:default/john',
        ]),
      ];

      mockCatalogClient.getEntities.mockResolvedValue({
        items: entities,
      });

      await handleTemplateUpdateNotifications(
        mockCatalogClient,
        mockNotificationService,
        mockAuthService,
        mockProcessorConfigWithNotificationsEnabled,
        payload,
        mockLogger,
        mockUrlReader,
        mockVcsRegistry,
        mockConfig,
      );

      expect(mockCatalogClient.getEntities).toHaveBeenCalledWith(
        {
          filter: { 'spec.scaffoldedFrom': payload.entityRef },
          fields: [
            'kind',
            'metadata.namespace',
            'metadata.name',
            'metadata.title',
            'metadata.annotations',
            'relations',
            'spec',
          ],
        },
        {
          token: 'mock-service-token:{"sub":"plugin:test","target":"catalog"}',
        },
      );

      // Should send 3 individual notifications (one per entity)
      expect(mockNotificationService.send).toHaveBeenCalledTimes(3);

      // Check first notification (service-a to john)
      expect(mockNotificationService.send).toHaveBeenCalledWith({
        recipients: {
          type: 'entity',
          entityRef: 'user:default/john',
        },
        payload: {
          title: 'Service-a is out of sync with template',
          description:
            'The template used to create service-a has been updated to a new version. Review and update your entity to stay in sync with the template.',
          link: '/catalog/default/component/service-a',
        },
      });

      // Check second notification (service-b to jane)
      expect(mockNotificationService.send).toHaveBeenCalledWith({
        recipients: {
          type: 'entity',
          entityRef: 'user:default/jane',
        },
        payload: {
          title: 'Service-b is out of sync with template',
          description:
            'The template used to create service-b has been updated to a new version. Review and update your entity to stay in sync with the template.',
          link: '/catalog/default/component/service-b',
        },
      });

      // Check third notification (service-c to john)
      expect(mockNotificationService.send).toHaveBeenCalledWith({
        recipients: {
          type: 'entity',
          entityRef: 'user:default/john',
        },
        payload: {
          title: 'Service-c is out of sync with template',
          description:
            'The template used to create service-c has been updated to a new version. Review and update your entity to stay in sync with the template.',
          link: '/catalog/default/component/service-c',
        },
      });
    });

    it('should handle entities with multiple owners', async () => {
      const entities = [
        createMockEntity('shared-service', 'Component', 'default', [
          'user:default/john',
          'group:default/backend-team',
        ]),
      ];

      mockCatalogClient.getEntities.mockResolvedValue({
        items: entities,
      });

      await handleTemplateUpdateNotifications(
        mockCatalogClient,
        mockNotificationService,
        mockAuthService,
        mockProcessorConfigWithNotificationsEnabled,
        payload,
        mockLogger,
        mockUrlReader,
        mockVcsRegistry,
        mockConfig,
      );

      // Should send 2 notifications (one to each owner)
      expect(mockNotificationService.send).toHaveBeenCalledTimes(2);

      expect(mockNotificationService.send).toHaveBeenCalledWith({
        recipients: {
          type: 'entity',
          entityRef: 'user:default/john',
        },
        payload: {
          title: 'Shared-service is out of sync with template',
          description:
            'The template used to create shared-service has been updated to a new version. Review and update your entity to stay in sync with the template.',
          link: '/catalog/default/component/shared-service',
        },
      });
    });

    it('should handle entities without owners', async () => {
      const entities = [
        createMockEntity('orphaned-service', 'Component', 'default', []),
      ];

      mockCatalogClient.getEntities.mockResolvedValue({
        items: entities,
      });

      await handleTemplateUpdateNotifications(
        mockCatalogClient,
        mockNotificationService,
        mockAuthService,
        mockProcessorConfigWithNotificationsEnabled,
        payload,
        mockLogger,
        mockUrlReader,
        mockVcsRegistry,
        mockConfig,
      );

      // Should not send any notifications
      expect(mockNotificationService.send).not.toHaveBeenCalled();
    });

    it('should handle empty scaffolded entities list', async () => {
      mockCatalogClient.getEntities.mockResolvedValue({
        items: [],
      });

      await handleTemplateUpdateNotifications(
        mockCatalogClient,
        mockNotificationService,
        mockAuthService,
        mockProcessorConfigWithNotificationsEnabled,
        payload,
        mockLogger,
        mockUrlReader,
        mockVcsRegistry,
        mockConfig,
      );

      expect(mockNotificationService.send).not.toHaveBeenCalled();
    });

    it('should handle entities with different kinds and namespaces', async () => {
      const entities = [
        createMockEntity('my-api', 'API', 'production', ['user:default/alice']),
        createMockEntity('my-website', 'Website', 'staging', [
          'user:default/bob',
        ]),
      ];

      mockCatalogClient.getEntities.mockResolvedValue({
        items: entities,
      });

      await handleTemplateUpdateNotifications(
        mockCatalogClient,
        mockNotificationService,
        mockAuthService,
        mockProcessorConfigWithNotificationsEnabled,
        payload,
        mockLogger,
        mockUrlReader,
        mockVcsRegistry,
        mockConfig,
      );

      expect(mockNotificationService.send).toHaveBeenCalledTimes(2);

      expect(mockNotificationService.send).toHaveBeenCalledWith({
        recipients: {
          type: 'entity',
          entityRef: 'user:default/alice',
        },
        payload: {
          title: 'My-api is out of sync with template',
          description:
            'The template used to create my-api has been updated to a new version. Review and update your entity to stay in sync with the template.',
          link: '/catalog/production/api/my-api',
        },
      });

      expect(mockNotificationService.send).toHaveBeenCalledWith({
        recipients: {
          type: 'entity',
          entityRef: 'user:default/bob',
        },
        payload: {
          title: 'My-website is out of sync with template',
          description:
            'The template used to create my-website has been updated to a new version. Review and update your entity to stay in sync with the template.',
          link: '/catalog/staging/website/my-website',
        },
      });
    });

    it('should capitalize entity names correctly in titles', async () => {
      const entities = [
        createMockEntity('api-gateway', 'Component', 'default', [
          'user:default/dev',
        ]),
        createMockEntity('user-service', 'Component', 'default', [
          'user:default/dev',
        ]),
        createMockEntity('frontend', 'Component', 'default', [
          'user:default/dev',
        ]),
      ];

      mockCatalogClient.getEntities.mockResolvedValue({
        items: entities,
      });

      await handleTemplateUpdateNotifications(
        mockCatalogClient,
        mockNotificationService,
        mockAuthService,
        mockProcessorConfigWithNotificationsEnabled,
        payload,
        mockLogger,
        mockUrlReader,
        mockVcsRegistry,
        mockConfig,
      );

      const calls = mockNotificationService.send.mock.calls;
      expect(calls[0][0].payload.title).toBe(
        'Api-gateway is out of sync with template',
      );
      expect(calls[1][0].payload.title).toBe(
        'User-service is out of sync with template',
      );
      expect(calls[2][0].payload.title).toBe(
        'Frontend is out of sync with template',
      );
    });

    it('should handle entities without namespace (default to "default")', async () => {
      const entityWithoutNamespace: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'simple-service',
        },
        relations: [
          {
            type: 'ownedBy',
            targetRef: 'user:default/owner',
          },
        ],
      };

      mockCatalogClient.getEntities.mockResolvedValue({
        items: [entityWithoutNamespace],
      });

      await handleTemplateUpdateNotifications(
        mockCatalogClient,
        mockNotificationService,
        mockAuthService,
        mockProcessorConfigWithNotificationsEnabled,
        payload,
        mockLogger,
        mockUrlReader,
        mockVcsRegistry,
        mockConfig,
      );

      expect(mockNotificationService.send).toHaveBeenCalledWith({
        recipients: {
          type: 'entity',
          entityRef: 'user:default/owner',
        },
        payload: {
          title: 'Simple-service is out of sync with template',
          description:
            'The template used to create simple-service has been updated to a new version. Review and update your entity to stay in sync with the template.',
          link: '/catalog/default/component/simple-service',
        },
      });
    });

    it('should not send notifications when notifications are disabled', async () => {
      const entities = [
        createMockEntity('service-a', 'Component', 'default', [
          'user:default/john',
        ]),
      ];

      mockCatalogClient.getEntities.mockResolvedValue({
        items: entities,
      });

      const configWithNotificationsDisabled = {
        notifications: {
          templateUpdate: {
            enabled: false,
            message: {
              title: DEFAULT_NOTIFICATION_TITLE,
              description: DEFAULT_NOTIFICATION_DESCRIPTION,
            },
          },
        },
        pullRequests: {
          templateUpdate: {
            enabled: false,
          },
        },
      };

      await handleTemplateUpdateNotifications(
        mockCatalogClient,
        mockNotificationService,
        mockAuthService,
        configWithNotificationsDisabled,
        payload,
        mockLogger,
        mockUrlReader,
        mockVcsRegistry,
        mockConfig,
      );

      expect(mockNotificationService.send).not.toHaveBeenCalled();
    });

    it('should not call PR creation when PRs are disabled', async () => {
      const entities = [
        createMockEntity('service-a', 'Component', 'default', [
          'user:default/john',
        ]),
      ];

      mockCatalogClient.getEntities.mockResolvedValue({
        items: entities,
      });

      await handleTemplateUpdateNotifications(
        mockCatalogClient,
        mockNotificationService,
        mockAuthService,
        mockProcessorConfigWithNotificationsEnabled,
        payload,
        mockLogger,
        mockUrlReader,
        mockVcsRegistry,
        mockConfig,
      );

      expect(
        pullRequestsModule.handleTemplateUpdatePullRequest,
      ).not.toHaveBeenCalled();
    });

    it('should call PR creation when PRs are enabled', async () => {
      const entities = [
        createMockEntity('service-a', 'Component', 'default', [
          'user:default/john',
        ]),
      ];

      mockCatalogClient.getEntities.mockResolvedValue({
        items: entities,
      });

      await handleTemplateUpdateNotifications(
        mockCatalogClient,
        mockNotificationService,
        mockAuthService,
        mockProcessorConfigWithPRsEnabled,
        payload,
        mockLogger,
        mockUrlReader,
        mockVcsRegistry,
        mockConfig,
      );

      expect(
        pullRequestsModule.handleTemplateUpdatePullRequest,
      ).toHaveBeenCalled();
    });

    it('should include PR URL in notification when PR is created', async () => {
      const entities = [
        createMockEntity('service-a', 'Component', 'default', [
          'user:default/john',
        ]),
      ];

      mockCatalogClient.getEntities.mockResolvedValue({
        items: entities,
      });

      // Mock PR creation returning a success result
      const prResults = new Map([
        [
          'service-a',
          { success: true, url: 'https://github.com/org/repo/pull/123' },
        ],
      ]);
      (
        pullRequestsModule.handleTemplateUpdatePullRequest as jest.Mock
      ).mockResolvedValue(prResults);

      await handleTemplateUpdateNotifications(
        mockCatalogClient,
        mockNotificationService,
        mockAuthService,
        mockProcessorConfigWithPRsEnabled,
        payload,
        mockLogger,
        mockUrlReader,
        mockVcsRegistry,
        mockConfig,
      );

      // Should use PR URL as the notification link
      expect(mockNotificationService.send).toHaveBeenCalledWith({
        recipients: {
          type: 'entity',
          entityRef: 'user:default/john',
        },
        payload: {
          title: 'Service-a has a template update PR ready',
          description: expect.stringContaining(
            'https://github.com/org/repo/pull/123',
          ),
          link: 'https://github.com/org/repo/pull/123',
        },
      });
    });

    it('should not send notification when PR creation returns empty map (no changes)', async () => {
      const entities = [
        createMockEntity('service-a', 'Component', 'default', [
          'user:default/john',
        ]),
      ];

      mockCatalogClient.getEntities.mockResolvedValue({
        items: entities,
      });

      // Mock PR creation returning empty map (no PRs created - no changes for any entity)
      (
        pullRequestsModule.handleTemplateUpdatePullRequest as jest.Mock
      ).mockResolvedValue(new Map());

      await handleTemplateUpdateNotifications(
        mockCatalogClient,
        mockNotificationService,
        mockAuthService,
        mockProcessorConfigWithPRsEnabled,
        payload,
        mockLogger,
        mockUrlReader,
        mockVcsRegistry,
        mockConfig,
      );

      // Should NOT send any notification since entity has no changes
      expect(mockNotificationService.send).not.toHaveBeenCalled();
    });

    it('should use default message with error prefix when PR creation fails', async () => {
      const entities = [
        createMockEntity('service-a', 'Component', 'default', [
          'user:default/john',
        ]),
      ];

      mockCatalogClient.getEntities.mockResolvedValue({
        items: entities,
      });

      // Mock PR creation returning a failure result
      const prResults = new Map([
        [
          'service-a',
          { success: false, error: 'Repository permissions denied' },
        ],
      ]);
      (
        pullRequestsModule.handleTemplateUpdatePullRequest as jest.Mock
      ).mockResolvedValue(prResults);

      await handleTemplateUpdateNotifications(
        mockCatalogClient,
        mockNotificationService,
        mockAuthService,
        mockProcessorConfigWithPRsEnabled,
        payload,
        mockLogger,
        mockUrlReader,
        mockVcsRegistry,
        mockConfig,
      );

      // Should use default message with error prefix
      expect(mockNotificationService.send).toHaveBeenCalledWith({
        recipients: {
          type: 'entity',
          entityRef: 'user:default/john',
        },
        payload: {
          title: 'Service-a is out of sync with template',
          description: expect.stringContaining(
            'Failed to create template update PR: Repository permissions denied',
          ),
          link: '/catalog/default/component/service-a',
        },
      });

      // Should also contain the default description
      expect(mockNotificationService.send).toHaveBeenCalledWith({
        recipients: {
          type: 'entity',
          entityRef: 'user:default/john',
        },
        payload: expect.objectContaining({
          description: expect.stringContaining(
            'Review and update your entity to stay in sync with the template',
          ),
        }),
      });
    });

    it('should use default message even when custom message is configured if PR creation fails', async () => {
      const entities = [
        createMockEntity('service-a', 'Component', 'default', [
          'user:default/john',
        ]),
      ];

      mockCatalogClient.getEntities.mockResolvedValue({
        items: entities,
      });

      // Mock PR creation returning a failure result
      const prResults = new Map([
        ['service-a', { success: false, error: 'Authentication failed' }],
      ]);
      (
        pullRequestsModule.handleTemplateUpdatePullRequest as jest.Mock
      ).mockResolvedValue(prResults);

      const customConfig = {
        notifications: {
          templateUpdate: {
            enabled: true,
            message: {
              title: 'Custom title for $ENTITY_DISPLAY_NAME',
              description: 'Custom description with PR link: $PR_LINK',
            },
          },
        },
        pullRequests: {
          templateUpdate: {
            enabled: true,
          },
        },
      };

      await handleTemplateUpdateNotifications(
        mockCatalogClient,
        mockNotificationService,
        mockAuthService,
        customConfig,
        payload,
        mockLogger,
        mockUrlReader,
        mockVcsRegistry,
        mockConfig,
      );

      // Should use DEFAULT message (not custom) with error prefix
      expect(mockNotificationService.send).toHaveBeenCalledWith({
        recipients: {
          type: 'entity',
          entityRef: 'user:default/john',
        },
        payload: {
          title: 'Service-a is out of sync with template',
          description: expect.stringContaining(
            'Failed to create template update PR: Authentication failed',
          ),
          link: '/catalog/default/component/service-a',
        },
      });
    });

    it('should skip notification for entities with no changes when PRs are enabled', async () => {
      const entities = [
        createMockEntity('service-a', 'Component', 'default', [
          'user:default/john',
        ]),
        createMockEntity('service-b', 'Component', 'default', [
          'user:default/jane',
        ]),
        createMockEntity('service-c', 'Component', 'default', [
          'user:default/bob',
        ]),
      ];

      mockCatalogClient.getEntities.mockResolvedValue({
        items: entities,
      });

      // Mock PR creation: only service-a has a PR, service-b and service-c have no changes
      const prResults = new Map([
        [
          'service-a',
          { success: true, url: 'https://github.com/org/repo/pull/123' },
        ],
      ]);
      (
        pullRequestsModule.handleTemplateUpdatePullRequest as jest.Mock
      ).mockResolvedValue(prResults);

      await handleTemplateUpdateNotifications(
        mockCatalogClient,
        mockNotificationService,
        mockAuthService,
        mockProcessorConfigWithPRsEnabled,
        payload,
        mockLogger,
        mockUrlReader,
        mockVcsRegistry,
        mockConfig,
      );

      // Should only send notification for service-a (the one with a PR)
      expect(mockNotificationService.send).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.send).toHaveBeenCalledWith({
        recipients: {
          type: 'entity',
          entityRef: 'user:default/john',
        },
        payload: expect.objectContaining({
          link: 'https://github.com/org/repo/pull/123',
        }),
      });
    });

    it('should send notifications to all entities when PRs are disabled', async () => {
      const entities = [
        createMockEntity('service-a', 'Component', 'default', [
          'user:default/john',
        ]),
        createMockEntity('service-b', 'Component', 'default', [
          'user:default/jane',
        ]),
      ];

      mockCatalogClient.getEntities.mockResolvedValue({
        items: entities,
      });

      // PRs are disabled, so no prResults
      await handleTemplateUpdateNotifications(
        mockCatalogClient,
        mockNotificationService,
        mockAuthService,
        mockProcessorConfigWithNotificationsEnabled, // PRs disabled in this config
        payload,
        mockLogger,
        mockUrlReader,
        mockVcsRegistry,
        mockConfig,
      );

      // Should send notifications to all entities
      expect(mockNotificationService.send).toHaveBeenCalledTimes(2);
    });

    it('should send notification for failed PR even if other entities have no changes', async () => {
      const entities = [
        createMockEntity('service-a', 'Component', 'default', [
          'user:default/john',
        ]),
        createMockEntity('service-b', 'Component', 'default', [
          'user:default/jane',
        ]),
      ];

      mockCatalogClient.getEntities.mockResolvedValue({
        items: entities,
      });

      // service-a had PR creation failure, service-b has no changes (not in map)
      const prResults = new Map([
        ['service-a', { success: false, error: 'Permission denied' }],
      ]);
      (
        pullRequestsModule.handleTemplateUpdatePullRequest as jest.Mock
      ).mockResolvedValue(prResults);

      await handleTemplateUpdateNotifications(
        mockCatalogClient,
        mockNotificationService,
        mockAuthService,
        mockProcessorConfigWithPRsEnabled,
        payload,
        mockLogger,
        mockUrlReader,
        mockVcsRegistry,
        mockConfig,
      );

      // Should only send notification for service-a (failed PR)
      // service-b should be skipped (no changes)
      expect(mockNotificationService.send).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.send).toHaveBeenCalledWith({
        recipients: {
          type: 'entity',
          entityRef: 'user:default/john',
        },
        payload: expect.objectContaining({
          description: expect.stringContaining('Permission denied'),
        }),
      });
    });
  });

  describe('readScaffolderRelationProcessorConfig', () => {
    it('should return default values when config is empty', () => {
      const config = mockServices.rootConfig();

      const result = readScaffolderRelationProcessorConfig(config);

      expect(result).toEqual(mockProcessorConfig);
    });

    it('should use custom config values when provided', () => {
      const customProcessorConfig = {
        notifications: {
          templateUpdate: {
            enabled: true,
            message: {
              title: 'Custom notification title',
              description: 'Custom notification description',
            },
          },
        },
        pullRequests: {
          templateUpdate: {
            enabled: true,
          },
        },
      };
      const config = mockServices.rootConfig({
        data: {
          scaffolder: customProcessorConfig,
        },
      });

      const result = readScaffolderRelationProcessorConfig(config);

      expect(result).toEqual(customProcessorConfig);
    });

    it('should use PR-specific defaults when PRs are enabled', () => {
      const config = mockServices.rootConfig({
        data: {
          scaffolder: {
            pullRequests: {
              templateUpdate: {
                enabled: true,
              },
            },
          },
        },
      });

      const result = readScaffolderRelationProcessorConfig(config);

      expect(result.notifications?.templateUpdate?.message.title).toBe(
        DEFAULT_NOTIFICATION_TITLE_WITH_PR,
      );
      expect(result.notifications?.templateUpdate?.message.description).toBe(
        DEFAULT_NOTIFICATION_DESCRIPTION_WITH_PR,
      );
    });

    it('should use standard defaults when PRs are disabled', () => {
      const config = mockServices.rootConfig({
        data: {
          scaffolder: {
            pullRequests: {
              templateUpdate: {
                enabled: false,
              },
            },
          },
        },
      });

      const result = readScaffolderRelationProcessorConfig(config);

      expect(result.notifications?.templateUpdate?.message.title).toBe(
        DEFAULT_NOTIFICATION_TITLE,
      );
      expect(result.notifications?.templateUpdate?.message.description).toBe(
        DEFAULT_NOTIFICATION_DESCRIPTION,
      );
    });

    it('should handle missing scaffolder.notifications section', () => {
      const config = mockServices.rootConfig({
        data: {
          scaffolder: {
            // notifications section is missing
          },
        },
      });

      const result = readScaffolderRelationProcessorConfig(config);

      expect(result).toEqual(mockProcessorConfig);
    });

    it('should handle missing scaffolder.notifications.templateUpdate section', () => {
      const config = mockServices.rootConfig({
        data: {
          scaffolder: {
            notifications: {
              // templateUpdate section is missing
            },
          },
        },
      });

      const result = readScaffolderRelationProcessorConfig(config);

      expect(result).toEqual(mockProcessorConfig);
    });

    it('should handle missing scaffolder.notifications.templateUpdate.message section', () => {
      const config = mockServices.rootConfig({
        data: {
          scaffolder: {
            notifications: {
              templateUpdate: {
                enabled: true,
                // message section is missing
              },
            },
          },
        },
      });

      const result = readScaffolderRelationProcessorConfig(config);

      expect(result).toEqual({
        notifications: {
          templateUpdate: {
            enabled: true,
            message: {
              title: DEFAULT_NOTIFICATION_TITLE,
              description: DEFAULT_NOTIFICATION_DESCRIPTION,
            },
          },
        },
        pullRequests: {
          templateUpdate: {
            enabled: DEFAULT_PR_ENABLED,
          },
        },
      });
    });

    it('should handle null config values', () => {
      const config = mockServices.rootConfig({
        data: {
          scaffolder: {
            notifications: {
              templateUpdate: {
                enabled: null,
                message: {
                  title: null,
                  description: null,
                },
              },
            },
          },
        },
      });

      const result = readScaffolderRelationProcessorConfig(config);

      expect(result).toEqual(mockProcessorConfig);
    });

    it('should handle malformed config structure', () => {
      const config = mockServices.rootConfig({
        data: {
          scaffolder: {
            notifications: {
              templateUpdate: {
                // Missing enabled field
                message: {
                  title: 'Test Title',
                  description: 'Test Description',
                },
              },
            },
          },
        },
      });

      const result = readScaffolderRelationProcessorConfig(config);

      expect(result).toEqual({
        notifications: {
          templateUpdate: {
            enabled: DEFAULT_NOTIFICATION_ENABLED,
            message: {
              title: 'Test Title',
              description: 'Test Description',
            },
          },
        },
        pullRequests: {
          templateUpdate: {
            enabled: DEFAULT_PR_ENABLED,
          },
        },
      });
    });

    it('should handle partial message configuration', () => {
      const config = mockServices.rootConfig({
        data: {
          scaffolder: {
            notifications: {
              templateUpdate: {
                enabled: true,
                message: {
                  title: 'Custom Title',
                  // description is missing
                },
              },
            },
          },
        },
      });

      const result = readScaffolderRelationProcessorConfig(config);

      expect(result).toEqual({
        notifications: {
          templateUpdate: {
            enabled: true,
            message: {
              title: 'Custom Title',
              description: DEFAULT_NOTIFICATION_DESCRIPTION,
            },
          },
        },
        pullRequests: {
          templateUpdate: {
            enabled: DEFAULT_PR_ENABLED,
          },
        },
      });
    });

    it('should handle pullRequests config independently from notifications', () => {
      const config = mockServices.rootConfig({
        data: {
          scaffolder: {
            notifications: {
              templateUpdate: {
                enabled: false,
              },
            },
            pullRequests: {
              templateUpdate: {
                enabled: true,
              },
            },
          },
        },
      });

      const result = readScaffolderRelationProcessorConfig(config);

      expect(result.notifications?.templateUpdate?.enabled).toBe(false);
      expect(result.pullRequests?.templateUpdate?.enabled).toBe(true);
    });
  });
});
