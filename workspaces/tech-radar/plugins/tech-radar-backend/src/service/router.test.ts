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
import { ConfigReader } from '@backstage/config';

import express from 'express';
import request from 'supertest';

import { createRouter } from './router';
import * as utils from '../utils';

jest.mock('../utils', () => {
  return {
    __esModule: true, //    <----- this __esModule: true is important
    ...jest.requireActual('../utils'),
  };
});

const validURL = 'https://example.com';
const config = new ConfigReader({
  techRadar: {
    url: validURL,
  },
});
const emptyRadarData = {
  entries: [],
  quadrants: [],
  rings: [],
};

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const router = await createRouter({
      logger: mockServices.logger.mock(),
      config,
      reader: mockServices.urlReader.mock(),
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

  describe('GET /entities', () => {
    it('returns ok & data if readTechRadarResponseFromURL returns valid response', async () => {
      jest
        .spyOn(utils, 'readTechRadarResponseFromURL')
        .mockResolvedValue(emptyRadarData);
      const response = await request(app).get('/entries');

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('ok');
      expect(response.body.data).toEqual(emptyRadarData);
    });

    it('returns 400 if readTechRadarResponseFromURL returns undefined', async () => {
      jest
        .spyOn(utils, 'readTechRadarResponseFromURL')
        .mockResolvedValue(undefined);
      const response = await request(app).get('/entries');

      expect(response.status).toEqual(400);
      expect(response.body.status).not.toEqual('ok');
    });

    it('returns 500 if config is missing URL value', async () => {
      const missingConfig = new ConfigReader({
        techRadar: {},
      });
      const router = await createRouter({
        logger: mockServices.logger.mock(),
        config: missingConfig,
        reader: mockServices.urlReader.mock(),
      });
      app = express().use(router);
      const response = await request(app).get('/entries');

      expect(response.status).toEqual(500);
    });
  });
});
