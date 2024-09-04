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
