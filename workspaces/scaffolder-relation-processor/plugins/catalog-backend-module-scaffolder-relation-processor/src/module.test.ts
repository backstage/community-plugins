/*
 * Copyright 2026 The Backstage Authors
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
import { createServiceFactory } from '@backstage/backend-plugin-api';
import { mockServices, startTestBackend } from '@backstage/backend-test-utils';
import type { CatalogProcessor } from '@backstage/plugin-catalog-node';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node';
import { notificationService } from '@backstage/plugin-notifications-node';

import { TEMPLATE_VERSION_UPDATED_TOPIC } from './constants';
import { catalogModuleScaffolderRelationProcessor } from './module';
import { ScaffolderRelationEntityProcessor } from './ScaffolderRelationEntityProcessor';
import { handleTemplateUpdateNotifications } from './templateVersionUtils';

jest.mock('./templateVersionUtils', () => {
  const actual = jest.requireActual('./templateVersionUtils');
  return {
    ...actual,
    handleTemplateUpdateNotifications: jest.fn(),
  };
});

describe('catalogModuleScaffolderRelationProcessor', () => {
  let addedProcessors: CatalogProcessor[] | undefined;

  beforeEach(() => {
    addedProcessors = undefined;
    jest.clearAllMocks();
  });

  const extensionPoint = {
    addProcessor: (
      ...processors: Array<CatalogProcessor | CatalogProcessor[]>
    ) => {
      addedProcessors = processors.flat();
    },
  };

  const notificationFactory = createServiceFactory({
    service: notificationService,
    deps: {},
    factory: () => ({
      send: jest.fn(),
    }),
  });

  it('registers ScaffolderRelationEntityProcessor via the catalog extension point', async () => {
    await startTestBackend({
      extensionPoints: [[catalogProcessingExtensionPoint, extensionPoint]],
      features: [
        catalogModuleScaffolderRelationProcessor,
        mockServices.rootConfig.factory({ data: {} }),
        mockServices.events.factory(),
        notificationFactory,
      ],
    });

    expect(addedProcessors).toHaveLength(1);
    expect(addedProcessors![0]).toBeInstanceOf(
      ScaffolderRelationEntityProcessor,
    );
    expect(addedProcessors![0].getProcessorName()).toEqual(
      'ScaffolderRelationEntityProcessor',
    );
  });

  it('registers exactly one processor with empty optional config without throwing', async () => {
    const events = mockServices.events.mock();

    await expect(
      startTestBackend({
        extensionPoints: [[catalogProcessingExtensionPoint, extensionPoint]],
        features: [
          catalogModuleScaffolderRelationProcessor,
          mockServices.rootConfig.factory({ data: {} }),
          events.factory,
          notificationFactory,
        ],
      }),
    ).resolves.toBeDefined();

    expect(addedProcessors).toHaveLength(1);
    expect(addedProcessors![0]).toBeInstanceOf(
      ScaffolderRelationEntityProcessor,
    );
    expect(events.subscribe).not.toHaveBeenCalled();
  });

  it('subscribes to template version events when notifications are enabled', async () => {
    const events = mockServices.events.mock();

    await startTestBackend({
      extensionPoints: [[catalogProcessingExtensionPoint, extensionPoint]],
      features: [
        catalogModuleScaffolderRelationProcessor,
        mockServices.rootConfig.factory({
          data: {
            scaffolder: {
              notifications: {
                templateUpdate: {
                  enabled: true,
                },
              },
            },
          },
        }),
        events.factory,
        notificationFactory,
      ],
    });

    expect(events.subscribe).toHaveBeenCalledTimes(1);
    expect(events.subscribe).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'scaffolder-relation-processor',
        topics: [TEMPLATE_VERSION_UPDATED_TOPIC],
        onEvent: expect.any(Function),
      }),
    );
    expect(addedProcessors).toHaveLength(1);
  });

  it('subscribes to template version events when pull requests are enabled', async () => {
    const events = mockServices.events.mock();

    await startTestBackend({
      extensionPoints: [[catalogProcessingExtensionPoint, extensionPoint]],
      features: [
        catalogModuleScaffolderRelationProcessor,
        mockServices.rootConfig.factory({
          data: {
            scaffolder: {
              pullRequests: {
                templateUpdate: {
                  enabled: true,
                },
              },
            },
          },
        }),
        events.factory,
        notificationFactory,
      ],
    });

    expect(events.subscribe).toHaveBeenCalledTimes(1);
    expect(addedProcessors).toHaveLength(1);
  });

  it('forwards subscribed events to handleTemplateUpdateNotifications', async () => {
    const events = mockServices.events.mock();

    await startTestBackend({
      extensionPoints: [[catalogProcessingExtensionPoint, extensionPoint]],
      features: [
        catalogModuleScaffolderRelationProcessor,
        mockServices.rootConfig.factory({
          data: {
            scaffolder: {
              notifications: {
                templateUpdate: {
                  enabled: true,
                },
              },
            },
          },
        }),
        events.factory,
        notificationFactory,
      ],
    });

    const subscription = events.subscribe.mock.calls[0][0];
    const payload = {
      entityRef: 'template:default/example',
      previousVersion: '1.0.0',
      currentVersion: '1.1.0',
    };

    await subscription.onEvent({
      topic: TEMPLATE_VERSION_UPDATED_TOPIC,
      eventPayload: payload,
    });

    expect(handleTemplateUpdateNotifications).toHaveBeenCalledTimes(1);
    expect(
      (handleTemplateUpdateNotifications as jest.Mock).mock.calls[0][4],
    ).toEqual(payload);
  });
});
