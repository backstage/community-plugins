import { AnnouncementCollatorFactory } from './AnnouncementCollatorFactory';
import { Readable } from 'stream';
import { getVoidLogger } from '@backstage/backend-common';
import { TestPipeline } from '@backstage/plugin-search-backend-node';
import { setupRequestMockHandlers } from '@backstage/test-utils';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { mockServices } from '@backstage/backend-test-utils';

const mockAnnouncements = {
  count: 3,
  results: [
    {
      id: '1',
      title: 'title',
      publisher: 'publisher1',
      body: 'body',
      excerpt: 'excerpt',
      created_at: 'created_at',
    },
    {
      id: '2',
      title: 'title',
      publisher: 'publisher2',
      body: 'body',
      excerpt: 'excerpt',
      created_at: 'created_at',
    },
    {
      id: '3',
      title: 'title',
      publisher: 'publisher3',
      body: 'body',
      excerpt: 'excerpt',
      created_at: 'created_at',
    },
  ],
};

describe('AnnouncementCollatorFactory', () => {
  const logger = getVoidLogger();
  const mockDiscoveryApi = {
    getBaseUrl: jest.fn().mockReturnValue('http://localhost:7007/api'),
  };
  const mockAuth = mockServices.auth();

  const factory = AnnouncementCollatorFactory.fromConfig({
    logger,
    discoveryApi: mockDiscoveryApi,
    auth: mockAuth,
  });

  it('has expected type', () => {
    expect(factory.type).toBe('announcements');
  });

  describe('getCollator', () => {
    const worker = setupServer();
    setupRequestMockHandlers(worker);

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

    it('runs against announcements', async () => {
      collator = await factory.getCollator();
      const pipeline = TestPipeline.fromCollator(collator);
      const { documents } = await pipeline.execute();
      expect(mockDiscoveryApi.getBaseUrl).toHaveBeenCalledWith('announcements');
      expect(documents).toHaveLength(mockAnnouncements.results.length);
    });
  });
});
