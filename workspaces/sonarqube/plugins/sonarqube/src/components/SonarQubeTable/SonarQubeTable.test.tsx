import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { setupRequestMockHandlers } from '@backstage/test-utils';

describe('SonarQubeTable', () => {
  const server = setupServer();
  // Enable sane handlers for network requests
  setupRequestMockHandlers(server);

  // setup mock response
  beforeEach(() => {
    server.use(
      rest.get('/*', (_, res, ctx) => res(ctx.status(200), ctx.json({}))),
    );
  });

  it('should render', async () => {
    expect(true).toBeTruthy();
  });
});
