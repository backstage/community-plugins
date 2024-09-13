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

  describe('PUT /create', () => {
    let newId: string;
    it('creates a new short URL', async () => {
      const response = await request(app)
        .put('/create')
        .send({ fullUrl: 'https://backstage.io', usageCount: 0 });

      expect(response.status).toEqual(201);
      expect(response.body).toEqual({ status: 'ok', id: expect.any(String) });
      newId = response.body.id;
    });

    it('returns existing short URL', async () => {
      const response = await request(app)
        .put('/create')
        .send({ fullUrl: 'https://backstage.io', usageCount: 0 });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok', id: newId });
    });

    it('returns 400 on invalid request', async () => {
      const response = await request(app).put('/create').send({});

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({ status: 'invalid request' });
    });
  });

  describe('GET /go/:id', () => {
    it('redirects to full URL', async () => {
      const mockUrl = 'https://backstage.io';
      const createUrlResponse = await request(app)
        .put('/create')
        .send({ fullUrl: mockUrl, usageCount: 0 });

      const response = await request(app).get(
        `/go/${createUrlResponse.body.id}`,
      );

      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(mockUrl);
    });

    it('returns 404 on missing short URL', async () => {
      const response = await request(app).get('/go/missing');

      expect(response.status).toEqual(404);
    });
  });

  describe('GET /getAll', () => {
    it('returns all short URLs', async () => {
      const { subject } = await createSubject('SQLITE_3');
      await subject.saveUrlMapping({
        shortId: 'abc123',
        fullUrl: 'https://backstage.io/getAll',
        usageCount: 0,
      });

      const response = await request(app).get('/getAll');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        status: 'ok',
        data: expect.any(Array),
      });
    });
  });
});
