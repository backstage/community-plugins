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
import { SchedulerServiceTaskScheduleDefinitionConfig } from '@backstage/backend-plugin-api';
import { mockServices, startTestBackend } from '@backstage/backend-test-utils';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { catalogModulePingIdentityEntityProvider } from './catalogModulePingIdentityEntityProvider';
import { PingIdentityEntityProvider } from '../providers/PingIdentityEntityProvider';

describe('catalogModulePingIdentityEntityProvider', () => {
  it('should register provider at the catalog extension point', async () => {
    let addedProviders: Array<PingIdentityEntityProvider> | undefined;
    let usedSchedule: SchedulerServiceTaskScheduleDefinitionConfig | undefined;

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
          pingIdentityOrg: {
            default: {
              apiPath: 'apiPath',
              authPath: 'authPath',
              envId: 'envId',
              clientId: 'clientId',
              clientSecret: 'clientSecret',
              schedule: {
                frequency: {
                  minutes: 30,
                },
                initialDelay: undefined,
                scope: undefined,
                timeout: {
                  minutes: 3,
                },
              },
            },
          },
        },
      },
    };

    await startTestBackend({
      extensionPoints: [[catalogProcessingExtensionPoint, extensionPoint]],
      features: [
        catalogModulePingIdentityEntityProvider,
        mockServices.rootConfig.factory({ data: config }),
        scheduler.factory,
      ],
    });

    expect(usedSchedule?.frequency).toEqual({ minutes: 30 });
    expect(usedSchedule?.timeout).toEqual({ minutes: 3 });
    expect(addedProviders?.length).toEqual(1);
    expect(addedProviders?.pop()?.getProviderName()).toEqual(
      'PingIdentityEntityProvider:default',
    );
    expect(runner).not.toHaveBeenCalled();
  });
});
