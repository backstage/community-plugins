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
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';

import { ManagedClusterProvider } from './ManagedClusterProvider';

/**
 * @public
 */
export const catalogModuleOCMEntityProvider = createBackendModule({
  moduleId: 'catalog-backend-module-ocm',
  pluginId: 'catalog',
  register(env) {
    env.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        scheduler: coreServices.scheduler,
      },
      async init({ catalog, config, logger, scheduler }) {
        catalog.addEntityProvider(
          await ManagedClusterProvider.fromConfig(
            { config, logger },
            {
              schedule: scheduler.createScheduledTaskRunner({
                frequency: { hours: 1 },
                timeout: { minutes: 15 },
                initialDelay: { seconds: 15 },
              }),
              scheduler: scheduler,
            },
          ),
        );
      },
    });
  },
});
