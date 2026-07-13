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

import { ConfigReader } from '@backstage/config';
import express from 'express';
import request from 'supertest';
import { mockServices } from '@backstage/backend-test-utils';
import { NotAllowedError } from '@backstage/errors';
import { AkeylessBuilder } from './AkeylessBuilder';
import { AkeylessApi } from './akeylessApi';

describe('AkeylessBuilder', () => {
  const config = new ConfigReader({
    akeyless: {
      deploymentProfile: 'saas',
      gatewayUrl: 'https://api.akeyless.io',
      consoleUrl: 'https://console.akeyless.io',
      allowCrud: true,
      authentication: {
        method: 'accessKey',
        accessKey: {
          accessId: 'test-id',
          accessKey: 'test-key',
        },
      },
    },
  });

  const createMockApi = () => ({
    getConsoleUrl: () => 'https://console.akeyless.io',
    listSecrets: jest.fn().mockResolvedValue([]),
    getStaticSecretValue: jest.fn().mockResolvedValue('value'),
    createStaticSecret: jest.fn().mockResolvedValue(undefined),
    updateStaticSecretValue: jest.fn().mockResolvedValue(undefined),
    deleteItem: jest.fn().mockResolvedValue(undefined),
  });

  const createCrudApp = (mockApi: AkeylessApi) => {
    const builder = AkeylessBuilder.createBuilder({
      logger: mockServices.logger.mock(),
      config,
    });
    const { router } = builder.setAkeylessClient(mockApi).build();
    return express().use(router);
  };

  let app: express.Express;

  beforeAll(() => {
    const builder = AkeylessBuilder.createBuilder({
      logger: mockServices.logger.mock(),
      config,
    });

    const { router } = builder.build();
    app = express().use(router);
  });

  it('returns health status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ status: 'ok', allowCrud: true });
  });

  it('returns disabled health when config is missing', async () => {
    const builder = AkeylessBuilder.createBuilder({
      logger: mockServices.logger.mock(),
      config: new ConfigReader({}),
    });
    const { router } = builder.build();
    const disabledApp = express().use(router);

    const response = await request(disabledApp).get('/health');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      status: 'disabled',
      reason: 'missing config',
    });
  });

  it('rejects CRUD when disabled', async () => {
    const disabledBuilder = AkeylessBuilder.createBuilder({
      logger: mockServices.logger.mock(),
      config: new ConfigReader({
        akeyless: {
          gatewayUrl: 'https://api.akeyless.io',
          allowCrud: false,
          authentication: {
            method: 'accessKey',
            accessKey: {
              accessId: 'test-id',
              accessKey: 'test-key',
            },
          },
        },
      }),
    });
    const mockApi: AkeylessApi = {
      getConsoleUrl: () => 'https://console.akeyless.io',
      listSecrets: async () => [],
      getStaticSecretValue: async () => 'value',
      createStaticSecret: async () => undefined,
      updateStaticSecretValue: async () => undefined,
      deleteItem: async () => undefined,
    };
    const { router } = disabledBuilder.setAkeylessClient(mockApi).build();
    const disabledApp = express().use(router);

    const response = await request(disabledApp)
      .post('/v1/static-secrets')
      .send({
        name: 'demo',
        value: 'secret',
        contextPath: '/demo',
      });

    expect(response.status).toEqual(403);
    expect(response.body.error.name).toEqual(NotAllowedError.name);
  });

  it('rejects CRUD with root contextPath', async () => {
    const mockApi = createMockApi();
    const crudApp = createCrudApp(mockApi);

    const response = await request(crudApp).post('/v1/static-secrets').send({
      name: 'demo',
      value: 'secret',
      contextPath: '/',
    });

    expect(response.status).toEqual(400);
    expect(response.body.error.message).toContain('non-root path');
    expect(mockApi.createStaticSecret).not.toHaveBeenCalled();
  });

  it('returns allowCrud false when listing the root path', async () => {
    const mockApi = createMockApi();
    const crudApp = createCrudApp(mockApi);

    const response = await request(crudApp).get('/v1/secrets/%2F');

    expect(response.status).toEqual(200);
    expect(response.body.allowCrud).toEqual(false);
    expect(mockApi.listSecrets).toHaveBeenCalled();
  });

  describe('path scoping', () => {
    const contextPath = '/demo/app';

    it('rejects create outside contextPath', async () => {
      const mockApi = createMockApi();
      const crudApp = createCrudApp(mockApi);

      const response = await request(crudApp).post('/v1/static-secrets').send({
        name: '/other/secret',
        value: 'secret',
        contextPath,
      });

      expect(response.status).toEqual(403);
      expect(response.body.error.name).toEqual(NotAllowedError.name);
      expect(mockApi.createStaticSecret).not.toHaveBeenCalled();
    });

    it('rejects update outside contextPath', async () => {
      const mockApi = createMockApi();
      const crudApp = createCrudApp(mockApi);

      const response = await request(crudApp).put('/v1/static-secrets').send({
        name: '/other/secret',
        value: 'secret',
        contextPath,
      });

      expect(response.status).toEqual(403);
      expect(response.body.error.name).toEqual(NotAllowedError.name);
      expect(mockApi.updateStaticSecretValue).not.toHaveBeenCalled();
    });

    it('rejects delete outside contextPath', async () => {
      const mockApi = createMockApi();
      const crudApp = createCrudApp(mockApi);

      const response = await request(crudApp)
        .delete('/v1/static-secrets')
        .send({
          name: '/other/secret',
          contextPath,
        });

      expect(response.status).toEqual(403);
      expect(response.body.error.name).toEqual(NotAllowedError.name);
      expect(mockApi.deleteItem).not.toHaveBeenCalled();
    });

    it('rejects read outside contextPath', async () => {
      const mockApi = createMockApi();
      const crudApp = createCrudApp(mockApi);

      const response = await request(crudApp)
        .get('/v1/static-secrets/value')
        .query({
          name: '/other/secret',
          contextPath,
        });

      expect(response.status).toEqual(403);
      expect(response.body.error.name).toEqual(NotAllowedError.name);
      expect(mockApi.getStaticSecretValue).not.toHaveBeenCalled();
    });

    it('rejects traversal attempts outside contextPath', async () => {
      const mockApi = createMockApi();
      const crudApp = createCrudApp(mockApi);

      const response = await request(crudApp).post('/v1/static-secrets').send({
        name: '../outside',
        value: 'secret',
        contextPath: '/allowed',
      });

      expect(response.status).toEqual(403);
      expect(response.body.error.name).toEqual(NotAllowedError.name);
      expect(mockApi.createStaticSecret).not.toHaveBeenCalled();
    });

    it('returns normalized secret paths from create', async () => {
      const mockApi = createMockApi();
      const crudApp = createCrudApp(mockApi);

      const response = await request(crudApp).post('/v1/static-secrets').send({
        name: 'foo/../bar',
        value: 'secret',
        contextPath: '/demo',
      });

      expect(response.status).toEqual(201);
      expect(response.body.name).toEqual('/demo/bar');
      expect(mockApi.createStaticSecret).toHaveBeenCalledWith(
        '/demo/bar',
        'secret',
      );
    });
  });
});
