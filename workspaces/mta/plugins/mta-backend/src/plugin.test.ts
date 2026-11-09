import {
  mockCredentials,
  mockServices,
  startTestBackend,
} from '@backstage/backend-test-utils';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import request from 'supertest';
import { mtaPlugin } from './plugin';

// Keep the test free of a real database (and of native sqlite bindings).
jest.mock('./database/storage', () => ({
  DataBaseEntityApplicationStorage: {
    create: async () => ({
      getRefreshTokenForUser: async () => undefined,
      saveRefreshTokenForUser: async () => {},
    }),
  },
}));

// Nothing listens on port 1, so connecting to it is refused.
const MTA_URL = 'http://127.0.0.1:1';
const ISSUER = `${MTA_URL}/auth/realms/mta`;

const config = mockServices.rootConfig.factory({
  data: {
    app: { baseUrl: 'http://localhost:3000' },
    backend: { baseUrl: 'http://localhost:7007' },
    mta: {
      url: MTA_URL,
      providerAuth: { realm: 'mta', clientID: 'backstage', secret: 's3cr3t' },
    },
  },
});

const database = mockServices.database.mock({
  getClient: async () => ({}) as any,
}).factory;

describe('mtaPlugin', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('starts when MTA is unreachable', async () => {
    const { server: backend } = await startTestBackend({
      features: [mtaPlugin, config, database],
    });

    expect(backend).toBeDefined();
  });

  it('retries OIDC discovery on the next request after a failure', async () => {
    const { server: backend } = await startTestBackend({
      features: [mtaPlugin, config, database],
    });

    const first = await request(backend)
      .get('/api/mta/applications')
      .set('Authorization', mockCredentials.user.header());
    expect(first.status).toBe(500);

    server.use(
      rest.get(`${ISSUER}/.well-known/openid-configuration`, (_, res, ctx) =>
        res(
          ctx.json({
            issuer: ISSUER,
            authorization_endpoint: `${ISSUER}/protocol/openid-connect/auth`,
            token_endpoint: `${ISSUER}/protocol/openid-connect/token`,
          }),
        ),
      ),
    );

    const second = await request(backend)
      .get('/api/mta/applications')
      .set('Authorization', mockCredentials.user.header());
    expect(second.status).toBe(401);
    expect(second.body.loginURL).toMatch(
      `${ISSUER}/protocol/openid-connect/auth?`,
    );
  });
});
