/*
 * Copyright 2021 The Backstage Authors
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

import { buildTechInsightsContext } from './techInsightsContextBuilder';
import { createRouter } from './router';
import { ConfigReader } from '@backstage/config';
import request from 'supertest';
import express from 'express';
import {
  PersistenceContext,
  TechInsightsStore,
} from '@backstage-community/plugin-tech-insights-node';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { DateTime } from 'luxon';
import { mockServices } from '@backstage/backend-test-utils';
import { DefaultSchedulerService } from '@backstage/backend-defaults/scheduler';

const setupRouter = async (
  mockPersistenceContext: PersistenceContext,
  allow: boolean,
) => {
  const database = mockServices.database.mock({
    migrations: { skip: true },
  });
  const logger = mockServices.logger.mock();
  const urlReader = mockServices.urlReader.mock();
  const rootLifecycle = mockServices.rootLifecycle.mock();
  const httpRouter = mockServices.httpRouter.mock();
  const techInsightsContext = await buildTechInsightsContext({
    database,
    logger,
    factRetrievers: [],
    scheduler: DefaultSchedulerService.create({
      database,
      logger,
      rootLifecycle,
      httpRouter,
      pluginMetadata: { getId: () => 'plugin-id' },
    }),
    config: ConfigReader.fromConfigs([]),
    discovery: {
      getBaseUrl: (_: string) => Promise.resolve('http://mock.url'),
      getExternalBaseUrl: (_: string) => Promise.resolve('http://mock.url'),
    },
    auth: mockServices.auth(),
    urlReader,
  });

  const router = await createRouter({
    logger,
    config: ConfigReader.fromConfigs([]),
    ...techInsightsContext,
    persistenceContext: mockPersistenceContext,
    permissions: mockServices.permissions.mock({
      authorize: async () => [
        { result: allow ? AuthorizeResult.ALLOW : AuthorizeResult.DENY },
      ],
      authorizeConditional: async () => [
        { result: allow ? AuthorizeResult.ALLOW : AuthorizeResult.DENY },
      ],
    }),
    httpAuth: mockServices.httpAuth(),
  });

  return router;
};

describe('Tech Insights router tests', () => {
  let app: express.Express;

  const latestFactsByIdsMock = jest.fn();
  const factsBetweenTimestampsByIdsMock = jest.fn();
  const latestSchemasMock = jest.fn();

  const mockPersistenceContext: PersistenceContext = {
    techInsightsStore: {
      getLatestFactsByIds: latestFactsByIdsMock,
      getFactsBetweenTimestampsByIds: factsBetweenTimestampsByIdsMock,
      getLatestSchemas: latestSchemasMock,
    } as unknown as TechInsightsStore,
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeEach(async () => {
    const router = await setupRouter(mockPersistenceContext, true);

    app = express().use(router);
  });
  describe('/fact-schemas', () => {
    it('should be able to retrieve latest schemas', async () => {
      await request(app).get('/fact-schemas').expect(200);
      expect(latestSchemasMock).toHaveBeenCalled();
    });

    it('should not allow access when not authorized', async () => {
      const router = await setupRouter(mockPersistenceContext, false);
      app = express().use(router);
      await request(app).get('/fact-schemas').expect(403);
    });
  });

  describe('/checks', () => {
    it('should not contain check endpoints when checker not present', async () => {
      await request(app).get('/checks').expect(404);
      await request(app).post('/checks/a/a/a').expect(404);
    });
  });

  describe('/facts/latest', () => {
    it('should be able to parse id request params for fact retrieval', async () => {
      await request(app)
        .get('/facts/latest')
        .query({
          entity: 'a:a/a',
          ids: ['firstId', 'secondId'],
        })
        .expect(200);
      expect(latestFactsByIdsMock).toHaveBeenCalledWith(
        ['firstId', 'secondId'],
        'a:a/a',
      );
    });
    it('should handle singular ids in query params correctly', async () => {
      await request(app)
        .get('/facts/latest')
        .query({
          entity: 'a:a/a',
          ids: ['secondId'],
        })
        .expect(200);
      expect(latestFactsByIdsMock).toHaveBeenCalledWith(['secondId'], 'a:a/a');
    });

    it('should not allow access when not authorized', async () => {
      const router = await setupRouter(mockPersistenceContext, false);

      app = express().use(router);

      await request(app)
        .get('/facts/latest')
        .query({
          entity: 'a:a/a',
          ids: ['firstId', 'secondId'],
        })
        .expect(403);
    });
  });

  describe('/facts/range', () => {
    it('should be able to parse datetime request params for fact retrieval', async () => {
      await request(app)
        .get('/facts/range')
        .query({
          entity: 'a:a/a',
          ids: ['firstId', 'secondId'],
          startDatetime: '2021-12-12T12:12:12',
          endDatetime: '2022-11-11T11:11:11',
        })
        .expect(200);
      expect(factsBetweenTimestampsByIdsMock).toHaveBeenCalledWith(
        ['firstId', 'secondId'],
        'a:a/a',
        DateTime.fromISO('2021-12-12T12:12:12.000+00:00'),
        DateTime.fromISO('2022-11-11T11:11:11.000+00:00'),
      );
    });

    it('should respond gracefully on parsing errors', async () => {
      await request(app)
        .get('/facts/range')
        .query({
          entity: 'a:a/a',
          ids: ['firstId', 'secondId'],
          startDatetime: '2021-12-1222T12:12:12',
          endDatetime: '2022-1122-11T11:11:11',
        })
        .expect(422);
      expect(latestFactsByIdsMock).toHaveBeenCalledTimes(0);
    });

    it('should handle singular ids in query params correctly', async () => {
      await request(app)
        .get('/facts/range')
        .query({
          entity: 'a:a/a',
          ids: ['firstId'],
          startDatetime: '2021-12-12T12:12:12',
          endDatetime: '2022-11-11T11:11:11',
        })
        .expect(200);
      expect(factsBetweenTimestampsByIdsMock).toHaveBeenCalledWith(
        ['firstId'],
        'a:a/a',
        DateTime.fromISO('2021-12-12T12:12:12.000+00:00'),
        DateTime.fromISO('2022-11-11T11:11:11.000+00:00'),
      );
    });

    it('should not allow access when not authorized', async () => {
      const router = await setupRouter(mockPersistenceContext, false);

      app = express().use(router);

      await request(app).get('/facts/range').expect(403);
    });
  });
});
