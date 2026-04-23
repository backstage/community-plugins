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

import { HttpAuthService, LoggerService } from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { v4 as uuid, validate as uuidValidate } from 'uuid';
import {
  MCPClientService,
  ChatConversationStore,
  SummarizationService,
} from '../services';
import { ChatMessage } from '../types';
import {
  validateMessages,
  isGuestUser,
  validateEnabledTools,
  validateToolApprovalMessage,
  validateDecisions,
} from '../utils';

/**
 * Dependencies required for chat routes.
 */
export interface ChatRoutesDeps {
  mcpClientService: MCPClientService;
  conversationStore: ChatConversationStore;
  summarizationService: SummarizationService;
  httpAuth: HttpAuthService;
  logger: LoggerService;
}

/**
 * Creates Express router for chat endpoints.
 * Provides POST /chat endpoint for sending messages to the LLM.
 *
 * @param deps - Route dependencies
 * @returns Express router
 */
export function createChatRoutes(deps: ChatRoutesDeps): express.Router {
  const {
    mcpClientService,
    conversationStore,
    summarizationService,
    httpAuth,
    logger,
  } = deps;
  const router = Router();

  async function saveConversation(
    req: express.Request,
    messages: ChatMessage[],
    conversationId?: string,
  ): Promise<string> {
    // Save conversation for authenticated non-guest users
    let savedConversationId: string | undefined;
    let userId: string | undefined;
    try {
      const credentials = await httpAuth.credentials(req, {
        allow: ['user'],
        allowLimitedAccess: true,
      });

      userId = credentials.principal.userEntityRef;

      if (!isGuestUser(userId)) {
        const savedConversation = await conversationStore.saveConversation(
          userId,
          messages,
          messages
            .filter(
              msg =>
                msg.role === 'assistant' &&
                msg.tool_calls &&
                msg.tool_calls.length > 0,
            )
            .flatMap(msg => msg.tool_calls!.map(tc => tc.function.name)),
          conversationId,
        );
        savedConversationId = savedConversation.id;

        // Fire-and-forget: Generate title asynchronously
        // This doesn't block the response to the user
        if (savedConversationId && !conversationId) {
          // Only generate title for new conversations
          const convId = savedConversationId;
          const convUserId = userId;

          setImmediate(async () => {
            try {
              // Generate title using LLM
              const title = await summarizationService.summarizeConversation(
                messages,
              );

              // Update title in database
              await conversationStore.updateTitle(convUserId, convId, title);

              logger.debug(
                `Generated title for conversation ${convId}: "${title}"`,
              );
            } catch (titleError) {
              logger.warn(
                `Failed to generate title for ${convId}: ${titleError}`,
              );
            }
          });
        }
      }
    } catch (error: any) {
      // Don't fail the request if saving fails
      if (error?.message?.includes('no such table')) {
        logger.warn('Conversations table does not exist yet');
      } else {
        logger.error(`Failed to save conversation: ${error}`);
      }
    }

    // Conversation doesn't have an id if user is guest
    return savedConversationId ?? uuid();
  }

  /**
   * POST /chat
   * Process a chat message through the LLM with optional tool usage.
   */
  router.post('/', async (req, res) => {
    const { messages, userMessage, enabledTools, conversationId } = req.body;

    if (conversationId && !uuidValidate(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID format' });
    }

    const messagesValidation = validateMessages(messages);
    if (!messagesValidation.isValid) {
      logger.warn(`Message validation failed: ${messagesValidation.error}`);
      return res.status(400).json({ error: messagesValidation.error });
    }

    if (userMessage === undefined || userMessage.trim() === '') {
      logger.warn(`userMessage validation failed: invalid userMessage`);
      return res.status(400).json({ error: 'A message from user is required' });
    }

    const enabledToolsValidation = validateEnabledTools(enabledTools);
    if (!enabledToolsValidation.isValid) {
      logger.warn(
        `enabledTools validation failed: ${enabledToolsValidation.error}`,
      );
      return res.status(400).json({ error: enabledToolsValidation.error });
    }

    const updatedMessages = await mcpClientService.processQuery(
      messages,
      userMessage,
      enabledTools,
    );

    const id = await saveConversation(req, updatedMessages, conversationId);

    return res.json({
      conversationId: id,
      messages: updatedMessages,
    });
  });

  /**
   * POST /chat/approve
   * Process user approval/rejection decisions for pending tool calls.
   * Accepts a decisions map keyed by tool call ID, executes approved tools,
   * appends rejection messages for rejected tools, and returns the LLM follow-up.
   */
  router.post('/approve', async (req, res) => {
    const { messages, decisions, conversationId } = req.body;

    if (conversationId && !uuidValidate(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID format' });
    }

    let messagesValidation = validateMessages(messages);
    if (messagesValidation.isValid) {
      if (messages.length === 0) {
        messagesValidation = {
          isValid: false,
          error: 'At least one message is required',
        };
      } else {
        messagesValidation = validateToolApprovalMessage(messages);
      }
    }
    if (!messagesValidation.isValid) {
      logger.warn(`Message validation failed: ${messagesValidation.error}`);
      return res.status(400).json({ error: messagesValidation.error });
    }

    const decisionsValidation = validateDecisions(decisions, messages);
    if (!decisionsValidation.isValid) {
      logger.warn(`Decisions validation failed: ${decisionsValidation.error}`);
      return res.status(400).json({ error: decisionsValidation.error });
    }

    const updatedMessages = await mcpClientService.processApprovalDecisions(
      messages,
      decisions,
    );

    const id = await saveConversation(req, updatedMessages, conversationId);

    return res.json({
      conversationId: id,
      messages: updatedMessages,
    });
  });

  return router;
}
