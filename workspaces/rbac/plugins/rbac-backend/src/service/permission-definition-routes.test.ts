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
  mockAuditorService,
  mockAuthService,
  mockedAuthorizeConditional,
  mockHttpAuth,
  mockLoggerService,
  mockPermissionEvaluator,
  permissionDependentPluginStoreMock,
  pluginMetadataCollectorMock,
} from '../../__fixtures__/mock-utils';
import { createPermissionDefinitionRoutes } from './permission-definition-routes';
import express from 'express';
import { PluginMetadataResponseSerializedRule } from './plugin-endpoints';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import {
  PluginPermissionMetaData,
  policyEntityReadPermission,
} from '@backstage-community/plugin-rbac-common';
import request from 'supertest';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { mockServices } from '@backstage/backend-test-utils';

jest.setTimeout(30000);

describe('REST plugin policies metadata API', () => {
  let app: express.Express;

  const config = mockServices.rootConfig();

  beforeEach(async () => {
    const router = await createPermissionDefinitionRoutes(
      pluginMetadataCollectorMock as any,
      permissionDependentPluginStoreMock,
      {
        auth: mockAuthService,
        httpAuth: mockHttpAuth,
        auditor: mockAuditorService,
        permissions: mockPermissionEvaluator,
      },
    );
    app = express().use(router);
    app.use(
      MiddlewareFactory.create({ logger: mockLoggerService, config }).error(),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list plugin permissions and condition rules', () => {
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
});
