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
  createBackendModule,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';

import { SettingsDatabase } from './database';
import { createSettingsRouter } from './settingsRouter';

const migrationsDir = resolvePackagePath(
  '@backstage-community/plugin-announcements-backend-module-settings',
  'db/migrations',
);

export const announcementsModuleSettings = createBackendModule({
  pluginId: 'announcements',
  moduleId: 'settings',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        database: coreServices.database,
        httpRouter: coreServices.httpRouter,
        httpAuth: coreServices.httpAuth,
        permissions: coreServices.permissions,
        auditor: coreServices.auditor,
      },
      async init({
        logger,
        database,
        httpRouter,
        httpAuth,
        permissions,
        auditor,
      }) {
        const client = await database.getClient();

        if (!database.migrations?.skip) {
          await client.migrate.latest({
            directory: migrationsDir,
          });
        }

        const settingsStore = await SettingsDatabase.withDefaults(client);

        const settingsRouter = createSettingsRouter({
          auditor,
          httpAuth,
          logger,
          permissions,
          settingsStore,
        });

        httpRouter.use(settingsRouter);

        logger.info('Announcements settings module initialized');
      },
    });
  },
});
