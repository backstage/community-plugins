/*
 * Copyright 2026 The Backstage Authors
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
import { NotFoundError, InputError } from '@backstage/errors';
import Router from 'express-promise-router';
import express from 'express';
import type { TicketProvider } from '@backstage-community/plugin-pointing-poker-common';
import type { DatabaseClient } from '../database/DatabaseClient';

type RouterOptions = {
  db: DatabaseClient;
  logger: LoggerService;
  ticketProvider: () => TicketProvider | undefined;
};

export function createRouter(options: RouterOptions): express.Router {
  const { db, logger, ticketProvider } = options;
  const router = Router();
  router.use(express.json());

  router.get('/health', (_req, res) => res.json({ status: 'ok' }));

  router.get('/provider', (_req, res) => {
    const provider = ticketProvider();
    res.json({ id: provider?.providerId ?? null });
  });

  router.post('/tickets/search', async (req, res) => {
    const provider = ticketProvider();
    if (!provider)
      return res.status(503).json({ error: 'No ticket provider configured' });
    const { query } = req.body;
    if (!query) throw new InputError('query is required');
    try {
      const tickets = await provider.searchTickets(query);
      return res.json(tickets);
    } catch (err) {
      return res.status(502).json({ error: (err as Error).message });
    }
  });

  router.get('/tickets/:key', async (req, res) => {
    const provider = ticketProvider();
    if (!provider)
      return res.status(503).json({ error: 'No ticket provider configured' });
    const ticket = await provider.getTicket(req.params.key);
    if (!ticket) throw new NotFoundError(`Ticket ${req.params.key} not found`);
    return res.json(ticket);
  });

  router.post('/tickets/:key/estimate', async (req, res) => {
    const provider = ticketProvider();
    if (!provider)
      return res.status(503).json({ error: 'No ticket provider configured' });
    const { value } = req.body;
    if (value === undefined) throw new InputError('value is required');
    await provider.setEstimate(req.params.key, Number(value));
    return res.status(204).send();
  });

  router.get('/tickets/:key/comments', async (req, res) => {
    const provider = ticketProvider();
    if (!provider)
      return res.status(503).json({ error: 'No ticket provider configured' });
    const comments = await provider.getComments(req.params.key);
    return res.json(comments);
  });

  router.post('/tickets/:key/comments', async (req, res) => {
    const provider = ticketProvider();
    if (!provider)
      return res.status(503).json({ error: 'No ticket provider configured' });
    const { body, author } = req.body;
    const hasBody =
      (typeof body === 'string' && body.length > 0) ||
      (Array.isArray(body) && body.length > 0);
    if (!hasBody) throw new InputError('body is required');
    await provider.postComment(req.params.key, body, author ?? 'anonymous');
    return res.status(204).send();
  });

  router.get('/tickets/:key/subtasks', async (req, res) => {
    const provider = ticketProvider();
    if (!provider)
      return res.status(503).json({ error: 'No ticket provider configured' });
    if (!provider.getSubtasks) return res.json([]);
    return res.json(await provider.getSubtasks(req.params.key));
  });

  router.get('/users/search', async (req, res) => {
    const provider = ticketProvider();
    if (!provider?.searchUsers) return res.json([]);
    const q = String(req.query.q ?? '');
    const users = await provider.searchUsers(q);
    return res.json(users);
  });

  router.get('/users/:id', async (req, res) => {
    const provider = ticketProvider();
    if (!provider?.getUser)
      throw new NotFoundError(`User ${req.params.id} not found`);
    const user = await provider.getUser(req.params.id);
    if (!user) throw new NotFoundError(`User ${req.params.id} not found`);
    return res.json(user);
  });

  router.get('/sessions/lobby', async (req, res) => {
    const teamRefs = String(req.query.teamRefs ?? '')
      .split(',')
      .filter(Boolean);
    if (teamRefs.length === 0) return res.json([]);
    return res.json(await db.getLobbySessions(teamRefs));
  });

  router.get('/sessions/history', async (req, res) => {
    const teamRefs = String(req.query.teamRefs ?? '')
      .split(',')
      .filter(Boolean);
    if (teamRefs.length === 0) return res.json([]);
    return res.json(await db.getHistorySessions(teamRefs));
  });

  router.get('/team-query', async (req, res) => {
    const teamRef = String(req.query.teamRef ?? '');
    if (!teamRef) throw new InputError('teamRef is required');
    return res.json({ query: await db.getTeamQuery(teamRef) });
  });

  router.post('/team-query', async (req, res) => {
    const { teamRef, query } = req.body;
    if (!teamRef || !query)
      throw new InputError('teamRef and query are required');
    await db.saveTeamQuery(teamRef, query);
    return res.status(204).send();
  });

  router.get('/team-cards', async (req, res) => {
    const teamRef = String(req.query.teamRef ?? '');
    if (!teamRef) throw new InputError('teamRef is required');
    return res.json({ cards: await db.getTeamCards(teamRef) });
  });

  router.post('/team-cards', async (req, res) => {
    const { teamRef, cards } = req.body;
    if (!teamRef || !Array.isArray(cards))
      throw new InputError('teamRef and cards[] are required');
    await db.saveTeamCards(teamRef, cards);
    return res.status(204).send();
  });

  router.get('/avatar-pref', async (req, res) => {
    const userId = String(req.query.userId ?? '');
    if (!userId) throw new InputError('userId is required');
    return res.json(await db.getAvatarPref(userId));
  });

  router.post('/avatar-pref', async (req, res) => {
    const { userId, avatarSeed, avatarStyle } = req.body;
    if (!userId || !avatarSeed || !avatarStyle)
      throw new InputError('userId, avatarSeed, avatarStyle are required');
    await db.saveAvatarPref(userId, avatarSeed, avatarStyle);
    return res.status(204).send();
  });

  router.post('/sessions', async (req, res) => {
    const session = await db.createSession(req.body);
    return res.status(201).json(session);
  });

  router.get('/sessions/:id', async (req, res) => {
    const session = await db.getSession(req.params.id);
    if (!session) throw new NotFoundError(`Session ${req.params.id} not found`);
    return res.json(session);
  });

  router.delete('/sessions/:id', async (req, res) => {
    await db.deleteSession(req.params.id);
    return res.status(204).send();
  });

  router.post('/sessions/:sessionId/end', async (req, res) => {
    await db.endSession(req.params.sessionId);
    return res.status(204).send();
  });

  router.post('/sessions/:sessionId/reopen', async (req, res) => {
    await db.reopenSession(req.params.sessionId);
    return res.status(204).send();
  });

  router.post('/sessions/:sessionId/join', async (req, res) => {
    const participant = await db.joinSession(req.params.sessionId, req.body);
    return res.json(participant);
  });

  router.post('/sessions/:sessionId/leave', async (req, res) => {
    const { userId } = req.body;
    if (!userId) throw new InputError('userId is required');
    await db.leaveSession(req.params.sessionId, userId);
    return res.status(204).send();
  });

  router.post('/sessions/:sessionId/role', async (req, res) => {
    const { userId, role } = req.body;
    if (!userId || !role) throw new InputError('userId and role are required');
    await db.updateRole(req.params.sessionId, userId, role);
    return res.status(204).send();
  });

  router.post('/sessions/:sessionId/heartbeat', async (req, res) => {
    const { userId } = req.body;
    if (!userId) throw new InputError('userId is required');
    await db.heartbeat(req.params.sessionId, userId);
    return res.status(204).send();
  });

  router.post('/sessions/:sessionId/vote', async (req, res) => {
    return res.json(await db.castVote(req.params.sessionId, req.body));
  });

  router.post('/sessions/:sessionId/unvote', async (req, res) => {
    const { userId } = req.body;
    if (!userId) throw new InputError('userId is required');
    return res.json(await db.unvote(req.params.sessionId, userId));
  });

  router.post('/sessions/:sessionId/reveal', async (req, res) => {
    return res.json(
      await db.setRevealed(req.params.sessionId, req.body.revealed ?? true),
    );
  });

  router.post('/sessions/:sessionId/accept', async (req, res) => {
    const { estimate } = req.body;
    if (!estimate) throw new InputError('estimate is required');
    return res.json(await db.acceptEstimate(req.params.sessionId, estimate));
  });

  router.post('/sessions/:sessionId/skip', async (req, res) => {
    return res.json(await db.skipStory(req.params.sessionId));
  });

  router.post('/sessions/:sessionId/new-round', async (req, res) => {
    return res.json(await db.newRound(req.params.sessionId));
  });

  router.post(
    '/sessions/:sessionId/stories/:storyId/activate',
    async (req, res) => {
      return res.json(
        await db.activateStory(req.params.sessionId, req.params.storyId),
      );
    },
  );

  router.post(
    '/sessions/:sessionId/stories/:storyId/presenter',
    async (req, res) => {
      const { presenterUserId } = req.body;
      return res.json(
        await db.setPresenter(
          req.params.sessionId,
          req.params.storyId,
          presenterUserId ?? null,
        ),
      );
    },
  );

  router.post(
    '/sessions/:sessionId/stories/:storyId/split',
    async (req, res) => {
      const { subtasks } = req.body;
      if (!Array.isArray(subtasks) || subtasks.length === 0)
        throw new InputError('subtasks[] is required');
      return res.json(
        await db.splitStory(req.params.sessionId, req.params.storyId, subtasks),
      );
    },
  );

  router.post(
    '/sessions/:sessionId/stories/:storyId/resolve-split',
    async (req, res) => {
      const { mode, estimate } = req.body;
      if (!mode) throw new InputError('mode is required');
      return res.json(
        await db.resolveSplit(
          req.params.sessionId,
          req.params.storyId,
          mode,
          estimate,
        ),
      );
    },
  );

  router.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      logger.error('Pointing Poker error', err);
      if (err.name === 'NotFoundError')
        return res.status(404).json({ error: err.message });
      if (err.name === 'InputError')
        return res.status(400).json({ error: err.message });
      return res.status(500).json({ error: 'Internal server error' });
    },
  );

  return router;
}
