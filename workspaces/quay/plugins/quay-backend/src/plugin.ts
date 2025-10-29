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

import { quayPermissions } from '@backstage-community/plugin-quay-common';

import { createRouter } from './services/router';

/**
 * Quay backend plugin
 *
 * @public
 */
export const quayPlugin = createBackendPlugin({
  pluginId: 'quay',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        permissions: coreServices.permissions,
        permissionsRegistry: coreServices.permissionsRegistry,
        httpRouter: coreServices.httpRouter,
        httpAuth: coreServices.httpAuth,
      },
      async init({
        config,
        logger,
        permissions,
        permissionsRegistry,
        httpAuth,
        httpRouter,
      }) {
        permissionsRegistry.addPermissions(quayPermissions);

        httpRouter.use(
          await createRouter({
            logger,
            config,
            permissions,
            httpAuth,
          }),
        );
      },
    });
  },
});
