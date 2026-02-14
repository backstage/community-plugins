/*
 * Copyright 2026 The Backstage Authors
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
  createBackendPlugin,
  coreServices,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { CatalogClient } from '@backstage/catalog-client';

/**
 * The Fairwinds Insights backend plugin.
 *
 * @public */
export const fairwindsInsightsPlugin = createBackendPlugin({
  pluginId: 'fairwinds-insights',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
        discovery: coreServices.discovery,
        auth: coreServices.auth,
        cache: coreServices.cache,
      },
      async init({ config, logger, httpRouter, discovery, auth, cache }) {
        const catalogApi = new CatalogClient({
          discoveryApi: discovery,
        });

        httpRouter.use(
          await createRouter({
            config,
            catalogApi,
            logger,
            auth,
            cache,
          }),
        );
      },
    });
  },
});
