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
/** @public */
export type ParticipantRole = 'host' | 'observer' | 'voter';

/** @public */
export type SessionStatus = 'completed' | 'pending';

/** @public */
export type StoryState =
  | 'active'
  | 'estimated'
  | 'pending'
  | 'skipped'
  | 'snoozed'
  | 'split';

/** @public */
export type SplitResolution = 'leave' | 'rollup' | 'separate';

/** @public */
export type Participant = {
  avatarSeed?: string;
  avatarStyle?: string;
  id: string;
  joinedAt: Date;
  lastActiveAt: Date;
  role: ParticipantRole;
  sessionId: string;
  userId: string;
  userName: string;
};

/** @public */
export type Vote = {
  id: string;
  storyId: string;
  userId: string;
  userName: string;
  value: string;
  votedAt: Date;
};

/** @public */
export type Story = {
  createdAt: Date;
  description?: string;
  durationSeconds: number;
  estimate?: string;
  id: string;
  parentStoryId?: string;
  presenterUserId?: string;
  revealed: boolean;
  sessionId: string;
  sort: number;
  startedAt?: Date;
  state: StoryState;
  ticketKey?: string;
  title: string;
  updatedAt: Date;
  votes: Vote[];
};

/** @public */
export type Session = {
  createdAt: Date;
  createdBy: string;
  createdByName: string;
  currentStoryId?: string;
  description?: string;
  id: string;
  name: string;
  participants: Participant[];
  status: SessionStatus;
  stories: Story[];
  teamRef?: string;
  updatedAt: Date;
};

/** @public */
export type SessionSummary = {
  activeCount: number;
  createdAt: Date;
  createdBy: string;
  createdByName: string;
  id: string;
  isDuplicate: boolean;
  joinedCount: number;
  name: string;
  participants: Participant[];
  teamRef: string;
  votingCount: number;
};

/** @public */
export type AvatarPreference = {
  avatarSeed: string;
  avatarStyle: string;
};

/** @public */
export type NewStory = {
  ticketKey?: string;
  title: string;
};

/** @public */
export type CreateSessionRequest = {
  avatarSeed?: string;
  avatarStyle?: string;
  description?: string;
  name: string;
  query?: string;
  stories?: NewStory[];
  teamRef: string;
  userId: string;
  userName: string;
};

/** @public */
export type JoinSessionRequest = {
  avatarSeed?: string;
  avatarStyle?: string;
  role: ParticipantRole;
  userId: string;
  userName: string;
};

/** @public */
export type CastVoteRequest = {
  userId: string;
  userName: string;
  value: string;
};

/** @public */
export type CommentSegment =
  | { id: string; text: string; type: 'mention' }
  | { text: string; type: 'text' };

/** @public */
export type Attachment = {
  filename: string;
  id: string;
  mimeType: string;
  size?: number;
  url?: string;
};

/** @public */
export type Subtask = {
  key: string;
  priority?: string;
  storyPoints?: number;
  summary: string;
  type?: string;
};

/** @public */
export type Ticket = {
  assignee?: string;
  author?: string;
  authorAvatarUrl?: string;
  created?: string;
  key: string;
  priority?: string;
  sprint?: string | null;
  status?: string;
  summary: string;
  type?: string;
  typeIconUrl?: string;
  url?: string;
};

/** @public */
export type TicketDetail = {
  assignee?: string;
  attachments?: Attachment[];
  author?: string;
  createdAt?: string;
  description?: string;
  key: string;
  priority?: string;
  reporterName?: string;
  status?: string;
  summary: string;
  type?: string;
  typeIconUrl?: string;
  url?: string;
};

/** @public */
export type TicketComment = {
  author: string;
  authorAvatarUrl?: string;
  body: string;
  createdAt: string;
  id: string;
};

/** @public */
export type ProviderUser = {
  avatarUrl?: string;
  displayName: string;
  email?: string;
  id: string;
};

/** @public */
export interface TicketProvider {
  readonly providerId: string;
  getComments(key: string): Promise<TicketComment[]>;
  getSubtasks?(key: string): Promise<Subtask[]>;
  getTicket(key: string): Promise<TicketDetail | null>;
  getUser?(id: string): Promise<ProviderUser | null>;
  postComment(
    key: string,
    content: CommentSegment[] | string,
    author: string,
  ): Promise<void>;
  searchTickets(query: string): Promise<Ticket[]>;
  searchUsers?(query: string): Promise<ProviderUser[]>;
  setEstimate(key: string, points: number): Promise<void>;
}
