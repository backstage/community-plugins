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
import { catalogServiceRef } from '@backstage/plugin-catalog-node';

import { DefaultJenkinsInfoProvider } from './service/jenkinsInfoProvider';
import { JenkinsBuilder } from './service/JenkinsBuilder';
import { jenkinsPermissions } from '@backstage-community/plugin-jenkins-common';

/**
 * Jenkins backend plugin
 *
 * @public
 */
export const jenkinsPlugin = createBackendPlugin({
  pluginId: 'jenkins',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        permissions: coreServices.permissions,
        permissionsRegistry: coreServices.permissionsRegistry,
        httpRouter: coreServices.httpRouter,
        config: coreServices.rootConfig,
        catalog: catalogServiceRef,
        discovery: coreServices.discovery,
        auth: coreServices.auth,
        httpAuth: coreServices.httpAuth,
      },
      async init({
        logger,
        permissions,
        permissionsRegistry,
        httpRouter,
        config,
        catalog,
        discovery,
        auth,
        httpAuth,
      }) {
        permissionsRegistry.addPermissions(jenkinsPermissions);

        const jenkinsInfoProvider = DefaultJenkinsInfoProvider.fromConfig({
          auth,
          httpAuth,
          config,
          catalog,
          discovery,
          logger,
        });

        const builder = JenkinsBuilder.createBuilder({
          logger,
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
