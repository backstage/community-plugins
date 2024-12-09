/*
 * Copyright 2024 The Backstage Authors
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
import { MemberEntity } from '../types';

export const mockMembers: MemberEntity[] = [
  {
    metadata: {
      namespace: 'default',
      annotations: {},
      name: 'team-d',
      description: 'Team D',
    },
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    spec: {
      type: 'team',
      profile: {
        displayName: 'Team D',
      },
      parent: 'boxoffice',
      children: [],
    },
    relations: [
      {
        type: 'childOf',
        targetRef: 'group:default/boxoffice',
      },
      {
        type: 'hasMember',
        targetRef: 'user:default/eva.macdowell',
      },
      {
        type: 'hasMember',
        targetRef: 'user:default/lucy.sheehan',
      },
    ],
  },
  {
    metadata: {
      namespace: 'default',
      annotations: {},
      name: 'infrastructure',
      description: 'The infra department',
    },
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    spec: {
      type: 'department',
      parent: 'acme-corp',
      children: ['backstage', 'boxoffice'],
    },
    relations: [],
  },
  {
    metadata: {
      namespace: 'default',
      annotations: {},
      name: 'guest',
    },
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'User',
    spec: {
      profile: {
        displayName: 'Guest User',
      },
      memberOf: ['team-a'],
    },
    relations: [
      {
        type: 'memberOf',
        targetRef: 'group:default/team-a',
      },
    ],
  },
  {
    metadata: {
      namespace: 'default',
      annotations: {},
      name: 'backstage-community-authors',
      title: 'Backstage-Community Authors',
    },
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    spec: {
      type: 'team',
      children: [],
    },
    relations: [],
  },
  {
    metadata: {
      namespace: 'default',
      annotations: {},
      name: 'team-a',
      description: 'Team A',
    },
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    spec: {
      type: 'team',
      profile: {},
      parent: 'backstage',
      children: [],
    },
    relations: [
      {
        type: 'childOf',
        targetRef: 'group:default/backstage',
      },
      {
        type: 'hasMember',
        targetRef: 'user:default/breanna.davison',
      },
      {
        type: 'hasMember',
        targetRef: 'user:default/guest',
      },
      {
        type: 'hasMember',
        targetRef: 'user:default/janelle.dawe',
      },
      {
        type: 'hasMember',
        targetRef: 'user:default/nigel.manning',
      },
    ],
  },
  {
    metadata: {
      namespace: 'default',
      annotations: {},
      name: 'backstage',
      description: 'The backstage sub-department',
    },
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    spec: {
      type: 'sub-department',
      profile: {
        displayName: 'Backstage',
      },
      parent: 'infrastructure',
      children: ['team-a', 'team-b'],
    },
    relations: [],
  },
  {
    metadata: {
      namespace: 'default',
      annotations: {},
      name: 'team-b',
      description: 'Team B',
    },
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    spec: {
      type: 'team',
      profile: {
        displayName: 'Team B',
      },
      parent: 'backstage',
      children: [],
    },
    relations: [
      {
        type: 'hasMember',
        targetRef: 'user:default/amelia.park',
      },
      {
        type: 'hasMember',
        targetRef: 'user:default/colette.brock',
      },
      {
        type: 'hasMember',
        targetRef: 'user:default/jenny.doe',
      },
      {
        type: 'hasMember',
        targetRef: 'user:default/jonathon.page',
      },
      {
        type: 'hasMember',
        targetRef: 'user:default/justine.barrow',
      },
    ],
  },
  {
    metadata: {
      namespace: 'default',
      annotations: {},
      name: 'lucy.sheehan',
    },
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'User',
    spec: {
      profile: {
        displayName: 'Lucy Sheehan',
      },
      memberOf: ['team-d'],
    },
    relations: [
      {
        type: 'memberOf',
        targetRef: 'group:default/team-d',
      },
    ],
  },
  {
    metadata: {
      namespace: 'default',
      annotations: {},
      name: 'boxoffice',
      description: 'The boxoffice sub-department',
    },
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    spec: {
      type: 'sub-department',
      profile: {
        displayName: 'Box Office',
      },
      parent: 'infrastructure',
      children: ['team-c', 'team-d'],
    },
    relations: [
      {
        type: 'childOf',
        targetRef: 'group:default/infrastructure',
      },
      {
        type: 'parentOf',
        targetRef: 'group:default/team-c',
      },
      {
        type: 'parentOf',
        targetRef: 'group:default/team-d',
      },
    ],
  },
  {
    metadata: {
      namespace: 'default',
      annotations: {},
      name: 'amelia.park',
    },
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'User',
    spec: {
      profile: {
        displayName: 'Amelia Park',
      },
      memberOf: ['team-b'],
    },
    relations: [
      {
        type: 'memberOf',
        targetRef: 'group:default/team-b',
      },
    ],
  },
];
