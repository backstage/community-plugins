/*
 * Copyright 2026 The Backstage Authors
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

import {
  mockCredentials,
  mockServices,
  startTestBackend,
  type TestBackend,
} from '@backstage/backend-test-utils';
import permissionBackend from '@backstage/plugin-permission-backend';
import request from 'supertest';

import { rbacPlugin } from './plugin';

jest.setTimeout(120_000);

const TEST_CONFIG = {
  permission: {
    enabled: true,
    rbac: {
      admin: {
        users: [{ name: 'user:default/admin' }],
      },
    },
  },
  backend: {
    database: {
      client: 'better-sqlite3',
      connection: ':memory:',
    },
  },
};

describe('rbacPlugin', () => {
  let backend: TestBackend;

  beforeEach(async () => {
    backend = await startTestBackend({
      features: [
        permissionBackend,
        rbacPlugin,
        mockServices.rootConfig.factory({ data: TEST_CONFIG }),
        mockServices.httpAuth.factory({
          defaultCredentials: mockCredentials.service(),
        }),
      ],
    });
  });

  afterEach(async () => {
    await backend?.stop();
  });

  it('registers RBAC routes on the permission plugin', async () => {
    const response = await request(backend.server).get('/api/permission/roles');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
