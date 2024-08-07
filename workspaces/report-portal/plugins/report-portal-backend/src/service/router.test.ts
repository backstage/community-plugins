import { getVoidLogger } from '@backstage/backend-common';
import { ConfigReader } from '@backstage/config';

import express from 'express';

import { createRouter } from './router';

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const router = await createRouter({
      logger: getVoidLogger(),
      config: new ConfigReader({ reportPortal: { integrations: [] } }),
    });
    app = express().use(router);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('just a test', () => {
    it('returns ok', async () => {
      expect(app).toBeDefined();
    });
  });
});
