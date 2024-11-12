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
    resolvePackagePath,
  } from '@backstage/backend-plugin-api';
  import { createRouter } from './service/router';
  
  /**
   * jiraPlugin backend plugin
   *
   * @public
   */
  export const jiraPlugin = createBackendPlugin({
    pluginId: 'jira',
    register(env) {
      env.registerInit({
        deps: {
          httpRouter: coreServices.httpRouter,
          logger: coreServices.logger,
          config: coreServices.rootConfig,
          database: coreServices.database,
          httpAuth: coreServices.httpAuth,
          userInfo: coreServices.userInfo,
        },
        async init({ httpRouter, logger, config, database }) {
          const client = await database.getClient();
          const migrationsDir = resolvePackagePath(
            '@backstage/plugin-jira-backend',
            'migrations',
          );
          console.log('dir: ', migrationsDir);
        
          await client.migrate.latest({
            directory: migrationsDir,
          });
        
          const router = await createRouter({
            db: client,
            configApi: config,
            logger,
            config,
          });
        
          httpRouter.use(router);
        }
        
      });
    },
  });
  