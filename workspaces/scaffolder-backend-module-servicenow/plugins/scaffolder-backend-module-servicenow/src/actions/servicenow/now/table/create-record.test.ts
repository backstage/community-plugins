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
import { ConfigReader } from '@backstage/config';
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';

import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { createRecordAction } from '.';
import res401 from './__fixtures__/{tableName}/401.json';
import res404 from './__fixtures__/{tableName}/404.json';
import res201 from './__fixtures__/{tableName}/POST/201.json';

const LOCAL_ADDR = 'https://dev12345.service-now.com' as const;

const SERVICENOW_CONFIG = {
  baseUrl: LOCAL_ADDR,
  username: 'admin',
  password: 'password', // NOSONAR
} as const;

const handlers = [
  rest.post(`${LOCAL_ADDR}/api/now/table/:tableName`, (req, res, ctx) => {
    const { tableName } = req.params;

    // Check if the Authorization header is set
    if (
      req.headers.get('Authorization') !==
      `Basic ${btoa(
        `${SERVICENOW_CONFIG.username}:${SERVICENOW_CONFIG.password}`,
      )}`
    ) {
      return res(ctx.status(401), ctx.json(res401));
    }

    // Check if the table name is valid
    if (tableName !== 'incident') {
      return res(ctx.status(404), ctx.json(res404));
    }

    return res(ctx.status(201), ctx.json(res201));
  }),
];

const server = setupServer(...handlers);

describe('createRecord', () => {
  const action = createRecordAction({
    config: new ConfigReader({
      servicenow: SERVICENOW_CONFIG,
    }),
  });

  const mockContext = createMockActionContext();

  beforeAll(() => server.listen());

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    server.restoreHandlers();
  });

  afterAll(() => server.close());

  it('should create a record', async () => {
    const input = {
      tableName: 'incident',
    };

    const context = {
      ...mockContext,
      input,
    };

    await action.handler(context);

    expect(context.output).toHaveBeenLastCalledWith('result', res201.result);
  });

  it('should throw an error if the table does not exist', async () => {
    const input = {
      tableName: 'invalid-table',
    };

    const context = {
      ...mockContext,
      input,
    };

    await expect(action.handler(context)).rejects.toThrow(res404.error.message);
  });

  it('should throw an error if the user is not authenticated', async () => {
    const input = {
      tableName: 'incident',
    };

    const context = {
      ...mockContext,
      input,
    };

    await expect(
      createRecordAction({
        config: new ConfigReader({
          servicenow: { ...SERVICENOW_CONFIG, password: 'invalid-password' }, // NOSONAR
        }),
      }).handler(context),
    ).rejects.toThrow(res401.error.message);
  });
});
