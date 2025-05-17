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

import { PolicyBuilder } from '@backstage-community/plugin-rbac-backend';
import {
  PluginIdProvider,
  PluginIdProviderExtensionPoint,
  pluginIdProviderExtensionPoint,
  RBACProvider,
  rbacProviderExtensionPoint,
} from '@backstage-community/plugin-rbac-node';

/**
 * @public
 * RBAC plugin
 *
 */
export const rbacPlugin = createBackendPlugin({
  pluginId: 'permission',
  register(env) {
    const pluginIdProviderExtensionPointImpl = new (class PluginIdProviderImpl
      implements PluginIdProviderExtensionPoint
    {
      pluginIdProviders: PluginIdProvider[] = [];

      addPluginIdProvider(pluginIdProvider: PluginIdProvider): void {
        this.pluginIdProviders.push(pluginIdProvider);
      }
    })();

    env.registerExtensionPoint(
      pluginIdProviderExtensionPoint,
      pluginIdProviderExtensionPointImpl,
    );

    const rbacProviders = new Array<RBACProvider>();

    env.registerExtensionPoint(rbacProviderExtensionPoint, {
      addRBACProvider(
        ...providers: Array<RBACProvider | Array<RBACProvider>>
      ): void {
        rbacProviders.push(...providers.flat());
      },
    });

    env.registerInit({
      deps: {
        http: coreServices.httpRouter,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        discovery: coreServices.discovery,
        permissions: coreServices.permissions,
        auth: coreServices.auth,
        httpAuth: coreServices.httpAuth,
        auditor: coreServices.auditor,
        userInfo: coreServices.userInfo,
        lifecycle: coreServices.lifecycle,
        permissionsRegistry: coreServices.permissionsRegistry,
      },
      async init({
        http,
        config,
        logger,
        discovery,
        permissions,
        auth,
        httpAuth,
        auditor,
        userInfo,
        lifecycle,
        permissionsRegistry: permissionsRegistry,
      }) {
        http.use(
          await PolicyBuilder.build(
            {
              config,
              logger,
              discovery,
              permissions,
              auth,
              httpAuth,
              auditor,
              userInfo,
              lifecycle,
              permissionsRegistry: permissionsRegistry,
            },
            {
              getPluginIds: () =>
                Array.from(
                  new Set(
                    pluginIdProviderExtensionPointImpl.pluginIdProviders.flatMap(
                      p => p.getPluginIds(),
                    ),
                  ),
                ),
            },
            rbacProviders,
          ),
        );
      },
    });
  },
});
