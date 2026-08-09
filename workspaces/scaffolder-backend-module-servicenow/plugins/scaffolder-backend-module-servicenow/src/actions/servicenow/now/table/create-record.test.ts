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
import { registerMswTestHooks } from '@backstage/backend-test-utils';
import { ConfigReader } from '@backstage/config';
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';

import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { createRecordAction } from '.';
import {
  ERROR_BODY_WITHOUT_MESSAGE,
  LOCAL_ADDR,
  SERVICENOW_CONFIG,
  basicAuthHeader,
  resetOpenAPIConfig,
} from './__testUtils__/msw';
import res401 from './__fixtures__/{tableName}/401.json';
import res404 from './__fixtures__/{tableName}/404.json';
import res201 from './__fixtures__/{tableName}/POST/201.json';

const handlers = [
  rest.post(`${LOCAL_ADDR}/api/now/table/:tableName`, (req, res, ctx) => {
    const { tableName } = req.params;

    if (req.headers.get('Authorization') !== basicAuthHeader()) {
      return res(ctx.status(401), ctx.json(res401));
    }

    if (tableName !== 'incident') {
      return res(ctx.status(404), ctx.json(res404));
    }

    return res(ctx.status(201), ctx.json(res201));
  }),
];

const server = setupServer(...handlers);
registerMswTestHooks(server);

describe('createRecord', () => {
  const action = createRecordAction({
    config: new ConfigReader({
      servicenow: SERVICENOW_CONFIG,
    }),
  });

  const mockContext = createMockActionContext();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    server.resetHandlers();
    resetOpenAPIConfig();
  });

  it('should create a record', async () => {
    const input = {
      tableName: 'incident',
    };

    const context = {
      ...mockContext,
      input,
    };

    await action.handler(context);

    expect(context.output).toHaveBeenLastCalledWith('result', res201?.result);
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
          servicenow: { ...SERVICENOW_CONFIG, password: 'invalid-password' },
        }),
      }).handler(context),
    ).rejects.toThrow(res401.error.message);
  });

  it('should throw a useful error when the API body lacks error.message', async () => {
    server.use(
      rest.post(`${LOCAL_ADDR}/api/now/table/:tableName`, (_req, res, ctx) =>
        res(
          ctx.status(400, 'Bad Request'),
          ctx.json(ERROR_BODY_WITHOUT_MESSAGE),
        ),
      ),
    );

    const context = {
      ...mockContext,
      input: { tableName: 'incident' },
    };

    await expect(action.handler(context)).rejects.toThrow('Bad Request');
  });
});
