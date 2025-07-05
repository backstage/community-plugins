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
  RootConfigService,
} from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { MCPClientService } from './services/MCPClientService';

// Helper function to load server configurations from app-config

export async function createRouter({
  logger,
  mcpClientService,
  config,
}: {
  logger: LoggerService;
  mcpClientService: MCPClientService;
  config: RootConfigService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  // Configuration status endpoint
  router.get('/config/status', async (_req, res) => {
    const providerConfig = mcpClientService.getProviderConfig();
    const mcpServers =
      config.getOptionalConfigArray('mcpChat.mcpServers') || [];

    const serverList = mcpServers?.map(serverConfig => {
      const configuredType = serverConfig.getOptionalString('type') as
        | 'stdio'
        | 'sse'
        | 'streamable-http'
        | undefined;
      const hasUrl = serverConfig.has('url');

      const effectiveType =
        configuredType || (hasUrl ? 'streamable-http' : 'stdio');

      const serverInfo = {
        id: serverConfig.getString('id'),
        name: serverConfig.getString('name'),
        type: effectiveType,
        configuredType,
        hasUrl,
        hasNpxCommand: serverConfig.has('npxCommand'),
        hasScriptPath: serverConfig.has('scriptPath'),
        hasArgs: serverConfig.has('args'),
        hasEnv: serverConfig.has('env'),
        hasHeaders: serverConfig.has('headers'),
      };

      const isValid =
        serverInfo.hasUrl ||
        serverInfo.hasNpxCommand ||
        serverInfo.hasScriptPath;

      return {
        ...serverInfo,
        isValid,
        validationIssues: !isValid
          ? ['Missing required configuration: url, npxCommand, or scriptPath']
          : [],
      };
    });

    const validServers = serverList.filter(server => server.isValid);
    const invalidServers = serverList.filter(server => !server.isValid);

    res.json({
      provider: providerConfig,
      mcpServers: {
        total: serverList.length,
        valid: validServers.length,
        invalid: invalidServers.length,
        servers: serverList,
      },
      summary: {
        hasValidServers: validServers.length > 0,
        configurationComplete:
          invalidServers.length === 0 && serverList.length > 0,
        issues:
          invalidServers.length > 0
            ? [`${invalidServers.length} server(s) have configuration issues`]
            : [],
      },
      timestamp: new Date().toISOString(),
    });
  });

  // provider status endpoint
  router.get('/provider/status', async (_req, res) => {
    logger.info('Route called: /provider/status');
    const providerStatus = await mcpClientService.getProviderStatus();
    return res.json(providerStatus);
  });

  // mcp server status endpoint
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

    // Validate messages array
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'No query provided' });
    }

    const userQuery = messages[messages.length - 1]?.content;

    if (!userQuery) {
      return res.status(400).json({ error: 'No query provided' });
    }

    const { reply, toolCalls, toolResponses } =
      await mcpClientService.processQuery(messages, enabledTools);

    if (toolCalls.length > 0) {
      const toolsUsed = toolCalls?.map(call => call.function.name);

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
