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
import {
  DatabaseManager,
  getVoidLogger,
  PluginDatabaseManager,
  ServerTokenManager,
} from '@backstage/backend-common';
import { ConfigReader } from '@backstage/config';
import request from 'supertest';
import express from 'express';
import {
  PersistenceContext,
  TechInsightsStore,
} from '@backstage-community/plugin-tech-insights-node';
import { DateTime } from 'luxon';
import { Knex } from 'knex';
import { TaskScheduler } from '@backstage/backend-tasks';

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

  beforeAll(async () => {
    const pluginDatabase: PluginDatabaseManager = {
      getClient: () => {
        return Promise.resolve({
          migrate: {
            latest: () => {},
          },
        }) as unknown as Promise<Knex>;
      },
    };
    const databaseManager: Partial<DatabaseManager> = {
      forPlugin: () => pluginDatabase,
    };
    const manager = databaseManager as DatabaseManager;
    const techInsightsContext = await buildTechInsightsContext({
      database: pluginDatabase,
      logger: getVoidLogger(),
      factRetrievers: [],
      scheduler: new TaskScheduler(manager, getVoidLogger()).forPlugin(
        'tech-insights',
      ),
      config: ConfigReader.fromConfigs([]),
      discovery: {
        getBaseUrl: (_: string) => Promise.resolve('http://mock.url'),
        getExternalBaseUrl: (_: string) => Promise.resolve('http://mock.url'),
      },
      tokenManager: ServerTokenManager.noop(),
    });

    const router = await createRouter({
      logger: getVoidLogger(),
      config: ConfigReader.fromConfigs([]),
      ...techInsightsContext,
      persistenceContext: mockPersistenceContext,
    });

    app = express().use(router);
  });
  describe('/fact-schemas', () => {
    it('should be able to retrieve latest schemas', async () => {
      await request(app).get('/fact-schemas').expect(200);
      expect(latestSchemasMock).toHaveBeenCalled();
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
  });
});
