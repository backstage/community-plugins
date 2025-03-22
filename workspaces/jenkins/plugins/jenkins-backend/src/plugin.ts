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
import {
  DefaultJenkinsInfoProvider,
  JenkinsInfoProvider,
} from './service/jenkinsInfoProvider';
import { catalogServiceRef } from '@backstage/plugin-catalog-node/alpha';
import { JenkinsBuilder } from './service/JenkinsBuilder';
import { jenkinsInfoProviderExtensionPoint } from './extensions';

/**
 * Jenkins backend plugin
 *
 * @public
 */
export const jenkinsPlugin = createBackendPlugin({
  pluginId: 'jenkins',
  register(env) {
    let jenkinsInfoProvider: JenkinsInfoProvider | undefined;

    env.registerExtensionPoint(jenkinsInfoProviderExtensionPoint, {
      setInfoProvider(customInfoProvider: JenkinsInfoProvider) {
        if (jenkinsInfoProvider) {
          throw new Error('The JenkinsInfoProvider has been already set');
        }
        jenkinsInfoProvider = customInfoProvider;
      },
    });

    env.registerInit({
      deps: {
        logger: coreServices.logger,
        permissions: coreServices.permissions,
        httpRouter: coreServices.httpRouter,
        config: coreServices.rootConfig,
        catalogClient: catalogServiceRef,
        discovery: coreServices.discovery,
        auth: coreServices.auth,
        httpAuth: coreServices.httpAuth,
      },
      async init({
        logger,
        permissions,
        httpRouter,
        config,
        catalogClient,
        discovery,
        auth,
        httpAuth,
      }) {
        jenkinsInfoProvider =
          jenkinsInfoProvider ??
          DefaultJenkinsInfoProvider.fromConfig({
            auth,
            httpAuth,
            config,
            catalog: catalogClient,
            discovery,
            logger,
          });

        const builder = JenkinsBuilder.createBuilder({
          /**
           * Logger for logging purposes
           */
          logger,
          /**
           * Info provider to be able to get all necessary information for the APIs
           */
          jenkinsInfoProvider,
          config,
          permissions,
          discovery,
          auth,
          httpAuth,
        });
        const { router } = await builder.build();
        httpRouter.use(router);
      },
    });
  },
});
