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

import { retrieveRecordAction } from '.';
import resSysId404 from './__fixtures__/{tableName}/{sys_id}/404.json';
import res200 from './__fixtures__/{tableName}/{sys_id}/GET/200.json';
import res401 from './__fixtures__/{tableName}/401.json';
import resTable404 from './__fixtures__/{tableName}/404.json';

const LOCAL_ADDR = 'https://dev12345.service-now.com' as const;

const SERVICENOW_CONFIG = {
  baseUrl: LOCAL_ADDR,
  username: 'admin',
  password: 'password', // NOSONAR
} as const;

const handlers = [
  rest.get(
    `${LOCAL_ADDR}/api/now/table/:tableName/:sys_id`,
    (req, res, ctx) => {
      const { tableName, sys_id } = req.params;

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
        return res(ctx.status(404), ctx.json(resTable404));
      }

      // Check if the sys_id is valid
      if (sys_id !== 'valid-sys-id') {
        return res(ctx.status(404), ctx.json(resSysId404));
      }

      return res(ctx.status(200), ctx.json(res200));
    },
  ),
];

const server = setupServer(...handlers);

describe('retrieveRecord', () => {
  const action = retrieveRecordAction({
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

  it('should retrieve a record', async () => {
    const input = {
      tableName: 'incident',
      sysId: 'valid-sys-id',
    };

    const context = {
      ...mockContext,
      input,
    };

    await action.handler(context);

    expect(context.output).toHaveBeenLastCalledWith('result', res200?.result);
  });

  it('should throw an error if the table does not exist', async () => {
    const input = {
      tableName: 'invalid-table',
      sysId: 'valid-sys-id',
    };

    const context = {
      ...mockContext,
      input,
    };

    await expect(action.handler(context)).rejects.toThrow(
      resTable404.error.message,
    );
  });

  it('should throw an error if the sysId does not exist', async () => {
    const input = {
      tableName: 'incident',
      sysId: 'invalid-sys-id',
    };

    const context = {
      ...mockContext,
      input,
    };

    await expect(action.handler(context)).rejects.toThrow(
      resSysId404.error.message,
    );
  });

  it('should throw an error if the user is not authenticated', async () => {
    const input = {
      tableName: 'incident',
      sysId: 'valid-sys-id',
    };

    const context = {
      ...mockContext,
      input,
    };

    await expect(
      retrieveRecordAction({
        config: new ConfigReader({
          servicenow: { ...SERVICENOW_CONFIG, password: 'invalid-password' }, // NOSONAR
        }),
      }).handler(context),
    ).rejects.toThrow(res401.error.message);
  });
});
