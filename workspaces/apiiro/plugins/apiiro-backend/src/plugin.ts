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
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { ApiiroDataService } from './service/data.service';
import { RepositoryCacheService } from './service/cache.service';
import {
  REPOSITORY_CACHE_REFRESH_INTERVAL_MINUTES,
  REPOSITORY_CACHE_REFRESH_TIMEOUT_MINUTES,
} from './constants';

/**
 * Apiiro backend plugin.
 *
 * Registers the HTTP router under `/api/apiiro` and wires required core
 * services. The router implements proxy endpoints to the Apiiro REST API.
 *
 * Includes a scheduled task to refresh the repository cache periodically
 * to improve performance when dealing with large numbers of repositories.
 */

/** @public */
export const apiiroBackendPlugin = createBackendPlugin({
  pluginId: 'apiiro',
  register(env) {
    env.registerInit({
      deps: {
        httpAuth: coreServices.httpAuth,
        discovery: coreServices.discovery,
        auth: coreServices.auth,
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        scheduler: coreServices.scheduler,
        cache: coreServices.cache,
      },
      async init({
        httpAuth,
        discovery,
        auth,
        httpRouter,
        config,
        logger,
        scheduler,
        cache,
      }) {
        // Initialize cache service
        const dataService = ApiiroDataService.fromConfig(config, cache, logger);
        const repoService = new RepositoryCacheService(
          dataService,
          cache,
          logger,
        );

        // Schedule periodic cache refresh
        // Runs every 60 minutes to keep repository data fresh
        await scheduler.scheduleTask({
          id: 'apiiro-refresh-repositories-cache',
          frequency: { minutes: REPOSITORY_CACHE_REFRESH_INTERVAL_MINUTES },
          timeout: { minutes: REPOSITORY_CACHE_REFRESH_TIMEOUT_MINUTES },
          fn: async () => {
            logger.info('Running scheduled repository cache refresh...');
            try {
              await repoService.refreshAllRepositoriesCache();
              logger.info(
                'Scheduled repository cache refresh completed successfully',
              );
            } catch (error) {
              logger.error('Scheduled repository cache refresh failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
              });
              // Don't throw - let the scheduler continue running
            }
          },
        });

        logger.info(
          `Repository cache refresh task scheduled (every ${REPOSITORY_CACHE_REFRESH_INTERVAL_MINUTES} minutes)`,
        );

        httpRouter.use(
          await createRouter({
            auth,
            discovery,
            httpAuth,
            logger,
            config,
            cache,
            repoService,
          }),
        );
      },
    });
  },
});
