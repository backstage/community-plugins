import { mockServices } from '@backstage/backend-test-utils';
import express from 'express';
import request from 'supertest';
import { BlackDuckConfig } from './BlackDuckConfig';

import { createRouter } from './router';
import { ConfigReader } from '@backstage/config';

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const config = new ConfigReader({
      blackduck: {
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
