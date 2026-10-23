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
import { Entity } from '@backstage/catalog-model';
import { Notification } from '@backstage/plugin-notifications-common';
import { JsonObject } from '@backstage/types';

const entity = (
  kind: string,
  name: string,
  spec: JsonObject,
  extra: Partial<Entity['metadata']> = {},
): Entity => ({
  apiVersion:
    kind === 'Template'
      ? 'scaffolder.backstage.io/v1beta3'
      : 'backstage.io/v1alpha1',
  kind,
  metadata: { name, namespace: 'default', ...extra },
  spec,
});

/** A small catalog: the examples from `examples/` plus a few extras. */
export const mockEntities: Entity[] = [
  entity(
    'Group',
    'guests',
    { type: 'team', children: [] },
    { title: 'Guests' },
  ),
  entity('User', 'guest', { memberOf: ['guests'] }, { title: 'Guest' }),
  entity('System', 'examples', { owner: 'guests' }),
  entity(
    'Component',
    'example-website',
    {
      type: 'website',
      lifecycle: 'experimental',
      owner: 'guests',
      system: 'examples',
      providesApis: ['example-grpc-api'],
    },
    { description: 'The example website', tags: ['frontend', 'react'] },
  ),
  entity(
    'Component',
    'payments-service',
    {
      type: 'service',
      lifecycle: 'production',
      owner: 'guests',
      system: 'examples',
    },
    { description: 'Handles payments', tags: ['backend', 'go'] },
  ),
  entity(
    'API',
    'example-grpc-api',
    {
      type: 'grpc',
      lifecycle: 'experimental',
      owner: 'guests',
      system: 'examples',
      definition: 'syntax = "proto3";',
    },
    { description: 'The example gRPC API' },
  ),
  entity(
    'Template',
    'example-nodejs-template',
    {
      owner: 'user:guest',
      type: 'service',
      parameters: [
        {
          title: 'Fill in some steps',
          required: ['name'],
          properties: {
            name: {
              title: 'Name',
              type: 'string',
              description: 'Unique name of the component',
            },
          },
        },
      ],
      steps: [
        { id: 'fetch-base', name: 'Fetch Base', action: 'fetch:template' },
      ],
    },
    {
      title: 'Example Node.js Template',
      description: 'An example template that creates a simple Node.js service',
      tags: ['recommended', 'nodejs'],
    },
  ),
];

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000);

/** A few notifications for the guest user, two of them unread. */
export const mockNotifications: Notification[] = [
  {
    id: '1',
    user: 'user:default/guest',
    created: minutesAgo(5),
    origin: 'plugin-scaffolder',
    payload: {
      title: 'Your "payments-service" template run finished',
      description: 'All 4 steps completed without errors.',
      link: '/create/tasks',
      severity: 'normal',
      topic: 'scaffolder',
    },
  },
  {
    id: '2',
    user: 'user:default/guest',
    created: minutesAgo(90),
    origin: 'plugin-catalog',
    payload: {
      title: 'example-website has a new owner',
      description: 'The component is now owned by group:default/guests.',
      link: '/catalog/default/component/example-website',
      severity: 'low',
      topic: 'catalog',
    },
  },
  {
    id: '3',
    user: 'user:default/guest',
    created: minutesAgo(60 * 26),
    read: minutesAgo(60 * 20),
    origin: 'plugin-guided-tour',
    payload: {
      title: 'Welcome to the guided tour demo',
      description: 'Replay any tour from the Guided tours page.',
      link: '/guided-tours',
      severity: 'normal',
      topic: 'guided-tour',
    },
  },
];
