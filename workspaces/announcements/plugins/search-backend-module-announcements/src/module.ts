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
  coreServices,
  createBackendModule,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
} from '@backstage/backend-plugin-api';
import { AnnouncementCollatorFactory } from './collators/AnnouncementCollatorFactory';
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
          ? readSchedulerServiceTaskScheduleDefinitionFromConfig(
              config.getConfig('search.collators.announcements.schedule'),
            )
          : defaultSchedule;

        indexRegistry.addCollator({
          schedule: scheduler.createScheduledTaskRunner(schedule),
          factory: AnnouncementCollatorFactory.fromConfig({
            discoveryApi: discovery,
            logger,
            auth,
          }),
        });
      },
    });
  },
});
