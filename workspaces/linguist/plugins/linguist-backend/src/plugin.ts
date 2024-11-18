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

import { createRouter } from './service/router';

/**
 * Linguist backend plugin
 *
 * @public
 */
export const linguistPlugin = createBackendPlugin({
  pluginId: 'linguist',
  register(env) {
    env.registerInit({
      deps: {
        auth: coreServices.auth,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        reader: coreServices.urlReader,
        database: coreServices.database,
        discovery: coreServices.discovery,
        scheduler: coreServices.scheduler,
        httpRouter: coreServices.httpRouter,
      },
      async init({
        auth,
        logger,
        config,
        reader,
        database,
        discovery,
        scheduler,
        httpRouter,
      }) {
        httpRouter.use(
          await createRouter({
            auth,
            logger,
            config,
            reader,
            database,
            discovery,
            scheduler,
          }),
        );
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
