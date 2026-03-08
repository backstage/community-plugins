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
import {
  DEFAULT_CONVERSATIONS_LIMIT,
  MAX_CONVERSATIONS_LIMIT,
} from '../constants';
import { createWithRoute, notFound } from './routeWrapper';
import type { RouteContext } from './types';

const VALID_ORDER_VALUES = new Set(['asc', 'desc']);

/**
 * Registers conversation CRUD and history endpoints.
 */
export function registerConversationRoutes(ctx: RouteContext): void {
  const { router, logger, provider, sendRouteError, missingConversations } =
    ctx;

  const withRoute = createWithRoute(logger, sendRouteError);

  router.post(
    '/conversations/create',
    withRoute(
      'POST /conversations/create',
      'Failed to create conversation',
      async (_req, res) => {
        if (missingConversations(res)) return;
        const { conversationId } = await provider.conversations!.create();
        res.json({
          success: true,
          conversationId,
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );

  router.get(
    '/conversations/by-conversation/:conversationId/items',
    withRoute(
      req =>
        `GET /conversations/by-conversation/${req.params.conversationId}/items`,
      'Failed to get conversation items',
      async (req, res) => {
        const { conversationId } = req.params;
        if (!conversationId || typeof conversationId !== 'string') {
          throw new InputError('conversationId path parameter is required');
        }
        if (missingConversations(res)) return;
        const getChain = provider.conversations!.getByResponseChain.bind(
          provider.conversations,
        );
        const result = await getChain(conversationId);
        logger.info(
          `Returning ${result.items.length} items for conversation ${conversationId}`,
        );
        res.json({
          success: true,
          items: result.items,
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );

  router.get(
    '/conversations/by-conversation/:conversationId/messages',
    withRoute(
      req =>
        `GET /conversations/by-conversation/${req.params.conversationId}/messages`,
      'Failed to get processed messages',
      async (req, res) => {
        const { conversationId } = req.params;
        if (!conversationId || typeof conversationId !== 'string') {
          throw new InputError('conversationId path parameter is required');
        }
        if (missingConversations(res)) return;
        const messages = await provider.conversations!.getProcessedMessages(
          conversationId,
        );
        logger.info(
          `Returning ${messages.length} processed messages for conversation ${conversationId}`,
        );
        res.json({
          success: true,
          messages,
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );

  router.get(
    '/conversations/by-response/:responseId/chain',
    withRoute(
      req => `GET /conversations/by-response/${req.params.responseId}/chain`,
      'Failed to walk response chain',
      async (req, res) => {
        const { responseId } = req.params;
        if (!responseId || typeof responseId !== 'string') {
          throw new InputError('responseId path parameter is required');
        }
        if (missingConversations(res)) return;
        const getChain = provider.conversations!.getByResponseChain.bind(
          provider.conversations,
        );
        const chainResult = await getChain(responseId);
        const messages = chainResult.items.map(item => ({
          role: item.role as 'user' | 'assistant',
          text: typeof item.content === 'string' ? item.content : '',
        }));
        logger.info(
          `Returning ${messages.length} messages from chain walk for ${responseId}`,
        );
        res.json({
          success: true,
          messages,
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );

  router.get(
    '/conversations',
    withRoute(
      'GET /conversations',
      'Failed to list conversations',
      async (req, res) => {
        const rawLimit = parseInt(String(req.query.limit), 10);
        const limit = Number.isFinite(rawLimit)
          ? Math.min(Math.max(rawLimit, 1), MAX_CONVERSATIONS_LIMIT)
          : DEFAULT_CONVERSATIONS_LIMIT;
        const rawOrder = String(req.query.order || 'desc');
        const order: 'asc' | 'desc' = VALID_ORDER_VALUES.has(rawOrder)
          ? (rawOrder as 'asc' | 'desc')
          : 'desc';
        const after = req.query.after ? String(req.query.after) : undefined;

        logger.info(
          `Fetching conversations with limit=${limit}, order=${order}, after=${
            after || 'none'
          }`,
        );
        if (!provider.conversations) {
          res.json({
            success: true,
            conversations: [],
            hasMore: false,
            timestamp: new Date().toISOString(),
          });
          return;
        }
        const result = await provider.conversations.list(limit, after);
        logger.info(
          `Returning ${result.conversations.length} conversations, hasMore=${result.hasMore}`,
        );
        res.json({
          success: true,
          ...result,
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );

  router.get(
    '/conversations/:responseId',
    withRoute(
      req => `GET /conversations/${req.params.responseId}`,
      'Failed to get conversation',
      async (req, res) => {
        const { responseId } = req.params;
        if (!responseId || typeof responseId !== 'string') {
          throw new InputError('responseId is required');
        }
        if (missingConversations(res)) return;
        const conversation = await provider.conversations!.get(responseId);
        if (!conversation) {
          logger.warn(
            `Conversation ${responseId} not found or could not be retrieved`,
          );
          notFound(res, 'Conversation');
          return;
        }
        logger.info(
          `Returning conversation ${responseId} with ${
            conversation.output?.length || 0
          } output items`,
        );
        res.json({
          success: true,
          conversation,
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );

  router.get(
    '/conversations/:responseId/inputs',
    withRoute(
      req => `GET /conversations/${req.params.responseId}/inputs`,
      'Failed to get conversation inputs',
      async (req, res) => {
        const { responseId } = req.params;
        if (!responseId || typeof responseId !== 'string') {
          throw new InputError('responseId is required');
        }
        if (missingConversations(res)) return;
        const result = await provider.conversations!.getInputs(responseId);
        logger.info(
          `Returning ${result.items.length} input items for ${responseId}`,
        );
        res.json({
          success: true,
          ...result,
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );

  router.delete(
    '/conversations/:responseId',
    withRoute(
      req => `DELETE /conversations/${req.params.responseId}`,
      'Failed to delete conversation',
      async (req, res) => {
        const { responseId } = req.params;
        if (!responseId || typeof responseId !== 'string') {
          throw new InputError('responseId is required');
        }
        if (missingConversations(res)) return;
        await provider.conversations!.delete(responseId);
        res.json({
          success: true,
          message: 'Conversation deleted',
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );
}
