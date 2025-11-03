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
import { LoggerService, HttpAuthService } from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import express from 'express';
import Router from 'express-promise-router';
import { MCPClientService } from './services/MCPClientService';
import { ChatConversationStore } from './services/ChatConversationStore';
import { validateMessages, isGuestUser } from './utils';

export async function createRouter({
  logger,
  mcpClientService,
  conversationStore,
  httpAuth,
}: {
  logger: LoggerService;
  mcpClientService: MCPClientService;
  conversationStore: ChatConversationStore;
  httpAuth: HttpAuthService;
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
    });
  });

  // MCP Chat route
  router.post('/chat', async (req, res) => {
    logger.info('Route called: /chat');
    const { messages, enabledTools, conversationId } = req.body;

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

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

    const toolsUsed =
      toolCalls.length > 0 ? toolCalls.map(call => call.function.name) : [];

    // Create the complete conversation with assistant's response
    const conversationMessages = [
      ...messages,
      {
        role: 'assistant' as const,
        content: reply,
        tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
      },
    ];

    // Save conversation to database only for authenticated users
    let savedConversationId: string | undefined;
    try {
      const credentials = await httpAuth.credentials(req, {
        allow: ['user'],
        allowLimitedAccess: true,
      });

      const userId = credentials.principal.userEntityRef;

      // Only save conversations for authenticated users (not guests)
      if (!isGuestUser(userId)) {
        const savedConversation = await conversationStore.saveConversation(
          userId,
          conversationMessages,
          toolsUsed.length > 0 ? toolsUsed : undefined,
          conversationId, // Pass existing conversationId to update or create new
        );
        savedConversationId = savedConversation.id;
        logger.info(`Conversation saved for user: ${userId}`);
      } else {
        logger.debug(
          `Guest user detected (${userId}) - skipping conversation save`,
        );
      }
    } catch (error: any) {
      // If table doesn't exist, just warn - migrations may not have run yet
      if (error?.message?.includes('no such table')) {
        logger.warn(
          'Conversations table does not exist yet. Skipping conversation save.',
        );
      } else {
        logger.error(`Failed to save conversation: ${error}`);
      }
      // Don't fail the request if saving fails
    }

    if (toolCalls.length > 0) {
      return res.json({
        role: 'assistant',
        content: reply,
        toolResponses,
        toolsUsed,
        conversationId: savedConversationId,
      });
    }
    return res.json({
      role: 'assistant',
      content: reply,
      toolResponses: [],
      toolsUsed: [],
      conversationId: savedConversationId,
    });
  });

  // Get conversation history for the authenticated user
  // Query params: ?limit=20 (optional, overrides config)
  router.get('/conversations', async (req, res) => {
    logger.info('Route called: /conversations');
    try {
      const credentials = await httpAuth.credentials(req, {
        allow: ['user'],
        allowLimitedAccess: true,
      });
      const userId = credentials.principal.userEntityRef;

      // Guest users don't have saved conversations
      if (isGuestUser(userId)) {
        logger.debug(
          `Guest user (${userId}) requested conversations - returning empty`,
        );
        return res.json({
          conversations: [],
          count: 0,
          timestamp: new Date().toISOString(),
        });
      }

      // Allow optional limit query parameter to override config
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : undefined;

      const conversations = await conversationStore.getConversations(
        userId,
        limit,
      );
      return res.json({
        conversations,
        count: conversations.length,
        limit: limit || 'config default',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      // If table doesn't exist, return empty array instead of error
      if (error?.message?.includes('no such table')) {
        logger.warn(
          'Conversations table does not exist yet. Returning empty array.',
        );
        return res.json({
          conversations: [],
          count: 0,
          timestamp: new Date().toISOString(),
        });
      }
      logger.error(`Failed to retrieve conversations: ${error}`);
      return res
        .status(500)
        .json({ error: 'Failed to retrieve conversations' });
    }
  });

  // Get a specific conversation by ID (user-scoped)
  router.get('/conversations/:id', async (req, res) => {
    const { id } = req.params;
    logger.info(`Route called: /conversations/${id}`);
    try {
      const credentials = await httpAuth.credentials(req, {
        allow: ['user'],
        allowLimitedAccess: true,
      });
      const userId = credentials.principal.userEntityRef;

      // Guest users don't have saved conversations
      if (isGuestUser(userId)) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      const conversation = await conversationStore.getConversationById(
        userId,
        id,
      );
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      return res.json(conversation);
    } catch (error: any) {
      // If table doesn't exist, return 404
      if (error?.message?.includes('no such table')) {
        logger.warn('Conversations table does not exist yet.');
        return res.status(404).json({ error: 'Conversation not found' });
      }
      logger.error(`Failed to retrieve conversation ${id}: ${error}`);
      return res.status(500).json({ error: 'Failed to retrieve conversation' });
    }
  });

  return router;
}
