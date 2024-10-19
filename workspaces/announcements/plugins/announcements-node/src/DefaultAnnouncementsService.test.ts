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
      discoveryApi: mockServices.discovery.mock({
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
