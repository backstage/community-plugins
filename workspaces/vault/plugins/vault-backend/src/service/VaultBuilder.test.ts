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

import { ConfigReader } from '@backstage/config';
import express from 'express';
import request from 'supertest';
import { mockServices } from '@backstage/backend-test-utils';
import { VaultBuilder } from './VaultBuilder';

describe('VaultBuilder', () => {
  let app: express.Express;

  beforeAll(() => {
    const builder = VaultBuilder.createBuilder({
      logger: mockServices.logger.mock(),
      config: new ConfigReader({
        vault: {
          baseUrl: 'https://vault-server',
          publicUrl: 'https://vault-server',
          secretEngine: 'secrets',
          auth: {
            type: 'static',
            secret: '1234567890',
          },
        },
      }),
      scheduler: mockServices.scheduler.mock(),
    });
    app = express().use(builder.build().router);
  });

  describe('GET /v1/secrets/:path/create-url', () => {
    it('returns createUrl for valid path', async () => {
      const response = await request(app).get(
        '/v1/secrets/test-path/create-url',
      );

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('createUrl');
      expect(typeof response.body.createUrl).toBe('string');
      expect(response.body.createUrl).toContain(
        'https://vault-server/ui/vault/secrets/secrets/kv/create',
      );
      expect(response.body.createUrl).toContain('initialKey=test-path');
    });

    it('returns createUrl for valid path with engine parameter', async () => {
      const response = await request(app).get(
        '/v1/secrets/test-path/create-url?engine=custom-engine',
      );

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('createUrl');
      expect(typeof response.body.createUrl).toBe('string');
      expect(response.body.createUrl).toContain(
        'https://vault-server/ui/vault/secrets/custom-engine/kv/create',
      );
      expect(response.body.createUrl).toContain('initialKey=test-path');
    });

    it('returns createUrl for numeric path (validation accepts all strings)', async () => {
      const response = await request(app).get('/v1/secrets/123/create-url');

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('createUrl');
      expect(response.body.createUrl).toContain('initialKey=123');
    });

    it('returns createUrl for numeric engine (validation accepts all strings)', async () => {
      const response = await request(app).get(
        '/v1/secrets/test-path/create-url?engine=123',
      );

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('createUrl');
      expect(response.body.createUrl).toContain('secrets/123');
    });

    it('returns 404 for missing path parameter (route pattern mismatch)', async () => {
      const response = await request(app).get('/v1/secrets//create-url');

      expect(response.status).toEqual(404);
    });
  });
});
