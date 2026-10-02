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
import { HttpAuthService, LoggerService } from '@backstage/backend-plugin-api';
import {
  parseEntityRef,
  RELATION_MEMBER_OF,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import type { CatalogService } from '@backstage/plugin-catalog-node';
import {
  ConflictError,
  InputError,
  NotAllowedError,
  NotFoundError,
} from '@backstage/errors';
import Router from 'express-promise-router';
import express from 'express';
import type {
  ParticipantRole,
  Session,
  TicketProvider,
} from '@backstage-community/plugin-pointing-poker-common';
import type { DatabaseClient } from '../database/DatabaseClient';

type RouterOptions = {
  catalog: CatalogService;
  db: DatabaseClient;
  httpAuth: HttpAuthService;
  logger: LoggerService;
  ticketProvider: () => TicketProvider | undefined;
};

const normalizeRef = (ref: string): string =>
  stringifyEntityRef(parseEntityRef(ref, { defaultKind: 'group' }));

export function createRouter(options: RouterOptions): express.Router {
  const { catalog, db, httpAuth, logger, ticketProvider } = options;
  const router = Router();
  router.use(express.json());

  // The caller's identity comes from the verified Backstage credentials, never
  // from the request body, so one user cannot act on behalf of another.
  const currentUserId = async (req: express.Request): Promise<string> => {
    const credentials = await httpAuth.credentials(req, { allow: ['user'] });
    return parseEntityRef(credentials.principal.userEntityRef).name;
  };

  // Teams are the groups the user is a member of in the catalog.
  const userTeamRefs = async (req: express.Request): Promise<string[]> => {
    const credentials = await httpAuth.credentials(req, { allow: ['user'] });
    const user = await catalog.getEntityByRef(
      credentials.principal.userEntityRef,
      { credentials },
    );
    return (user?.relations ?? [])
      .filter(r => r.type === RELATION_MEMBER_OF)
      .map(r => normalizeRef(r.targetRef));
  };

  const requireTeamMember = async (req: express.Request, teamRef: string) => {
    const teams = await userTeamRefs(req);
    if (!teams.includes(normalizeRef(teamRef))) {
      throw new NotAllowedError('You are not a member of this team');
    }
  };

  // Restricts a requested list of teams to the ones the user belongs to.
  const ownTeamRefs = async (req: express.Request): Promise<string[]> => {
    const requested = String(req.query.teamRefs ?? '')
      .split(',')
      .filter(Boolean)
      .map(normalizeRef);
    if (requested.length === 0) return [];
    const own = new Set(await userTeamRefs(req));
    return requested.filter(ref => own.has(ref));
  };

  const getSessionOrThrow = async (sessionId: string): Promise<Session> => {
    const session = await db.getSession(sessionId);
    if (!session) throw new NotFoundError(`Session ${sessionId} not found`);
    return session;
  };

  const findParticipant = (session: Session, userId: string) =>
    session.participants.find(p => p.userId === userId);

  // Actions that drive a session (reveal, accept, skip, ...) belong to the
  // participant holding the host role, matching what the UI offers.
  const requireHost = async (req: express.Request, sessionId: string) => {
    const userId = await currentUserId(req);
    const session = await getSessionOrThrow(sessionId);
    if (findParticipant(session, userId)?.role !== 'host') {
      throw new NotAllowedError('Only the session host can do this');
    }
    return { userId, session };
  };

  // Lifecycle actions on a session are reserved for whoever created it.
  const requireCreator = async (req: express.Request, sessionId: string) => {
    const userId = await currentUserId(req);
    const session = await getSessionOrThrow(sessionId);
    if (session.createdBy !== userId) {
      throw new NotAllowedError('Only the session creator can do this');
    }
    return { userId, session };
  };

  const requireStory = (session: Session, storyId: string) => {
    const story = session.stories.find(s => s.id === storyId);
    if (!story) throw new NotFoundError(`Story ${storyId} not found`);
    return story;
  };

  const assertHostRoleAvailable = (
    session: Session,
    userId: string,
    role: ParticipantRole,
  ) => {
    const currentHost = session.participants.find(p => p.role === 'host');
    if (role === 'host' && currentHost && currentHost.userId !== userId) {
      throw new ConflictError('This session already has a host');
    }
  };

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
    const roles = await db.getTicketRoles(
      await currentUserId(req),
      req.params.key,
    );
    if (!roles.includes('host')) {
      throw new NotAllowedError(
        'Only the host of a session with this ticket can set its estimate',
      );
    }
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
    const { body } = req.body;
    const hasBody =
      (typeof body === 'string' && body.length > 0) ||
      (Array.isArray(body) && body.length > 0);
    if (!hasBody) throw new InputError('body is required');
    const userId = await currentUserId(req);
    if (!(await db.getTicketRoles(userId, req.params.key)).length) {
      throw new NotAllowedError(
        'Only participants of a session with this ticket can comment',
      );
    }
    await provider.postComment(req.params.key, body, userId);
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
    const teamRefs = await ownTeamRefs(req);
    if (teamRefs.length === 0) return res.json([]);
    return res.json(await db.getLobbySessions(teamRefs));
  });

  router.get('/sessions/history', async (req, res) => {
    const teamRefs = await ownTeamRefs(req);
    if (teamRefs.length === 0) return res.json([]);
    return res.json(await db.getHistorySessions(teamRefs));
  });

  router.get('/team-query', async (req, res) => {
    const teamRef = String(req.query.teamRef ?? '');
    if (!teamRef) throw new InputError('teamRef is required');
    await requireTeamMember(req, teamRef);
    return res.json({ query: await db.getTeamQuery(teamRef) });
  });

  router.post('/team-query', async (req, res) => {
    const { teamRef, query } = req.body;
    if (!teamRef || !query)
      throw new InputError('teamRef and query are required');
    await requireTeamMember(req, teamRef);
    await db.saveTeamQuery(teamRef, query);
    return res.status(204).send();
  });

  router.get('/team-cards', async (req, res) => {
    const teamRef = String(req.query.teamRef ?? '');
    if (!teamRef) throw new InputError('teamRef is required');
    await requireTeamMember(req, teamRef);
    return res.json({ cards: await db.getTeamCards(teamRef) });
  });

  router.post('/team-cards', async (req, res) => {
    const { teamRef, cards } = req.body;
    if (!teamRef || !Array.isArray(cards))
      throw new InputError('teamRef and cards[] are required');
    await requireTeamMember(req, teamRef);
    await db.saveTeamCards(teamRef, cards);
    return res.status(204).send();
  });

  router.get('/avatar-pref', async (req, res) => {
    const userId = await currentUserId(req);
    if (req.query.userId && req.query.userId !== userId) {
      throw new NotAllowedError('Avatar preferences are private to each user');
    }
    return res.json(await db.getAvatarPref(userId));
  });

  router.post('/avatar-pref', async (req, res) => {
    const userId = await currentUserId(req);
    const { avatarSeed, avatarStyle } = req.body;
    if (!avatarSeed || !avatarStyle)
      throw new InputError('avatarSeed and avatarStyle are required');
    await db.saveAvatarPref(userId, avatarSeed, avatarStyle);
    return res.status(204).send();
  });

  router.post('/sessions', async (req, res) => {
    if (!req.body.teamRef) throw new InputError('teamRef is required');
    await requireTeamMember(req, req.body.teamRef);
    const session = await db.createSession({
      ...req.body,
      userId: await currentUserId(req),
    });
    return res.status(201).json(session);
  });

  router.get('/sessions/:id', async (req, res) => {
    const session = await db.getSession(req.params.id);
    if (!session) throw new NotFoundError(`Session ${req.params.id} not found`);
    return res.json(session);
  });

  router.delete('/sessions/:id', async (req, res) => {
    await requireCreator(req, req.params.id);
    await db.deleteSession(req.params.id);
    return res.status(204).send();
  });

  router.post('/sessions/:sessionId/end', async (req, res) => {
    const userId = await currentUserId(req);
    const session = await getSessionOrThrow(req.params.sessionId);
    if (
      session.createdBy !== userId &&
      findParticipant(session, userId)?.role !== 'host'
    ) {
      throw new NotAllowedError('Only the session host can end the session');
    }
    await db.endSession(req.params.sessionId);
    return res.status(204).send();
  });

  router.post('/sessions/:sessionId/reopen', async (req, res) => {
    await requireCreator(req, req.params.sessionId);
    await db.reopenSession(req.params.sessionId);
    return res.status(204).send();
  });

  router.post('/sessions/:sessionId/join', async (req, res) => {
    const userId = await currentUserId(req);
    const session = await getSessionOrThrow(req.params.sessionId);
    if (session.teamRef) await requireTeamMember(req, session.teamRef);
    assertHostRoleAvailable(session, userId, req.body.role);
    const participant = await db.joinSession(req.params.sessionId, {
      ...req.body,
      userId,
    });
    return res.json(participant);
  });

  router.post('/sessions/:sessionId/leave', async (req, res) => {
    await db.leaveSession(req.params.sessionId, await currentUserId(req));
    return res.status(204).send();
  });

  router.post('/sessions/:sessionId/role', async (req, res) => {
    const userId = await currentUserId(req);
    const { role } = req.body;
    if (req.body.userId && req.body.userId !== userId) {
      throw new NotAllowedError('You can only change your own role');
    }
    if (!['host', 'observer', 'voter'].includes(role)) {
      throw new InputError('role must be one of host, observer or voter');
    }
    const session = await getSessionOrThrow(req.params.sessionId);
    if (!findParticipant(session, userId)) {
      throw new NotAllowedError('Join the session before changing your role');
    }
    assertHostRoleAvailable(session, userId, role);
    await db.updateRole(req.params.sessionId, userId, role);
    return res.status(204).send();
  });

  router.post('/sessions/:sessionId/heartbeat', async (req, res) => {
    await db.heartbeat(req.params.sessionId, await currentUserId(req));
    return res.status(204).send();
  });

  const assertCanVote = async (
    req: express.Request,
    sessionId: string,
  ): Promise<string> => {
    const userId = await currentUserId(req);
    const session = await getSessionOrThrow(sessionId);
    const role = findParticipant(session, userId)?.role;
    if (!role || role === 'observer') {
      throw new NotAllowedError('Only joined voters can vote');
    }
    return userId;
  };

  router.post('/sessions/:sessionId/vote', async (req, res) => {
    const userId = await assertCanVote(req, req.params.sessionId);
    return res.json(
      await db.castVote(req.params.sessionId, { ...req.body, userId }),
    );
  });

  router.post('/sessions/:sessionId/unvote', async (req, res) => {
    const userId = await assertCanVote(req, req.params.sessionId);
    return res.json(await db.unvote(req.params.sessionId, userId));
  });

  router.post('/sessions/:sessionId/reveal', async (req, res) => {
    await requireHost(req, req.params.sessionId);
    return res.json(
      await db.setRevealed(req.params.sessionId, req.body.revealed ?? true),
    );
  });

  router.post('/sessions/:sessionId/accept', async (req, res) => {
    const { estimate } = req.body;
    if (!estimate) throw new InputError('estimate is required');
    await requireHost(req, req.params.sessionId);
    return res.json(await db.acceptEstimate(req.params.sessionId, estimate));
  });

  router.post('/sessions/:sessionId/skip', async (req, res) => {
    await requireHost(req, req.params.sessionId);
    return res.json(await db.skipStory(req.params.sessionId));
  });

  router.post('/sessions/:sessionId/new-round', async (req, res) => {
    await requireHost(req, req.params.sessionId);
    return res.json(await db.newRound(req.params.sessionId));
  });

  router.post(
    '/sessions/:sessionId/stories/:storyId/activate',
    async (req, res) => {
      const { session } = await requireHost(req, req.params.sessionId);
      requireStory(session, req.params.storyId);
      return res.json(
        await db.activateStory(req.params.sessionId, req.params.storyId),
      );
    },
  );

  router.post(
    '/sessions/:sessionId/stories/:storyId/presenter',
    async (req, res) => {
      const userId = await currentUserId(req);
      const presenterUserId: string | null = req.body.presenterUserId ?? null;
      const session = await getSessionOrThrow(req.params.sessionId);
      const story = requireStory(session, req.params.storyId);
      const me = findParticipant(session, userId);
      const isHost = me?.role === 'host';
      const takesStageThemselves =
        presenterUserId === userId && me && me.role !== 'observer';
      const leavesStage =
        presenterUserId === null && story.presenterUserId === userId;
      if (!isHost && !takesStageThemselves && !leavesStage) {
        throw new NotAllowedError(
          'You can only present yourself or leave the stage',
        );
      }
      return res.json(
        await db.setPresenter(
          req.params.sessionId,
          req.params.storyId,
          presenterUserId,
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
      const { session } = await requireHost(req, req.params.sessionId);
      requireStory(session, req.params.storyId);
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
      const { session } = await requireHost(req, req.params.sessionId);
      requireStory(session, req.params.storyId);
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
      if (err.name === 'AuthenticationError')
        return res.status(401).json({ error: err.message });
      if (err.name === 'NotAllowedError')
        return res.status(403).json({ error: err.message });
      if (err.name === 'ConflictError')
        return res.status(409).json({ error: err.message });
      return res.status(500).json({ error: 'Internal server error' });
    },
  );

  return router;
}
