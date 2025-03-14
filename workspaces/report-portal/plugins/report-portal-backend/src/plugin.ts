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
  createBackendPlugin,
} from '@backstage/backend-plugin-api';

import { createRouter } from './service/router';

/**
 * The report-portal backend plugin.
 * @packageDocumentation
 * @public
 */
export const reportPortalPlugin = createBackendPlugin({
  pluginId: 'report-portal',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        http: coreServices.httpRouter,
      },
      async init({ config, logger, http }) {
        if (!config.has('reportPortal.integrations')) {
          logger.error(
            `No 'reportPortal.integrations' configured in you app-config.yaml`,
          );
          return;
        }
        http.use(
          await createRouter({
            config: config,
            logger: logger,
          }),
        );
      },
    });
  },
});
