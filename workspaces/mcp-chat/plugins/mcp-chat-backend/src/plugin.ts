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
  resolvePackagePath,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { MCPClientServiceImpl } from './services/MCPClientServiceImpl';
import { ChatConversationStore } from './services/ChatConversationStore';
import { validateConfig } from './utils';

/**
 * mcpChatPlugin backend plugin
 *
 * @public
 */
export const mcpChatPlugin = createBackendPlugin({
  pluginId: 'mcp-chat',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        httpRouter: coreServices.httpRouter,
        database: coreServices.database,
        httpAuth: coreServices.httpAuth,
      },
      async init({ logger, httpRouter, config, database, httpAuth }) {
        validateConfig(config);

        // Initialize database connection
        const db = await database.getClient();

        // Run migrations
        logger.info('Running database migrations for MCP Chat...');
        const migrationsDir = resolvePackagePath(
          '@backstage-community/plugin-mcp-chat-backend',
          'migrations',
        );
        logger.info(`Migrations directory: ${migrationsDir}`);

        const [batchNo, log] = await db.migrate.latest({
          directory: migrationsDir,
        });

        if (log.length === 0) {
          logger.info('Database is already up to date');
        } else {
          logger.info(`Batch ${batchNo} run: ${log.length} migrations applied`);
          log.forEach((migration: string) => {
            logger.info(`  - ${migration}`);
          });
        }

        // Initialize services
        const mcpClientService = new MCPClientServiceImpl({
          logger,
          config,
        });

        const conversationStore = new ChatConversationStore(db, logger, config);

        httpRouter.use(
          await createRouter({
            logger,
            mcpClientService,
            conversationStore,
            httpAuth,
          }),
        );
      },
    });
  },
});
