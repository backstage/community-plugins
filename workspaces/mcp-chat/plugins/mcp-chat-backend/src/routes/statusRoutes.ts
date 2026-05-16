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

import { LoggerService } from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { MCPClientService } from '../services/MCPClientService';

/**
 * Dependencies required for status routes.
 */
export interface StatusRoutesDeps {
  mcpClientService: MCPClientService;
  logger: LoggerService;
}

/**
 * Creates Express router for status endpoints.
 * Provides /provider/status, /mcp/status, and /tools endpoints.
 *
 * @param deps - Route dependencies
 * @returns Express router
 */
export function createStatusRoutes(deps: StatusRoutesDeps): express.Router {
  const { mcpClientService, logger } = deps;
  const router = Router();

  /**
   * GET /provider/status
   * Returns the status of configured LLM providers.
   */
  router.get('/provider/status', async (_req, res) => {
    logger.info('Route called: /provider/status');
    const providerStatus = await mcpClientService.getProviderStatus();
    return res.json(providerStatus);
  });

  /**
   * GET /mcp/status
   * Returns the status of connected MCP servers.
   */
  router.get('/mcp/status', async (_req, res) => {
    logger.info('Route called: /mcp/status');
    const mcpServerStatus = await mcpClientService.getMCPServerStatus();
    return res.json(mcpServerStatus);
  });

  /**
   * GET /tools
   * Returns the list of available tools from all MCP servers.
   */
  router.get('/tools', async (_req, res) => {
    logger.info('Route called: /tools');
    const availableTools = mcpClientService.getAvailableTools();
    return res.json({
      availableTools,
      toolCount: availableTools.length,
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
