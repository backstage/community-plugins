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
// eslint-disable-next-line @backstage/no-ui-css-imports-in-non-frontend
import '@backstage/ui/css/styles.css';
import { createDevApp } from '@backstage/dev-utils';
import { createApiFactory } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import type { CatalogApi } from '@backstage/plugin-catalog-react';
import {
  RELATION_HAS_MEMBER,
  RELATION_MEMBER_OF,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import type { Entity, GroupEntity, UserEntity } from '@backstage/catalog-model';
import type {
  AvatarPreference,
  Participant,
  Session,
} from '@backstage-community/plugin-pointing-poker-common';
import {
  pointingPokerPlugin,
  PointingPokerPage,
  pointingPokerApiRef,
} from '../src';
import type { PointingPokerApi } from '../src';

const TEAMS = [
  { name: 'team-rocket', title: 'Team Rocket' },
  { name: 'platform', title: 'Platform Team' },
];

const memberOfRefs = TEAMS.map(t => `group:default/${t.name}`);

const user = (name: string, displayName: string): UserEntity => ({
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'User',
  metadata: { name, namespace: 'default', title: displayName },
  spec: {
    profile: { displayName, email: `${name}@example.com` },
    memberOf: TEAMS.map(t => t.name),
  },
  relations: memberOfRefs.map(targetRef => ({
    type: RELATION_MEMBER_OF,
    targetRef,
  })),
});

const guest = user('guest', 'Guest User');
const jane = user('jane.roe', 'Jane Roe');

const groups: GroupEntity[] = TEAMS.map(team => ({
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Group',
  metadata: { name: team.name, namespace: 'default', title: team.title },
  spec: { type: 'team', children: [], profile: { displayName: team.title } },
  relations: [guest, jane].map(u => ({
    type: RELATION_HAS_MEMBER,
    targetRef: stringifyEntityRef(u),
  })),
}));

const entities: Entity[] = [guest, jane, ...groups];
const byRef = new Map(entities.map(e => [stringifyEntityRef(e), e]));

const matches = (entity: Entity, key: string, value: unknown): boolean => {
  const actual =
    key === 'kind'
      ? entity.kind
      : key
          .split('.')
          .reduce<unknown>(
            (acc, part) => (acc as Record<string, unknown> | undefined)?.[part],
            entity,
          );
  const wanted = Array.isArray(value) ? value : [value];
  return wanted.some(
    v => String(v).toLowerCase() === String(actual).toLowerCase(),
  );
};

const catalogApi = {
  getEntityByRef: async (
    ref: string | { kind: string; namespace: string; name: string },
  ) => byRef.get(typeof ref === 'string' ? ref : stringifyEntityRef(ref)),
  getEntitiesByRefs: async (request: { entityRefs: string[] }) => ({
    items: request.entityRefs.map(ref => byRef.get(ref)),
  }),
  getEntities: async (request?: {
    filter?: Record<string, unknown> | Record<string, unknown>[];
  }) => {
    const filter = request?.filter;
    let filters: Record<string, unknown>[] = [];
    if (Array.isArray(filter)) {
      filters = filter;
    } else if (filter) {
      filters = [filter];
    }
    if (filters.length === 0) {
      return { items: entities };
    }
    return {
      items: entities.filter(entity =>
        filters.some(f =>
          Object.entries(f).every(([k, v]) => matches(entity, k, v)),
        ),
      ),
    };
  },
} as unknown as CatalogApi;

const now = new Date();

const stubSession = (id: string): Session => ({
  createdAt: now,
  createdBy: 'guest',
  createdByName: 'Guest User',
  id,
  name: 'Mock session',
  participants: [],
  status: 'pending',
  stories: [],
  updatedAt: now,
});

const avatarPrefs = new Map<string, AvatarPreference>();
const teamQueries = new Map<string, string>();
const teamCards = new Map<string, string[]>();

const pokerApi: PointingPokerApi = {
  getProvider: async () => ({ id: 'mock' }),
  searchTickets: async () => [],
  getTicket: async key => ({ key, summary: `Mock ticket ${key}` }),
  getSubtasks: async () => [],
  setEstimate: async () => {},
  getComments: async () => [],
  postComment: async () => {},
  searchUsers: async () => [],
  getUser: async () => null,
  getLobbySessions: async () => [],
  getHistorySessions: async () => [],
  getTeamQuery: async teamRef => teamQueries.get(teamRef) ?? null,
  saveTeamQuery: async (teamRef, query) => {
    teamQueries.set(teamRef, query);
  },
  getTeamCards: async teamRef => teamCards.get(teamRef) ?? null,
  saveTeamCards: async (teamRef, cards) => {
    teamCards.set(teamRef, cards);
  },
  getAvatarPref: async userId => avatarPrefs.get(userId) ?? null,
  saveAvatarPref: async (userId, avatarSeed, avatarStyle) => {
    avatarPrefs.set(userId, { avatarSeed, avatarStyle });
  },
  createSession: async () => stubSession('mock-session'),
  getSession: async id => stubSession(id),
  deleteSession: async () => {},
  endSession: async () => {},
  reopenSession: async () => {},
  joinSession: async (sessionId, req): Promise<Participant> => ({
    avatarSeed: req.avatarSeed,
    avatarStyle: req.avatarStyle,
    id: 'p-guest',
    joinedAt: now,
    lastActiveAt: now,
    role: req.role,
    sessionId,
    userId: req.userId,
    userName: req.userName,
  }),
  leaveSession: async () => {},
  updateRole: async () => {},
  heartbeat: async () => {},
  castVote: async sessionId => stubSession(sessionId),
  unvote: async sessionId => stubSession(sessionId),
  reveal: async sessionId => stubSession(sessionId),
  accept: async sessionId => stubSession(sessionId),
  skip: async sessionId => stubSession(sessionId),
  newRound: async sessionId => stubSession(sessionId),
  activateStory: async sessionId => stubSession(sessionId),
  setPresenter: async sessionId => stubSession(sessionId),
  splitStory: async sessionId => stubSession(sessionId),
  resolveSplit: async sessionId => stubSession(sessionId),
};

createDevApp()
  .registerApi(createApiFactory(catalogApiRef, catalogApi))
  .registerApi(createApiFactory(pointingPokerApiRef, pokerApi))
  .registerPlugin(pointingPokerPlugin)
  .addPage({
    element: <PointingPokerPage />,
    title: 'Pointing Poker',
    path: '/pointing-poker',
  })
  .render();
