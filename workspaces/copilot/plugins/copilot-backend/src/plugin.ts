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
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { createRouterFromConfig } from './service/router';
import {
  copilotUserResolverExtensionPoint,
  CopilotUserResolver,
  DefaultCopilotUserResolver,
} from './userResolver';

/**
 * Backend plugin for Copilot.
 *
 * @public
 */
export const copilotPlugin = createBackendPlugin({
  pluginId: 'copilot',
  register(env) {
    let userResolver: CopilotUserResolver | undefined;

    env.registerExtensionPoint(copilotUserResolverExtensionPoint, {
      setUserResolver(resolver) {
        if (userResolver) {
          throw new Error('The copilot user resolver has already been set');
        }
        userResolver = resolver;
      },
    });

    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        database: coreServices.database,
        scheduler: coreServices.scheduler,
        config: coreServices.rootConfig,
        httpAuth: coreServices.httpAuth,
        userInfo: coreServices.userInfo,
        catalog: catalogServiceRef,
      },
      async init({
        httpRouter,
        logger,
        database,
        scheduler,
        config,
        httpAuth,
        userInfo,
        catalog,
      }) {
        httpRouter.use(
          await createRouterFromConfig({
            logger,
            database,
            scheduler,
            config,
            httpAuth,
            userInfo,
            catalog,
            userResolver: userResolver ?? new DefaultCopilotUserResolver(),
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
