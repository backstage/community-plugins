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
import express from 'express';
import Router from 'express-promise-router';
import { MCPClientService } from './services/MCPClientService';
import { ChatConversationStore } from './services/ChatConversationStore';
import { SummarizationService } from './services/SummarizationService';
import {
  createStatusRoutes,
  createChatRoutes,
  createConversationRoutes,
} from './routes';

/**
 * Options for creating the MCP Chat router.
 *
 * @public
 */
export interface RouterOptions {
  logger: LoggerService;
  mcpClientService: MCPClientService;
  conversationStore: ChatConversationStore;
  httpAuth: HttpAuthService;
  summarizationService: SummarizationService;
}

/**
 * Creates an Express router with MCP chat endpoints.
 *
 * Routes are organized into domain-specific modules:
 * - Status routes: /provider/status, /mcp/status, /tools
 * - Chat routes: /chat
 * - Conversation routes: /conversations/*
 *
 * @param options - Router options including logger, services, and auth
 * @returns Express router
 * @public
 */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const {
    logger,
    mcpClientService,
    conversationStore,
    httpAuth,
    summarizationService,
  } = options;

  const router = Router();
  router.use(express.json());

  // Mount status routes (provider/status, mcp/status, tools)
  router.use(
    createStatusRoutes({
      mcpClientService,
      logger,
    }),
  );

  // Mount chat routes (/chat)
  router.use(
    '/chat',
    createChatRoutes({
      mcpClientService,
      conversationStore,
      summarizationService,
      httpAuth,
      logger,
    }),
  );

  // Mount conversation routes (/conversations/*)
  router.use(
    '/conversations',
    createConversationRoutes({
      store: conversationStore,
      httpAuth,
      logger,
    }),
  );

  return router;
}
