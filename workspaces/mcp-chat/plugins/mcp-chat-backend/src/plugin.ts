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
import { llmProviderExtensionPoint } from './extensions';
import { LLMProvider } from './providers/base-provider';

/**
 * mcpChatPlugin backend plugin
 *
 * @public
 */
export const mcpChatPlugin = createBackendPlugin({
  pluginId: 'mcp-chat',
  register(env) {
    const providers = new Map<string, LLMProvider>();

    env.registerExtensionPoint(llmProviderExtensionPoint, {
      registerProvider(type: string, provider: LLMProvider) {
        // Last-write-wins on duplicate registration (Req 1.4)
        providers.set(type, provider);
      },
    });

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

        // Resolve active provider from extension point registry (Req 6.3, 8.2)
        const configuredProviders =
          config.getOptionalConfigArray('mcpChat.providers') ?? [];
        const activeId = configuredProviders[0]?.getString('id');

        if (!activeId) {
          throw new Error('No provider configured in mcpChat.providers[0].id');
        }

        const activeProvider = providers.get(activeId);
        if (!activeProvider) {
          const available = Array.from(providers.keys()).join(', ');
          throw new Error(
            `No provider module registered for type '${activeId}'. ` +
              `Available registered types: [${available}]. ` +
              `Install the corresponding module package.`,
          );
        }

        if (providers.size > 0) {
          for (const [type] of providers) {
            if (type === activeId) {
              logger.info(`Active LLM provider: '${type}'`);
            }
          }
        }

        // Inject resolved provider into MCPClientServiceImpl (Req 8.2)
        const mcpClientService = new MCPClientServiceImpl({
          logger,
          config,
          provider: activeProvider,
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
