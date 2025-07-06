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
import { searchIndexRegistryExtensionPoint } from '@backstage/plugin-search-backend-node/alpha';
import {
  GithubDiscussionsCollatorFactory,
  DEFAULT_SCHEDULE,
} from './collators';

/**
 * Search backend module for GitHub discussions index.
 * @public
 */
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
        const _config = config.getConfig('search.collators.githubDiscussions');
        const schedule = _config.has('schedule')
          ? readSchedulerServiceTaskScheduleDefinitionFromConfig(
              _config.getConfig('schedule'),
            )
          : DEFAULT_SCHEDULE;

        indexRegistry.addCollator({
          schedule: scheduler.createScheduledTaskRunner(schedule),
          factory: await GithubDiscussionsCollatorFactory.fromConfig({
            config,
            logger,
          }),
        });
      },
    });
  },
});
