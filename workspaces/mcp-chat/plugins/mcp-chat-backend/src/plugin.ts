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
import { createRouter } from './router';
import {
  MCPClientServiceImpl,
  ChatConversationStore,
  SummarizationService,
} from './services';
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

        // Initialize core services
        const mcpClientService = new MCPClientServiceImpl({
          logger,
          config,
        });

        const conversationStore = await ChatConversationStore.create({
          database,
          logger,
          config,
        });

        // Initialize enhancement services
        const summarizationService = new SummarizationService({
          mcpClientService,
          logger,
          config,
        });

        // Mount router (includes conversation management routes)
        httpRouter.use(
          await createRouter({
            logger,
            mcpClientService,
            conversationStore,
            httpAuth,
            summarizationService,
          }),
        );
      },
    });
  },
});
