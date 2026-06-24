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

import {
  createBackendModule,
  type SchedulerServiceTaskScheduleDefinition,
} from '@backstage/backend-plugin-api';
import { mockServices, startTestBackend } from '@backstage/backend-test-utils';
import catalogPlugin from '@backstage/plugin-catalog-backend';
import type { EntityProvider } from '@backstage/plugin-catalog-node';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node';

import { CONFIG } from '../../__fixtures__/helpers';
import { keycloakTransformerExtensionPoint } from '../extensions';
import type { GroupTransformer, UserTransformer } from '../lib/types';
import { KeycloakOrgEntityProvider } from '../providers/KeycloakOrgEntityProvider';
import { catalogModuleKeycloakEntityProvider } from './catalogModuleKeycloakEntityProvider';

describe('catalogModuleKeycloakEntityProvider', () => {
  let addedProviders: EntityProvider[] | EntityProvider[][] | undefined;

  const extensionPoint = {
    addEntityProvider: (
      ...providers: EntityProvider[] | EntityProvider[][]
    ) => {
      addedProviders = providers;
    },
  };

  it('should return an empty array if no providers are configured', async () => {
    await startTestBackend({
      extensionPoints: [[catalogProcessingExtensionPoint, extensionPoint]],
      features: [
        catalogModuleKeycloakEntityProvider,
        mockServices.rootConfig.factory({ data: {} }),
      ],
    });

    // Only the Keycloak provider should be in the array
    expect((addedProviders as EntityProvider[][]).length).toEqual(1);
    // Keycloak returns an array of entity providers
    expect((addedProviders as EntityProvider[][])[0].length).toEqual(0);
  });

  it('should not run without a baseUrl', async () => {
    await expect(
      startTestBackend({
        features: [
          catalogPlugin,
          catalogModuleKeycloakEntityProvider,
          mockServices.rootConfig.factory({
            data: {
              catalog: {
                providers: {
                  keycloakOrg: {
                    dev: {},
                  },
                },
              },
            },
          }),
        ],
      }),
    ).rejects.toThrow(
      "Module 'catalog-backend-module-keycloak' for plugin 'catalog' startup failed; caused by Error: Missing required config value at 'catalog.providers.keycloakOrg.dev.baseUrl' in 'mock-config'",
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
        catalogModuleKeycloakEntityProvider,
        mockServices.rootConfig.factory({ data: CONFIG }),
        scheduler.factory,
      ],
    });

    expect(usedSchedule?.frequency).toEqual({ minutes: 30 });
    expect(usedSchedule?.timeout).toEqual({ minutes: 3 });
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
        catalogModuleKeycloakEntityProvider,
        mockServices.rootConfig.factory({
          data: {
            catalog: {
              providers: {
                keycloakOrg: {
                  dev: {
                    baseUrl: 'https://example.com/auth',
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
    await startTestBackend({
      extensionPoints: [[catalogProcessingExtensionPoint, extensionPoint]],
      features: [
        catalogModuleKeycloakEntityProvider,
        mockServices.rootConfig.factory({
          data: {
            catalog: {
              providers: {
                keycloakOrg: {
                  dev: {
                    baseUrl: 'https://example1.com/auth',
                  },
                  production: {
                    baseUrl: 'https://example2.com/auth',
                  },
                },
              },
            },
          },
        }),
      ],
    });

    // Only the Keycloak provider should be in the array
    expect((addedProviders as EntityProvider[][]).length).toEqual(1);
    // Keycloak returns an array of entity providers
    expect((addedProviders as EntityProvider[][])[0].length).toEqual(2);
  });

  it('should return provider name', async () => {
    await startTestBackend({
      extensionPoints: [[catalogProcessingExtensionPoint, extensionPoint]],
      features: [
        catalogModuleKeycloakEntityProvider,
        mockServices.rootConfig.factory({
          data: CONFIG,
        }),
      ],
    });

    // Only the Keycloak provider should be in the array
    expect((addedProviders as EntityProvider[][]).length).toEqual(1);
    // Keycloak returns an array of entity providers
    expect(
      (addedProviders as EntityProvider[][])[0][0].getProviderName(),
    ).toEqual('KeycloakOrgEntityProvider:default');
  });
});

describe('keycloakTransformerExtensionPoint', () => {
  const customUserTransformer: UserTransformer = async entity => entity;
  const customGroupTransformer: GroupTransformer = async entity => entity;

  const keycloakTransformerTestModule = createBackendModule({
    pluginId: 'catalog',
    moduleId: 'test-keycloak-transformer',
    register(reg) {
      reg.registerInit({
        deps: { keycloak: keycloakTransformerExtensionPoint },
        async init({ keycloak }) {
          keycloak.setUserTransformer(customUserTransformer);
          keycloak.setGroupTransformer(customGroupTransformer);
        },
      });
    },
  });

  it('passes transformers set via the extension point to KeycloakOrgEntityProvider', async () => {
    const fromConfigSpy = jest.spyOn(KeycloakOrgEntityProvider, 'fromConfig');

    try {
      await startTestBackend({
        extensionPoints: [
          [
            catalogProcessingExtensionPoint,
            {
              addEntityProvider: jest.fn(),
            },
          ],
        ],
        features: [
          keycloakTransformerTestModule,
          catalogModuleKeycloakEntityProvider,
          mockServices.rootConfig.factory({ data: CONFIG }),
        ],
      });

      expect(fromConfigSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.anything(),
          logger: expect.anything(),
        }),
        expect.objectContaining({
          userTransformer: customUserTransformer,
          groupTransformer: customGroupTransformer,
        }),
      );
    } finally {
      fromConfigSpy.mockRestore();
    }
  });

  it('rejects setting the user transformer more than once', async () => {
    const duplicateUserTransformerModule = createBackendModule({
      pluginId: 'catalog',
      moduleId: 'test-duplicate-user-transformer',
      register(reg) {
        reg.registerInit({
          deps: { keycloak: keycloakTransformerExtensionPoint },
          async init({ keycloak }) {
            keycloak.setUserTransformer(async entity => entity);
            keycloak.setUserTransformer(async entity => entity);
          },
        });
      },
    });

    await expect(
      startTestBackend({
        features: [
          catalogModuleKeycloakEntityProvider,
          duplicateUserTransformerModule,
          mockServices.rootConfig.factory({ data: CONFIG }),
        ],
      }),
    ).rejects.toThrow('User transformer may only be set once');
  });

  it('rejects setting the group transformer more than once', async () => {
    const duplicateGroupTransformerModule = createBackendModule({
      pluginId: 'catalog',
      moduleId: 'test-duplicate-group-transformer',
      register(reg) {
        reg.registerInit({
          deps: { keycloak: keycloakTransformerExtensionPoint },
          async init({ keycloak }) {
            keycloak.setGroupTransformer(async entity => entity);
            keycloak.setGroupTransformer(async entity => entity);
          },
        });
      },
    });

    await expect(
      startTestBackend({
        features: [
          catalogModuleKeycloakEntityProvider,
          duplicateGroupTransformerModule,
          mockServices.rootConfig.factory({ data: CONFIG }),
        ],
      }),
    ).rejects.toThrow('Group transformer may only be set once');
  });
});
