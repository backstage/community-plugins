/*
 * Copyright 2024 The Backstage Authors
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
import type { SchedulerServiceTaskScheduleDefinition } from '@backstage/backend-plugin-api';
import { mockServices, startTestBackend } from '@backstage/backend-test-utils';
import catalogPlugin from '@backstage/plugin-catalog-backend/alpha';
import type { EntityProvider } from '@backstage/plugin-catalog-node';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';

import { catalogModuleOCMEntityProvider } from './module';

const CONFIG = {
  catalog: {
    providers: {
      ocm: {
        dev: {
          url: 'http://localhost:5000',
          name: 'test',
        },
      },
    },
  },
} as const;

describe('catalogModuleOCMEntityProvider', () => {
  it('should return an empty array for OCM if no providers are configured', async () => {
    let addedProviders: EntityProvider[] | EntityProvider[][] | undefined;
    const extensionPoint = {
      addEntityProvider: (
        ...providers: EntityProvider[] | EntityProvider[][]
      ) => {
        addedProviders = providers;
      },
    };

    await startTestBackend({
      extensionPoints: [[catalogProcessingExtensionPoint, extensionPoint]],
      features: [
        catalogModuleOCMEntityProvider,
        mockServices.rootConfig.factory({ data: {} }),
      ],
    });

    // Only the OCM provider should be in the array
    expect((addedProviders as EntityProvider[][]).length).toEqual(1);

    // OCM returns an array of entity providers
    expect((addedProviders as EntityProvider[][])[0].length).toEqual(0);
  });

  it('should not run without a name', async () => {
    await expect(
      startTestBackend({
        features: [
          catalogPlugin,
          catalogModuleOCMEntityProvider,
          mockServices.rootConfig.factory({
            data: {
              catalog: {
                providers: {
                  ocm: {
                    dev: {
                      url: 'http://localhost:5000',
                    },
                  },
                },
              },
            },
          }),
        ],
      }),
    ).rejects.toThrow(
      "Module 'catalog-backend-module-ocm' for plugin 'catalog' startup failed; caused by Error: Value must be specified in config at 'catalog.providers.ocm.dev.name'",
    );
  });

  it('should not run without a url', async () => {
    await expect(
      startTestBackend({
        features: [
          catalogPlugin,
          catalogModuleOCMEntityProvider,
          mockServices.rootConfig.factory({
            data: {
              catalog: {
                providers: {
                  ocm: {
                    dev: {
                      name: 'test',
                    },
                  },
                },
              },
            },
          }),
        ],
      }),
    ).rejects.toThrow(
      "Module 'catalog-backend-module-ocm' for plugin 'catalog' startup failed; caused by Error: Value must be specified in config at 'catalog.providers.ocm.dev.url'",
    );
  });

  it('should return a single provider with the default schedule', async () => {
    let usedSchedule: SchedulerServiceTaskScheduleDefinition | undefined;
    const runner = jest.fn();
    const scheduler = mockServices.scheduler.mock({
      createScheduledTaskRunner(schedule) {
        usedSchedule = schedule;
        return { run: runner };
      },
    });

    await startTestBackend({
      features: [
        catalogPlugin,
        catalogModuleOCMEntityProvider,
        mockServices.rootConfig.factory({ data: CONFIG }),
        scheduler.factory,
      ],
    });

    expect(usedSchedule?.frequency).toEqual({ hours: 1 });
    expect(usedSchedule?.timeout).toEqual({ minutes: 15 });
  });

  it('should return a single provider with a specified schedule', async () => {
    let usedSchedule: SchedulerServiceTaskScheduleDefinition | undefined;
    const runner = jest.fn();
    const scheduler = mockServices.scheduler.mock({
      createScheduledTaskRunner(schedule) {
        usedSchedule = schedule;
        return { run: runner };
      },
    });

    await startTestBackend({
      features: [
        catalogPlugin,
        catalogModuleOCMEntityProvider,
        mockServices.rootConfig.factory({
          data: {
            catalog: {
              providers: {
                ocm: {
                  dev: {
                    url: 'http://localhost:5000',
                    name: 'test',
                    schedule: {
                      frequency: 'P1M',
                      timeout: 'PT5M',
                    },
                  },
                },
              },
            },
          },
        }),
        scheduler.factory,
      ],
    });

    expect(usedSchedule?.frequency).toEqual({ months: 1 });
    expect(usedSchedule?.timeout).toEqual({ minutes: 5 });
  });

  it('should return multiple providers', async () => {
    let addedProviders: EntityProvider[] | EntityProvider[][] | undefined;
    const extensionPoint = {
      addEntityProvider: (
        ...providers: EntityProvider[] | EntityProvider[][]
      ) => {
        addedProviders = providers;
      },
    };

    await startTestBackend({
      extensionPoints: [[catalogProcessingExtensionPoint, extensionPoint]],
      features: [
        catalogModuleOCMEntityProvider,
        mockServices.rootConfig.factory({
          data: {
            catalog: {
              providers: {
                ocm: {
                  dev: {
                    url: 'http://localhost:5000',
                    name: 'test',
                  },
                  production: {
                    url: 'http://localhost:5000',
                    name: 'test',
                  },
                },
              },
            },
          },
        }),
      ],
    });

    // Only the OCM provider should be in the array
    expect((addedProviders as EntityProvider[][]).length).toEqual(1);

    // OCM returns an array of entity providers
    expect((addedProviders as EntityProvider[][])[0].length).toEqual(2);
  });

  it('should return provider name', async () => {
    let addedProviders: EntityProvider[] | EntityProvider[][] | undefined;
    const extensionPoint = {
      addEntityProvider: (
        ...providers: EntityProvider[] | EntityProvider[][]
      ) => {
        addedProviders = providers;
      },
    };

    await startTestBackend({
      extensionPoints: [[catalogProcessingExtensionPoint, extensionPoint]],
      features: [
        catalogModuleOCMEntityProvider,
        mockServices.rootConfig.factory({
          data: CONFIG,
        }),
      ],
    });

    // Only the OCM provider should be in the array
    expect((addedProviders as EntityProvider[][]).length).toEqual(1);

    // OCM returns an array of entity providers
    expect(
      (addedProviders as EntityProvider[][])[0][0].getProviderName(),
    ).toEqual('ocm-managed-cluster:dev');
  });
});
