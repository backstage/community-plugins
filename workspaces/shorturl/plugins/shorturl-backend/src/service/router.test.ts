import { TestDatabaseId, TestDatabases } from '@backstage/backend-test-utils';
import { mockServices } from '@backstage/backend-test-utils';
import express from 'express';
import request from 'supertest';

import { createRouter } from './router';
import { DatabaseHandler } from '../database/DatabaseHandler';

describe('createRouter', () => {
  let app: express.Express;
  const databases = TestDatabases.create({
    ids: ['SQLITE_3'],
  });

  // Just an example of how to conveniently bundle up the setup code
  async function createSubject(databaseId: TestDatabaseId) {
    const knex = await databases.init(databaseId);
    const knexWithGetClient = {
      ...knex,
      getClient: async () => knex,
    };
    const subject = await DatabaseHandler.create({
      database: knexWithGetClient,
    });
    return { knex, subject };
  }

  beforeAll(async () => {
    const { knex } = await createSubject('SQLITE_3');
    const router = await createRouter({
      logger: mockServices.logger.mock(),
      config: mockServices.rootConfig(),
      database: mockServices.database.mock({ getClient: async () => knex }),
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
