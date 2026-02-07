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
import { N8nApi } from './service/n8nApi';
import { createRouter } from './service/router';

/**
 * n8n backend plugin
 *
 * @public
 */
export const n8nPlugin = createBackendPlugin({
  pluginId: 'n8n',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
        config: coreServices.rootConfig,
      },
      async init({ logger, httpRouter, config }) {
        const baseUrl = config.getString('n8n.baseUrl');
        const apiKey = config.getString('n8n.apiKey');

        const n8nApi = new N8nApi({ baseUrl, apiKey });

        const router = await createRouter({ logger, n8nApi });
        httpRouter.use(router);
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });

        logger.info('n8n backend plugin initialized');
      },
    });
  },
});
