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
import { ChatConversationStore } from '../services/ChatConversationStore';
import { isGuestUser } from '../utils';
import {
  createAuthMiddleware,
  requireNonGuest,
  validateUuidParam,
  AuthenticatedRequest,
} from '../middleware';

/** Maximum allowed limit for conversation queries */
const MAX_CONVERSATION_LIMIT = 100;

/**
 * Dependencies required for conversation routes.
 *
 * @public
 */
export interface ConversationRoutesDeps {
  store: ChatConversationStore;
  httpAuth: HttpAuthService;
  logger: LoggerService;
}

/**
 * Creates Express router for conversation management endpoints.
 * Provides GET, DELETE, and PATCH (star/title) endpoints.
 *
 * @param deps - Route dependencies
 * @returns Express router
 * @public
 */
export function createConversationRoutes(
  deps: ConversationRoutesDeps,
): express.Router {
  const { store, httpAuth, logger } = deps;
  const router = Router();

  // Create middleware instances
  const auth = createAuthMiddleware(httpAuth);
  const nonGuest = requireNonGuest;
  const validId = validateUuidParam('id');

  /**
   * GET /conversations
   * Get conversation history for the authenticated user.
   */
  router.get('/', auth, async (req: AuthenticatedRequest, res) => {
    const userId = req.userId!;

    try {
      // Guest users don't have saved conversations
      if (isGuestUser(userId)) {
        return res.json({
          conversations: [],
          count: 0,
        });
      }

      // Validate and parse limit query parameter
      let limit: number | undefined;
      if (req.query.limit) {
        const parsed = parseInt(req.query.limit as string, 10);
        if (isNaN(parsed) || parsed < 1 || parsed > MAX_CONVERSATION_LIMIT) {
          return res.status(400).json({
            error: `Limit must be between 1 and ${MAX_CONVERSATION_LIMIT}`,
          });
        }
        limit = parsed;
      }

      const conversations = await store.getConversations(userId, limit);

      return res.json({
        conversations,
        count: conversations.length,
      });
    } catch (error: any) {
      if (error?.message?.includes('no such table')) {
        return res.json({ conversations: [], count: 0 });
      }
      logger.error(`Failed to retrieve conversations: ${error}`);
      return res
        .status(500)
        .json({ error: 'Failed to retrieve conversations' });
    }
  });

  /**
   * GET /conversations/:id
   * Get a specific conversation by ID.
   */
  router.get(
    '/:id',
    auth,
    nonGuest,
    validId,
    async (req: AuthenticatedRequest, res) => {
      const { id } = req.params;
      const userId = req.userId!;

      try {
        const conversation = await store.getConversationById(userId, id);

        if (!conversation) {
          return res.status(404).json({ error: 'Conversation not found' });
        }

        return res.json(conversation);
      } catch (error: any) {
        if (error?.message?.includes('no such table')) {
          return res.status(404).json({ error: 'Conversation not found' });
        }
        logger.error(`Failed to retrieve conversation ${id}: ${error}`);
        return res
          .status(500)
          .json({ error: 'Failed to retrieve conversation' });
      }
    },
  );

  /**
   * DELETE /conversations/:id
   * Delete a specific conversation (requires ownership).
   */
  router.delete(
    '/:id',
    auth,
    nonGuest,
    validId,
    async (req: AuthenticatedRequest, res) => {
      const { id } = req.params;
      const userId = req.userId!;

      try {
        const deleted = await store.deleteConversation(userId, id);
        if (!deleted) {
          return res.status(404).json({ error: 'Conversation not found' });
        }

        logger.debug(
          `Deleted conversation ${id} for user ${userId.split('/').pop()}`,
        );
        return res.status(204).send();
      } catch (error) {
        logger.error(`Failed to delete conversation ${id}: ${error}`);
        return res.status(500).json({ error: 'Failed to delete conversation' });
      }
    },
  );

  /**
   * PATCH /conversations/:id/star
   * Toggle the starred status of a conversation.
   */
  router.patch(
    '/:id/star',
    auth,
    nonGuest,
    validId,
    async (req: AuthenticatedRequest, res) => {
      const { id } = req.params;
      const userId = req.userId!;

      try {
        const isStarred = await store.toggleStarred(userId, id);

        logger.debug(
          `Toggled star for conversation ${id}: isStarred=${isStarred}`,
        );
        return res.json({ isStarred });
      } catch (error) {
        logger.error(`Failed to toggle star for conversation ${id}: ${error}`);
        return res.status(500).json({ error: 'Failed to update conversation' });
      }
    },
  );

  /**
   * PATCH /conversations/:id/title
   * Update the title of a conversation.
   */
  router.patch(
    '/:id/title',
    auth,
    nonGuest,
    validId,
    async (req: AuthenticatedRequest, res) => {
      const { id } = req.params;
      const { title } = req.body;
      const userId = req.userId!;

      // Validate title
      if (typeof title !== 'string') {
        return res.status(400).json({ error: 'Title must be a string' });
      }

      if (title.length > 255) {
        return res
          .status(400)
          .json({ error: 'Title too long (max 255 characters)' });
      }

      try {
        await store.updateTitle(userId, id, title.trim());

        logger.debug(`Updated title for conversation ${id}`);
        return res.json({ title: title.trim() });
      } catch (error) {
        logger.error(`Failed to update title for conversation ${id}: ${error}`);
        return res.status(500).json({ error: 'Failed to update conversation' });
      }
    },
  );

  return router;
}
