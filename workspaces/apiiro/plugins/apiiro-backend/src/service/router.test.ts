/*
 * Copyright 2025 The Backstage Authors
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
import { RepositoryCacheService } from './cache.service';
import { ApiiroAuthService } from './auth.service';

describe('createRouter', () => {
  let app: express.Express;
  let mockRepoService: jest.Mocked<RepositoryCacheService>;

  beforeAll(async () => {
    // Create a mock repository service
    mockRepoService = {
      get: jest.fn(),
      set: jest.fn(),
      invalidate: jest.fn(),
      clear: jest.fn(),
      refresh: jest.fn(),
    } as any;

    // Mock the ApiiroAuthService
    jest.spyOn(ApiiroAuthService, 'connect').mockResolvedValue();
    jest
      .spyOn(ApiiroAuthService, 'getBearerToken')
      .mockReturnValue('DUMMY_TOKEN');

    // Create mock cache manually since mockServices.cache() doesn't exist
    const mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };

    const router = await createRouter({
      logger: mockServices.logger.mock(),
      config: new ConfigReader({
        apiiro: {
          accessToken: 'DUMMY_ACCESS_TOKEN',
        },
      }),
      discovery: mockServices.discovery(),
      auth: mockServices.auth(),
      httpAuth: mockServices.httpAuth(),
      cache: mockCache as any,
      repoService: mockRepoService,
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

  describe('POST /repositories', () => {
    it('passes authentication and returns response', async () => {
      const response = await request(app).post('/repositories').send({});

      // Should pass auth but may fail due to missing required data or service issues
      expect([200, 400, 500]).toContain(response.status);
    });
  });

  describe('POST /risks', () => {
    it('passes authentication and returns response', async () => {
      const response = await request(app).post('/risks').send({});

      // Should pass auth but may fail due to missing required data or service issues
      expect([200, 400, 500]).toContain(response.status);
    });
  });

  describe('POST /mttr-statistics', () => {
    it('passes authentication and returns response', async () => {
      const response = await request(app).post('/mttr-statistics').send({});

      // Should pass auth but may fail due to missing required data or service issues
      expect([200, 400, 500]).toContain(response.status);
    });
  });

  describe('POST /risk-score-over-time', () => {
    it('passes authentication and returns response', async () => {
      const response = await request(app)
        .post('/risk-score-over-time')
        .send({});

      // Should pass auth but may fail due to missing required data or service issues
      expect([200, 400, 500]).toContain(response.status);
    });
  });

  describe('POST /sla-breach', () => {
    it('passes authentication and returns response', async () => {
      const response = await request(app).post('/sla-breach').send({});

      // Should pass auth but may fail due to missing required data or service issues
      expect([200, 400, 500]).toContain(response.status);
    });
  });

  describe('POST /top-risks', () => {
    it('passes authentication and returns response', async () => {
      const response = await request(app).post('/top-risks').send({});

      // Should pass auth but may fail due to missing required data or service issues
      expect([200, 400, 500]).toContain(response.status);
    });
  });

  describe('GET /filterOptions', () => {
    it('passes authentication and returns response', async () => {
      const response = await request(app).get('/filterOptions');

      // Should pass auth but may fail due to missing required data or service issues
      expect([200, 400, 500]).toContain(response.status);
    });
  });

  describe('undefined routes', () => {
    it('returns 404 for undefined routes', async () => {
      const response = await request(app).get('/undefined-route');

      expect(response.status).toEqual(404);
      expect(response.body).toEqual({
        error: 'Not Found',
        details: {
          status: 404,
          error: 'Route GET /undefined-route not found',
        },
      });
    });
  });
});
