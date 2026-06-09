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
});
