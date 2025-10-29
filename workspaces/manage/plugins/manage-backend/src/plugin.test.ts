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
import request from 'supertest';

import {
  mockCredentials,
  startTestBackend,
} from '@backstage/backend-test-utils';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';
import { Entity } from '@backstage/catalog-model';

import { managePlugin } from './plugin';

describe('plugin', () => {
  it('should read home', async () => {
    const ownerEntity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      metadata: {
        name: 'mock',
        namespace: 'default',
      },
      relations: [
        {
          targetRef: 'component:default/my-component',
          type: 'ownerOf',
        },
      ],
      spec: {},
    };
    const ownedEntity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-component',
        namespace: 'default',
        title: 'My Component',
      },
      spec: {
        type: 'service',
        owner: 'user:default/mock',
      },
    };

    const { server } = await startTestBackend({
      features: [
        managePlugin,
        catalogServiceMock.factory({
          entities: [ownedEntity, ownerEntity],
        }),
      ],
    });

    const res = await request(server)
      .get('/api/manage/home')
      .set('Authorization', mockCredentials.user.header());

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ownedEntities: [ownedEntity],
      ownerEntities: [ownerEntity],
    });
  });
});
