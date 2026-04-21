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
import { actionsRegistryServiceRef } from '@backstage/backend-plugin-api/alpha';
import { createRouter } from './router';
import { createArgoCDActions } from './actions';
import { argocdPermissions } from '@backstage-community/plugin-argocd-common';
import { ArgoCDService } from '@backstage-community/plugin-argocd-node';

/**
 * ArgoCD backend plugin
 *
 * @public
 */
export const argoCDPlugin = createBackendPlugin({
  pluginId: 'backstage-community-argocd',
  register(env) {
    env.registerInit({
      deps: {
        actionsRegistry: actionsRegistryServiceRef,
        config: coreServices.rootConfig,
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        permissions: coreServices.permissions,
        permissionsRegistry: coreServices.permissionsRegistry,
      },
      async init({
        actionsRegistry,
        config,
        httpAuth,
        httpRouter,
        logger,
        permissions,
        permissionsRegistry,
      }) {
        permissionsRegistry.addPermissions(argocdPermissions);

        httpRouter.use(
          await createRouter({
            config,
            httpAuth,
            logger,
            permissions,
          }),
        );

        const argoCDService = new ArgoCDService(config, logger);
        createArgoCDActions({
          actionsRegistry,
          argoCDService,
          permissions,
          config,
          logger,
        });
      },
    });
  },
});
