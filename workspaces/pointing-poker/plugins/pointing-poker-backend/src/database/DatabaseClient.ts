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
import {
  DatabaseService,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';
import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import type {
  AvatarPreference,
  CastVoteRequest,
  CreateSessionRequest,
  JoinSessionRequest,
  NewStory,
  Participant,
  ParticipantRole,
  Session,
  SessionSummary,
  SplitResolution,
  Story,
  Vote,
} from '@backstage-community/plugin-pointing-poker-common';

const STALE_SESSION_HOURS = 8;
const DEFAULT_SORT_GAP = 1000;
type DbDate = Date | number | string;

type DbSession = {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_by_name: string;
  current_story_id: string | null;
  team_ref: string | null;
  status: string;
  created_at: DbDate;
  updated_at: DbDate;
};

type DbStory = {
  id: string;
  session_id: string;
  title: string;
  description: string | null;
  estimate: string | null;
  ticket_key: string | null;
  revealed: boolean;
  state: string;
  started_at: DbDate | null;
  duration_seconds: number;
  parent_story_id: string | null;
  sort: number;
  presenter_user_id: string | null;
  created_at: DbDate;
  updated_at: DbDate;
};

type DbVote = {
  id: string;
  story_id: string;
  user_id: string;
  user_name: string;
  value: string;
  voted_at: DbDate;
};

type DbParticipant = {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  role: string;
  avatar_style: string | null;
  avatar_seed: string | null;
  joined_at: DbDate;
  last_active_at: DbDate;
};

const mapDate = (value: DbDate): Date =>
  value instanceof Date ? value : new Date(value);

function mapVote(row: DbVote): Vote {
  return {
    id: row.id,
    storyId: row.story_id,
    userId: row.user_id,
    userName: row.user_name,
    value: row.value,
    votedAt: mapDate(row.voted_at),
  };
}

function mapParticipant(row: DbParticipant): Participant {
  return {
    id: row.id,
    sessionId: row.session_id,
    userId: row.user_id,
    userName: row.user_name,
    role: row.role as ParticipantRole,
    avatarStyle: row.avatar_style ?? undefined,
    avatarSeed: row.avatar_seed ?? undefined,
    joinedAt: mapDate(row.joined_at),
    lastActiveAt: mapDate(row.last_active_at),
  };
}

function mapStory(row: DbStory, votes: Vote[]): Story {
  return {
    id: row.id,
    sessionId: row.session_id,
    title: row.title,
    description: row.description ?? undefined,
    estimate: row.estimate ?? undefined,
    ticketKey: row.ticket_key ?? undefined,
    revealed: Boolean(row.revealed),
    state: row.state as Story['state'],
    startedAt: row.started_at ? mapDate(row.started_at) : undefined,
    durationSeconds: row.duration_seconds,
    parentStoryId: row.parent_story_id ?? undefined,
    sort: row.sort,
    presenterUserId: row.presenter_user_id ?? undefined,
    createdAt: mapDate(row.created_at),
    updatedAt: mapDate(row.updated_at),
    votes,
  };
}

async function hydrateSession(db: Knex, row: DbSession): Promise<Session> {
  const [dbStories, dbParticipants] = await Promise.all([
    db('pointing_poker_stories')
      .where({ session_id: row.id })
      .orderBy('sort', 'asc'),
    db('pointing_poker_participants').where({ session_id: row.id }),
  ]);

  const storyIds = dbStories.map((s: DbStory) => s.id);
  const dbVotes =
    storyIds.length > 0
      ? await db('pointing_poker_votes').whereIn('story_id', storyIds)
      : [];

  const votesByStory = new Map<string, Vote[]>();
  for (const v of dbVotes) {
    const list = votesByStory.get(v.story_id) ?? [];
    list.push(mapVote(v));
    votesByStory.set(v.story_id, list);
  }

  const stories = dbStories.map((s: DbStory) =>
    mapStory(s, votesByStory.get(s.id) ?? []),
  );
  const participants = dbParticipants.map(mapParticipant);

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    createdBy: row.created_by,
    createdByName: row.created_by_name,
    currentStoryId: row.current_story_id ?? undefined,
    teamRef: row.team_ref ?? undefined,
    status: row.status as Session['status'],
    createdAt: mapDate(row.created_at),
    updatedAt: mapDate(row.updated_at),
    stories,
    participants,
  };
}

function elapsedSeconds(startedAt: Date | string): number {
  const timestamp = new Date(startedAt).getTime();
  if (!Number.isFinite(timestamp)) {
    return 0;
  }
  return Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
}

export class DatabaseClient {
  private constructor(private readonly db: Knex) {}

  static async create(database: DatabaseService): Promise<DatabaseClient> {
    const client = await database.getClient();
    const migrationsDir = resolvePackagePath(
      '@backstage-community/plugin-pointing-poker-backend',
      'migrations',
    );
    await client.migrate.latest({ directory: migrationsDir });
    return new DatabaseClient(client);
  }

  async getLobbySessions(teamRefs: string[]): Promise<SessionSummary[]> {
    await this.autoCompleteStaleSessions();
    const rows = await this.db('pointing_poker_sessions')
      .whereIn('team_ref', teamRefs)
      .where('status', 'pending')
      .orderBy('created_at', 'desc');

    const summaries: SessionSummary[] = [];
    for (const row of rows) {
      const participants = await this.db('pointing_poker_participants').where({
        session_id: row.id,
      });
      const mapped = participants.map(mapParticipant);
      const voters = mapped.filter(p => p.role === 'voter');
      const voting = voters.filter(p => {
        const cutoff = Date.now() - 60_000;
        return p.lastActiveAt.getTime() > cutoff;
      });

      const isDuplicate =
        summaries.some(s => s.teamRef === row.team_ref) ||
        rows
          .slice(0, rows.indexOf(row))
          .some((r: DbSession) => r.team_ref === row.team_ref);

      summaries.push({
        id: row.id,
        name: row.name,
        createdBy: row.created_by,
        createdByName: row.created_by_name,
        teamRef: row.team_ref ?? '',
        createdAt: mapDate(row.created_at),
        participants: mapped,
        joinedCount: mapped.length,
        activeCount: mapped.filter(p => {
          const cutoff = Date.now() - 60_000;
          return p.lastActiveAt.getTime() > cutoff;
        }).length,
        votingCount: voting.length,
        isDuplicate,
      });
    }
    return summaries;
  }

  async getHistorySessions(teamRefs: string[]): Promise<Session[]> {
    await this.autoCompleteStaleSessions();
    const rows = await this.db('pointing_poker_sessions')
      .whereIn('team_ref', teamRefs)
      .orderBy('created_at', 'desc');
    return Promise.all(rows.map((r: DbSession) => hydrateSession(this.db, r)));
  }

  async getSession(id: string): Promise<Session | null> {
    const row = await this.db('pointing_poker_sessions').where({ id }).first();
    if (!row) return null;
    return hydrateSession(this.db, row);
  }

  async createSession(req: CreateSessionRequest): Promise<Session> {
    const id = uuidv4();
    await this.db('pointing_poker_sessions').insert({
      id,
      name: req.name,
      description: req.description ?? null,
      created_by: req.userId,
      created_by_name: req.userName,
      team_ref: req.teamRef,
      status: 'pending',
      current_story_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const avatarPref = req.avatarSeed
      ? { avatarSeed: req.avatarSeed, avatarStyle: req.avatarStyle }
      : await this.getAvatarPref(req.userId);

    await this.db('pointing_poker_participants').insert({
      id: uuidv4(),
      session_id: id,
      user_id: req.userId,
      user_name: req.userName,
      role: 'host',
      avatar_style: avatarPref?.avatarStyle ?? null,
      avatar_seed: avatarPref?.avatarSeed ?? null,
      joined_at: new Date(),
      last_active_at: new Date(),
    });

    if (req.stories && req.stories.length > 0) {
      await this.seedStories(id, req.stories);
    }

    return (await this.getSession(id))!;
  }

  private async seedStories(sessionId: string, stories: NewStory[]) {
    const rows = stories.map((s, i) => ({
      id: uuidv4(),
      session_id: sessionId,
      title: s.title,
      ticket_key: s.ticketKey ?? null,
      description: null,
      estimate: null,
      revealed: false,
      state: i === 0 ? 'active' : 'pending',
      started_at: i === 0 ? new Date() : null,
      duration_seconds: 0,
      parent_story_id: null,
      sort: (i + 1) * DEFAULT_SORT_GAP,
      presenter_user_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await this.db('pointing_poker_stories').insert(rows);

    await this.db('pointing_poker_sessions').where({ id: sessionId }).update({
      current_story_id: rows[0].id,
      updated_at: new Date(),
    });
  }

  async deleteSession(id: string): Promise<void> {
    await this.db('pointing_poker_sessions').where({ id }).delete();
  }

  async endSession(id: string): Promise<void> {
    const session = await this.getSession(id);
    if (!session) return;
    const current = session.stories.find(s => s.id === session.currentStoryId);
    if (current?.startedAt) {
      await this.db('pointing_poker_stories')
        .where({ id: current.id })
        .update({
          duration_seconds:
            current.durationSeconds + elapsedSeconds(current.startedAt),
          started_at: null,
          state: 'pending',
          updated_at: new Date(),
        });
    }
    await this.db('pointing_poker_sessions').where({ id }).update({
      status: 'completed',
      updated_at: new Date(),
    });
  }

  async reopenSession(id: string): Promise<void> {
    const session = await this.getSession(id);
    if (!session) return;
    const current = session.stories.find(s => s.id === session.currentStoryId);
    if (current) {
      await this.db('pointing_poker_stories').where({ id: current.id }).update({
        state: 'active',
        started_at: new Date(),
        updated_at: new Date(),
      });
    }
    await this.db('pointing_poker_sessions').where({ id }).update({
      status: 'pending',
      updated_at: new Date(),
    });
  }

  async joinSession(
    sessionId: string,
    req: JoinSessionRequest,
  ): Promise<Participant> {
    const existing = await this.db('pointing_poker_participants')
      .where({ session_id: sessionId, user_id: req.userId })
      .first();

    if (existing) {
      await this.db('pointing_poker_participants')
        .where({ id: existing.id })
        .update({
          user_name: req.userName,
          role: req.role,
          avatar_style: req.avatarStyle ?? existing.avatar_style,
          avatar_seed: req.avatarSeed ?? existing.avatar_seed,
          last_active_at: new Date(),
        });
    } else {
      await this.db('pointing_poker_participants').insert({
        id: uuidv4(),
        session_id: sessionId,
        user_id: req.userId,
        user_name: req.userName,
        role: req.role,
        avatar_style: req.avatarStyle ?? null,
        avatar_seed: req.avatarSeed ?? null,
        joined_at: new Date(),
        last_active_at: new Date(),
      });
    }

    const row = await this.db('pointing_poker_participants')
      .where({ session_id: sessionId, user_id: req.userId })
      .first();
    await this.db('pointing_poker_sessions')
      .where({ id: sessionId })
      .update({ updated_at: new Date() });
    return mapParticipant(row);
  }

  async leaveSession(sessionId: string, userId: string): Promise<void> {
    await this.db('pointing_poker_participants')
      .where({ session_id: sessionId, user_id: userId })
      .delete();
    await this.db('pointing_poker_sessions')
      .where({ id: sessionId })
      .update({ updated_at: new Date() });
  }

  async updateRole(
    sessionId: string,
    userId: string,
    role: ParticipantRole,
  ): Promise<void> {
    await this.db('pointing_poker_participants')
      .where({ session_id: sessionId, user_id: userId })
      .update({ role, last_active_at: new Date() });
    await this.db('pointing_poker_sessions')
      .where({ id: sessionId })
      .update({ updated_at: new Date() });
  }

  async heartbeat(sessionId: string, userId: string): Promise<void> {
    await this.db('pointing_poker_participants')
      .where({ session_id: sessionId, user_id: userId })
      .update({ last_active_at: new Date() });
  }

  async castVote(sessionId: string, req: CastVoteRequest): Promise<Session> {
    const session = await this.getSession(sessionId);
    if (!session || !session.currentStoryId) throw new Error('No active story');

    const existing = await this.db('pointing_poker_votes')
      .where({ story_id: session.currentStoryId, user_id: req.userId })
      .first();

    if (existing) {
      await this.db('pointing_poker_votes')
        .where({ id: existing.id })
        .update({ value: req.value, voted_at: new Date() });
    } else {
      await this.db('pointing_poker_votes').insert({
        id: uuidv4(),
        story_id: session.currentStoryId,
        user_id: req.userId,
        user_name: req.userName,
        value: req.value,
        voted_at: new Date(),
      });
    }

    await this.db('pointing_poker_sessions')
      .where({ id: sessionId })
      .update({ updated_at: new Date() });
    return (await this.getSession(sessionId))!;
  }

  async unvote(sessionId: string, userId: string): Promise<Session> {
    const session = await this.getSession(sessionId);
    if (!session || !session.currentStoryId) throw new Error('No active story');
    await this.db('pointing_poker_votes')
      .where({ story_id: session.currentStoryId, user_id: userId })
      .delete();
    await this.db('pointing_poker_sessions')
      .where({ id: sessionId })
      .update({ updated_at: new Date() });
    return (await this.getSession(sessionId))!;
  }

  async setRevealed(sessionId: string, revealed: boolean): Promise<Session> {
    const session = await this.getSession(sessionId);
    if (!session || !session.currentStoryId) throw new Error('No active story');
    await this.db('pointing_poker_stories')
      .where({ id: session.currentStoryId })
      .update({ revealed, updated_at: new Date() });
    await this.db('pointing_poker_sessions')
      .where({ id: sessionId })
      .update({ updated_at: new Date() });
    return (await this.getSession(sessionId))!;
  }

  async acceptEstimate(sessionId: string, estimate: string): Promise<Session> {
    const session = await this.getSession(sessionId);
    if (!session || !session.currentStoryId) throw new Error('No active story');
    const current = session.stories.find(s => s.id === session.currentStoryId)!;

    await this.db('pointing_poker_stories')
      .where({ id: current.id })
      .update({
        estimate,
        state: 'estimated',
        revealed: false,
        started_at: null,
        duration_seconds:
          current.durationSeconds +
          (current.startedAt ? elapsedSeconds(current.startedAt) : 0),
        updated_at: new Date(),
      });

    return this.advanceFromStory(sessionId, current, session.stories);
  }

  async skipStory(sessionId: string): Promise<Session> {
    const session = await this.getSession(sessionId);
    if (!session || !session.currentStoryId) throw new Error('No active story');
    const current = session.stories.find(s => s.id === session.currentStoryId)!;

    await this.db('pointing_poker_stories')
      .where({ id: current.id })
      .update({
        state: 'skipped',
        started_at: null,
        duration_seconds:
          current.durationSeconds +
          (current.startedAt ? elapsedSeconds(current.startedAt) : 0),
        updated_at: new Date(),
      });

    return this.advanceFromStory(sessionId, current, session.stories);
  }

  async newRound(sessionId: string): Promise<Session> {
    const session = await this.getSession(sessionId);
    if (!session || !session.currentStoryId) throw new Error('No active story');
    await this.db('pointing_poker_votes')
      .where({ story_id: session.currentStoryId })
      .delete();
    await this.db('pointing_poker_stories')
      .where({ id: session.currentStoryId })
      .update({ revealed: false, updated_at: new Date() });
    await this.db('pointing_poker_sessions')
      .where({ id: sessionId })
      .update({ updated_at: new Date() });
    return (await this.getSession(sessionId))!;
  }

  private async advanceFromStory(
    sessionId: string,
    current: Story,
    allStories: Story[],
  ): Promise<Session> {
    let nextId: string | null = null;

    if (current.parentStoryId) {
      const siblings = allStories.filter(
        s => s.parentStoryId === current.parentStoryId && s.id !== current.id,
      );
      const nextSibling = siblings
        .filter(s => s.state === 'pending')
        .sort((a, b) => a.sort - b.sort)[0];
      nextId = nextSibling?.id ?? current.parentStoryId ?? null;
    } else {
      nextId = this.advanceQueue(current, allStories);
    }

    if (nextId && nextId !== current.parentStoryId) {
      const nextStory = allStories.find(s => s.id === nextId);
      if (nextStory && nextStory.state !== 'split') {
        await this.db('pointing_poker_stories').where({ id: nextId }).update({
          state: 'active',
          started_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    await this.db('pointing_poker_sessions')
      .where({ id: sessionId })
      .update({
        current_story_id: nextId,
        status: nextId ? 'pending' : 'completed',
        updated_at: new Date(),
      });

    return (await this.getSession(sessionId))!;
  }

  private advanceQueue(current: Story, allStories: Story[]): string | null {
    const pending = allStories
      .filter(
        s => s.state === 'pending' && s.id !== current.id && !s.parentStoryId,
      )
      .sort((a, b) => a.sort - b.sort);
    if (pending.length > 0) return pending[0].id;
    const snoozed = allStories
      .filter(s => s.state === 'snoozed' && !s.parentStoryId)
      .sort((a, b) => a.sort - b.sort);
    return snoozed[0]?.id ?? null;
  }

  async activateStory(sessionId: string, storyId: string): Promise<Session> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    const outgoing = session.stories.find(s => s.id === session.currentStoryId);
    if (outgoing && outgoing.startedAt) {
      await this.db('pointing_poker_stories')
        .where({ id: outgoing.id })
        .update({
          state: 'pending',
          started_at: null,
          duration_seconds:
            outgoing.durationSeconds + elapsedSeconds(outgoing.startedAt),
          updated_at: new Date(),
        });
    }

    await this.db('pointing_poker_votes')
      .whereIn(
        'story_id',
        session.stories.filter(s => s.id === outgoing?.id).map(s => s.id),
      )
      .delete();

    await this.db('pointing_poker_stories').where({ id: storyId }).update({
      state: 'active',
      started_at: new Date(),
      revealed: false,
      updated_at: new Date(),
    });

    await this.db('pointing_poker_sessions').where({ id: sessionId }).update({
      current_story_id: storyId,
      updated_at: new Date(),
    });

    return (await this.getSession(sessionId))!;
  }

  async setPresenter(
    sessionId: string,
    storyId: string,
    presenterUserId: string | null,
  ): Promise<Session> {
    await this.db('pointing_poker_stories').where({ id: storyId }).update({
      presenter_user_id: presenterUserId,
      updated_at: new Date(),
    });
    await this.db('pointing_poker_sessions')
      .where({ id: sessionId })
      .update({ updated_at: new Date() });
    return (await this.getSession(sessionId))!;
  }

  async splitStory(
    sessionId: string,
    storyId: string,
    subtasks: NewStory[],
  ): Promise<Session> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');
    const parent = session.stories.find(s => s.id === storyId);
    if (!parent) throw new Error('Story not found');

    const accumulated =
      parent.durationSeconds +
      (parent.startedAt ? elapsedSeconds(parent.startedAt) : 0);

    await this.db('pointing_poker_stories').where({ id: storyId }).update({
      state: 'split',
      started_at: null,
      duration_seconds: accumulated,
      updated_at: new Date(),
    });

    const nextStory = session.stories
      .filter(s => s.sort > parent.sort && !s.parentStoryId)
      .sort((a, b) => a.sort - b.sort)[0];
    const gapEnd =
      nextStory?.sort ??
      parent.sort + DEFAULT_SORT_GAP * subtasks.length + DEFAULT_SORT_GAP;
    const gap = (gapEnd - parent.sort) / (subtasks.length + 1);

    const rows = subtasks.map((s, i) => ({
      id: uuidv4(),
      session_id: sessionId,
      title: s.title,
      ticket_key: s.ticketKey ?? null,
      description: null,
      estimate: null,
      revealed: false,
      state: i === 0 ? 'active' : 'pending',
      started_at: i === 0 ? new Date() : null,
      duration_seconds: 0,
      parent_story_id: storyId,
      sort: parent.sort + gap * (i + 1),
      presenter_user_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await this.db('pointing_poker_stories').insert(rows);

    await this.db('pointing_poker_sessions').where({ id: sessionId }).update({
      current_story_id: rows[0].id,
      updated_at: new Date(),
    });

    return (await this.getSession(sessionId))!;
  }

  async resolveSplit(
    sessionId: string,
    storyId: string,
    mode: SplitResolution,
    estimate?: string,
  ): Promise<Session> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');
    const parent = session.stories.find(s => s.id === storyId);
    if (!parent) throw new Error('Story not found');

    if (mode === 'rollup' || mode === 'leave') {
      await this.db('pointing_poker_stories')
        .where({ id: storyId })
        .update({
          state: 'estimated',
          estimate: estimate ?? null,
          updated_at: new Date(),
        });
      return this.advanceFromStory(sessionId, parent, session.stories);
    }

    await this.db('pointing_poker_votes').where({ story_id: storyId }).delete();
    await this.db('pointing_poker_stories').where({ id: storyId }).update({
      state: 'active',
      started_at: new Date(),
      revealed: false,
      updated_at: new Date(),
    });
    await this.db('pointing_poker_sessions').where({ id: sessionId }).update({
      current_story_id: storyId,
      updated_at: new Date(),
    });
    return (await this.getSession(sessionId))!;
  }

  async getTeamQuery(teamRef: string): Promise<string | null> {
    const row = await this.db('pointing_poker_team_queries')
      .where({ team_ref: teamRef })
      .first();
    return row?.query ?? null;
  }

  async saveTeamQuery(teamRef: string, query: string): Promise<void> {
    await this.db('pointing_poker_team_queries')
      .insert({ team_ref: teamRef, query, updated_at: new Date() })
      .onConflict('team_ref')
      .merge();
  }

  async getTeamCards(teamRef: string): Promise<string[] | null> {
    const row = await this.db('pointing_poker_team_cards')
      .where({ team_ref: teamRef })
      .first();
    if (!row) return null;
    return row.cards.split(',').filter(Boolean);
  }

  async saveTeamCards(teamRef: string, cards: string[]): Promise<void> {
    await this.db('pointing_poker_team_cards')
      .insert({
        team_ref: teamRef,
        cards: cards.join(','),
        updated_at: new Date(),
      })
      .onConflict('team_ref')
      .merge();
  }

  async getAvatarPref(userId: string): Promise<AvatarPreference | null> {
    const row = await this.db('pointing_poker_avatar_prefs')
      .where({ user_ref: userId })
      .first();
    if (!row) return null;
    return { avatarSeed: row.avatar_seed, avatarStyle: row.avatar_style };
  }

  async saveAvatarPref(
    userId: string,
    avatarSeed: string,
    avatarStyle: string,
  ): Promise<void> {
    await this.db('pointing_poker_avatar_prefs')
      .insert({
        user_ref: userId,
        avatar_seed: avatarSeed,
        avatar_style: avatarStyle,
        updated_at: new Date(),
      })
      .onConflict('user_ref')
      .merge();

    await this.db('pointing_poker_participants')
      .whereIn(
        'session_id',
        this.db('pointing_poker_sessions')
          .where('status', 'pending')
          .select('id'),
      )
      .where('user_id', userId)
      .update({ avatar_seed: avatarSeed, avatar_style: avatarStyle });
  }

  private async autoCompleteStaleSessions(): Promise<void> {
    const cutoff = new Date(Date.now() - STALE_SESSION_HOURS * 60 * 60 * 1000);
    const stale = await this.db('pointing_poker_sessions')
      .where('status', 'pending')
      .where('created_at', '<', cutoff);
    for (const row of stale) {
      await this.endSession(row.id);
    }
  }
}
