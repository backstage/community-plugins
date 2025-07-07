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
  createBackendPlugin,
  coreServices,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { signalsServiceRef } from '@backstage/plugin-signals-node';
import { eventsServiceRef } from '@backstage/plugin-events-node';
import { buildAnnouncementsContext } from './service';
import { announcementEntityPermissions } from '@backstage-community/plugin-announcements-common';

/**
 * A backend for the announcements plugin.
 * @public
 */
export const announcementsPlugin = createBackendPlugin({
  pluginId: 'announcements',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        database: coreServices.database,
        events: eventsServiceRef,
        http: coreServices.httpRouter,
        httpAuth: coreServices.httpAuth,
        logger: coreServices.logger,
        permissions: coreServices.permissions,
        permissionsRegistry: coreServices.permissionsRegistry,
        signals: signalsServiceRef,
      },
      async init({
        config,
        database,
        events,
        http,
        httpAuth,
        logger,
        permissions,
        permissionsRegistry,
        signals,
      }) {
        const context = await buildAnnouncementsContext({
          config,
          database,
          events,
          httpAuth,
          logger,
          permissions,
          permissionsRegistry,
          signals,
        });

        permissionsRegistry.addPermissions(
          Object.values(announcementEntityPermissions),
        );

        const router = await createRouter(context);

        http.use(router);
      },
    });
  },
});
