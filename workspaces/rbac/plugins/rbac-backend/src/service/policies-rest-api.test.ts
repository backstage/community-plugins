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
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { mockCredentials, mockServices } from '@backstage/backend-test-utils';
import { InputError } from '@backstage/errors';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import type { MetadataResponse } from '@backstage/plugin-permission-node';

import express from 'express';
import * as Knex from 'knex';
import { MockClient } from 'knex-mock-client';
import request from 'supertest';

import {
  PermissionAction,
  PermissionInfo,
  PluginPermissionMetaData,
  policyEntityCreatePermission,
  policyEntityDeletePermission,
  policyEntityReadPermission,
  policyEntityUpdatePermission,
  Role,
  RoleConditionalPolicyDecision,
  Source,
} from '@backstage-community/plugin-rbac-common';
import type { RBACProvider } from '@backstage-community/plugin-rbac-node';

import {
  RoleMetadataDao,
  RoleMetadataStorage,
} from '../database/role-metadata';
import { RBACPermissionPolicy } from '../policies/permission-policy';
import { EnforcerDelegate } from './enforcer-delegate';
import {
  PluginMetadataResponseSerializedRule,
  PluginPermissionMetadataCollector,
} from './plugin-endpoints';
import { PoliciesServer } from './policies-rest-api';
import { RBACRouterOptions } from './policy-builder';

jest.setTimeout(60000);

const pluginPermissionMetadataCollectorMock: Partial<PluginPermissionMetadataCollector> =
  {
    getPluginPolicies: jest.fn().mockImplementation(),
    getPluginConditionRules: jest.fn().mockImplementation(),
    getMetadataByPluginId: jest.fn().mockImplementation(),
  };

jest.mock('@backstage/plugin-auth-node', () => ({
  getBearerTokenFromAuthorizationHeader: () => 'token',
}));

const enforcerDelegateMock: Partial<EnforcerDelegate> = {
  hasPolicy: jest.fn().mockImplementation(),

  hasGroupingPolicy: jest.fn().mockImplementation(),

  getPolicy: jest.fn().mockImplementation((): Promise<string[][]> => {
    return Promise.resolve([[]]);
  }),

  getGroupingPolicy: jest.fn().mockImplementation((): Promise<string[][]> => {
    return Promise.resolve([[]]);
  }),

  getFilteredPolicy: jest.fn().mockImplementation(),
  getFilteredGroupingPolicy: jest.fn().mockImplementation(),

  addPolicy: jest.fn().mockImplementation(),

  addPolicies: jest.fn().mockImplementation(),

  addGroupingPolicies: jest.fn().mockImplementation(),

  removePolicy: jest.fn().mockImplementation(),

  removePolicies: jest.fn().mockImplementation(),

  removeGroupingPolicy: jest.fn().mockImplementation(),

  removeGroupingPolicies: jest.fn().mockImplementation(),

  updatePolicies: jest.fn().mockImplementation(),

  updateGroupingPolicies: jest.fn().mockImplementation(),
};

const roleMetadataStorageMock: RoleMetadataStorage = {
  filterRoleMetadata: jest.fn().mockImplementation(() => []),
  findRoleMetadata: jest.fn().mockImplementation(),
  createRoleMetadata: jest.fn().mockImplementation(),
  updateRoleMetadata: jest.fn().mockImplementation(),
  removeRoleMetadata: jest.fn().mockImplementation(),
};

const conditionalStorageMock = {
  filterConditions: jest.fn().mockImplementation(),
  createCondition: jest.fn().mockImplementation(),
  checkConflictedConditions: jest.fn().mockImplementation(),
  getCondition: jest.fn().mockImplementation(),
  deleteCondition: jest.fn().mockImplementation(),
  updateCondition: jest.fn().mockImplementation(),
};

const validateRoleConditionMock = jest.fn().mockImplementation();
jest.mock('../validation/condition-validation', () => {
  return {
    validateRoleCondition: jest
      .fn()
      .mockImplementation(
        (condition: RoleConditionalPolicyDecision<PermissionAction>) => {
          validateRoleConditionMock(condition);
        },
      ),
  };
});

const auditLoggerMock = {
  getActorId: jest.fn().mockImplementation(),
  createAuditLogDetails: jest.fn().mockImplementation(),
  auditLog: jest.fn().mockImplementation(() => Promise.resolve()),
};

const mockHttpAuth = mockServices.httpAuth({
  pluginId: 'permission',
  defaultCredentials: mockCredentials.user('user:default/guest'),
});
const mockAuthService = mockServices.auth();
const credentials = mockCredentials.user('user:default/guest');
const mockUserInfo = mockServices.userInfo();

const conditions: RoleConditionalPolicyDecision<PermissionInfo>[] = [
  {
    id: 1,
    pluginId: 'catalog',
    roleEntityRef: 'role:default/test',
    resourceType: 'catalog-entity',
    permissionMapping: [{ name: 'catalog.entity.read', action: 'read' }],
    result: AuthorizeResult.CONDITIONAL,
    conditions: {
      rule: 'IS_ENTITY_OWNER',
      resourceType: 'catalog-entity',
      params: { claims: ['group:default/team-a'] },
    },
  },
];

const expectedConditions: RoleConditionalPolicyDecision<PermissionAction>[] = [
  {
    id: 1,
    pluginId: 'catalog',
    roleEntityRef: 'role:default/test',
    resourceType: 'catalog-entity',
    permissionMapping: ['read'],
    result: AuthorizeResult.CONDITIONAL,
    conditions: {
      rule: 'IS_ENTITY_OWNER',
      resourceType: 'catalog-entity',
      params: { claims: ['group:default/team-a'] },
    },
  },
];

const providerMock: RBACProvider = {
  getProviderName: jest.fn().mockImplementation(() => `testProvider`),
  connect: jest.fn().mockImplementation(),
  refresh: jest.fn().mockImplementation(),
};

const modifiedBy = 'user:default/some-admin';

describe('REST policies api', () => {
  let app: express.Express;

  const mockedAuthorize = jest.fn().mockImplementation(async () => [
    {
      result: AuthorizeResult.ALLOW,
    },
  ]);

  const mockedAuthorizeConditional = jest.fn().mockImplementation(async () => [
    {
      result: AuthorizeResult.ALLOW,
    },
  ]);

  const mockPermissionEvaluator = {
    authorize: mockedAuthorize,
    authorizeConditional: mockedAuthorizeConditional,
  };

  const logger = mockServices.logger.mock();
  const mockDiscovery = mockServices.discovery.mock();

  const knex = Knex.knex({ client: MockClient });

  let config = mockServices.rootConfig({
    data: {
      backend: {
        database: {
          client: 'better-sqlite3',
          connection: ':memory:',
        },
      },
      permission: {
        enabled: true,
      },
    },
  });

  let server: PoliciesServer;

  beforeEach(async () => {
    conditionalStorageMock.filterConditions = jest
      .fn()
      .mockImplementation(async () => {
        return conditions;
      });

    enforcerDelegateMock.hasPolicy = jest
      .fn()
      .mockImplementation(async (..._param: string[]): Promise<boolean> => {
        return false;
      });
    enforcerDelegateMock.hasGroupingPolicy = jest
      .fn()
      .mockImplementation(async (..._param: string[]): Promise<boolean> => {
        return false;
      });
    enforcerDelegateMock.getFilteredPolicy = jest
      .fn()
      .mockImplementation(
        async (_fieldIndex: number, ..._fieldValues: string[]) => {
          return [
            [
              'user:default/permission_admin',
              'policy-entity',
              'create',
              'allow',
            ],
          ];
        },
      );
    enforcerDelegateMock.getFilteredGroupingPolicy = jest
      .fn()
      .mockImplementation(
        async (_fieldIndex: number, ..._fieldValues: string[]) => {
          return [['user:default/permission_admin', 'role:default/rbac_admin']];
        },
      );
    enforcerDelegateMock.removeGroupingPolicies = jest
      .fn()
      .mockImplementation(async (..._param: string[]): Promise<boolean> => {
        return true;
      });
    enforcerDelegateMock.addGroupingPolicies = jest.fn().mockImplementation();

    roleMetadataStorageMock.findRoleMetadata = jest
      .fn()
      .mockImplementation(
        async (roleEntityRef: string): Promise<RoleMetadataDao> => {
          return {
            source: 'rest',
            roleEntityRef: roleEntityRef,
            modifiedBy: 'user:default/some-user',
          };
        },
      );

    mockHttpAuth.credentials = jest.fn().mockImplementation(() => credentials);

    const options: RBACRouterOptions = {
      config: config,
      logger,
      discovery: mockDiscovery,
      httpAuth: mockHttpAuth,
      auth: mockAuthService,
      policy: await RBACPermissionPolicy.build(
        logger,
        auditLoggerMock,
        config,
        conditionalStorageMock,
        enforcerDelegateMock as EnforcerDelegate,
        roleMetadataStorageMock,
        knex,
        pluginPermissionMetadataCollectorMock as PluginPermissionMetadataCollector,
        mockAuthService,
      ),
      userInfo: mockUserInfo,
    };

    server = new PoliciesServer(
      mockPermissionEvaluator,
      options,
      enforcerDelegateMock as EnforcerDelegate,
      conditionalStorageMock,
      pluginPermissionMetadataCollectorMock as PluginPermissionMetadataCollector,
      roleMetadataStorageMock,
      auditLoggerMock,
    );
    const router = await server.serve();
    app = express().use(router);
    app.use(MiddlewareFactory.create({ logger, config }).error());
    conditionalStorageMock.getCondition.mockReset();
    validateRoleConditionMock.mockReset();
    auditLoggerMock.auditLog.mockClear();
    jest.clearAllMocks();
  });

  it('should build', () => {
    expect(app).toBeTruthy();
  });

  describe('GET /', () => {
    it('should return a status of Authorized', async () => {
      const result = await request(app).get('/').send();

      expect(result.status).toBe(200);
      expect(result.body).toEqual({ status: 'Authorized' });
    });

    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app).get('/').send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityReadPermission,
            resourceRef: 'policy-entity',
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

  describe('POST /policies', () => {
    afterEach(() => {
      (enforcerDelegateMock.addPolicies as jest.Mock).mockReset();
    });

    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app).post('/policies').send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityCreatePermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials,
        },
      );
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should return a status of Unauthorized - non user request', async () => {
      mockHttpAuth.credentials = jest
        .fn()
        .mockImplementationOnce(() => mockCredentials.service());
      const result = await request(app).post('/policies').send();

      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: `Only creadential principal with type 'user' permitted to modify permissions`,
      });
    });

    it('should not be created permission policy - req body is an empty', async () => {
      const result = await request(app).post('/policies').send();

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `permission policy must be present`,
      });
    });

    it('should not be created permission policy - entityReference is empty', async () => {
      const result = await request(app).post('/policies').send([{}]);

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid policy definition. Cause: 'entityReference' must not be empty`,
      });
    });

    it('should not be created permission policy - entityReference is invalid', async () => {
      const result = await request(app)
        .post('/policies')
        .send([{ entityReference: 'user' }]);

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid policy definition. Cause: Entity reference "user" had missing or empty kind (e.g. did not start with "component:" or similar)`,
      });
    });

    it('should not be created permission policy - permission is an empty', async () => {
      const result = await request(app)
        .post('/policies')
        .send([
          {
            entityReference: 'user:default/permission_admin',
          },
        ]);

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid policy definition. Cause: 'permission' field must not be empty`,
      });
    });

    it('should not be created permission policy - policy is an empty', async () => {
      const result = await request(app)
        .post('/policies')
        .send([
          {
            entityReference: 'user:default/permission_admin',
            permission: 'policy-entity',
          },
        ]);

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid policy definition. Cause: 'policy' field must not be empty`,
      });
    });

    it('should not be created permission policy - effect is an empty', async () => {
      const result = await request(app)
        .post('/policies')
        .send([
          {
            entityReference: 'user:default/permission_admin',
            permission: 'policy-entity',
            policy: 'read',
          },
        ]);

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid policy definition. Cause: 'effect' field must not be empty`,
      });
    });

    it('should be created permission policy', async () => {
      const result = await request(app)
        .post('/policies')
        .send([
          {
            entityReference: 'user:default/permission_admin',
            permission: 'policy-entity',
            policy: 'delete',
            effect: 'deny',
          },
        ]);

      expect(result.statusCode).toBe(201);
    });

    it('should fail to create permission policy, because of source mismatch', async () => {
      const roleMeta: RoleMetadataDao = {
        roleEntityRef: 'user:default/permission_admin',
        source: 'csv-file',
        modifiedBy,
      };

      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(
          async (roleEntityRef: string): Promise<RoleMetadataDao> => {
            if (roleEntityRef === roleMeta.roleEntityRef) {
              return roleMeta;
            }
            return { source: 'rest', roleEntityRef: roleEntityRef, modifiedBy };
          },
        );

      const result = await request(app)
        .post('/policies')
        .send([
          {
            entityReference: 'user:default/permission_admin',
            permission: 'policy-entity',
            policy: 'delete',
            effect: 'deny',
          },
        ]);

      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: `Unable to add policy user:default/permission_admin,policy-entity,delete,deny: source does not match originating role ${
          roleMeta.roleEntityRef
        }, consider making changes to the '${roleMeta.source.toLocaleUpperCase()}'`,
      });
    });

    it('should fail to add permission policy, with original source of configuration', async () => {
      const roleMeta: RoleMetadataDao = {
        roleEntityRef: 'user:default/permission_admin',
        source: 'configuration',
        modifiedBy,
      };

      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(
          async (roleEntityRef: string): Promise<RoleMetadataDao> => {
            if (roleEntityRef === roleMeta.roleEntityRef) {
              return roleMeta;
            }
            return { source: 'rest', roleEntityRef: roleEntityRef, modifiedBy };
          },
        );

      const result = await request(app)
        .post('/policies')
        .send([
          {
            entityReference: 'user:default/permission_admin',
            permission: 'policy-entity',
            policy: 'delete',
            effect: 'deny',
          },
        ]);

      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: `Unable to add policy user:default/permission_admin,policy-entity,delete,deny: source does not match originating role ${
          roleMeta.roleEntityRef
        }, consider making changes to the '${roleMeta.source.toLocaleUpperCase()}'`,
      });
    });

    it('should not be created permission policy, because it is has been already present', async () => {
      enforcerDelegateMock.hasPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param.at(2) === 'read') {
            return Promise.resolve(true);
          }
          return Promise.resolve(false);
        });

      const result = await request(app)
        .post('/policies')
        .send([
          {
            entityReference: 'user:default/permission_admin',
            permission: 'policy-entity',
            policy: 'read',
            effect: 'deny',
          },
          {
            entityReference: 'user:default/permission_admin',
            permission: 'policy-entity',
            policy: 'delete',
            effect: 'deny',
          },
        ]);

      expect(result.statusCode).toBe(409);
    });

    it('should not be created permission policy caused some unexpected error', async () => {
      enforcerDelegateMock.addPolicies = jest
        .fn()
        .mockImplementation(async (): Promise<void> => {
          throw new Error(`Failed to add policies`);
        });

      const result = await request(app)
        .post('/policies')
        .send([
          {
            entityReference: 'user:default/permission_admin',
            permission: 'policy-entity',
            policy: 'delete',
            effect: 'deny',
          },
        ]);

      expect(result.statusCode).toBe(500);
    });

    it('should fail to create permission policy - duplication in req body', async () => {
      const result = await request(app)
        .post('/policies')
        .send([
          {
            entityReference: 'user:default/permission_admin',
            permission: 'policy-entity',
            policy: 'delete',
            effect: 'deny',
          },
          {
            entityReference: 'user:default/permission_admin',
            permission: 'policy-entity',
            policy: 'delete',
            effect: 'deny',
          },
        ]);

      expect(result.statusCode).toBe(409);
      expect(result.body.error).toEqual({
        name: 'ConflictError',
        message: `Duplicate polices found; user:default/permission_admin, policy-entity, delete, deny is a duplicate`,
      });
    });
  });

  describe('GET /policies/:kind/:namespace/:name', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app)
        .get('/policies/user/default/permission_admin')
        .send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityReadPermission,
            resourceRef: 'policy-entity',
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

    it('should be returned permission policies by user reference', async () => {
      enforcerDelegateMock.getFilteredPolicy = jest
        .fn()
        .mockImplementation(
          async (_fieldIndex: number, ..._fieldValues: string[]) => {
            return [
              [
                'user:default/permission_admin',
                'policy-entity',
                'create',
                'allow',
              ],
            ];
          },
        );
      const result = await request(app)
        .get('/policies/user/default/permission_admin')
        .send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual([
        {
          entityReference: 'user:default/permission_admin',
          permission: 'policy-entity',
          policy: 'create',
          effect: 'allow',
          metadata: {
            source: 'rest',
          },
        },
      ]);
    });
    it('should be returned policies by user reference not found', async () => {
      enforcerDelegateMock.getFilteredPolicy = jest
        .fn()
        .mockImplementation(
          async (_fieldIndex: number, ..._fieldValues: string[]) => {
            return [];
          },
        );

      const result = await request(app)
        .get('/policies/user/default/permission_admin')
        .send();
      expect(result.statusCode).toBe(404);
      expect(result.body).toEqual({
        error: { message: '', name: 'NotFoundError' },
        request: {
          method: 'GET',
          url: '/policies/user/default/permission_admin',
        },
        response: { statusCode: 404 },
      });
    });
  });

  describe('GET /policies', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app).get('/policies').send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityReadPermission,
            resourceRef: 'policy-entity',
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

    it('should be returned list all policies', async () => {
      enforcerDelegateMock.getPolicy = jest
        .fn()
        .mockImplementation(async () => {
          return [
            [
              'user:default/permission_admin',
              'policy-entity',
              'create',
              'allow',
              'rest',
            ],
            ['user:default/guest', 'policy-entity', 'read', 'allow', 'rest'],
          ];
        });
      const result = await request(app).get('/policies').send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual([
        {
          entityReference: 'user:default/permission_admin',
          permission: 'policy-entity',
          policy: 'create',
          effect: 'allow',
          metadata: {
            source: 'rest',
          },
        },
        {
          entityReference: 'user:default/guest',
          permission: 'policy-entity',
          policy: 'read',
          effect: 'allow',
          metadata: {
            source: 'rest',
          },
        },
      ]);
    });
    it('should be returned list filtered policies', async () => {
      enforcerDelegateMock.getFilteredPolicy = jest
        .fn()
        .mockImplementation(
          async (_fieldIndex: number, ..._fieldValues: string[]) => {
            return [
              ['user:default/guest', 'policy-entity', 'read', 'allow', 'rest'],
            ];
          },
        );
      const result = await request(app)
        .get(
          '/policies?entityRef=user:default/guest&permission=policy-entity&policy=read&effect=allow',
        )
        .send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual([
        {
          entityReference: 'user:default/guest',
          permission: 'policy-entity',
          policy: 'read',
          effect: 'allow',
          metadata: {
            source: 'rest',
          },
        },
      ]);
    });
  });

  describe('DELETE /policies/:kind/:namespace/:name', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app)
        .delete('/policies/user/default/permission_admin')
        .send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityDeletePermission,
            resourceRef: 'policy-entity',
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

    it('should fail to delete, request is empty', async () => {
      const result = await request(app)
        .delete('/policies/user/default/permission_admin')
        .send();

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `permission policy must be present`,
      });
    });

    it('should fail to delete, because permission field is absent', async () => {
      const result = await request(app)
        .delete('/policies/user/default/permission_admin')
        .send([{}]);

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid policy definition. Cause: 'permission' field must not be empty`,
      });
    });

    it('should fail to delete, because policy field is absent', async () => {
      const result = await request(app)
        .delete('/policies/user/default/permission_admin')
        .send([
          {
            permission: 'policy-entity',
          },
        ]);

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid policy definition. Cause: 'policy' field must not be empty`,
      });
    });

    it('should fail to delete, because effect field is absent', async () => {
      const result = await request(app)
        .delete('/policies/user/default/permission_admin')
        .send([
          {
            permission: 'policy-entity',
            policy: 'read',
          },
        ]);

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid policy definition. Cause: 'effect' field must not be empty`,
      });
    });

    it('should fail to delete, because policy not found', async () => {
      enforcerDelegateMock.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return false;
        });

      const result = await request(app)
        .delete('/policies/user/default/permission_admin')
        .send([
          {
            permission: 'policy-entity',
            policy: 'read',
            effect: 'allow',
          },
        ]);

      expect(result.statusCode).toEqual(404);
      expect(result.body.error).toEqual({
        name: 'NotFoundError',
        message: `Policy '[user:default/permission_admin, policy-entity, read, allow]' not found`,
      });
    });

    it('should fail to delete, because unexpected error', async () => {
      enforcerDelegateMock.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      enforcerDelegateMock.removePolicies = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<void> => {
          throw new Error('Fail to delete policy');
        });

      const result = await request(app)
        .delete('/policies/user/default/permission_admin')
        .send([
          {
            permission: 'policy-entity',
            policy: 'read',
            effect: 'allow',
          },
        ]);

      expect(result.statusCode).toEqual(500);
      expect(result.body.error).toEqual({
        name: 'Error',
        message: 'Fail to delete policy',
      });
    });

    it('should fail to delete, because source mismatch', async () => {
      const roleMeta: RoleMetadataDao = {
        roleEntityRef: 'user:default/permission_admin',
        source: 'csv-file',
        modifiedBy,
      };

      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(
          async (roleEntityRef: string): Promise<RoleMetadataDao> => {
            if (roleEntityRef === roleMeta.roleEntityRef) {
              return roleMeta;
            }
            return { source: 'rest', roleEntityRef: roleEntityRef, modifiedBy };
          },
        );

      const result = await request(app)
        .delete('/policies/user/default/permission_admin')
        .send([
          {
            permission: 'policy-entity',
            policy: 'read',
            effect: 'allow',
          },
        ]);

      const policy = [
        'user:default/permission_admin',
        'policy-entity',
        'read',
        'allow',
      ];

      expect(result.statusCode).toEqual(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: `Unable to delete policy ${policy}: source does not match originating role ${
          roleMeta.roleEntityRef
        }, consider making changes to the '${roleMeta.source.toLocaleUpperCase()}'`,
      });
    });

    it('should fail to delete policy, with original source of configuration', async () => {
      const roleMeta: RoleMetadataDao = {
        roleEntityRef: 'user:default/permission_admin',
        source: 'configuration',
        modifiedBy,
      };

      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(
          async (roleEntityRef: string): Promise<RoleMetadataDao> => {
            if (roleEntityRef === roleMeta.roleEntityRef) {
              return roleMeta;
            }
            return { source: 'rest', roleEntityRef: roleEntityRef, modifiedBy };
          },
        );

      enforcerDelegateMock.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      enforcerDelegateMock.removePolicies = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });

      const result = await request(app)
        .delete('/policies/user/default/permission_admin')
        .send([
          {
            permission: 'policy-entity',
            policy: 'read',
            effect: 'allow',
          },
        ]);

      const policy = [
        'user:default/permission_admin',
        'policy-entity',
        'read',
        'allow',
      ];

      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: `Unable to delete policy ${policy}: source does not match originating role ${
          roleMeta.roleEntityRef
        }, consider making changes to the '${roleMeta.source.toLocaleUpperCase()}'`,
      });
    });

    it('should delete policy', async () => {
      enforcerDelegateMock.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      enforcerDelegateMock.removePolicies = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });

      const result = await request(app)
        .delete(
          '/policies/user/default/permission_admin?permission=policy-entity&policy=read&effect=allow',
        )
        .send([
          {
            permission: 'policy-entity',
            policy: 'read',
            effect: 'allow',
          },
        ]);

      expect(result.statusCode).toEqual(204);
    });
  });

  describe('PUT /policies/:kind/:namespace/:name', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityUpdatePermission,
            resourceRef: 'policy-entity',
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

    it('should fail to update policy - old policy is absent', async () => {
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send([{}]);

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `'oldPolicy' object must be present`,
      });
    });

    it('should fail to update policy - new policy is absent', async () => {
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({ oldPolicy: [{}] });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `'newPolicy' object must be present`,
      });
    });

    it('should fail to update policy - oldPolicy permission is absent', async () => {
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({ oldPolicy: [{}], newPolicy: [{}] });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid old policy definition. Cause: 'permission' field must not be empty`,
      });
    });

    it('should fail to update policy - oldPolicy policy is absent', async () => {
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [{ permission: 'policy-entity' }],
          newPolicy: [{}],
        });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid old policy definition. Cause: 'policy' field must not be empty`,
      });
    });

    it('should fail to update policy - oldPolicy effect is absent', async () => {
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [{ permission: 'policy-entity', policy: 'read' }],
          newPolicy: [{}],
        });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid old policy definition. Cause: 'effect' field must not be empty`,
      });
    });

    it('should fail to update policy - newPolicy permission is absent', async () => {
      enforcerDelegateMock.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [{}],
        });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid new policy definition. Cause: 'permission' field must not be empty`,
      });
    });

    it('should fail to update policy - newPolicy policy is absent', async () => {
      enforcerDelegateMock.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [{ permission: 'policy-entity' }],
        });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid new policy definition. Cause: 'policy' field must not be empty`,
      });
    });

    it('should fail to update policy - newPolicy effect is absent', async () => {
      enforcerDelegateMock.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [{ permission: 'policy-entity', policy: 'create' }],
        });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid new policy definition. Cause: 'effect' field must not be empty`,
      });
    });

    it('should fail to update policy - newPolicy effect has invalid value', async () => {
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'unknown',
            },
          ],
          newPolicy: [{ permission: 'policy-entity', policy: 'create' }],
        });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid old policy definition. Cause: 'effect' has invalid value: 'unknown'. It should be: '${AuthorizeResult.ALLOW.toLocaleLowerCase()}' or '${AuthorizeResult.DENY.toLocaleLowerCase()}'`,
      });
    });

    it('should fail to update policy - old policy not found', async () => {
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'create',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toEqual(404);
      expect(result.body.error).toEqual({
        name: 'NotFoundError',
        message: `Policy '[user:default/permission_admin, policy-entity, read, allow]' not found`,
      });
    });

    it('should fail to update policy - old policy not found but old and new policies match', async () => {
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toEqual(404);
      expect(result.body.error).toEqual({
        name: 'NotFoundError',
        message: `Policy '[user:default/permission_admin, policy-entity, read, allow]' not found`,
      });
    });

    it('should fail to update policy - newPolicy is already present', async () => {
      enforcerDelegateMock.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'create',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toEqual(409);
      expect(result.body.error).toEqual({
        name: 'ConflictError',
        message: `Policy '[user:default/permission_admin, policy-entity, create, allow]' has been already stored`,
      });
    });

    it('should nothing to update', async () => {
      enforcerDelegateMock.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toEqual(204);
    });

    it('should nothing to update - same permissions with different policy in a different order', async () => {
      enforcerDelegateMock.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
            {
              permission: 'policy-entity',
              policy: 'delete',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'delete',
              effect: 'allow',
            },
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toEqual(204);
    });

    it('should nothing to update - same permissions with different permission type in a different order', async () => {
      enforcerDelegateMock.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
            {
              permission: 'catalog-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'catalog-entity',
              policy: 'read',
              effect: 'allow',
            },
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toEqual(204);
    });

    it('should fail to update policy - unable to remove oldPolicy', async () => {
      enforcerDelegateMock.hasPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[2] === 'create') {
            return false;
          }
          return true;
        });
      enforcerDelegateMock.updatePolicies = jest
        .fn()
        .mockImplementation(async (): Promise<void> => {
          throw new Error('Fail to remove policy');
        });

      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'create',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toEqual(500);
      expect(result.body.error).toEqual({
        name: 'Error',
        message: 'Fail to remove policy',
      });
    });

    it('should fail to update policy - unable to add newPolicy', async () => {
      enforcerDelegateMock.hasPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[2] === 'create') {
            return false;
          }
          return true;
        });
      enforcerDelegateMock.updatePolicies = jest
        .fn()
        .mockImplementation(
          async (_param: string[][], _source: Source): Promise<void> => {
            throw new Error('Fail to add policy');
          },
        );

      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'create',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toEqual(500);
      expect(result.body.error).toEqual({
        name: 'Error',
        message: 'Fail to add policy',
      });
    });

    it('should update policy', async () => {
      enforcerDelegateMock.hasPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[2] === 'create') {
            return false;
          }
          return true;
        });
      enforcerDelegateMock.updatePolicies = jest.fn().mockImplementation();

      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'create',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toEqual(200);
    });

    it('should fail to update permission policy - duplication in old policy', async () => {
      enforcerDelegateMock.hasPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[2] === 'create') {
            return false;
          }
          return true;
        });

      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'create',
              effect: 'allow',
            },
            {
              permission: 'policy-entity',
              policy: 'create',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toBe(409);
      expect(result.body.error).toEqual({
        name: 'ConflictError',
        message: `Duplicate polices found; user:default/permission_admin, policy-entity, read, allow is a duplicate`,
      });
    });

    it('should fail to update permission policy - duplication in new policy', async () => {
      enforcerDelegateMock.hasPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[2] === 'update') {
            return false;
          }
          return true;
        });

      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
            {
              permission: 'policy-entity',
              policy: 'create',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'update',
              effect: 'allow',
            },
            {
              permission: 'policy-entity',
              policy: 'update',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toBe(409);
      expect(result.body.error).toEqual({
        name: 'ConflictError',
        message: `Duplicate polices found; user:default/permission_admin, policy-entity, update, allow is a duplicate`,
      });
    });

    it('should fail to update permission policy - oldPolicy has an additional permission', async () => {
      enforcerDelegateMock.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
            {
              permission: 'policy-entity',
              policy: 'create',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'delete',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `'oldPolicy' object has more permission policies compared to 'newPolicy' object`,
      });
    });

    it('should fail to update permission policy, because of source mismatch', async () => {
      const roleMeta: RoleMetadataDao = {
        roleEntityRef: 'user:default/permission_admin',
        source: 'csv-file',
        modifiedBy,
      };

      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(
          async (roleEntityRef: string): Promise<RoleMetadataDao> => {
            if (roleEntityRef === roleMeta.roleEntityRef) {
              return roleMeta;
            }
            return { source: 'rest', roleEntityRef: roleEntityRef, modifiedBy };
          },
        );

      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
            {
              permission: 'policy-entity',
              policy: 'create',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'delete',
              effect: 'allow',
            },
          ],
        });

      const policy = [
        'user:default/permission_admin',
        'policy-entity',
        'read',
        'allow',
      ];

      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: `Unable to edit policy ${policy}: source does not match originating role ${
          roleMeta.roleEntityRef
        }, consider making changes to the '${roleMeta.source.toLocaleUpperCase()}'`,
      });
    });

    it('should fail to update permission policy, with original source of configuration', async () => {
      const roleMeta: RoleMetadataDao = {
        roleEntityRef: 'user:default/permission_admin',
        source: 'configuration',
        modifiedBy,
      };

      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(
          async (roleEntityRef: string): Promise<RoleMetadataDao> => {
            if (roleEntityRef === roleMeta.roleEntityRef) {
              return roleMeta;
            }
            return { source: 'rest', roleEntityRef: roleEntityRef, modifiedBy };
          },
        );

      enforcerDelegateMock.hasPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[2] === 'delete') {
            return false;
          }
          return true;
        });
      enforcerDelegateMock.updatePolicies = jest.fn().mockImplementation();

      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'delete',
              effect: 'allow',
            },
          ],
        });

      const policy = [
        'user:default/permission_admin',
        'policy-entity',
        'read',
        'allow',
      ];

      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: `Unable to edit policy ${policy}: source does not match originating role ${
          roleMeta.roleEntityRef
        }, consider making changes to the '${roleMeta.source.toLocaleUpperCase()}'`,
      });
    });
  });

  describe('GET /roles', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app).get('/roles').send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityReadPermission,
            resourceRef: 'policy-entity',
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

    it('should be returned list all roles', async () => {
      enforcerDelegateMock.getGroupingPolicy = jest
        .fn()
        .mockImplementation(async () => {
          return [
            ['group:default/test', 'role:default/test'],
            ['group:default/team_a', 'role:default/team_a'],
          ];
        });
      const result = await request(app).get('/roles').send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual([
        {
          memberReferences: ['group:default/test'],
          name: 'role:default/test',
          metadata: {
            source: 'rest',
            modifiedBy: 'user:default/some-user',
          },
        },
        {
          memberReferences: ['group:default/team_a'],
          name: 'role:default/team_a',
          metadata: {
            source: 'rest',
            modifiedBy: 'user:default/some-user',
          },
        },
      ]);
    });
  });

  describe('GET /roles/:kind/:namespace/:name', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app)
        .get('/roles/role/default/rbac_admin')
        .send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityReadPermission,
            resourceRef: 'policy-entity',
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

    it('should return an input error when kind is wrong', async () => {
      const result = await request(app)
        .get('/roles/test/default/rbac_admin')
        .send();
      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Unsupported kind test. Supported value should be "role"`,
      });
    });

    it('should be returned role by role reference', async () => {
      const result = await request(app)
        .get('/roles/role/default/rbac_admin')
        .send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual([
        {
          memberReferences: ['user:default/permission_admin'],
          name: 'role:default/rbac_admin',
          metadata: {
            source: 'rest',
            modifiedBy: 'user:default/some-user',
          },
        },
      ]);
    });

    it('should be returned not found error by role reference', async () => {
      enforcerDelegateMock.getFilteredGroupingPolicy = jest
        .fn()
        .mockImplementation(
          async (_fieldIndex: number, ..._fieldValues: string[]) => {
            return [];
          },
        );

      const result = await request(app)
        .get('/roles/role/default/rbac_admin')
        .send();
      expect(result.statusCode).toBe(404);
      expect(result.body).toEqual({
        error: { message: '', name: 'NotFoundError' },
        request: {
          method: 'GET',
          url: '/roles/role/default/rbac_admin',
        },
        response: { statusCode: 404 },
      });
    });
  });

  describe('POST /roles', () => {
    beforeEach(() => {
      mockedAuthorize.mockImplementation(async () => [
        { result: AuthorizeResult.ALLOW },
      ]);
    });
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app).post('/roles').send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityCreatePermission,
            resourceRef: 'policy-entity',
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

    it('should not be created role - req body is an empty', async () => {
      const result = await request(app).post('/roles').send();

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid role definition. Cause: 'name' field must not be empty`,
      });
    });

    it('should not be created role - memberReferences is missing', async () => {
      const result = await request(app).post('/roles').send({
        name: 'role:default/test',
      });

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid role definition. Cause: 'memberReferences' field must not be empty`,
      });
    });

    it('should not be created role - memberReferences is empty', async () => {
      const result = await request(app).post('/roles').send({
        memberReferences: [],
        name: 'role:default/test',
      });

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid role definition. Cause: 'memberReferences' field must not be empty`,
      });
    });

    it('should not be created role - memberReferences is invalid', async () => {
      const result = await request(app)
        .post('/roles')
        .send({
          memberReferences: ['user'],
          name: 'role:default/test',
        });

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid role definition. Cause: Entity reference "user" had missing or empty kind (e.g. did not start with "component:" or similar)`,
      });
    });

    it('should not be created role - name is empty', async () => {
      const result = await request(app)
        .post('/roles')
        .send({
          memberReferences: ['user:default/permission_admin'],
        });

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid role definition. Cause: 'name' field must not be empty`,
      });
    });

    it('should not create a role - name is invalid', async () => {
      const result = await request(app)
        .post('/roles')
        .send({
          memberReferences: ['user:default/permission_admin'],
          name: 'x:default/rbac_admin',
        });

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid role definition. Cause: Unsupported kind x. Supported value should be "role"`,
      });
    });

    it('should be created role', async () => {
      const result = await request(app)
        .post('/roles')
        .send({
          memberReferences: ['user:default/permission_admin'],
          name: 'role:default/rbac_admin',
        });

      expect(result.statusCode).toBe(201);
      expect(enforcerDelegateMock.addGroupingPolicies).toHaveBeenCalledWith(
        [['user:default/permission_admin', 'role:default/rbac_admin']],
        {
          author: 'user:default/guest',
          roleEntityRef: 'role:default/rbac_admin',
          source: 'rest',
          description: '',
          modifiedBy: 'user:default/guest',
        },
      );
    });

    it('should be created role with description', async () => {
      const result = await request(app)
        .post('/roles')
        .send({
          memberReferences: ['user:default/permission_admin'],
          name: 'role:default/rbac_admin',
          metadata: {
            description: 'some test description',
          },
        });

      expect(result.statusCode).toBe(201);
      expect(enforcerDelegateMock.addGroupingPolicies).toHaveBeenCalledWith(
        [['user:default/permission_admin', 'role:default/rbac_admin']],
        {
          roleEntityRef: 'role:default/rbac_admin',
          source: 'rest',
          author: 'user:default/guest',
          description: 'some test description',
          modifiedBy: 'user:default/guest',
        },
      );
    });

    it('should not be created role, because it is has been already present', async () => {
      enforcerDelegateMock.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });

      const result = await request(app)
        .post('/roles')
        .send({
          memberReferences: ['user:default/permission_admin'],
          name: 'role:default/rbac_admin',
        });

      expect(result.statusCode).toBe(409);
    });

    it('should not be created role caused some unexpected error', async () => {
      enforcerDelegateMock.addGroupingPolicies = jest
        .fn()
        .mockImplementation(async (): Promise<void> => {
          throw new Error('Fail to create new policy');
        });

      const result = await request(app)
        .post('/roles')
        .send({
          memberReferences: ['user:default/permission_admin'],
          name: 'role:default/rbac_admin',
        });

      expect(result.statusCode).toBe(500);
      expect(result.body.error).toEqual({
        name: 'Error',
        message: 'Fail to create new policy',
      });
    });

    it('should fail to create role - duplicate', async () => {
      const result = await request(app)
        .post('/roles')
        .send({
          memberReferences: [
            'user:default/permission_admin',
            'user:default/permission_admin',
          ],
          name: 'role:default/rbac_admin',
        });

      expect(result.statusCode).toBe(409);
      expect(result.body.error).toEqual({
        name: 'ConflictError',
        message: `Duplicate role members found; user:default/permission_admin, role:default/rbac_admin is a duplicate`,
      });
    });

    it('should fail to add role, because source mismatch', async () => {
      const roleMeta: RoleMetadataDao = {
        roleEntityRef: 'role:default/rbac_admin',
        source: 'configuration',
        modifiedBy,
      };

      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(
          async (roleEntityRef: string): Promise<RoleMetadataDao> => {
            if (roleEntityRef === roleMeta.roleEntityRef) {
              return roleMeta;
            }
            return { source: 'rest', roleEntityRef: roleEntityRef, modifiedBy };
          },
        );

      const result = await request(app)
        .post('/roles')
        .send({
          memberReferences: ['user:default/permission_admin'],
          name: 'role:default/rbac_admin',
        });

      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: `Unable to add role: source does not match originating role ${
          roleMeta.roleEntityRef
        }, consider making changes to the '${roleMeta.source.toLocaleUpperCase()}'`,
      });
    });
  });

  describe('PUT /roles/:kind/:namespace/:name', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityUpdatePermission,
            resourceRef: 'policy-entity',
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

    it('should fail to update role - old role is absent', async () => {
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send();

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `'oldRole' object must be present`,
      });
    });

    it('should fail to update role - new role is absent', async () => {
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({ oldRole: {} });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `'newRole' object must be present`,
      });
    });

    it('should fail to update role - oldRole entity is absent', async () => {
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({ oldRole: {}, newRole: {} });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid old role object. Cause: 'memberReferences' field must not be empty`,
      });
    });

    it('should fail to update role - newRole entity is absent', async () => {
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: { memberReferences: ['user:default/permission_admin'] },
          newRole: {},
        });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid new role object. Cause: 'name' field must not be empty`,
      });
    });

    it('should fail to update role - old role not found', async () => {
      enforcerDelegateMock.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._policy: string[]): Promise<boolean> => {
          return false;
        });
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test'],
            name: 'role:default/rbac_admin',
          },
        });

      expect(result.statusCode).toEqual(404);
      expect(result.body.error).toEqual({
        name: 'NotFoundError',
        message:
          'Member reference: user:default/permission_admin was not found for role role:default/rbac_admin',
      });
    });

    it('should fail to update role - newRole is already present', async () => {
      enforcerDelegateMock.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test'],
            name: 'role:default/rbac_admin',
          },
        });

      expect(result.statusCode).toEqual(409);
      expect(result.body.error).toEqual({
        name: 'ConflictError',
        message: '',
      });
    });

    it('should nothing to update', async () => {
      enforcerDelegateMock.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/permission_admin'],
            name: 'role:default/rbac_admin',
          },
        });

      expect(result.statusCode).toEqual(204);
    });

    it('should nothing to update, because role and metadata are the same', async () => {
      enforcerDelegateMock.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
            metadata: {
              source: 'rest',
            },
          },
          newRole: {
            memberReferences: ['user:default/permission_admin'],
            name: 'role:default/rbac_admin',
            metadata: {
              source: 'rest',
            },
          },
        });

      expect(result.statusCode).toEqual(204);
    });

    it('should nothing to update, because role and metadata are the same, but old role metadata was not send', async () => {
      enforcerDelegateMock.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/permission_admin'],
            name: 'role:default/rbac_admin',
            metadata: {
              source: 'rest',
            },
          },
        });

      expect(result.statusCode).toEqual(204);
    });

    it('should update description and set author', async () => {
      enforcerDelegateMock.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/permission_admin'],
            name: 'role:default/rbac_admin',
            metadata: {
              source: 'rest',
              description: 'some admin role.',
            },
          },
        });

      expect(result.statusCode).toEqual(200);
      expect(enforcerDelegateMock.updateGroupingPolicies).toHaveBeenCalledWith(
        [['user:default/permission_admin', 'role:default/rbac_admin']],
        [['user:default/permission_admin', 'role:default/rbac_admin']],
        {
          description: 'some admin role.',
          modifiedBy: 'user:default/guest',
          roleEntityRef: 'role:default/rbac_admin',
          source: 'rest',
        },
      );
    });

    it('should update role and role description', async () => {
      enforcerDelegateMock.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[0] === 'user:default/permission_admin') {
            return true;
          }
          return false;
        });

      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test', 'user:default/dev'],
            name: 'role:default/rbac_admin',
            metadata: {
              source: 'rest',
              description: 'some admin role.',
            },
          },
        });

      expect(result.statusCode).toEqual(200);

      expect(enforcerDelegateMock.updateGroupingPolicies).toHaveBeenCalledWith(
        [['user:default/permission_admin', 'role:default/rbac_admin']],
        [
          ['user:default/test', 'role:default/rbac_admin'],
          ['user:default/dev', 'role:default/rbac_admin'],
        ],
        {
          description: 'some admin role.',
          modifiedBy: 'user:default/guest',
          roleEntityRef: 'role:default/rbac_admin',
          source: 'rest',
        },
      );
    });

    it('should fail to update policy - role metadata could not be found', async () => {
      enforcerDelegateMock.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[0] === 'user:default/test') {
            return false;
          }
          return true;
        });
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(async (): Promise<undefined> => {
          return undefined;
        });
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test'],
            name: 'role:default/rbac_admin',
          },
        });

      expect(result.statusCode).toEqual(404);
      expect(result.body.error).toEqual({
        name: 'NotFoundError',
        message: `Unable to find metadata for role:default/rbac_admin`,
      });
    });

    it('should fail to update role - unable to remove oldRole', async () => {
      enforcerDelegateMock.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[0] === 'user:default/test') {
            return false;
          }
          return true;
        });
      enforcerDelegateMock.updateGroupingPolicies = jest
        .fn()
        .mockImplementation(async (): Promise<void> => {
          throw new Error('Unexpected error');
        });

      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test'],
            name: 'role:default/rbac_admin',
          },
        });

      expect(result.statusCode).toEqual(500);
      expect(result.body.error).toEqual({
        name: 'Error',
        message: 'Unexpected error',
      });
    });

    it('should fail to update role - unable to add newRole', async () => {
      enforcerDelegateMock.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[0] === 'user:default/test') {
            return false;
          }
          return true;
        });
      enforcerDelegateMock.updateGroupingPolicies = jest
        .fn()
        .mockImplementation(
          async (_param: string[][], _source: Source): Promise<void> => {
            throw new Error('Unexpected error');
          },
        );

      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test'],
            name: 'role:default/rbac_admin',
          },
        });

      expect(result.statusCode).toEqual(500);
      expect(result.body.error).toEqual({
        name: 'Error',
        message: 'Unexpected error',
      });
    });

    it('should update role', async () => {
      enforcerDelegateMock.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[0] === 'user:default/test') {
            return false;
          }
          return true;
        });
      enforcerDelegateMock.updateGroupingPolicies = jest
        .fn()
        .mockImplementation();

      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test'],
            name: 'role:default/rbac_admin',
          },
        });

      expect(result.statusCode).toEqual(200);
    });

    it('should update role where newRole has multiple roles', async () => {
      enforcerDelegateMock.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (
            param[0] === 'user:default/test' ||
            param[0] === 'user:default/test2'
          ) {
            return false;
          }
          return true;
        });
      enforcerDelegateMock.updateGroupingPolicies = jest
        .fn()
        .mockImplementation();

      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test', 'user:default/test2'],
            name: 'role:default/rbac_admin',
          },
        });

      expect(result.statusCode).toEqual(200);
    });

    it('should update role where newRole has multiple roles with one being from oldRole', async () => {
      enforcerDelegateMock.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[0] === 'user:default/test') {
            return false;
          }
          return true;
        });
      enforcerDelegateMock.updateGroupingPolicies = jest
        .fn()
        .mockImplementation();

      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: [
              'user:default/permission_admin',
              'user:default/test',
            ],
            name: 'role:default/rbac_admin',
          },
        });

      expect(result.statusCode).toEqual(200);
    });

    it('should update role name', async () => {
      enforcerDelegateMock.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[0] === 'user:default/test') {
            return false;
          }
          return true;
        });
      enforcerDelegateMock.updateGroupingPolicies = jest
        .fn()
        .mockImplementation();

      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test'],
            name: 'role:default/test',
          },
        });

      expect(result.statusCode).toEqual(200);
    });

    it('should fail to update role - duplicate roles in oldRole', async () => {
      enforcerDelegateMock.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[0] === 'user:default/test') {
            return false;
          }
          return true;
        });

      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: [
              'user:default/permission_admin',
              'user:default/permission_admin',
            ],
          },
          newRole: {
            memberReferences: ['user:default/test'],
            name: 'role:default/rbac_admin',
          },
        });

      expect(result.statusCode).toBe(409);
      expect(result.body.error).toEqual({
        name: 'ConflictError',
        message: `Duplicate role members found; user:default/permission_admin, role:default/rbac_admin is a duplicate`,
      });
    });

    it('should fail to update role - duplicate roles in newRole', async () => {
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test', 'user:default/test'],
            name: 'role:default/rbac_admin',
          },
        });

      expect(result.statusCode).toBe(409);
      expect(result.body.error).toEqual({
        name: 'ConflictError',
        message: `Duplicate role members found; user:default/test, role:default/rbac_admin is a duplicate`,
      });
    });

    it('should fail to update role name when role name is invalid', async () => {
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test'],
            name: 'role:default/',
          },
        });

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid new role object. Cause: Entity reference "role:default/" was not on the form [<kind>:][<namespace>/]<name>`,
      });
    });

    it('should fail to update - oldRole name is invalid', async () => {
      const result = await request(app)
        .put('/roles/x/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test'],
            name: 'role:default/',
          },
        });

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Unsupported kind x. Supported value should be "role"`,
      });
    });

    it('should fail to update role, because source mismatch', async () => {
      const roleMeta: RoleMetadataDao = {
        roleEntityRef: 'role:default/rbac_admin',
        source: 'configuration',
        modifiedBy,
      };

      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(
          async (roleEntityRef: string): Promise<RoleMetadataDao> => {
            if (roleEntityRef === roleMeta.roleEntityRef) {
              return roleMeta;
            }
            return { source: 'rest', roleEntityRef: roleEntityRef, modifiedBy };
          },
        );

      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test'],
            name: 'role:default/rbac_admin',
          },
        });

      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: `Unable to edit role: source does not match originating role ${
          roleMeta.roleEntityRef
        }, consider making changes to the '${roleMeta.source.toLocaleUpperCase()}'`,
      });
    });
  });

  describe('DELETE /roles/:kind/:namespace/:name', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app)
        .delete('/roles/role/default/rbac_admin')
        .send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityDeletePermission,
            resourceRef: 'policy-entity',
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

    it('should fail to delete, because unexpected error', async () => {
      enforcerDelegateMock.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      enforcerDelegateMock.removeGroupingPolicies = jest
        .fn()
        .mockImplementation(
          async (_param: string[][], _source: Source): Promise<void> => {
            throw new Error('Unexpected error');
          },
        );
      enforcerDelegateMock.getFilteredGroupingPolicy = jest
        .fn()
        .mockImplementation(
          async (_index: number, ..._filter: string[]): Promise<string[]> => {
            return ['group:default/test', 'role/default/rbac_admin', 'rest'];
          },
        );

      const result = await request(app)
        .delete(
          '/roles/role/default/rbac_admin?memberReferences=group:default/test',
        )
        .send();

      expect(result.statusCode).toEqual(500);
      expect(result.body.error).toEqual({
        name: 'Error',
        message: 'Unexpected error',
      });
    });

    it('should fail to delete, because not found error', async () => {
      enforcerDelegateMock.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return false;
        });
      enforcerDelegateMock.getFilteredGroupingPolicy = jest
        .fn()
        .mockImplementation(
          async (_index: number, ..._filter: string[]): Promise<string[]> => {
            return [];
          },
        );

      const result = await request(app)
        .delete(
          '/roles/role/default/rbac_admin?memberReferences=group:default/test',
        )
        .send();

      expect(result.statusCode).toEqual(404);
      expect(result.body.error).toEqual({
        name: 'NotFoundError',
        message: `role member 'group:default/test' was not found`,
      });
    });

    it('should delete a user / group from a role', async () => {
      enforcerDelegateMock.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      enforcerDelegateMock.removeGroupingPolicies = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      enforcerDelegateMock.getFilteredGroupingPolicy = jest
        .fn()
        .mockImplementation(
          async (_index: number, ..._filter: string[]): Promise<string[]> => {
            return ['group:default/test', 'role/default/rbac_admin', 'rest'];
          },
        );

      const result = await request(app)
        .delete(
          '/roles/role/default/rbac_admin?memberReferences=group:default/test',
        )
        .send();

      expect(result.statusCode).toEqual(204);
    });

    it('should delete a role', async () => {
      enforcerDelegateMock.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      enforcerDelegateMock.removeGroupingPolicies = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });

      const result = await request(app)
        .delete('/roles/role/default/rbac_admin')
        .send();

      expect(result.statusCode).toEqual(204);
    });

    it('should fail to delete role, because source mismatch', async () => {
      const roleMeta: RoleMetadataDao = {
        roleEntityRef: 'role:default/rbac_admin',
        source: 'configuration',
        modifiedBy,
      };

      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(
          async (roleEntityRef: string): Promise<RoleMetadataDao> => {
            if (roleEntityRef === roleMeta.roleEntityRef) {
              return roleMeta;
            }
            return { source: 'rest', roleEntityRef: roleEntityRef, modifiedBy };
          },
        );
      enforcerDelegateMock.getFilteredGroupingPolicy = jest
        .fn()
        .mockImplementation(
          async (_index: number, ..._filter: string[]): Promise<string[]> => {
            return ['group:default/test', 'role/default/rbac_admin', 'rest'];
          },
        );
      enforcerDelegateMock.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });

      const result = await request(app)
        .delete('/roles/role/default/rbac_admin')
        .send();

      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: `Unable to delete role: source does not match originating role ${
          roleMeta.roleEntityRef
        }, consider making changes to the '${roleMeta.source.toLocaleUpperCase()}'`,
      });
    });
  });

  describe('GetFirstQuery', () => {
    it('should return an empty string for undefined query value', () => {
      const result = server.getFirstQuery(undefined);
      expect(result).toBe('');
    });

    it('should return the first string value from a string array', async () => {
      const queryValue = ['value1', 'value2'];
      const result = server.getFirstQuery(queryValue);
      expect(result).toBe('value1');
    });

    it('should throw an InputError for an array of ParsedQs', () => {
      const queryValue = [{ key: 'value' }, { key: 'value2' }];
      expect(() => server.getFirstQuery(queryValue)).toThrow(InputError);
    });

    it('should return the string value when query value is a string', () => {
      const queryValue = 'singleValue';
      const result = server.getFirstQuery(queryValue);
      expect(result).toBe('singleValue');
    });

    it('should throw an InputError for ParsedQs', () => {
      const queryValue = { key: 'value' };
      expect(() => server.getFirstQuery(queryValue)).toThrow(InputError);
    });
  });

  describe('transformRoleArray', () => {
    it('should combine two roles together that are similar', async () => {
      const roles = [
        ['group:default/test', 'role:default/test'],
        ['user:default/test', 'role:default/test'],
      ];

      const expectedResult: Role[] = [
        {
          memberReferences: ['group:default/test', 'user:default/test'],
          name: 'role:default/test',
          metadata: {
            author: undefined,
            createdAt: undefined,
            description: undefined,
            lastModified: undefined,
            modifiedBy: 'user:default/some-user',
            source: 'rest',
          },
        },
      ];

      const transformedRoles = await server.transformRoleArray(...roles);
      expect(transformedRoles).toStrictEqual(expectedResult);
    });
  });

  // Define a test suite for the GET /conditions endpoint
  describe('GET /roles/conditions', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);

      // Perform the GET request to the endpoint
      const result = await request(app).get('/roles/conditions').send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityReadPermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials: credentials,
        },
      );

      // Assert the response status code and error message
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should be returned list all condition decisions', async () => {
      const result = await request(app).get('/roles/conditions').send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual(expectedConditions);
      expect(mockHttpAuth.credentials).toHaveBeenCalledTimes(1);
    });

    it('should be returned condition decision by pluginId', async () => {
      conditionalStorageMock.filterConditions = jest
        .fn()
        .mockImplementation(
          async (
            _roleEntityRef: string,
            pluginId: string,
            _resourceType: string,
          ) => {
            if (pluginId === 'catalog') {
              return conditions;
            }
            return [];
          },
        );
      const result = await request(app)
        .get('/roles/conditions?pluginId=catalog')
        .send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual(expectedConditions);
    });

    it('should be returned empty condition decision list by pluginId', async () => {
      conditionalStorageMock.filterConditions = jest
        .fn()
        .mockImplementation(
          async (
            _roleEntityRef: string,
            pluginId: string,
            _resourceType: string,
          ) => {
            if (pluginId === 'catalog') {
              return conditions;
            }
            return [];
          },
        );
      const result = await request(app)
        .get('/roles/conditions?pluginId=scaffolder')
        .send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual([]);
    });

    it('should be returned condition decision by resourceType', async () => {
      conditionalStorageMock.filterConditions = jest
        .fn()
        .mockImplementation(
          async (
            _roleEntityRef: string,
            _pluginId: string,
            resourceType: string,
          ) => {
            if (resourceType === 'catalog-entity') {
              return conditions;
            }
            return [];
          },
        );
      const result = await request(app)
        .get('/roles/conditions?resourceType=catalog-entity')
        .send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual(expectedConditions);
    });
  });

  describe('DELETE /roles/conditions/:id', () => {
    beforeEach(() => {
      conditionalStorageMock.getCondition = jest
        .fn()
        .mockImplementation(async () => {
          return expectedConditions[0];
        });
    });
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);

      const result = await request(app).delete('/roles/conditions/1').send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityDeletePermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials: credentials,
        },
      );

      // Assert the response status code and error message
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should delete condition decision by id', async () => {
      const result = await request(app).delete('/roles/conditions/1').send();

      expect(result.statusCode).toEqual(204);
      expect(mockHttpAuth.credentials).toHaveBeenCalledTimes(1);
      expect(conditionalStorageMock.deleteCondition).toHaveBeenCalled();
    });

    it('should fail to delete condition decision by id', async () => {
      conditionalStorageMock.deleteCondition = jest.fn(() => {
        throw new Error('Failed to delete condition decision by id');
      });

      const result = await request(app).delete('/roles/conditions/1').send();

      expect(result.statusCode).toEqual(500);
      expect(result.body.error.message).toEqual(
        'Failed to delete condition decision by id',
      );
    });

    it('should return return 400', async () => {
      const result = await request(app)
        .delete('/roles/conditions/non-number')
        .send();
      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        message: 'Id is not a valid number.',
        name: 'InputError',
      });
    });
  });

  describe('GET /roles/condition/:id', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);

      const result = await request(app).get('/roles/conditions/1').send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityReadPermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials: credentials,
        },
      );

      // Assert the response status code and error message
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should return condition decision by id', async () => {
      conditionalStorageMock.getCondition = jest
        .fn()
        .mockImplementation(async (id: number) => {
          if (id === 1) {
            return conditions[0];
          }
          return undefined;
        });

      const result = await request(app).get('/roles/conditions/1').send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual(expectedConditions[0]);
      expect(mockHttpAuth.credentials).toHaveBeenCalledTimes(1);
    });

    it('should return return 404', async () => {
      const result = await request(app).get('/roles/conditions/1').send();
      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual({
        message: '',
        name: 'NotFoundError',
      });
    });

    it('should return return 400', async () => {
      const result = await request(app)
        .get('/roles/conditions/non-number')
        .send();
      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        message: 'Id is not a valid number.',
        name: 'InputError',
      });
    });
  });

  describe('POST /roles/conditions', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);

      const result = await request(app).post('/roles/conditions').send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityCreatePermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials: credentials,
        },
      );

      // Assert the response status code and error message
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should be created condition', async () => {
      conditionalStorageMock.createCondition = jest
        .fn()
        .mockImplementation(() => {
          return 1;
        });
      pluginPermissionMetadataCollectorMock.getMetadataByPluginId = jest
        .fn()
        .mockImplementation(() => {
          const response: MetadataResponse = {
            permissions: [
              {
                name: 'catalog.entity.read',
                attributes: {
                  action: 'read',
                },
                type: 'resource',
                resourceType: 'catalog-entity',
              },
            ],
            rules: [],
          };
          return response;
        });

      const roleCondition: RoleConditionalPolicyDecision<PermissionAction> = {
        id: 1,
        pluginId: 'catalog',
        roleEntityRef: 'role:default/test',
        resourceType: 'catalog-entity',
        permissionMapping: ['read'],
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: { claims: ['group:default/team-a'] },
        },
      };
      const result = await request(app)
        .post('/roles/conditions')
        .send(roleCondition);

      expect(result.statusCode).toBe(201);
      expect(validateRoleConditionMock).toHaveBeenCalledWith(roleCondition);
      expect(result.body).toEqual({ id: 1 });
      expect(mockHttpAuth.credentials).toHaveBeenCalledTimes(1);
    });
  });

  describe('PUT /roles/conditions', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);

      const result = await request(app).put('/roles/conditions/1').send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityUpdatePermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials: credentials,
        },
      );

      // Assert the response status code and error message
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should return return 400', async () => {
      const result = await request(app)
        .put('/roles/conditions/non-number')
        .send();
      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        message: 'Id is not a valid number.',
        name: 'InputError',
      });
    });

    it('should update condition decision', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.ALLOW },
      ]);
      const conditionDecision: RoleConditionalPolicyDecision<PermissionAction> =
        {
          id: 1,
          pluginId: 'catalog',
          roleEntityRef: 'role:default/test',
          resourceType: 'catalog-entity',
          permissionMapping: ['read'],
          result: AuthorizeResult.CONDITIONAL,
          conditions: {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: { claims: ['group:default/team-a'] },
          },
        };
      const result = await request(app)
        .put('/roles/conditions/1')
        .send(conditionDecision);

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityUpdatePermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials: credentials,
        },
      );
      expect(validateRoleConditionMock).toHaveBeenCalledWith(conditionDecision);

      expect(result.statusCode).toBe(200);
      expect(conditionalStorageMock.updateCondition).toHaveBeenCalledWith(1, {
        id: 1,
        pluginId: 'catalog',
        roleEntityRef: 'role:default/test',
        resourceType: 'catalog-entity',
        permissionMapping: [
          {
            action: 'read',
            name: 'catalog.entity.read',
          },
        ],
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: { claims: ['group:default/team-a'] },
        },
      });
      expect(mockHttpAuth.credentials).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /refresh/:id', () => {
    let appWithProvider: express.Express;

    beforeEach(async () => {
      mockedAuthorize.mockImplementation(async () => [
        { result: AuthorizeResult.ALLOW },
      ]);

      const options: RBACRouterOptions = {
        config: config,
        logger,
        discovery: mockDiscovery,
        httpAuth: mockHttpAuth,
        auth: mockAuthService,
        policy: await RBACPermissionPolicy.build(
          logger,
          auditLoggerMock,
          config,
          conditionalStorageMock,
          enforcerDelegateMock as EnforcerDelegate,
          roleMetadataStorageMock,
          knex,
          pluginPermissionMetadataCollectorMock as PluginPermissionMetadataCollector,
          mockAuthService,
        ),
        userInfo: mockUserInfo,
      };

      server = new PoliciesServer(
        mockPermissionEvaluator,
        options,
        enforcerDelegateMock as EnforcerDelegate,
        conditionalStorageMock,
        pluginPermissionMetadataCollectorMock as PluginPermissionMetadataCollector,
        roleMetadataStorageMock,
        auditLoggerMock,
        [providerMock],
      );
      const router = await server.serve();
      appWithProvider = express().use(router);
      appWithProvider.use(MiddlewareFactory.create({ logger, config }).error());
    });

    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app).post('/refresh/test').send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityCreatePermission,
            resourceRef: 'policy-entity',
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

    it('should return a 200 for successful refresh set', async () => {
      const result = await request(appWithProvider)
        .post('/refresh/testProvider')
        .send();
      expect(result.statusCode).toBe(200);
    });

    it('should return a 404 when there are no rbac providers', async () => {
      const result = await request(app).post('/refresh/test').send();
      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual({
        message: 'No RBAC providers were found',
        name: 'NotFoundError',
      });
    });

    it('should return a 404 when the rbac provider does not exist', async () => {
      const result = await request(appWithProvider)
        .post('/refresh/test')
        .send();
      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual({
        message: 'The RBAC provider test was not found',
        name: 'NotFoundError',
      });
    });
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
      pluginPermissionMetadataCollectorMock.getPluginPolicies = jest
        .fn()
        .mockImplementation(async () => {
          return pluginMetadata;
        });
      const result = await request(app).get('/plugins/policies').send();
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual(pluginMetadata);
    });

    it('should return a status of Unauthorized for /plugins/policies', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app).get('/plugins/policies').send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityReadPermission,
            resourceRef: 'policy-entity',
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
      pluginPermissionMetadataCollectorMock.getPluginConditionRules = jest
        .fn()
        .mockImplementation(async () => {
          return rules;
        });
      const result = await request(app).get('/plugins/condition-rules').send();
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual(rules);
    });

    it('should return a status of Unauthorized for /plugins/condition-rules', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app).get('/plugins/condition-rules').send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityReadPermission,
            resourceRef: 'policy-entity',
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

  describe('test rest API when permission framework disabled', () => {
    beforeAll(() => {
      config = mockServices.rootConfig({
        data: {
          backend: {
            database: {
              client: 'better-sqlite3',
              connection: ':memory:',
            },
          },
          permission: {
            enabled: false,
          },
        },
      });
    });

    it('should not delete policy, because permission framework was disabled', async () => {
      enforcerDelegateMock.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      enforcerDelegateMock.removePolicies = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });

      const result = await request(app)
        .delete(
          '/policies/user/default/permission_admin?permission=policy-entity&policy=read&effect=allow',
        )
        .send([
          {
            permission: 'policy-entity',
            policy: 'read',
            effect: 'allow',
          },
        ]);

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not create policies, because permission framework was disabled', async () => {
      const result = await request(app).post('/policies').send();

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not return policies, because permission framework was disabled', async () => {
      const result = await request(app)
        .get('/policies/user/default/permission_admin')
        .send();

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not update policy, because permission framework was disabled', async () => {
      enforcerDelegateMock.hasPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[2] === 'create') {
            return false;
          }
          return true;
        });
      enforcerDelegateMock.updatePolicies = jest.fn().mockImplementation();

      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not return list all policies, because permission framework was disabled', async () => {
      enforcerDelegateMock.getPolicy = jest
        .fn()
        .mockImplementation(async () => {
          return [
            [
              'user:default/permission_admin',
              'policy-entity',
              'create',
              'allow',
            ],
            ['user:default/guest', 'policy-entity', 'read', 'allow'],
          ];
        });
      const result = await request(app).get('/policies').send();

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not return list all roles, because permission framework was disabled', async () => {
      enforcerDelegateMock.getGroupingPolicy = jest
        .fn()
        .mockImplementation(async () => {
          return [
            ['group:default/test', 'role:default/test'],
            ['group:default/team_a', 'role:default/team_a'],
          ];
        });

      const result = await request(app).get('/roles').send();

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not return role by role reference, because permission framework was disabled', async () => {
      const result = await request(app)
        .get('/roles/role/default/rbac_admin')
        .send();

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not create role, because permission framework was disabled', async () => {
      const result = await request(app)
        .post('/roles')
        .send({
          memberReferences: ['user:default/permission_admin'],
          name: 'role:default/rbac_admin',
        });

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not update role, because permission framework was disabled', async () => {
      enforcerDelegateMock.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[0] === 'user:default/permission_admin') {
            return true;
          }
          return false;
        });

      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test', 'user:default/dev'],
            name: 'role:default/rbac_admin',
            metadata: {
              source: 'rest',
              description: 'some admin role.',
            },
          },
        });

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not delete a role, because permission framework was disabled', async () => {
      enforcerDelegateMock.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      enforcerDelegateMock.removeGroupingPolicies = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });

      const result = await request(app)
        .delete('/roles/role/default/rbac_admin')
        .send();
      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not return list of all condition decisions, because permission framework was disabled', async () => {
      const result = await request(app).get('/roles/conditions').send();

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not delete condition decision, because permission framework was disabled', async () => {
      const result = await request(app).delete('/roles/conditions/1').send();

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not return condition decision by id, because permission framework was disabled', async () => {
      conditionalStorageMock.getCondition = jest
        .fn()
        .mockImplementation(async (id: number) => {
          if (id === 1) {
            return conditions[0];
          }
          return undefined;
        });

      const result = await request(app).get('/roles/conditions/1').send();

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not create condition, because permission framework was disabled', async () => {
      conditionalStorageMock.createCondition = jest
        .fn()
        .mockImplementation(() => {
          return 1;
        });
      pluginPermissionMetadataCollectorMock.getMetadataByPluginId = jest
        .fn()
        .mockImplementation(() => {
          const response: MetadataResponse = {
            permissions: [
              {
                name: 'catalog.entity.read',
                attributes: {
                  action: 'read',
                },
                type: 'resource',
                resourceType: 'catalog-entity',
              },
            ],
            rules: [],
          };
          return response;
        });

      const roleCondition: RoleConditionalPolicyDecision<PermissionAction> = {
        id: 1,
        pluginId: 'catalog',
        roleEntityRef: 'role:default/test',
        resourceType: 'catalog-entity',
        permissionMapping: ['read'],
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: { claims: ['group:default/team-a'] },
        },
      };

      const result = await request(app)
        .post('/roles/conditions')
        .send(roleCondition);

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not update condition decision, because permission framework was disabled', async () => {
      mockedAuthorizeConditional.mockImplementationOnce(async () => [
        { result: AuthorizeResult.ALLOW },
      ]);
      const conditionDecision: RoleConditionalPolicyDecision<PermissionAction> =
        {
          id: 1,
          pluginId: 'catalog',
          roleEntityRef: 'role:default/test',
          resourceType: 'catalog-entity',
          permissionMapping: ['read'],
          result: AuthorizeResult.CONDITIONAL,
          conditions: {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: { claims: ['group:default/team-a'] },
          },
        };

      const result = await request(app)
        .put('/roles/conditions/1')
        .send(conditionDecision);

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not return list plugins condition rules, because permission framework was disabled', async () => {
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
      pluginPermissionMetadataCollectorMock.getPluginConditionRules = jest
        .fn()
        .mockImplementation(async () => {
          return rules;
        });

      const result = await request(app).get('/plugins/condition-rules').send();

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });
  });
});
