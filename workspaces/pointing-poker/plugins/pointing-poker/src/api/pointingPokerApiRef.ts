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
import { createApiRef } from '@backstage/core-plugin-api';
import type {
  AvatarPreference,
  CastVoteRequest,
  CommentSegment,
  CreateSessionRequest,
  Subtask,
  JoinSessionRequest,
  NewStory,
  Participant,
  ProviderUser,
  Session,
  SessionSummary,
  SplitResolution,
  Ticket,
  TicketComment,
  TicketDetail,
} from '@backstage-community/plugin-pointing-poker-common';

export type { ProviderUser, Ticket, TicketDetail, TicketComment };

export interface PointingPokerApi {
  getProvider(): Promise<{ id: string | null }>;
  searchTickets(query: string): Promise<Ticket[]>;
  getTicket(key: string): Promise<TicketDetail>;
  getSubtasks(key: string): Promise<Subtask[]>;
  setEstimate(key: string, value: number): Promise<void>;
  getComments(key: string): Promise<TicketComment[]>;
  postComment(
    key: string,
    content: CommentSegment[] | string,
    author: string,
  ): Promise<void>;
  searchUsers(query: string): Promise<ProviderUser[]>;
  getUser(id: string): Promise<ProviderUser | null>;

  getLobbySessions(teamRefs: string[]): Promise<SessionSummary[]>;
  getHistorySessions(teamRefs: string[]): Promise<Session[]>;
  getTeamQuery(teamRef: string): Promise<string | null>;
  saveTeamQuery(teamRef: string, query: string): Promise<void>;
  getTeamCards(teamRef: string): Promise<string[] | null>;
  saveTeamCards(teamRef: string, cards: string[]): Promise<void>;
  getAvatarPref(userId: string): Promise<AvatarPreference | null>;
  saveAvatarPref(
    userId: string,
    avatarSeed: string,
    avatarStyle: string,
  ): Promise<void>;

  createSession(req: CreateSessionRequest): Promise<Session>;
  getSession(id: string): Promise<Session>;
  deleteSession(id: string): Promise<void>;
  endSession(id: string): Promise<void>;
  reopenSession(id: string): Promise<void>;

  joinSession(sessionId: string, req: JoinSessionRequest): Promise<Participant>;
  leaveSession(sessionId: string, userId: string): Promise<void>;
  updateRole(sessionId: string, userId: string, role: string): Promise<void>;
  heartbeat(sessionId: string, userId: string): Promise<void>;

  castVote(sessionId: string, req: CastVoteRequest): Promise<Session>;
  unvote(sessionId: string, userId: string): Promise<Session>;
  reveal(sessionId: string, revealed: boolean): Promise<Session>;
  accept(sessionId: string, estimate: string): Promise<Session>;
  skip(sessionId: string): Promise<Session>;
  newRound(sessionId: string): Promise<Session>;

  activateStory(sessionId: string, storyId: string): Promise<Session>;
  setPresenter(
    sessionId: string,
    storyId: string,
    presenterUserId: string | null,
  ): Promise<Session>;
  splitStory(
    sessionId: string,
    storyId: string,
    subtasks: NewStory[],
  ): Promise<Session>;
  resolveSplit(
    sessionId: string,
    storyId: string,
    mode: SplitResolution,
    estimate?: string,
  ): Promise<Session>;
}

export const pointingPokerApiRef = createApiRef<PointingPokerApi>({
  id: 'plugin.pointing-poker.service',
});
