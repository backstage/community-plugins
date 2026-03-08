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
  LoggerService,
  HttpAuthService,
  PermissionsService,
  DatabaseService,
} from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import type { SecurityMode } from '@backstage-community/plugin-agentic-chat-common';
import express from 'express';
import Router from 'express-promise-router';
import type { ProviderManager } from './providers';
import type { ChatSessionService } from './services/ChatSessionService';
import type { RouteContext } from './routes';
import {
  registerStatusRoutes,
  registerChatRoutes,
  registerDocumentRoutes,
  registerConfigRoutes,
  registerSessionRoutes,
  registerConversationRoutes,
  registerAdminRoutes,
} from './routes';
import { toErrorMessage } from './services/utils';
import type { AdminConfigService } from './services/AdminConfigService';
import { createSecurityMiddleware } from './middleware/security';
import {
  parseChatRequest,
  parseApprovalRequest,
} from './parsers/chatRequestParsers';

export interface RouterOptions {
  logger: LoggerService;
  config: import('@backstage/config').Config;
  httpAuth: HttpAuthService;
  permissions: PermissionsService;
  database: DatabaseService;
  providerManager: ProviderManager;
  sessions?: ChatSessionService;
  adminConfig: AdminConfigService;
}

/**
 * Creates an Express router for the Agentic Chat backend
 *
 * Documents are managed via config-driven ingestion, not via API endpoints.
 * The documents endpoint is read-only for viewing what's in the knowledge base.
 *
 * Authentication & Authorization:
 * - All endpoints (except /health) require user authentication via Backstage httpAuth
 * - Authorization uses a single plugin-level permission: agenticChat.access
 * - If a user has the permission, they get FULL access to all features
 * - If not, they are blocked from the entire plugin
 *
 * To restrict access to a Keycloak group, configure RBAC policies in app-config.yaml:
 * ```yaml
 * permission:
 *   enabled: true
 *   rbac:
 *     policies:
 *       # Map Keycloak group to a role
 *       - g, group:default/agentic-chat-users, role:default/agentic-chat-user
 *       # Grant plugin access to the role (single permission for entire plugin)
 *       - p, role:default/agentic-chat-user, agenticChat.access, read, allow
 * ```
 *
 * @public
 */
export async function createRouter({
  logger,
  config,
  httpAuth,
  permissions,
  providerManager,
  sessions,
  adminConfig,
}: RouterOptions): Promise<express.Router> {
  const router = Router();
  router.use(express.json({ limit: '1mb' }));

  // =============================================================================
  // Shared Helpers
  // =============================================================================

  function sanitizeErrorMessage(raw: string): {
    message: string;
    inferredStatus?: number;
  } {
    // Extract detail from LlamaStack errors:
    // "Llama Stack API error: 400 Bad Request - {"detail":"..."}"
    const llamaMatch = raw.match(
      /Llama Stack API error:\s*(\d{3})\s*[^-]*-\s*(.*)/s,
    );
    if (llamaMatch) {
      const status = parseInt(llamaMatch[1], 10);
      const body = llamaMatch[2].trim();
      try {
        const parsed = JSON.parse(body);
        if (typeof parsed.detail === 'string') {
          return { message: parsed.detail, inferredStatus: status };
        }
      } catch {
        // Request body may not be JSON; ignore parse error
      }
      const truncated =
        body.length > 300 ? `${body.substring(0, 300)}...` : body;
      return { message: truncated, inferredStatus: status };
    }
    return { message: raw };
  }

  function sendRouteError(
    res: express.Response,
    error: unknown,
    logLabel: string,
    userFacingError: string,
    extra?: Record<string, unknown>,
    statusCode?: number,
  ): void {
    const rawMsg = toErrorMessage(error);
    logger.error(`${logLabel}: ${rawMsg}`);
    const { message, inferredStatus } = sanitizeErrorMessage(rawMsg);
    const resolvedStatus =
      statusCode ?? (error instanceof InputError ? 400 : inferredStatus ?? 500);
    res
      .status(resolvedStatus)
      .json({ error: userFacingError, message, ...extra });
  }

  function missingSessions(res: express.Response): boolean {
    if (!sessions) {
      res.status(501).json({ success: false, error: 'Sessions not available' });
      return true;
    }
    return false;
  }

  function missingConversations(res: express.Response): boolean {
    if (!providerManager.provider.conversations) {
      res.status(501).json({
        success: false,
        error: 'Conversations not supported by current provider',
      });
      return true;
    }
    return false;
  }

  // =============================================================================
  // Security Configuration
  // =============================================================================

  const VALID_SECURITY_MODES: ReadonlySet<SecurityMode> = new Set<SecurityMode>(
    ['none', 'plugin-only', 'full'],
  );
  const rawSecurityMode =
    config.getOptionalString('agenticChat.security.mode') || 'plugin-only';
  if (!VALID_SECURITY_MODES.has(rawSecurityMode as SecurityMode)) {
    throw new InputError(
      `Invalid security mode "${rawSecurityMode}". Must be one of: ${[
        ...VALID_SECURITY_MODES,
      ].join(', ')}`,
    );
  }
  const securityMode = rawSecurityMode as SecurityMode;
  const securityConfig = {
    mode: securityMode,
    accessDeniedMessage: config.getOptionalString(
      'agenticChat.security.accessDeniedMessage',
    ),
  };
  const adminUsers = config.getOptionalStringArray(
    'agenticChat.security.adminUsers',
  );
  const permissionsEnabled =
    config.getOptionalBoolean('permission.enabled') === true;

  const { requirePluginAccess, checkIsAdmin, requireAdminAccess, getUserRef } =
    createSecurityMiddleware({
      logger,
      httpAuth,
      permissions,
      securityMode,
      accessDeniedMessage: securityConfig.accessDeniedMessage,
      adminUsers,
      permissionsEnabled,
    });

  // Log security mode and admin mechanism
  if (securityConfig.mode === 'none') {
    logger.info('Agentic Chat security mode: NONE (no access control)');
  } else if (securityConfig.mode === 'plugin-only') {
    logger.info(
      'Agentic Chat security mode: PLUGIN-ONLY (Backstage RBAC for plugin access)',
    );
  } else if (securityConfig.mode === 'full') {
    logger.info(
      'Agentic Chat security mode: FULL (Backstage RBAC + MCP OAuth)',
    );
    logger.info('  MCP servers will receive OAuth tokens');
  }
  if (securityConfig.mode !== 'none') {
    if (permissionsEnabled) {
      logger.info(
        '  Admin access: determined by Backstage RBAC (agenticChat.admin permission)',
      );
    } else if (adminUsers && adminUsers.length > 0) {
      logger.info(
        `  Admin access: config-based (${adminUsers.length} user${
          adminUsers.length !== 1 ? 's' : ''
        } in agenticChat.security.adminUsers)`,
      );
    } else {
      logger.warn(
        '  Admin access: NO admin mechanism configured. ' +
          'Either enable Backstage permissions (permission.enabled: true) ' +
          'or set agenticChat.security.adminUsers in app-config.yaml.',
      );
    }
  }

  // =============================================================================
  // Route Registration
  // =============================================================================

  const ctx: RouteContext = {
    router,
    logger,
    config,
    get provider() {
      return providerManager.provider;
    },
    sessions,
    toErrorMessage,
    sendRouteError,
    missingSessions,
    missingConversations,
    getUserRef,
    checkIsAdmin,
    requireAdminAccess,
    parseChatRequest,
    parseApprovalRequest,
  };

  const onConfigChanged = () => {
    providerManager.provider.invalidateRuntimeConfig?.();
  };

  // Public routes (before auth middleware)
  registerStatusRoutes(ctx, adminConfig);

  // MCP namespacing proxy — called by LlamaStack, not by browser users.
  // Mounted before the auth middleware because LlamaStack does not carry
  // Backstage credentials. The proxy transparently prefixes tool names
  // with the server ID so that duplicate names across MCP servers do not
  // cause LlamaStack to reject the request.
  router.post(
    '/mcp-proxy/:serverId',
    express.text({ type: '*/*', limit: '1mb' }),
    async (req, res) => {
      const { serverId } = req.params;
      const handler = providerManager.provider.handleMcpProxyRequest;
      if (!handler) {
        res
          .status(501)
          .json({ error: 'MCP proxy not supported by current provider' });
        return;
      }
      const incomingHeaders: Record<string, string> = {};
      for (const [k, v] of Object.entries(req.headers)) {
        if (typeof v === 'string') incomingHeaders[k] = v;
      }
      try {
        const result = await handler.call(
          providerManager.provider,
          serverId,
          typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
          incomingHeaders,
        );
        res.status(result.status);
        for (const [k, v] of Object.entries(result.headers)) {
          res.setHeader(k, v);
        }
        res.send(result.body);
      } catch (error) {
        logger.error(
          `MCP proxy error for server ${serverId}: ${toErrorMessage(error)}`,
        );
        res.status(502).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Proxy internal error' },
          id: null,
        });
      }
    },
  );

  // MCP Streamable HTTP also uses GET (SSE notifications) and DELETE
  // (session close). The proxy doesn't support server-push SSE, so GET
  // returns 405.  DELETE acknowledges the session close gracefully.
  router.get('/mcp-proxy/:serverId', (_req, res) => {
    res.status(405).set('Allow', 'POST, DELETE').end();
  });
  router.delete('/mcp-proxy/:serverId', async (req, res) => {
    const handler = providerManager.provider.handleMcpProxyDelete;
    if (!handler) {
      res.status(200).end();
      return;
    }
    const incomingHeaders: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (typeof v === 'string') incomingHeaders[k] = v;
    }
    try {
      const result = await handler.call(
        providerManager.provider,
        req.params.serverId,
        incomingHeaders,
      );
      res.status(result.status).end();
    } catch {
      res.status(200).end();
    }
  });

  // Apply plugin-level access control to ALL subsequent routes
  router.use(requirePluginAccess);

  // Authenticated routes
  registerChatRoutes(ctx);
  registerDocumentRoutes(ctx);
  registerConfigRoutes(ctx, adminConfig);
  registerSessionRoutes(ctx);
  registerConversationRoutes(ctx);

  // Admin routes (requireAdminAccess is applied inside registerAdminRoutes)
  registerAdminRoutes(ctx, adminConfig, onConfigChanged, providerManager);

  return router;
}
