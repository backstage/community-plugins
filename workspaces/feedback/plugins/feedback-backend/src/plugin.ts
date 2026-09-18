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
import { feedbackPermissions } from '@backstage-community/plugin-feedback-common';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { actionsRegistryServiceRef } from '@backstage/backend-plugin-api/alpha';
import { notificationService } from '@backstage/plugin-notifications-node';
import { registerFeedbackActions } from './actions/feedbackActions';
import { createRouter } from './service/router';

/**
 * The feedback backend plugin.
 *
 * @public
 */
export const feedbackPlugin = createBackendPlugin({
  pluginId: 'feedback',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
        config: coreServices.rootConfig,
        discovery: coreServices.discovery,
        auth: coreServices.auth,
        database: coreServices.database,
        notifications: notificationService,
        httpAuth: coreServices.httpAuth,
        actionsRegistry: actionsRegistryServiceRef,
        permissionsRegistry: coreServices.permissionsRegistry,
        permissions: coreServices.permissions,
      },
      async init({
        logger,
        httpRouter,
        config,
        discovery,
        auth,
        database,
        notifications,
        httpAuth,
        actionsRegistry,
        permissionsRegistry,
        permissions,
      }) {
        await registerFeedbackActions({
          actionsRegistry,
          discovery,
          auth,
          config,
        });

        permissionsRegistry.addPermissions(feedbackPermissions);

        httpRouter.use(
          await createRouter({
            logger: logger,
            config: config,
            discovery: discovery,
            auth: auth,
            database: database,
            notifications,
            httpAuth,
            permissionsRegistry,
            permissions,
          }),
        );
      },
    });
  },
});
