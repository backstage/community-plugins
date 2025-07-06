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
import { mockServices } from '@backstage/backend-test-utils';
import express from 'express';
import request from 'supertest';
import { BlackDuckConfig } from '@backstage-community/plugin-blackduck-node';

import { createRouter } from './router';
import { ConfigReader } from '@backstage/config';

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const config = new ConfigReader({
      blackduck: {
        default: 'blackduck1',
        hosts: [
          {
            name: 'blackduck1',
            host: 'https://blackduck1.example.com',
            token: 'token1',
          },
          {
            name: 'blackduck2',
            host: 'https://blackduck2.example.com',
            token: 'token2',
          },
        ],
      },
    });

    const router = await createRouter({
      logger: mockServices.logger.mock(),
      config,
      permissions: mockServices.permissions.mock(),
      discovery: mockServices.discovery.mock(),
      blackDuckConfig: BlackDuckConfig.fromConfig(config),
      httpAuth: mockServices.httpAuth(),
    });
    app = express().use(router);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /health', () => {
    it('returns ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});
