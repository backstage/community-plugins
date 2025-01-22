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
import { searchIndexRegistryExtensionPoint } from '@backstage/plugin-search-backend-node/alpha';
import { GithubDiscussionsCollatorFactory } from './collators';

export const searchModuleGithubDiscussions = createBackendModule({
  pluginId: 'search',
  moduleId: 'github-discussions-collator',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        scheduler: coreServices.scheduler,
        indexRegistry: searchIndexRegistryExtensionPoint,
      },
      async init({ logger, config, scheduler, indexRegistry }) {
        const schedule = {
          frequency: { minutes: 45 },
          timeout: { minutes: 15 },
          initialDelay: { seconds: 3 },
        };
        indexRegistry.addCollator({
          schedule: scheduler.createScheduledTaskRunner(schedule),
          factory: GithubDiscussionsCollatorFactory.fromConfig(config, {
            logger,
            config,
          }),
        });
      },
    });
  },
});
