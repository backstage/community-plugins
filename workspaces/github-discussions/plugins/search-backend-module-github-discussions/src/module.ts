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
import { GithubDiscussionsCollatorFactory } from './collators';
import {
  DefaultGithubCredentialsProvider,
  ScmIntegrations,
} from '@backstage/integration';
import { Duration } from 'luxon';

const defaultSchedule = {
  frequency: { minutes: 45 },
  timeout: { minutes: 30 },
  initialDelay: { seconds: 10 },
};

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
          : defaultSchedule;

        const timeout = Duration.fromObject(schedule.timeout).as(
          'milliseconds',
        );
        const integrations = ScmIntegrations.fromConfig(config);
        const { github: githubIntegration } = integrations;
        const credentialsProvider =
          DefaultGithubCredentialsProvider.fromIntegrations(integrations);

        const url = _config.getString('url');
        const cacheBase = _config.getOptionalString('cacheBase');
        const clearCacheOnSuccess = _config.getOptionalBoolean(
          'clearCacheOnSuccess',
        );
        const discussionsBatchSize = _config.getOptionalNumber(
          'discussionsBatchSize',
        );
        const commentsBatchSize =
          _config.getOptionalNumber('commentsBatchSize');
        const repliesBatchSize = _config.getOptionalNumber('repliesBatchSize');

        indexRegistry.addCollator({
          schedule: scheduler.createScheduledTaskRunner(schedule),
          factory: GithubDiscussionsCollatorFactory.fromConfig({
            logger,
            credentialsProvider,
            githubIntegration,
            timeout,
            url,
            cacheBase,
            clearCacheOnSuccess,
            discussionsBatchSize,
            commentsBatchSize,
            repliesBatchSize,
          }),
        });
      },
    });
  },
});
