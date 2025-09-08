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
import { startTestBackend, mockServices } from '@backstage/backend-test-utils';
import { defectdojoPlugin } from './plugin';
import request from 'supertest';

// TEMPLATE NOTE:
// Plugin tests are integration tests for your plugin, ensuring that all pieces
// work together end-to-end. You can still mock injected backend services
// however, just like anyone who installs your plugin might replace the
// services with their own implementations.
describe('plugin', () => {
  it('should return health status', async () => {
    const { server } = await startTestBackend({
      features: [
        defectdojoPlugin,
        mockServices.rootConfig.factory({
          data: {
            defectdojo: {
              baseUrl: 'https://demo.defectdojo.org',
              token: 'test-token',
              requestTimeoutMs: 5000,
              maxPages: 10,
            },
          },
        }),
      ],
    });

    const response = await request(server).get('/api/defectdojo/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('should require authentication for findings endpoint', async () => {
    const { server } = await startTestBackend({
      features: [
        defectdojoPlugin,
        mockServices.rootConfig.factory({
          data: {
            defectdojo: {
              baseUrl: 'https://demo.defectdojo.org',
              token: 'test-token',
              requestTimeoutMs: 5000,
              maxPages: 10,
            },
          },
        }),
      ],
    });

    // This should fail without authentication
    const response = await request(server).get(
      '/api/defectdojo/v1/findings?productId=123',
    );

    // The exact status code may vary depending on the mock auth setup
    expect([401, 403]).toContain(response.status);
  });
});
