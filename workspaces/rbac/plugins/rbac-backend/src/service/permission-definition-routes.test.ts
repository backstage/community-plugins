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
import {
  credentials,
  extendablePluginIdProviderMock,
  mockAuditorService,
  mockAuthService,
  mockedAuthorize,
  mockedAuthorizeConditional,
  mockHttpAuth,
  mockPermissionEvaluator,
  permissionDependentPluginStoreMock,
  pluginMetadataCollectorMock,
} from '../../__fixtures__/mock-utils';
import { registerPermissionDefinitionRoutes } from './permission-definition-routes';
import express from 'express';
import { PluginMetadataResponseSerializedRule } from './plugin-endpoints';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import {
  PluginPermissionMetaData,
  policyEntityCreatePermission,
  policyEntityDeletePermission,
  policyEntityReadPermission,
} from '@backstage-community/plugin-rbac-common';
import request from 'supertest';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { mockServices } from '@backstage/backend-test-utils';
import { ExtendablePluginIdProvider } from './extendable-id-provider';
import Router from 'express-promise-router';

describe('REST plugin policies metadata API', () => {
  let app: express.Express;

  beforeEach(async () => {
    const router = Router();

    router.use(express.json());

    registerPermissionDefinitionRoutes(
      router,
      pluginMetadataCollectorMock as any,
      extendablePluginIdProviderMock as ExtendablePluginIdProvider,
      permissionDependentPluginStoreMock,
      {
        auth: mockAuthService,
        httpAuth: mockHttpAuth,
        auditor: mockAuditorService,
        permissions: mockPermissionEvaluator,
      },
    );

    const middleware = MiddlewareFactory.create({
      logger: mockServices.logger.mock(),
      config: mockServices.rootConfig(),
    });
    router.use(middleware.error());

    app = express().use(router);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list plugin permissions and condition rules API', () => {
    it('should return list plugins permission', async () => {
      const pluginMetadata: PluginPermissionMetaData[] = [
        {
          pluginId: 'permissions',
          policies: [
            {
              name: 'catalog.entity.read',
              resourceType: 'policy-entity',
              policy: 'read',
            },
          ],
        },
      ];
      pluginMetadataCollectorMock.getPluginPolicies = jest
        .fn()
        .mockImplementation(async () => {
          return pluginMetadata;
        });
      const result = await request(app).get('/plugins/policies').send();
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual(pluginMetadata);
    });

    it('should return a status of Unauthorized for /plugins/policies', async () => {
      mockedAuthorizeConditional.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app).get('/plugins/policies').send();

      expect(mockedAuthorizeConditional).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityReadPermission,
          },
        ],
        {
          credentials: credentials,
        },
      );
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should return list plugins condition rules', async () => {
      const rules: PluginMetadataResponseSerializedRule[] = [
        {
          pluginId: 'catalog',
          rules: [
            {
              description: 'Allow entities with the specified label',
              name: 'HAS_LABEL',
              paramsSchema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                additionalProperties: false,
                properties: {
                  label: {
                    description: 'Name of the label to match on',
                    type: 'string',
                  },
                },
                required: ['label'],
                type: 'object',
              },
              resourceType: 'catalog-entity',
            },
          ],
        },
      ];
      pluginMetadataCollectorMock.getPluginConditionRules = jest
        .fn()
        .mockImplementation(async () => {
          return rules;
        });
      const result = await request(app).get('/plugins/condition-rules').send();
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual(rules);
    });

    it('should return a status of Unauthorized for /plugins/condition-rules', async () => {
      mockedAuthorizeConditional.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app).get('/plugins/condition-rules').send();

      expect(mockedAuthorizeConditional).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityReadPermission,
          },
        ],
        {
          credentials: credentials,
        },
      );
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });
  });

  describe('plugin ids API', () => {
    it('should return a status of Unauthorized for /plugins/id GET', async () => {
      mockedAuthorizeConditional.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app).get('/plugins/id').send();

      expect(mockedAuthorizeConditional).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityReadPermission,
          },
        ],
        {
          credentials: credentials,
        },
      );
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });
  });

  it('should return list plugin ids object /plugins/id GET', async () => {
    const result = await request(app).get('/plugins/id').send();

    expect(mockedAuthorizeConditional).toHaveBeenCalledWith(
      [
        {
          permission: policyEntityReadPermission,
        },
      ],
      {
        credentials: credentials,
      },
    );
    expect(result.statusCode).toBe(200);
    expect(result.body).toBeDefined();
    expect(result.body.ids).toContain('catalog');
  });

  it('should return a status of Unauthorized for /plugins/id POST', async () => {
    mockedAuthorize.mockImplementationOnce(async () => [
      { result: AuthorizeResult.DENY },
    ]);
    const result = await request(app)
      .post('/plugins/id')
      .send({ ids: ['catalog'] });

    expect(mockedAuthorize).toHaveBeenCalledWith(
      [
        {
          permission: policyEntityCreatePermission,
        },
      ],
      {
        credentials: credentials,
      },
    );
    expect(result.statusCode).toBe(403);
    expect(result.body.error).toEqual({
      name: 'NotAllowedError',
      message: '',
    });
  });

  it('should add more plugin ids with help of /plugins/id POST', async () => {
    mockedAuthorize.mockImplementationOnce(async () => [
      { result: AuthorizeResult.ALLOW },
    ]);
    (extendablePluginIdProviderMock.getPluginIds as jest.Mock)
      .mockResolvedValueOnce(['jenkins', 'catalog'])
      .mockResolvedValueOnce(['jenkins', 'catalog', 'scaffolder']);

    const result = await request(app)
      .post('/plugins/id')
      .send({ ids: ['scaffolder'] });

    expect(mockedAuthorize).toHaveBeenCalledWith(
      [
        {
          permission: policyEntityCreatePermission,
        },
      ],
      {
        credentials: credentials,
      },
    );
    expect(permissionDependentPluginStoreMock.addPlugins).toHaveBeenCalledWith([
      { pluginId: 'scaffolder' },
    ]);
    expect(result.statusCode).toBe(200);
    expect(result.body).toBeDefined();
    expect(result.body.ids).toContain('jenkins');
    expect(result.body.ids).toContain('catalog');
    expect(result.body.ids).toContain('scaffolder');
  });

  it('should fail to add more plugin ids, because of ConflictError', async () => {
    mockedAuthorize.mockImplementationOnce(async () => [
      { result: AuthorizeResult.ALLOW },
    ]);
    (
      extendablePluginIdProviderMock.getPluginIds as jest.Mock
    ).mockResolvedValueOnce(['jenkins', 'catalog', 'scaffolder']);

    const result = await request(app)
      .post('/plugins/id')
      .send({ ids: ['scaffolder'] });

    expect(mockedAuthorize).toHaveBeenCalledWith(
      [
        {
          permission: policyEntityCreatePermission,
        },
      ],
      {
        credentials: credentials,
      },
    );
    expect(
      permissionDependentPluginStoreMock.addPlugins,
    ).not.toHaveBeenCalledWith([{ pluginId: 'scaffolder' }]);
    expect(result.statusCode).toBe(409);
    expect(result.body).toEqual({
      error: {
        message:
          'Plugin IDs ["scaffolder"] already exist in the system. Please use a different set of plugin ids.',
        name: 'ConflictError',
      },
      request: {
        method: 'POST',
        url: '/plugins/id',
      },
      response: { statusCode: 409 },
    });
  });

  it('should return a status of Unauthorized for /plugins/id DELETE', async () => {
    mockedAuthorizeConditional.mockImplementationOnce(async () => [
      { result: AuthorizeResult.DENY },
    ]);
    const result = await request(app).delete('/plugins/id').send();

    expect(mockedAuthorizeConditional).toHaveBeenCalledWith(
      [
        {
          permission: policyEntityDeletePermission,
        },
      ],
      {
        credentials: credentials,
      },
    );
    expect(result.statusCode).toBe(403);
    expect(result.body.error).toEqual({
      name: 'NotAllowedError',
      message: '',
    });
  });

  it('should delete plugin id with help of /plugins/id DELETE', async () => {
    mockedAuthorizeConditional.mockImplementationOnce(async () => [
      { result: AuthorizeResult.ALLOW },
    ]);
    (extendablePluginIdProviderMock.getPluginIds as jest.Mock)
      .mockResolvedValueOnce(['jenkins', 'sonarqube', 'catalog'])
      .mockResolvedValueOnce(['jenkins', 'sonarqube']);

    const result = await request(app)
      .delete('/plugins/id')
      .send({ ids: ['catalog'] });

    expect(mockedAuthorizeConditional).toHaveBeenCalledWith(
      [
        {
          permission: policyEntityDeletePermission,
        },
      ],
      {
        credentials: credentials,
      },
    );
    expect(
      permissionDependentPluginStoreMock.deletePlugins,
    ).toHaveBeenCalledWith(['catalog']);
    expect(result.statusCode).toBe(200);
    expect(result.body).toBeDefined();
    expect(result.body.ids).toContain('jenkins');
    expect(result.body.ids).toContain('sonarqube');
    expect(result.body.ids).not.toContain('catalog');
  });

  it('should fail to delete plugin id with NotFoundError', async () => {
    mockedAuthorizeConditional.mockImplementationOnce(async () => [
      { result: AuthorizeResult.ALLOW },
    ]);
    const result = await request(app)
      .delete('/plugins/id')
      .send({ ids: ['jenkins'] });

    expect(mockedAuthorizeConditional).toHaveBeenCalledWith(
      [
        {
          permission: policyEntityDeletePermission,
        },
      ],
      {
        credentials: credentials,
      },
    );
    expect(
      permissionDependentPluginStoreMock.deletePlugins,
    ).not.toHaveBeenCalledWith(['jenkins']);
    expect(result.statusCode).toBe(404);
    expect(result.body).toEqual({
      error: {
        message: 'Plugin IDs ["jenkins"] were not found.',
        name: 'NotFoundError',
      },
      request: {
        method: 'DELETE',
        url: '/plugins/id',
      },
      response: { statusCode: 404 },
    });
  });

  it('should fail to deletion plugin id, because it was configured', async () => {
    mockedAuthorizeConditional.mockImplementationOnce(async () => [
      { result: AuthorizeResult.ALLOW },
    ]);
    (
      extendablePluginIdProviderMock.isConfiguredPluginId as jest.Mock
    ).mockReturnValueOnce(true);
    const result = await request(app)
      .delete('/plugins/id')
      .send({ ids: ['jenkins'] });

    expect(mockedAuthorizeConditional).toHaveBeenCalledWith(
      [
        {
          permission: policyEntityDeletePermission,
        },
      ],
      {
        credentials: credentials,
      },
    );
    expect(
      permissionDependentPluginStoreMock.deletePlugins,
    ).not.toHaveBeenCalledWith(['jenkins']);
    expect(result.statusCode).toBe(403);
    expect(result.body).toEqual({
      error: {
        message:
          'Plugin IDs ["jenkins"] can be removed only with help of configuration.',
        name: 'NotAllowedError',
      },
      request: {
        method: 'DELETE',
        url: '/plugins/id',
      },
      response: { statusCode: 403 },
    });
  });
});
