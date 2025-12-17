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
} from '@backstage/backend-plugin-api';
import { searchIndexRegistryExtensionPoint } from '@backstage/plugin-search-backend-node/alpha';
import { AzureDevOpsWikiArticleCollatorFactory } from './collator';
import { readScheduleConfigOptions } from './config';

/** @public */
export const searchModuleAzureDevOps = createBackendModule({
  pluginId: 'search',
  moduleId: 'azure-devops',
  register(reg) {
    reg.registerInit({
      deps: {
        config: coreServices.rootConfig,
        scheduler: coreServices.scheduler,
        logger: coreServices.logger,
        indexRegistry: searchIndexRegistryExtensionPoint,
      },
      async init({ config, scheduler, logger, indexRegistry }) {
        indexRegistry.addCollator({
          schedule: scheduler.createScheduledTaskRunner(
            readScheduleConfigOptions(config),
          ),
          factory: AzureDevOpsWikiArticleCollatorFactory.fromConfig(config, {
            logger,
          }),
        });
      },
    });
  },
});
