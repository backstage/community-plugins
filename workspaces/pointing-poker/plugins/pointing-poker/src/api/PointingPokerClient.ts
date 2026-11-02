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
import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import type {
  AvatarPreference,
  CastVoteRequest,
  CommentSegment,
  CreateSessionRequest,
  JoinSessionRequest,
  NewStory,
  Participant,
  ProviderUser,
  Session,
  SessionSummary,
  SplitResolution,
  Subtask,
  Ticket,
  TicketComment,
  TicketDetail,
} from '@backstage-community/plugin-pointing-poker-common';
import type { PointingPokerApi } from './pointingPokerApiRef';

export class PointingPokerClient implements PointingPokerApi {
  constructor(
    private readonly discoveryApi: DiscoveryApi,
    private readonly fetchApi: FetchApi,
  ) {}

  private async baseUrl(): Promise<string> {
    return this.discoveryApi.getBaseUrl('pointing-poker');
  }

  private async fetch<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${await this.baseUrl()}${path}`;
    const res = await this.fetchApi.fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status}: ${text}`);
    }
    if (res.status === 204) return undefined as unknown as T;
    return res.json();
  }

  async getProvider() {
    return this.fetch<{ id: string | null }>('/provider');
  }

  async searchTickets(query: string): Promise<Ticket[]> {
    return this.fetch('/tickets/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  async getTicket(key: string): Promise<TicketDetail> {
    return this.fetch(`/tickets/${encodeURIComponent(key)}`);
  }

  async getSubtasks(key: string): Promise<Subtask[]> {
    return this.fetch(`/tickets/${encodeURIComponent(key)}/subtasks`);
  }

  async setEstimate(key: string, value: number): Promise<void> {
    return this.fetch(`/tickets/${encodeURIComponent(key)}/estimate`, {
      method: 'POST',
      body: JSON.stringify({ value }),
    });
  }

  async getComments(key: string): Promise<TicketComment[]> {
    return this.fetch(`/tickets/${encodeURIComponent(key)}/comments`);
  }

  async postComment(
    key: string,
    content: CommentSegment[] | string,
    author: string,
  ): Promise<void> {
    return this.fetch(`/tickets/${encodeURIComponent(key)}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body: content, author }),
    });
  }

  async searchUsers(query: string): Promise<ProviderUser[]> {
    return this.fetch(`/users/search?q=${encodeURIComponent(query)}`);
  }

  async getUser(id: string): Promise<ProviderUser | null> {
    return this.fetch(`/users/${encodeURIComponent(id)}`);
  }

  async getLobbySessions(teamRefs: string[]): Promise<SessionSummary[]> {
    return this.fetch(`/sessions/lobby?teamRefs=${teamRefs.join(',')}`);
  }

  async getHistorySessions(teamRefs: string[]): Promise<Session[]> {
    return this.fetch(`/sessions/history?teamRefs=${teamRefs.join(',')}`);
  }

  async getTeamQuery(teamRef: string): Promise<string | null> {
    const data = await this.fetch<{ query: string | null }>(
      `/team-query?teamRef=${encodeURIComponent(teamRef)}`,
    );
    return data.query;
  }

  async saveTeamQuery(teamRef: string, query: string): Promise<void> {
    return this.fetch('/team-query', {
      method: 'POST',
      body: JSON.stringify({ teamRef, query }),
    });
  }

  async getTeamCards(teamRef: string): Promise<string[] | null> {
    const data = await this.fetch<{ cards: string[] | null }>(
      `/team-cards?teamRef=${encodeURIComponent(teamRef)}`,
    );
    return data.cards;
  }

  async saveTeamCards(teamRef: string, cards: string[]): Promise<void> {
    return this.fetch('/team-cards', {
      method: 'POST',
      body: JSON.stringify({ teamRef, cards }),
    });
  }

  async getAvatarPref(userId: string): Promise<AvatarPreference | null> {
    return this.fetch(`/avatar-pref?userId=${encodeURIComponent(userId)}`);
  }

  async saveAvatarPref(
    userId: string,
    avatarSeed: string,
    avatarStyle: string,
  ): Promise<void> {
    return this.fetch('/avatar-pref', {
      method: 'POST',
      body: JSON.stringify({ userId, avatarSeed, avatarStyle }),
    });
  }

  async createSession(req: CreateSessionRequest): Promise<Session> {
    return this.fetch('/sessions', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }

  async getSession(id: string): Promise<Session> {
    return this.fetch(`/sessions/${id}`);
  }

  async deleteSession(id: string): Promise<void> {
    return this.fetch(`/sessions/${id}`, { method: 'DELETE' });
  }

  async endSession(id: string): Promise<void> {
    return this.fetch(`/sessions/${id}/end`, { method: 'POST' });
  }

  async reopenSession(id: string): Promise<void> {
    return this.fetch(`/sessions/${id}/reopen`, { method: 'POST' });
  }

  async joinSession(
    sessionId: string,
    req: JoinSessionRequest,
  ): Promise<Participant> {
    return this.fetch(`/sessions/${sessionId}/join`, {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }

  async leaveSession(sessionId: string, userId: string): Promise<void> {
    return this.fetch(`/sessions/${sessionId}/leave`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async updateRole(
    sessionId: string,
    userId: string,
    role: string,
  ): Promise<void> {
    return this.fetch(`/sessions/${sessionId}/role`, {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    });
  }

  async heartbeat(sessionId: string, userId: string): Promise<void> {
    return this.fetch(`/sessions/${sessionId}/heartbeat`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async castVote(sessionId: string, req: CastVoteRequest): Promise<Session> {
    return this.fetch(`/sessions/${sessionId}/vote`, {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }

  async unvote(sessionId: string, userId: string): Promise<Session> {
    return this.fetch(`/sessions/${sessionId}/unvote`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async reveal(sessionId: string, revealed: boolean): Promise<Session> {
    return this.fetch(`/sessions/${sessionId}/reveal`, {
      method: 'POST',
      body: JSON.stringify({ revealed }),
    });
  }

  async accept(sessionId: string, estimate: string): Promise<Session> {
    return this.fetch(`/sessions/${sessionId}/accept`, {
      method: 'POST',
      body: JSON.stringify({ estimate }),
    });
  }

  async skip(sessionId: string): Promise<Session> {
    return this.fetch(`/sessions/${sessionId}/skip`, { method: 'POST' });
  }

  async newRound(sessionId: string): Promise<Session> {
    return this.fetch(`/sessions/${sessionId}/new-round`, { method: 'POST' });
  }

  async activateStory(sessionId: string, storyId: string): Promise<Session> {
    return this.fetch(`/sessions/${sessionId}/stories/${storyId}/activate`, {
      method: 'POST',
    });
  }

  async setPresenter(
    sessionId: string,
    storyId: string,
    presenterUserId: string | null,
  ): Promise<Session> {
    return this.fetch(`/sessions/${sessionId}/stories/${storyId}/presenter`, {
      method: 'POST',
      body: JSON.stringify({ presenterUserId }),
    });
  }

  async splitStory(
    sessionId: string,
    storyId: string,
    subtasks: NewStory[],
  ): Promise<Session> {
    return this.fetch(`/sessions/${sessionId}/stories/${storyId}/split`, {
      method: 'POST',
      body: JSON.stringify({ subtasks }),
    });
  }

  async resolveSplit(
    sessionId: string,
    storyId: string,
    mode: SplitResolution,
    estimate?: string,
  ): Promise<Session> {
    return this.fetch(
      `/sessions/${sessionId}/stories/${storyId}/resolve-split`,
      {
        method: 'POST',
        body: JSON.stringify({ mode, estimate }),
      },
    );
  }
}
