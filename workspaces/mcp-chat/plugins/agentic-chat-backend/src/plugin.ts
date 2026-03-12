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
import { agenticChatPermissions } from '@backstage-community/plugin-agentic-chat-common';
import type { ProviderType } from '@backstage-community/plugin-agentic-chat-common';
import { createRouter } from './router';
import { createProvider, ProviderManager } from './providers';
import { ChatSessionService } from './services/ChatSessionService';
import { AdminConfigService } from './services/AdminConfigService';
import { toErrorMessage } from './services/utils';

const SYNC_TASK_TIMEOUT_MINUTES = 30;

/**
 * Parse duration string to milliseconds
 * Supports: '30s', '5m', '1h', '1d'
 */
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)(s|m|h|d)$/);
  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unknown duration unit: ${unit}`);
  }
}

/**
 * Agentic Chat backend plugin
 *
 * Provides agentic AI chat with RAG, tool calling, and safety guardrails.
 * The agentic provider is configurable via `agenticChat.provider` in app-config.yaml
 * (default: 'llamastack'). Each provider implements the AgenticProvider
 * interface and brings its own chat, RAG, safety, and evaluation capabilities.
 *
 * @public
 */
export const agenticChatPlugin = createBackendPlugin({
  pluginId: 'agentic-chat',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        httpRouter: coreServices.httpRouter,
        httpAuth: coreServices.httpAuth,
        permissions: coreServices.permissions,
        permissionsRegistry: coreServices.permissionsRegistry,
        scheduler: coreServices.scheduler,
        database: coreServices.database,
      },
      async init({
        logger,
        httpRouter,
        config,
        scheduler,
        httpAuth,
        permissions,
        permissionsRegistry,
        database,
      }) {
        logger.info('Initializing Agentic Chat backend plugin');

        // Register the single plugin-level permission with the permissions framework
        // This controls access to the entire Agentic Chat plugin (all or nothing)
        // Configure via RBAC policies to restrict access to specific Keycloak groups
        permissionsRegistry.addPermissions(agenticChatPermissions);
        logger.info(
          'Registered agenticChat.access permission for plugin-level access control',
        );

        // Get security mode early to configure auth policies correctly
        const securityMode =
          config.getOptionalString('agenticChat.security.mode') ||
          'plugin-only';
        logger.info(`Agentic Chat security mode: ${securityMode}`);

        // Initialize shared admin config service (DB-backed, shared by provider and router)
        const adminConfig = new AdminConfigService(database, logger);
        await adminConfig.initialize();

        // Create the provider factory options (shared across hot-swaps)
        const providerOptions = { logger, config, database, adminConfig };

        // Factory function for creating providers by type
        const providerFactory = (type: ProviderType) =>
          createProvider(providerOptions, type);

        // Create and initialize the initial provider
        const initialProvider = createProvider(providerOptions);
        try {
          await initialProvider.initialize();
          await initialProvider.postInitialize();
        } catch (initError) {
          logger.error(
            `Provider initialization failed: ${toErrorMessage(
              initError,
            )}. The plugin will start but functionality may be limited.`,
          );
        }

        const providerManager = new ProviderManager(
          initialProvider,
          providerFactory,
          logger,
        );

        // Set up periodic document sync if configured and provider supports RAG
        const syncSchedule = config.getOptionalString(
          'agenticChat.documents.syncSchedule',
        );
        if (syncSchedule && providerManager.provider.rag) {
          try {
            const intervalMs = parseDuration(syncSchedule);
            logger.info(
              `Setting up periodic document sync every ${syncSchedule} (${intervalMs}ms)`,
            );

            await scheduler.scheduleTask({
              id: 'agentic-chat-document-sync',
              frequency: { milliseconds: intervalMs },
              timeout: { minutes: SYNC_TASK_TIMEOUT_MINUTES },
              fn: async () => {
                const currentProvider = providerManager.provider;
                logger.info('Running scheduled document sync');
                try {
                  const result = await currentProvider.rag!.syncDocuments();
                  logger.info(
                    `Scheduled sync completed: added=${result.added}, updated=${result.updated}, removed=${result.removed}`,
                  );
                } catch (error) {
                  logger.error(
                    `Scheduled sync failed: ${toErrorMessage(error)}`,
                  );
                }
              },
            });
          } catch (error) {
            logger.warn(
              `Invalid sync schedule format: ${syncSchedule}. Use formats like '30m', '1h', '1d'`,
            );
          }
        }

        // Initialize session service (local DB for session metadata)
        let sessions: ChatSessionService | undefined;
        try {
          const sessionService = new ChatSessionService(database, logger);
          await sessionService.initialize();
          sessions = sessionService;
          logger.info('Chat session service initialized');
        } catch (sessError) {
          logger.error(
            `Session service initialization failed: ${toErrorMessage(
              sessError,
            )}. Sessions will be unavailable.`,
          );
        }

        // Register HTTP routes
        httpRouter.use(
          await createRouter({
            logger,
            config,
            httpAuth,
            permissions,
            database,
            providerManager,
            sessions,
            adminConfig,
          }),
        );

        // Health check endpoint is always unauthenticated (for load balancers/k8s probes)
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });

        // MCP namespacing proxy — called by LlamaStack, not by browser users.
        // Must be unauthenticated because LlamaStack does not carry Backstage credentials.
        httpRouter.addAuthPolicy({
          path: '/mcp-proxy',
          allow: 'unauthenticated',
        });

        // Auth policy depends on security mode:
        // - 'none': all endpoints allow unauthenticated access
        // - 'plugin-only' or 'full': require user-cookie (OIDC session)
        const authPolicy: 'unauthenticated' | 'user-cookie' =
          securityMode === 'none' ? 'unauthenticated' : 'user-cookie';

        const protectedPaths = [
          '/status',
          '/branding',
          '/sessions',
          '/conversations',
          '/workflows',
          '/quick-actions',
          '/documents',
          '/chat',
          '/chat/stream',
          '/chat/approve',
          '/sync',
          '/safety/status',
          '/evaluation/status',
          '/vector-stores',
          '/swim-lanes',
          '/admin',
        ];

        for (const path of protectedPaths) {
          httpRouter.addAuthPolicy({ path, allow: authPolicy });
        }

        if (securityMode === 'none') {
          logger.info(
            'Auth policy: All endpoints allow unauthenticated access (mode: none)',
          );
        } else {
          logger.info(
            'Auth policy: Endpoints require user-cookie authentication (mode: plugin-only/full)',
          );
        }

        logger.info('Agentic Chat backend plugin initialized successfully');
      },
    });
  },
});
