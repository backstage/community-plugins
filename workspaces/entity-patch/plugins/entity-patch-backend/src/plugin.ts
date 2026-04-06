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

/**
 * The entity-patch backend plugin.
 *
 * Exposes a REST API at `/api/entity-patch` for reading and persisting
 * entity patch form data.
 *
 * @public
 */
export const entityPatchPlugin = createBackendPlugin({
  pluginId: 'entity-patch',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        database: coreServices.database,
        httpAuth: coreServices.httpAuth,
        auth: coreServices.auth,
        userInfo: coreServices.userInfo,
        discovery: coreServices.discovery,
        config: coreServices.rootConfig,
      },
      async init({
        httpRouter,
        logger,
        database,
        httpAuth,
        auth,
        userInfo,
        discovery,
        config,
      }) {
        const router = await createRouter({
          logger,
          database,
          httpAuth,
          auth,
          userInfo,
          discovery,
          config,
        });

        httpRouter.use(router);
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
