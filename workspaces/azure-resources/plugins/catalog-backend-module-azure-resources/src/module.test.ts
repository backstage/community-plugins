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
import { SchedulerServiceTaskScheduleDefinition } from '@backstage/backend-plugin-api';
import { mockServices, startTestBackend } from '@backstage/backend-test-utils';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { catalogModuleAzureResources } from './module';
import { AzureResourceProvider } from './provider/AzureResourceProvider';

describe('catalogModuleAzureResources', () => {
  it('should register provider at the catalog extension point', async () => {
    let addedProviders: Array<AzureResourceProvider> | undefined;
    let usedSchedule: SchedulerServiceTaskScheduleDefinition | undefined;

    const extensionPoint = {
      addEntityProvider: (providers: any) => {
        addedProviders = providers;
      },
    };
    const runner = jest.fn();
    const scheduler = mockServices.scheduler.mock({
      createScheduledTaskRunner(schedule) {
        usedSchedule = schedule;
        return { run: runner };
      },
    });

    const config = {
      catalog: {
        providers: {
          azureResources: [
            {
              id: 'test-provider',
              query:
                'Resources | where type == "microsoft.storage/storageaccounts"',
              scope: {
                subscriptions: ['sub-1', 'sub-2'],
              },
              schedule: {
                frequency: 'PT1H',
                timeout: 'PT5M',
              },
            },
          ],
        },
      },
    };

    await startTestBackend({
      extensionPoints: [[catalogProcessingExtensionPoint, extensionPoint]],
      features: [
        catalogModuleAzureResources,
        mockServices.rootConfig.factory({ data: config }),
        scheduler.factory,
      ],
    });

    expect(usedSchedule?.frequency).toEqual({ hours: 1 });
    expect(usedSchedule?.timeout).toEqual({ minutes: 5 });
    expect(addedProviders?.length).toEqual(1);
    expect(addedProviders?.pop()?.getProviderName()).toEqual(
      'azure-resource-provider-test-provider',
    );
    expect(runner).not.toHaveBeenCalled();
  });

  it('should register multiple providers from configuration', async () => {
    let addedProviders: Array<AzureResourceProvider> | undefined;
    const usedSchedules: SchedulerServiceTaskScheduleDefinition[] = [];

    const extensionPoint = {
      addEntityProvider: (providers: any) => {
        addedProviders = providers;
      },
    };
    const runner = jest.fn();
    const scheduler = mockServices.scheduler.mock({
      createScheduledTaskRunner(schedule) {
        usedSchedules.push(schedule);
        return { run: runner };
      },
    });

    const config = {
      catalog: {
        providers: {
          azureResources: [
            {
              id: 'storage-provider',
              query:
                'Resources | where type == "microsoft.storage/storageaccounts"',
              scope: {
                subscriptions: ['sub-1'],
              },
              schedule: {
                frequency: 'PT2H',
                timeout: 'PT10M',
              },
            },
            {
              id: 'vm-provider',
              query:
                'Resources | where type == "microsoft.compute/virtualmachines"',
              scope: {
                managementGroups: ['mg-1'],
              },
              schedule: {
                frequency: 'PT4H',
                timeout: 'PT15M',
              },
            },
          ],
        },
      },
    };

    await startTestBackend({
      extensionPoints: [[catalogProcessingExtensionPoint, extensionPoint]],
      features: [
        catalogModuleAzureResources,
        mockServices.rootConfig.factory({ data: config }),
        scheduler.factory,
      ],
    });

    expect(addedProviders?.length).toEqual(2);
    expect(usedSchedules).toHaveLength(2);

    expect(usedSchedules[0].frequency).toEqual({ hours: 2 });
    expect(usedSchedules[0].timeout).toEqual({ minutes: 10 });

    expect(usedSchedules[1].frequency).toEqual({ hours: 4 });
    expect(usedSchedules[1].timeout).toEqual({ minutes: 15 });

    const providerNames = addedProviders?.map(p => p.getProviderName());
    expect(providerNames).toContain('azure-resource-provider-storage-provider');
    expect(providerNames).toContain('azure-resource-provider-vm-provider');

    expect(runner).not.toHaveBeenCalled();
  });

  it('should handle no providers configured', async () => {
    let addedProviders: Array<AzureResourceProvider> | undefined;

    const extensionPoint = {
      addEntityProvider: (providers: any) => {
        addedProviders = providers;
      },
    };
    const runner = jest.fn();
    const scheduler = mockServices.scheduler.mock({
      createScheduledTaskRunner() {
        return { run: runner };
      },
    });

    const config = {
      catalog: {
        providers: {
          // No azureResources configuration
        },
      },
    };

    await startTestBackend({
      extensionPoints: [[catalogProcessingExtensionPoint, extensionPoint]],
      features: [
        catalogModuleAzureResources,
        mockServices.rootConfig.factory({ data: config }),
        scheduler.factory,
      ],
    });

    expect(addedProviders).toBeUndefined();
    expect(runner).not.toHaveBeenCalled();
  });
});
