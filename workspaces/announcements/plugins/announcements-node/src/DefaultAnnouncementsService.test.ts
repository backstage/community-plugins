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
import { registerMswTestHooks } from '@backstage/test-utils';
import { DefaultAnnouncementsService } from './DefaultAnnouncementsService';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { mockServices } from '@backstage/backend-test-utils';

describe('DefaultAnnouncementsService', () => {
  const server = setupServer();
  const mockBaseUrl = 'http://localhost:7007/api/';

  registerMswTestHooks(server);

  let client: DefaultAnnouncementsService;
  beforeEach(() => {
    client = new DefaultAnnouncementsService({
      discovery: mockServices.discovery.mock({
        getBaseUrl: jest.fn().mockReturnValue(mockBaseUrl),
      }),
    });
    server.listen();
  });

  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('handles no announcements', async () => {
    server.use(
      rest.get(`${mockBaseUrl}/announcements`, (_, res, ctx) =>
        res(ctx.status(200), ctx.json({ count: 0, results: [] })),
      ),
    );
    expect(await client.announcements()).toEqual([]);
  });

  it('returns announcements', async () => {
    const announcements = [
      {
        id: '1',
        title: 'announcement1',
        excerpt: 'excerpt',
        body: 'body',
        publisher: 'publisher',
        created_at: '2021-01-01T00:00:00Z',
      },
      {
        id: '1',
        title: 'announcement2',
        excerpt: 'excerpt',
        body: 'body',
        publisher: 'publisher2',
        created_at: '2021-01-02T00:00:00Z',
      },
    ];
    server.use(
      rest.get(`${mockBaseUrl}/announcements`, (_, res, ctx) =>
        res(ctx.status(200), ctx.json({ count: 2, results: announcements })),
      ),
    );
    expect(await client.announcements()).toEqual(announcements);
  });

  it('throws on error', async () => {
    server.use(
      rest.get(`${mockBaseUrl}/announcements`, (_, res, ctx) =>
        res(ctx.status(500)),
      ),
    );
    await expect(client.announcements()).rejects.toThrow(
      'Request failed with 500 Internal Server Error',
    );
  });
});
