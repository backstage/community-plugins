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
import { ConfigReader } from '@backstage/config';
import { createRouter, createRouterFromConfig } from './router';
import { LinguistBackendApi } from '../api';
import { mockServices } from '@backstage/backend-test-utils';
import {
  SchedulerServiceTaskScheduleDefinition,
  UrlReaderService,
} from '@backstage/backend-plugin-api';

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

const schedule: SchedulerServiceTaskScheduleDefinition = {
  frequency: { minutes: 2 },
  timeout: { minutes: 15 },
  initialDelay: { seconds: 15 },
};

describe('createRouter', () => {
  let linguistBackendApi: jest.Mocked<LinguistBackendApi>;
  let app: express.Express;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /health', () => {
    beforeAll(async () => {
      const router = await createRouter(
        { schedule: schedule, age: { days: 30 }, useSourceLocation: false },
        {
          linguistBackendApi: linguistBackendApi,
          discovery: mockServices.discovery.mock(),
          database: mockServices.database.mock(),
          reader: mockUrlReader,
          logger: mockServices.logger.mock(),
          config: mockServices.rootConfig(),
        },
      );
      app = express().use(router);
    });
    it('returns ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /health from config', () => {
    beforeAll(async () => {
      const config = new ConfigReader({
        linguist: {
          schedule: {
            frequency: { minutes: 2 },
            timeout: { minutes: 15 },
            initialDelay: { seconds: 15 },
          },
          age: { days: 30 },
          useSourceLocation: false,
        },
      });
      const router = await createRouterFromConfig({
        linguistBackendApi: linguistBackendApi,
        discovery: mockServices.discovery.mock(),
        database: mockServices.database.mock(),
        reader: mockUrlReader,
        logger: mockServices.logger.mock(),
        config,
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
