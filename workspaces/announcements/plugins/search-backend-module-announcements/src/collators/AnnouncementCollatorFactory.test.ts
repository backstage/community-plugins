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
import { AnnouncementCollatorFactory } from './AnnouncementCollatorFactory';
import { Readable } from 'stream';
import { TestPipeline } from '@backstage/plugin-search-backend-node';
import { registerMswTestHooks } from '@backstage/test-utils';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { mockServices } from '@backstage/backend-test-utils';

const mockAnnouncements = {
  count: 4,
  results: [
    {
      id: '1',
      title: 'title',
      publisher: 'publisher1',
      body: 'body',
      excerpt: 'excerpt',
      created_at: 'created_at',
      active: true,
    },
    {
      id: '2',
      title: 'title',
      publisher: 'publisher2',
      body: 'body',
      excerpt: 'excerpt',
      created_at: 'created_at',
      active: true,
    },
    {
      id: '3',
      title: 'title',
      publisher: 'publisher3',
      body: 'body',
      excerpt: 'excerpt',
      created_at: 'created_at',
      active: true,
    },
    {
      id: '4',
      title: 'inactive title',
      publisher: 'publisher4',
      body: 'body',
      excerpt: 'excerpt',
      created_at: 'created_at',
      active: false,
    },
  ],
};

describe('AnnouncementCollatorFactory', () => {
  const mockDiscovery = mockServices.discovery.mock({
    getBaseUrl: jest.fn().mockReturnValue('http://localhost:7007/api'),
  });

  const factory = AnnouncementCollatorFactory.fromConfig({
    logger: mockServices.logger.mock(),
    discoveryApi: mockDiscovery,
    auth: mockServices.auth(),
  });

  it('has expected type', () => {
    expect(factory.type).toBe('announcements');
  });

  describe('getCollator', () => {
    const worker = setupServer();
    registerMswTestHooks(worker);

    let collator: Readable;
    beforeEach(async () => {
      collator = await factory.getCollator();
      worker.use(
        rest.get('http://localhost:7007/api/announcements', (_, res, ctx) =>
          res(ctx.status(200), ctx.json(mockAnnouncements)),
        ),
      );
    });

    it('should return a Readable stream', async () => {
      collator = await factory.getCollator();
      expect(collator).toBeInstanceOf(Readable);
    });

    it('runs against announcements, skipping inactive ones', async () => {
      collator = await factory.getCollator();
      const pipeline = TestPipeline.fromCollator(collator);
      const { documents } = await pipeline.execute();
      expect(mockDiscovery.getBaseUrl).toHaveBeenCalledWith('announcements');
      expect(documents).toHaveLength(3);
      expect(documents).toEqual(
        expect.not.arrayContaining([
          expect.objectContaining({ location: '/announcements/view/4' }),
        ]),
      );
    });
  });
});
