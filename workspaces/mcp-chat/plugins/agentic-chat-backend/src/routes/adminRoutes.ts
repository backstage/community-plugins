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
import { InputError } from '@backstage/errors';
import { AdminConfigService } from '../services/AdminConfigService';
import { McpTestService } from '../services/McpTestService';
import { MAX_DESCRIPTION_LENGTH, MAX_RAG_SEARCH_RESULTS } from '../constants';
import { createWithRoute } from './routeWrapper';
import type { RouteContext } from './types';
import type { AdminRouteDeps } from './adminRouteTypes';
import { registerAdminConfigRoutes } from './adminConfigRoutes';
import { registerAdminModelRoutes } from './adminModelRoutes';
import { registerAdminDocumentRoutes } from './adminDocumentRoutes';
import { registerAdminVectorStoreRoutes } from './adminVectorStoreRoutes';
import { registerAdminSessionRoutes } from './adminSessionRoutes';
import { registerProviderRoutes } from './providerRoutes';
import { toErrorMessage } from '../services/utils';

export type { AdminRouteDeps } from './adminRouteTypes';

/**
 * Registers admin-only routes under /admin/*.
 * All routes in this module are gated by the requireAdminAccess middleware.
 *
 * Endpoints:
 *   GET    /admin/config/:key     — Read a config entry
 *   PUT    /admin/config/:key     — Set / update a config entry
 *   DELETE /admin/config/:key     — Delete a config entry (revert to YAML)
 *   GET    /admin/config          — List all admin config entries
 *   GET    /admin/effective-config — Effective merged config for admin panel
 *   POST   /admin/documents       — Upload a document (multipart)
 *   DELETE /admin/documents/:id   — Delete a document
 *   POST   /admin/rag-test        — Test a RAG query
 *   POST   /admin/mcp/test-connection — Test MCP server connection
 *   GET    /admin/vector-store-config — Effective vector store config (YAML + DB)
 *   POST   /admin/vector-store/create — Create vector store with config
 *   GET    /admin/vector-store/status — Vector store status
 *   GET    /admin/vector-stores   — List active vector stores
 *   POST   /admin/vector-stores/connect — Connect a vector store
 *   DELETE /admin/vector-stores/:id — Remove/disconnect vector store
 *   GET    /admin/models         — List available models from inference server
 *   POST   /admin/test-model      — Test model connection
 *   POST   /admin/generate-system-prompt — Generate system prompt from description
 *   GET    /admin/sessions        — List all sessions
 *   GET    /admin/sessions/:sessionId/messages — Get session messages
 */
export function registerAdminRoutes(
  ctx: RouteContext,
  adminConfig: AdminConfigService,
  onConfigChanged?: () => void,
  providerManager?: import('../providers').ProviderManager,
): void {
  const {
    router,
    logger,
    config,
    provider,
    sessions,
    sendRouteError,
    getUserRef,
    requireAdminAccess,
    missingSessions,
    missingConversations,
  } = ctx;

  const withRoute = createWithRoute(logger, sendRouteError);

  router.use('/admin', requireAdminAccess);

  const deps: AdminRouteDeps = {
    router,
    logger,
    config,
    provider,
    adminConfig,
    providerManager,
    sendRouteError,
    getUserRef,
    requireAdminAccess,
    onConfigChanged,
    sessions,
    missingSessions,
    missingConversations,
  };

  registerProviderRoutes(router, deps);
  registerAdminConfigRoutes(router, deps);
  registerAdminModelRoutes(router, deps);
  registerAdminDocumentRoutes(router, deps);
  registerAdminVectorStoreRoutes(router, deps);
  registerAdminSessionRoutes(router, deps);

  // ---------------------------------------------------------------------------
  // RAG Test (kept inline — small)
  // ---------------------------------------------------------------------------

  router.post(
    '/admin/rag-test',
    withRoute(
      'POST /admin/rag-test',
      'Failed to test RAG query',
      async (req, res) => {
        if (!provider.rag?.searchVectorStore) {
          res.status(501).json({
            success: false,
            error: 'RAG search not supported by current provider',
          });
          return;
        }

        const { query, maxResults, vectorStoreId, vectorStoreIds } = req.body;
        if (typeof query !== 'string' || query.trim().length === 0) {
          throw new InputError('query must be a non-empty string');
        }
        if (query.length > MAX_DESCRIPTION_LENGTH) {
          throw new InputError(
            `query must be at most ${MAX_DESCRIPTION_LENGTH} characters`,
          );
        }
        if (
          maxResults !== undefined &&
          (typeof maxResults !== 'number' ||
            maxResults < 1 ||
            maxResults > MAX_RAG_SEARCH_RESULTS)
        ) {
          throw new InputError(
            `maxResults must be a number between 1 and ${MAX_RAG_SEARCH_RESULTS}`,
          );
        }
        if (
          vectorStoreId !== undefined &&
          (typeof vectorStoreId !== 'string' ||
            vectorStoreId.trim().length === 0)
        ) {
          throw new InputError('vectorStoreId must be a non-empty string');
        }
        if (
          vectorStoreIds !== undefined &&
          (!Array.isArray(vectorStoreIds) ||
            vectorStoreIds.some((id: unknown) => typeof id !== 'string'))
        ) {
          throw new InputError('vectorStoreIds must be an array of strings');
        }

        const result = await provider.rag.searchVectorStore(
          query.trim(),
          maxResults,
          vectorStoreId,
          vectorStoreIds,
        );
        res.json({
          success: true,
          ...result,
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );

  // ---------------------------------------------------------------------------
  // MCP Server Connection Test (kept inline — small)
  // ---------------------------------------------------------------------------

  router.post(
    '/admin/mcp/test-connection',
    withRoute(
      'POST /admin/mcp/test-connection',
      'Failed to test MCP connection',
      async (req, res) => {
        const {
          url,
          type,
          headers: reqHeaders,
        } = req.body as {
          url?: string;
          type?: string;
          headers?: Record<string, string>;
        };

        if (!url || typeof url !== 'string' || url.trim().length === 0) {
          throw new InputError(
            'URL is required and must be a non-empty string',
          );
        }

        if (type !== undefined) {
          if (type !== 'streamable-http' && type !== 'sse') {
            throw new InputError("type must be 'streamable-http' or 'sse'");
          }
        }

        if (reqHeaders !== undefined) {
          if (
            typeof reqHeaders !== 'object' ||
            reqHeaders === null ||
            Array.isArray(reqHeaders)
          ) {
            throw new InputError('headers must be a plain object');
          }
        }

        try {
          const _parsed = new URL(url);
          void _parsed;
        } catch {
          throw new InputError(`Invalid URL: ${url}`);
        }

        const skipTls =
          config.getOptionalBoolean('agenticChat.llamaStack.skipTlsVerify') ??
          false;
        const service = new McpTestService(skipTls, logger);

        try {
          const result = await service.testConnection(url, type, reqHeaders);

          if (!result.success) {
            res.status(400).json(result);
            return;
          }

          res.json(result);
        } catch (error) {
          const msg = toErrorMessage(error, 'Connection failed');
          logger.warn(`MCP test-connection failed: ${msg}`);
          res.json({ success: false, error: msg });
        }
      },
    ),
  );
}
