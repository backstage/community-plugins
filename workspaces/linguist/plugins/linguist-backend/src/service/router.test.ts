/*
 * Copyright 2022 The Backstage Authors
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

import express from 'express';
import request from 'supertest';
import { createRouter } from './router';
import { LinguistBackendApi } from '../api';
import { mockServices, TestDatabases } from '@backstage/backend-test-utils';
import { UrlReaderService } from '@backstage/backend-plugin-api';

const mockUrlReader: UrlReaderService = {
  readUrl: url =>
    Promise.resolve({
      buffer: async () => Buffer.from(url),
      etag: 'buffer',
      stream: jest.fn(),
    }),
  readTree: jest.fn(),
  search: jest.fn(),
};

const databases = TestDatabases.create();

describe('createRouter', () => {
  let linguistBackendApi: jest.Mocked<LinguistBackendApi>;
  let app: express.Express;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /health', () => {
    beforeAll(async () => {
      const knex = await databases.init('SQLITE_3');
      const getClient = jest.fn(async () => knex);
      const router = await createRouter({
        linguistBackendApi: linguistBackendApi,
        discovery: mockServices.discovery.mock(),
        database: mockServices.database.mock({ getClient }),
        reader: mockUrlReader,
        logger: mockServices.logger.mock(),
        config: mockServices.rootConfig(),
        auth: mockServices.auth(),
      });
      app = express().use(router);
    });
    it('returns ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});
