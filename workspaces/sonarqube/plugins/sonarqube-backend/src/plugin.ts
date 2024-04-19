/*
 * Copyright 2023 The Backstage Authors
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
import { DefaultSonarqubeInfoProvider } from './service/sonarqubeInfoProvider';
import { createRouter } from './service/router';

/**
 * Sonarqube backend plugin
 *
 * @public
 */
export const sonarqubePlugin = createBackendPlugin({
  pluginId: 'sonarqube',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        httpRouter: coreServices.httpRouter,
      },
      async init({ logger, config, httpRouter }) {
        httpRouter.use(
          await createRouter({
            /**
             * Logger for logging purposes
             */
            logger,
            /**
             * Info provider to be able to get all necessary information for the APIs
             */
            sonarqubeInfoProvider:
              DefaultSonarqubeInfoProvider.fromConfig(config),
          }),
        );
      },
    });
  },
});
