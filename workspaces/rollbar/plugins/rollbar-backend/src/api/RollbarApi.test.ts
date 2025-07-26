/*
 * Copyright 2020 The Backstage Authors
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

import { getRequestHeaders, RollbarApi } from './RollbarApi';
import {
  mockServices,
  registerMswTestHooks,
} from '@backstage/backend-test-utils';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { RollbarProjectAccessToken } from './types';

describe('RollbarApi', () => {
  const server = setupServer();
  registerMswTestHooks(server);

  const mockBaseUrl = 'https://api.rollbar.com/api/1';

  const mockProjects = [
    { id: 123, name: 'abc', account_id: 1, status: 'enabled' },
    {
      id: 456,
      name: 'xyz',
      account_id: 1,
      status: 'enabled',
      extra_nested: { nested_value: [{ value_here: 'hello_world' }] },
    },
  ];

  describe('getRequestHeaders', () => {
    it('should generate headers based on token passed in constructor', () => {
      expect(getRequestHeaders('testtoken')).toEqual({
        headers: {
          'X-Rollbar-Access-Token': `testtoken`,
        },
      });
    });
  });

  describe('getAllProjects', () => {
    const setupHandlers = () => {
      server.use(
        rest.get(`${mockBaseUrl}/projects`, (_, res, ctx) => {
          return res(ctx.json({ result: mockProjects }));
        }),
      );
    };

    it('should return all projects with a name attribute', async () => {
      setupHandlers();
      const api = new RollbarApi(
        'my-access-token',
        mockServices.rootLogger(),
        mockServices.cache.mock(),
      );
      const projects = await api.getAllProjects();
      expect(projects).toEqual([
        { id: 123, name: 'abc', accountId: 1, status: 'enabled' },
        {
          id: 456,
          name: 'xyz',
          accountId: 1,
          status: 'enabled',
          extraNested: { nestedValue: [{ valueHere: 'hello_world' }] },
        },
      ]);
    });
  });

  describe('getProject', () => {
    const mockProject = mockProjects[0];

    const setupHandlers = () => {
      server.use(
        rest.get(`${mockBaseUrl}/projects`, (_, res, ctx) => {
          return res(ctx.json({ result: mockProjects }));
        }),
        rest.get(`${mockBaseUrl}/project/123`, (_, res, ctx) => {
          return res(ctx.json({ result: mockProject }));
        }),
        rest.get(`${mockBaseUrl}/project/123/access_tokens`, (_, res, ctx) => {
          return res(
            ctx.json({
              result: [
                {
                  projectId: 123,
                  name: 'project-token-expired',
                  scopes: ['read'],
                  accessToken: 'xyzzy',
                  status: 'expired',
                },
                {
                  projectId: 123,
                  name: 'project-token',
                  scopes: ['read'],
                  accessToken: 'plugh',
                  status: 'enabled',
                },
              ] satisfies RollbarProjectAccessToken[],
            }),
          );
        }),
      );
    };

    it('should use cached project map', async () => {
      setupHandlers();
      const cache = mockServices.cache.mock();
      cache.get.mockResolvedValue({
        [mockProject.name]: { ...mockProject, accessToken: 'bar' },
      });
      const api = new RollbarApi(
        'my-access-token',
        mockServices.rootLogger(),
        cache,
      );
      const project = await api.getProject(mockProject.name);
      expect(project.name).toEqual(mockProject.name);
    });

    it('should build and cache project map', async () => {
      setupHandlers();
      const cache = mockServices.cache.mock();
      const api = new RollbarApi(
        'my-access-token',
        mockServices.rootLogger(),
        cache,
      );
      const project = await api.getProject(mockProject.name);
      expect(project.name).toEqual(mockProject.name);
      expect(cache.get).toHaveBeenCalledWith('projectmap');
      expect(cache.set).toHaveBeenCalledWith(
        'projectmap',
        {
          abc: { id: 123, name: 'abc', accessToken: 'plugh' },
          xyz: { id: 456, name: 'xyz' },
        },
        { ttl: 300 },
      );
    });
  });
});
