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
} from '@backstage/backend-plugin-api';
import { readSchedulerServiceTaskScheduleDefinitionFromConfig } from '@backstage/backend-plugin-api';
import { searchIndexRegistryExtensionPoint } from '@backstage/plugin-search-backend-node/alpha';
import { ConfluenceCollatorFactory } from './collators';

/**
 * Search backend module for the Confluence index.
 *
 * @public
 */
export const searchModuleConfluenceCollator = createBackendModule({
  pluginId: 'search',
  moduleId: 'confluence-collator',
  register(reg) {
    reg.registerInit({
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        scheduler: coreServices.scheduler,
        indexRegistry: searchIndexRegistryExtensionPoint,
      },
      async init({ config, logger, scheduler, indexRegistry }) {
        const defaultSchedule = {
          frequency: { minutes: 120 },
          timeout: { minutes: 60 },
          initialDelay: { seconds: 30 },
        };

        const schedule = config.has('search.collators.confluence.schedule')
          ? readSchedulerServiceTaskScheduleDefinitionFromConfig(
              config.getConfig('search.collators.confluence.schedule'),
            )
          : defaultSchedule;

        logger.info(
          `Indexing Confluence instance: "${config.getString(
            'confluence.baseUrl',
          )}"`,
        );
        logger.info(`Confluence indexing schedule ${JSON.stringify(schedule)}`);
        indexRegistry.addCollator({
          schedule: scheduler.createScheduledTaskRunner(schedule),
          factory: ConfluenceCollatorFactory.fromConfig(config, {
            logger: logger,
          }),
        });
      },
    });
  },
});
