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
import { DiscoveryService } from '@backstage/backend-plugin-api';
import { UrlReaders } from '@backstage/backend-defaults/urlReader';
import { DatabaseManager } from '@backstage/backend-defaults/database';
import express from 'express';
import request from 'supertest';

import { createRouter } from './router';
// import { CatalogRequestOptions } from '@backstage/catalog-client';
import { ConfigReader } from '@backstage/config';
import {
  PluginTaskScheduler,
  TaskInvocationDefinition,
  TaskRunner,
} from '@backstage/backend-tasks';
import { mockServices } from '@backstage/backend-test-utils';

// let catalogRequestOptions: CatalogRequestOptions;

const testDiscovery: jest.Mocked<DiscoveryService> = {
  getBaseUrl: jest
    .fn()
    .mockResolvedValue('http://localhost:7007/api/time-saver'),
  getExternalBaseUrl: jest.fn(),
};
const mockUrlReader = UrlReaders.default({
  logger: mockServices.logger.mock(),
  config: new ConfigReader({}),
});

describe('createRouter', () => {
  let app: express.Express;
  const manager = DatabaseManager.fromConfig(
    new ConfigReader({
      backend: {
        database: { client: 'better-sqlite3', connection: ':memory:' },
      },
    }),
  );
  const config = new ConfigReader({
    backend: {
      baseUrl: 'http://127.0.0.1',
      listen: { port: 7007 },
      database: {
        client: 'better-sqlite3',
        connection: ':memory:',
      },
    },
  });
  const database = manager.forPlugin('time-saver');
  class PersistingTaskRunner implements TaskRunner {
    private tasks: TaskInvocationDefinition[] = [];

    getTasks() {
      return this.tasks;
    }

    run(task: TaskInvocationDefinition): Promise<void> {
      this.tasks.push(task);
      return Promise.resolve(undefined);
    }
  }

  const taskRunner = new PersistingTaskRunner();
  const scheduler = {
    createScheduledTaskRunner: (_: unknown) => taskRunner,
  } as unknown as PluginTaskScheduler;
  //  TODO : validate createScheduledTaskRunner parameters types.

  beforeAll(async () => {
    // const discovery = HostDiscovery.fromConfig(config);
    // const router = await createRouter({
    //   database: database,
    //   logger: getVoidLogger(),
    //   discovery: discovery,
    //   config: config,
    //   scheduler: scheduler,
    // });
    // app = express().use(router);
    const router = await createRouter({
      // config: new ConfigReader({}),
      config: config,
      logger: mockServices.logger.mock(),
      // database: createDatabase(),
      database: database,
      discovery: testDiscovery,
      urlReader: mockUrlReader,
      scheduler: scheduler,
      auth: mockServices.auth(),
      httpAuth: mockServices.httpAuth(),
    });
    app = express().use(router);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  const itTestGETApiEndpoint = (
    label: string,
    endpoint: string,
    status: object,
  ) => {
    it(`${label}`, async () => {
      const response = await request(app).get(endpoint);

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(status);
    });
  };

  describe('GET /health', () => {
    itTestGETApiEndpoint('returns ok', '/health', { status: 'ok' });
  });
});
