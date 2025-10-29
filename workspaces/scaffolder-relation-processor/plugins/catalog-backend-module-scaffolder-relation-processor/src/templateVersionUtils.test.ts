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
  DEFAULT_NOTIFICATION_ENABLED,
  DEFAULT_NOTIFICATION_TITLE,
} from './constants';

// Mock external dependencies
jest.mock('@backstage/catalog-client');

describe('templateVersionUtils', () => {
  let mockCatalogClient: jest.Mocked<CatalogClient>;
  let mockNotificationService: jest.Mocked<NotificationService>;
  const mockAuthService = mockServices.auth();
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
        mockProcessorConfig,
        payload,
      );

      expect(mockCatalogClient.getEntities).toHaveBeenCalledWith(
        {
          filter: { 'spec.scaffoldedFrom': payload.entityRef },
          fields: [
            'kind',
            'metadata.namespace',
            'metadata.name',
            'metadata.title',
            'relations',
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
        mockProcessorConfig,
        payload,
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
        mockProcessorConfig,
        payload,
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
        mockProcessorConfig,
        payload,
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
        mockProcessorConfig,
        payload,
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
        mockProcessorConfig,
        payload,
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
        mockProcessorConfig,
        payload,
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
      };
      const config = mockServices.rootConfig({
        data: {
          scaffolder: customProcessorConfig,
        },
      });

      const result = readScaffolderRelationProcessorConfig(config);

      expect(result).toEqual(customProcessorConfig);
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
      });
    });
  });
});
