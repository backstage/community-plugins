import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { readTaskScheduleDefinitionFromConfig } from '@backstage/backend-tasks';
import { AnnouncementCollatorFactory } from './collators/AnnouncementCollatorFactory';
import { loggerToWinstonLogger } from '@backstage/backend-common';
import { searchIndexRegistryExtensionPoint } from '@backstage/plugin-search-backend-node/alpha';

export const searchModuleAnnouncementsCollator = createBackendModule({
  pluginId: 'search',
  moduleId: 'announcements',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        permissions: coreServices.permissions,
        discovery: coreServices.discovery,
        scheduler: coreServices.scheduler,
        auth: coreServices.auth,
        indexRegistry: searchIndexRegistryExtensionPoint,
      },
      async init({
        config,
        logger,
        discovery,
        scheduler,
        auth,
        indexRegistry,
      }) {
        const defaultSchedule = {
          frequency: { minutes: 10 },
          timeout: { minutes: 15 },
          initialDelay: { seconds: 3 },
        };

        const schedule = config.has('search.collators.announcements.schedule')
          ? readTaskScheduleDefinitionFromConfig(
              config.getConfig('search.collators.announcements.schedule'),
            )
          : defaultSchedule;

        indexRegistry.addCollator({
          schedule: scheduler.createScheduledTaskRunner(schedule),
          factory: AnnouncementCollatorFactory.fromConfig({
            discoveryApi: discovery,
            logger: loggerToWinstonLogger(logger),
            auth: auth,
          }),
        });
      },
    });
  },
});
