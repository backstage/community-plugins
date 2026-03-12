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
import { MAX_SESSION_TITLE_LENGTH } from '../constants';
import { createWithRoute, notFound } from './routeWrapper';
import { type RouteContext, validateSessionId } from './types';

/**
 * Registers chat session CRUD endpoints (local DB).
 */
export function registerSessionRoutes(ctx: RouteContext): void {
  const {
    router,
    logger,
    provider,
    sessions,
    sendRouteError,
    missingSessions,
    missingConversations,
    getUserRef,
  } = ctx;

  const withRoute = createWithRoute(logger, sendRouteError);

  router.get(
    '/sessions',
    withRoute('GET /sessions', 'Failed to list sessions', async (req, res) => {
      if (missingSessions(res)) return;
      const userRef = await getUserRef(req);
      const list = await sessions!.listSessions(userRef);
      res.json({ sessions: list });
    }),
  );

  router.post(
    '/sessions',
    withRoute(
      'POST /sessions',
      'Failed to create session',
      async (req, res) => {
        if (missingSessions(res)) return;
        const userRef = await getUserRef(req);
        const body = req.body as Record<string, unknown>;
        let title: string | undefined;
        if (body.title !== undefined && typeof body.title === 'string') {
          title =
            body.title.trim().slice(0, MAX_SESSION_TITLE_LENGTH) || undefined;
        }
        const session = await sessions!.createSession(userRef, title);
        res.json({ session });
      },
    ),
  );

  router.get(
    '/sessions/:sessionId',
    withRoute(
      req => `GET /sessions/${req.params.sessionId}`,
      'Failed to get session',
      async (req, res) => {
        if (missingSessions(res)) return;
        validateSessionId(req.params.sessionId);
        const userRef = await getUserRef(req);
        const session = await sessions!.getSession(
          req.params.sessionId,
          userRef,
        );
        if (!session) {
          notFound(res, 'Session');
          return;
        }
        res.json({ session });
      },
    ),
  );

  router.delete(
    '/sessions/:sessionId',
    withRoute(
      req => `DELETE /sessions/${req.params.sessionId}`,
      'Failed to delete session',
      async (req, res) => {
        if (missingSessions(res)) return;
        validateSessionId(req.params.sessionId);
        const userRef = await getUserRef(req);
        const session = await sessions!.getSession(
          req.params.sessionId,
          userRef,
        );
        if (!session) {
          notFound(res, 'Session');
          return;
        }

        if (session.conversationId && provider.conversations) {
          logger.info(
            `Session ${req.params.sessionId} had conversation ${session.conversationId} — LlamaStack conversation orphaned`,
          );
        }

        const deleted = await sessions!.deleteSession(
          req.params.sessionId,
          userRef,
        );
        res.json({ success: deleted });
      },
    ),
  );

  router.get(
    '/sessions/:sessionId/messages',
    withRoute(
      req => `GET /sessions/${req.params.sessionId}/messages`,
      'Failed to get session messages',
      async (req, res) => {
        if (missingSessions(res)) return;
        validateSessionId(req.params.sessionId);
        const userRef = await getUserRef(req);
        const session = await sessions!.getSession(
          req.params.sessionId,
          userRef,
        );
        if (!session) {
          notFound(res, 'Session');
          return;
        }

        if (!session.conversationId) {
          res.json({ messages: [], sessionCreatedAt: session.createdAt });
          return;
        }

        if (missingConversations(res)) return;

        const messages = await provider.conversations!.getProcessedMessages(
          session.conversationId,
        );
        res.json({ messages, sessionCreatedAt: session.createdAt });
      },
    ),
  );
}
