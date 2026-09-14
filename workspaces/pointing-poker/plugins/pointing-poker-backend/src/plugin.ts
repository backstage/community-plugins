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
import { createRouter } from './service/router';
import { DatabaseClient } from './database/DatabaseClient';
import { pointingPokerTicketProviderExtensionPoint } from './extensionPoints';
import type { TicketProvider } from '@backstage-community/plugin-pointing-poker-common';

/** @public */
export const pointingPokerPlugin = createBackendPlugin({
  pluginId: 'pointing-poker',
  register(env) {
    let ticketProvider: TicketProvider | undefined;

    env.registerExtensionPoint(pointingPokerTicketProviderExtensionPoint, {
      setProvider(provider) {
        ticketProvider = provider;
      },
    });

    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        database: coreServices.database,
      },
      async init({ httpRouter, logger, database }) {
        const db = await DatabaseClient.create(database);
        const router = createRouter({
          db,
          logger,
          ticketProvider: () => ticketProvider,
        });
        httpRouter.use(router);
        httpRouter.addAuthPolicy({
          path: '/',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
