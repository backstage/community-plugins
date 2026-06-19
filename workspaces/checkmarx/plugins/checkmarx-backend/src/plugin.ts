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
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { createRouter } from './service/router';
import { DefaultCheckmarxInfoProvider } from './service/checkmarxInfoProvider';

/** @public */
export const checkmarxPlugin = createBackendPlugin({
  pluginId: 'checkmarx',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        httpRouter: coreServices.httpRouter,
        httpAuth: coreServices.httpAuth,
        catalog: catalogServiceRef,
      },
      async init({ logger, config, httpRouter, httpAuth, catalog }) {
        const router = await createRouter({
          logger,
          checkmarxInfoProvider:
            DefaultCheckmarxInfoProvider.fromConfig(config),
          catalog,
          httpAuth,
        });

        const factory = MiddlewareFactory.create({ logger, config });
        router.use(factory.error());

        httpRouter.use(router);
      },
    });
  },
});
