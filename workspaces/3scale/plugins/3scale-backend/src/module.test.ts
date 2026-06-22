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

import type { SchedulerServiceTaskScheduleDefinition } from '@backstage/backend-plugin-api';
import { mockServices, startTestBackend } from '@backstage/backend-test-utils';
import type { EntityProvider } from '@backstage/plugin-catalog-node';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node';

import { catalogModule3ScaleEntityProvider } from './module';
import { ThreeScaleApiEntityProvider } from './providers';

const PROVIDER_CONFIG = {
  catalog: {
    providers: {
      threeScaleApiEntity: {
        dev: {
          baseUrl: 'https://example-admin.3scale.net',
          accessToken: 'test-token',
        },
      },
    },
  },
} as const;

describe('catalogModule3ScaleEntityProvider', () => {
  let addedProviders: EntityProvider[] | EntityProvider[][] | undefined;

  beforeEach(() => {
    addedProviders = undefined;
  });

  const extensionPoint = {
    addEntityProvider: (
      ...providers: EntityProvider[] | EntityProvider[][]
    ) => {
      addedProviders = providers;
    },
  };

  it('registers an empty provider array when threeScaleApiEntity config is absent', async () => {
    await startTestBackend({
      extensionPoints: [[catalogProcessingExtensionPoint, extensionPoint]],
      features: [
        catalogModule3ScaleEntityProvider,
        mockServices.rootConfig.factory({ data: {} }),
      ],
    });

    expect((addedProviders as EntityProvider[][]).length).toEqual(1);
    expect((addedProviders as EntityProvider[][])[0]).toEqual([]);
  });

  it('registers a provider with the expected name when config is present', async () => {
    await startTestBackend({
      extensionPoints: [[catalogProcessingExtensionPoint, extensionPoint]],
      features: [
        catalogModule3ScaleEntityProvider,
        mockServices.rootConfig.factory({ data: PROVIDER_CONFIG }),
      ],
    });

    const providers = (addedProviders as EntityProvider[][])[0];
    expect(providers).toHaveLength(1);
    expect(providers[0]).toBeInstanceOf(ThreeScaleApiEntityProvider);
    expect(providers[0].getProviderName()).toEqual(
      'ThreeScaleApiEntityProvider:dev',
    );
  });

  it('uses the module default schedule when per-provider schedule is absent', async () => {
    const usedSchedules: SchedulerServiceTaskScheduleDefinition[] = [];
    const runner = jest.fn();
    const scheduler = mockServices.scheduler.mock({
      createScheduledTaskRunner(schedule) {
        usedSchedules.push(schedule);
        return { run: runner };
      },
    });

    await startTestBackend({
      extensionPoints: [[catalogProcessingExtensionPoint, extensionPoint]],
      features: [
        catalogModule3ScaleEntityProvider,
        mockServices.rootConfig.factory({ data: PROVIDER_CONFIG }),
        scheduler.factory,
      ],
    });

    expect(usedSchedules).toHaveLength(1);
    expect(usedSchedules[0].frequency).toEqual({ minutes: 30 });
    expect(usedSchedules[0].timeout).toEqual({ minutes: 3 });
    expect(runner).not.toHaveBeenCalled();
  });

  it('uses per-provider schedule when configured', async () => {
    const usedSchedules: SchedulerServiceTaskScheduleDefinition[] = [];
    const runner = jest.fn();
    const scheduler = mockServices.scheduler.mock({
      createScheduledTaskRunner(schedule) {
        usedSchedules.push(schedule);
        return { run: runner };
      },
    });

    await startTestBackend({
      extensionPoints: [[catalogProcessingExtensionPoint, extensionPoint]],
      features: [
        catalogModule3ScaleEntityProvider,
        mockServices.rootConfig.factory({
          data: {
            catalog: {
              providers: {
                threeScaleApiEntity: {
                  dev: {
                    baseUrl: 'https://example-admin.3scale.net',
                    accessToken: 'test-token',
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

    expect(usedSchedules).toHaveLength(2);
    expect(usedSchedules[0].frequency).toEqual({ minutes: 30 });
    expect(usedSchedules[0].timeout).toEqual({ minutes: 3 });
    expect(usedSchedules[1].frequency).toEqual({ months: 1 });
    expect(usedSchedules[1].timeout).toEqual({ minutes: 5 });
    expect(runner).not.toHaveBeenCalled();
  });

  it('registers multiple providers from configuration', async () => {
    await startTestBackend({
      extensionPoints: [[catalogProcessingExtensionPoint, extensionPoint]],
      features: [
        catalogModule3ScaleEntityProvider,
        mockServices.rootConfig.factory({
          data: {
            catalog: {
              providers: {
                threeScaleApiEntity: {
                  dev: {
                    baseUrl: 'https://example-admin.3scale.net',
                    accessToken: 'test-token',
                  },
                  production: {
                    baseUrl: 'https://production-admin.3scale.net',
                    accessToken: 'test-token',
                  },
                },
              },
            },
          },
        }),
      ],
    });

    const providers = (addedProviders as EntityProvider[][])[0];
    expect(providers).toHaveLength(2);
    expect(providers.map(p => p.getProviderName())).toEqual([
      'ThreeScaleApiEntityProvider:dev',
      'ThreeScaleApiEntityProvider:production',
    ]);
  });
});
