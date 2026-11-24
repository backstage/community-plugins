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
  mockCredentials,
  mockServices,
  startTestBackend,
} from '@backstage/backend-test-utils';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import request from 'supertest';
import { mdxCardPlugin } from '../plugin';

const startBackend = async (
  result: AuthorizeResult.ALLOW | AuthorizeResult.DENY = AuthorizeResult.ALLOW,
) => {
  const { server } = await startTestBackend({
    features: [mdxCardPlugin, mockServices.permissions.factory({ result })],
  });
  return server;
};

const template = {
  id: 'ownership',
  title: 'Ownership',
  template: 'Owned by {props.entity.spec.owner}',
  dataFetchers: [
    {
      name: 'details',
      pluginId: 'catalog',
      apiUrl: '/entities/by-name/{{ entity.kind }}/default/x',
    },
  ],
};

describe('router', () => {
  it('creates, reads, lists, updates and deletes templates', async () => {
    const server = await startBackend();
    const auth = mockCredentials.user.header('user:default/jane');

    const created = await request(server)
      .post('/api/mdx-card/templates')
      .set('Authorization', auth)
      .send(template);
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({
      ...template,
      createdBy: 'user:default/jane',
      updatedBy: 'user:default/jane',
    });

    const fetched = await request(server)
      .get('/api/mdx-card/templates/ownership')
      .set('Authorization', auth);
    expect(fetched.status).toBe(200);
    expect(fetched.body).toEqual(created.body);

    const listed = await request(server)
      .get('/api/mdx-card/templates')
      .set('Authorization', auth);
    expect(listed.body.items).toEqual([
      {
        id: 'ownership',
        title: 'Ownership',
        createdBy: 'user:default/jane',
        createdAt: created.body.createdAt,
        updatedBy: 'user:default/jane',
        updatedAt: created.body.updatedAt,
      },
    ]);

    const updated = await request(server)
      .put('/api/mdx-card/templates/ownership')
      .set('Authorization', mockCredentials.user.header('user:default/john'))
      .send({ template: 'Updated', dataFetchers: [] });
    expect(updated.status).toBe(200);
    expect(updated.body).toMatchObject({
      id: 'ownership',
      template: 'Updated',
      dataFetchers: [],
      createdBy: 'user:default/jane',
      updatedBy: 'user:default/john',
    });
    expect(updated.body.title).toBeUndefined();

    const deleted = await request(server)
      .delete('/api/mdx-card/templates/ownership')
      .set('Authorization', auth);
    expect(deleted.status).toBe(204);

    const missing = await request(server)
      .get('/api/mdx-card/templates/ownership')
      .set('Authorization', auth);
    expect(missing.status).toBe(404);
  });

  it('rejects duplicate ids', async () => {
    const server = await startBackend();
    const auth = mockCredentials.user.header();

    await request(server)
      .post('/api/mdx-card/templates')
      .set('Authorization', auth)
      .send(template);
    const duplicate = await request(server)
      .post('/api/mdx-card/templates')
      .set('Authorization', auth)
      .send(template);

    expect(duplicate.status).toBe(409);
  });

  it('validates the request body', async () => {
    const server = await startBackend();

    const response = await request(server)
      .post('/api/mdx-card/templates')
      .set('Authorization', mockCredentials.user.header())
      .send({ ...template, id: 'Not Valid' });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toContain('id:');
  });

  it('returns 404 when updating a missing template', async () => {
    const server = await startBackend();

    const response = await request(server)
      .put('/api/mdx-card/templates/missing')
      .set('Authorization', mockCredentials.user.header())
      .send({ template: 'x' });

    expect(response.status).toBe(404);
  });

  it('denies requests the permission policy rejects', async () => {
    const server = await startBackend(AuthorizeResult.DENY);

    const response = await request(server)
      .post('/api/mdx-card/templates')
      .set('Authorization', mockCredentials.user.header())
      .send(template);

    expect(response.status).toBe(403);
  });

  it('requires a user', async () => {
    const { server } = await startTestBackend({
      features: [
        mdxCardPlugin,
        mockServices.httpAuth.factory({
          defaultCredentials: mockCredentials.none(),
        }),
      ],
    });

    const response = await request(server).get('/api/mdx-card/templates');

    expect(response.status).toBe(401);
  });
});
