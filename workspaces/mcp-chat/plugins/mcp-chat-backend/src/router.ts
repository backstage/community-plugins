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
import { InputError } from '@backstage/errors';
import express from 'express';
import Router from 'express-promise-router';
import { MCPClientService } from './services/MCPClientService';
import { validateMessages } from './utils';

export async function createRouter({
  logger,
  mcpClientService,
}: {
  logger: LoggerService;
  mcpClientService: MCPClientService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  // provider status endpoint
  router.get('/provider/status', async (_req, res) => {
    logger.info('Route called: /provider/status');
    const providerStatus = await mcpClientService.getProviderStatus();
    return res.json(providerStatus);
  });

  // MCP server status endpoint
  router.get('/mcp/status', async (_req, res) => {
    logger.info('Route called: /mcp/status');
    const mcpServerStatus = await mcpClientService.getMCPServerStatus();
    return res.json(mcpServerStatus);
  });

  // MCP Tools List endpoint
  router.get('/tools', async (_req, res) => {
    logger.info('Route called: /tools');

    // Get all available tools from MCP servers
    const availableTools = mcpClientService.getAvailableTools();

    return res.json({
      availableTools: availableTools,
      toolCount: availableTools.length,
      timestamp: new Date().toISOString(),
    });
  });

  // MCP Chat route
  router.post('/chat', async (req, res) => {
    const { messages, enabledTools = [] } = req.body;

    const validation = validateMessages(messages);
    if (!validation.isValid) {
      logger.warn(`Message validation failed: ${validation.error}`);
      return res.status(400).json({ error: validation.error });
    }

    if (enabledTools && !Array.isArray(enabledTools)) {
      throw new InputError('enabledTools must be an array');
    }

    if (
      enabledTools &&
      enabledTools.some((tool: any) => typeof tool !== 'string')
    ) {
      throw new InputError('All enabledTools must be strings');
    }

    const { reply, toolCalls, toolResponses } =
      await mcpClientService.processQuery(messages, enabledTools);

    if (toolCalls.length > 0) {
      const toolsUsed = toolCalls.map(call => call.function.name);

      return res.json({
        role: 'assistant',
        content: reply,
        toolResponses,
        toolsUsed,
      });
    }
    return res.json({
      role: 'assistant',
      content: reply,
      toolResponses: [],
      toolsUsed: [],
    });
  });

  return router;
}
