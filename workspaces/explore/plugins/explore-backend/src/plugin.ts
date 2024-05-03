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
import { createRouter } from './service';
import { StaticExploreToolProvider } from './tools';
import {
  ExploreToolProvider,
  exploreToolProviderExtensionPoint,
} from '@backstage-community/plugin-explore-node';

/**
 * The explore backend plugin.
 *
 * @public
 */
export const explorePlugin = createBackendPlugin({
  pluginId: 'explore',
  register(env) {
    let customToolProvider: ExploreToolProvider | undefined;

    env.registerExtensionPoint(exploreToolProviderExtensionPoint, {
      setToolProvider(toolProvider) {
        if (customToolProvider) {
          throw new Error('Explore tool provider may only be set once');
        }
        customToolProvider = toolProvider;
      },
    });

    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
      },
      async init({ config, httpRouter, logger }) {
        httpRouter.use(
          await createRouter({
            logger,
            toolProvider:
              customToolProvider ??
              StaticExploreToolProvider.fromConfig(config),
          }),
        );
      },
    });
  },
});
