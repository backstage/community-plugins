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
import {
  coreServices,
  createBackendModule,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
  SchedulerServiceTaskScheduleDefinition,
} from '@backstage/backend-plugin-api';
import { searchIndexRegistryExtensionPoint } from '@backstage/plugin-search-backend-node/alpha';
import { ReportPortalCollatorFactory } from './collators/ReportPortalCollator';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';

const defaults: {
  schedule: SchedulerServiceTaskScheduleDefinition;
  locationTemplate: string;
} = {
  schedule: {
    frequency: { minutes: 10 },
    timeout: { minutes: 5 },
    initialDelay: { seconds: 3 },
  },
  locationTemplate: '/report-portal',
};

/**
 * Report portal collator
 * @public
 */
export const searchModuleReportPortalCollator = createBackendModule({
  pluginId: 'search',
  moduleId: 'report-portal-collator',
  register(reg) {
    reg.registerInit({
      deps: {
        indexRegistery: searchIndexRegistryExtensionPoint,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        scheduler: coreServices.scheduler,
        auth: coreServices.auth,
        catalog: catalogServiceRef,
      },
      async init({ logger, config, scheduler, indexRegistery, catalog, auth }) {
        if (!config.has('reportPortal.integrations')) {
          logger.error(
            'No reportPortal.integrations configured in you app-config.yaml',
          );
          return;
        }

        const schedule = config.has('search.collators.reportPortal.schedule')
          ? readSchedulerServiceTaskScheduleDefinitionFromConfig(
              config.getConfig('search.collators.reportPortal.schedule'),
            )
          : defaults.schedule;

        const locationTemplate =
          config.getOptionalString(
            'search.collators.reportPortal.locationTemplate',
          ) ?? defaults.locationTemplate;

        indexRegistery.addCollator({
          schedule: scheduler.createScheduledTaskRunner(schedule),
          factory: ReportPortalCollatorFactory.fromConfig(config, {
            logger,
            locationTemplate,
            catalog,
            auth,
          }),
        });
      },
    });
  },
});
