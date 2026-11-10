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

describe('mtaPlugin', () => {
  const mtaServer = setupServer();

  beforeAll(() => mtaServer.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => mtaServer.resetHandlers());
  afterAll(() => mtaServer.close());

  it('starts while MTA is unreachable and retries OIDC discovery after a failure', async () => {
    const { server: backend } = await startTestBackend({
      features: [
        mtaPlugin,
        mockServices.database.mock().factory,
        mockServices.rootConfig.factory({
          data: {
            app: { baseUrl: 'http://localhost:3000' },
            backend: { baseUrl: 'http://localhost:7007' },
            mta: {
              url: MTA_URL,
              providerAuth: {
                realm: 'mta',
                clientID: 'backstage',
                secret: 's3cr3t',
              },
            },
          },
        }),
      ],
    });

    const first = await request(backend)
      .get('/api/mta/applications')
      .set('Authorization', mockCredentials.user.header());
    expect(first.status).toBe(500);

    let discoveries = 0;
    mtaServer.use(
      rest.get(`${ISSUER}/.well-known/openid-configuration`, (_, res, ctx) => {
        discoveries++;
        return res(
          ctx.json({
            issuer: ISSUER,
            authorization_endpoint: `${ISSUER}/protocol/openid-connect/auth`,
            token_endpoint: `${ISSUER}/protocol/openid-connect/token`,
          }),
        );
      }),
    );

    const second = await request(backend)
      .get('/api/mta/applications')
      .set('Authorization', mockCredentials.user.header());
    expect(second.status).toBe(401);
    expect(second.body.loginURL).toContain(
      `${ISSUER}/protocol/openid-connect/auth?`,
    );

    // A successful discovery is reused by later requests.
    const third = await request(backend)
      .get('/api/mta/applications')
      .set('Authorization', mockCredentials.user.header());
    expect(third.status).toBe(401);
    expect(discoveries).toBe(1);
  });
});
