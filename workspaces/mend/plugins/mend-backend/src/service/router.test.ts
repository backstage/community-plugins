import { mockServices } from '@backstage/backend-test-utils';
import { ConfigReader } from '@backstage/config';
import { PermissionEvaluator } from '@backstage/plugin-permission-common';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createRouter } from './router';

const mockedAuthorize: jest.MockedFunction<PermissionEvaluator['authorize']> =
  jest.fn();
const mockedPermissionQuery: jest.MockedFunction<
  PermissionEvaluator['authorizeConditional']
> = jest.fn();

const permissionEvaluator: PermissionEvaluator = {
  authorize: mockedAuthorize,
  authorizeConditional: mockedPermissionQuery,
};

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    jest.spyOn(jwt, 'decode').mockImplementation(() => ({
      integratorEmail: 'DUMMY_INTEGRATOR_EMAIL',
      userKey: 'DUMMY_USER_KEY',
      wsEnvUrl: 'https://ws.example.com',
    }));
    const router = await createRouter({
      logger: mockServices.logger.mock(),
      config: new ConfigReader({
        mend: {
          activationKey: 'DUMMY_ACTIVATION_KEY',
        },
      }),
      discovery: mockServices.discovery(),
      auth: mockServices.auth(),
      httpAuth: mockServices.httpAuth(),
      permissions: permissionEvaluator,
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
