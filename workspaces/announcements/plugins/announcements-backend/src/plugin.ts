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

/**
 * A backend for the announcements plugin.
 * @public
 */
export const announcementsPlugin = createBackendPlugin({
  pluginId: 'announcements',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        http: coreServices.httpRouter,
        permissions: coreServices.permissions,
        database: coreServices.database,
        httpAuth: coreServices.httpAuth,
        config: coreServices.rootConfig,
        events: eventsServiceRef,
        signals: signalsServiceRef,
      },
      async init({
        http,
        logger,
        permissions,
        database,
        httpAuth,
        config,
        events,
        signals,
      }) {
        const context = await buildAnnouncementsContext({
          events,
          logger,
          config,
          database,
          permissions,
          signals,
          httpAuth,
        });

        const router = await createRouter(context);

        http.use(router);
      },
    });
  },
});
