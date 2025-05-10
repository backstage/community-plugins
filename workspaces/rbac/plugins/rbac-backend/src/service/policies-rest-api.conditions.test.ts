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

import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { mockServices } from '@backstage/backend-test-utils';
import {
  AuthorizeResult,
  MetadataResponse,
} from '@backstage/plugin-permission-common';

import express from 'express';

import {
  PermissionAction,
  PermissionInfo,
  RoleConditionalPolicyDecision,
} from '@backstage-community/plugin-rbac-common';

import { RBACPermissionPolicy } from '../policies/permission-policy';
import { EnforcerDelegate } from './enforcer-delegate';
import { PluginPermissionMetadataCollector } from './plugin-endpoints';
import { PoliciesServer } from './policies-rest-api';
import { RBACRouterOptions } from './policy-builder';
import {
  mockAuditorService,
  conditionalStorageMock,
  credentials,
  enforcerDelegateMock,
  mockAuthService,
  mockClientKnex,
  mockDiscovery,
  mockedAuthorize,
  mockHttpAuth,
  mockLoggerService,
  mockUserInfoService,
  pluginMetadataCollectorMock,
  roleMetadataStorageMock,
  mockPermissionRegistry,
} from '../../__fixtures__/mock-utils';
import request from 'supertest';
import { RoleMetadataDao } from '../database/role-metadata';
import { RBACFilters } from '../permissions/rules';

jest.setTimeout(60000);

jest.mock('@backstage/plugin-auth-node', () => ({
  getBearerTokenFromAuthorizationHeader: () => 'token',
}));

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

jest.mock('../permissions/conditions', () => {
  return {
    conditionTransformerFunc: () =>
      jest.fn().mockReturnValue({
        anyOf: [{ key: 'owners', values: ['user:default/mock'] }],
      }),
  };
});

const mockedAuthorizeConditional = jest.fn().mockImplementation(async () => [
  {
    conditions: {
      anyOf: [
        {
          rule: 'IS_OWNER',
          resourceType: 'policy-entity',
          params: [{ owners: ['user:default/mock'] }],
        },
      ],
    },
    result: AuthorizeResult.CONDITIONAL,
  },
]);

const mockPermissionEvaluator = {
  authorize: mockedAuthorize,
  authorizeConditional: mockedAuthorizeConditional,
};

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
  {
    id: 2,
    pluginId: 'catalog',
    roleEntityRef: 'role:default/guest',
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

describe('REST policies api with conditions', () => {
  let app: express.Express;

  const config = mockServices.rootConfig({
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
    mockHttpAuth.credentials = jest.fn().mockImplementation(() => credentials);
    enforcerDelegateMock.getFilteredGroupingPolicy = jest
      .fn()
      .mockImplementation(
        async (_fieldIndex: number, ..._fieldValues: string[]) => {
          return [['group:default/test', 'role:default/test']];
        },
      );

    enforcerDelegateMock.getFilteredPolicy = jest
      .fn()
      .mockImplementation(
        async (_fieldIndex: number, ...fieldValues: string[]) => {
          if (fieldValues.length === 1) {
            return [
              ['role:default/test', 'policy-entity', 'create', 'allow'],
              ['role:default/test', 'policy-entity', 'read', 'allow'],
            ];
          }

          if (fieldValues.length > 1) {
            return [['role:default/test', 'policy-entity', 'read', 'allow']];
          }

          return [];
        },
      );

    roleMetadataStorageMock.findRoleMetadata = jest
      .fn()
      .mockImplementation(
        async (roleEntityRef: string): Promise<RoleMetadataDao> => {
          const owner =
            roleEntityRef === 'role:default/test' ? 'user:default/mock' : '';
          return {
            source: 'rest',
            roleEntityRef: roleEntityRef,
            modifiedBy: 'user:default/some_user',
            owner,
          };
        },
      );

    roleMetadataStorageMock.filterForOwnerRoleMetadata = jest
      .fn()
      .mockImplementation(
        async (filter?: RBACFilters): Promise<RoleMetadataDao[]> => {
          if (filter && 'anyOf' in filter) {
            return [
              {
                source: 'rest',
                roleEntityRef: 'role:default/test',
                modifiedBy: 'user:default/some_user',
                owner: 'user:default/mock',
              },
            ];
          }

          return [
            {
              source: 'rest',
              roleEntityRef: 'role:default/permission_admin',
              modifiedBy: 'user:default/some_user',
              owner: '',
            },
            {
              source: 'rest',
              roleEntityRef: 'role:default/test',
              modifiedBy: 'user:default/some_user',
              owner: 'user:default/mock',
            },
          ];
        },
      );

    enforcerDelegateMock.hasPolicy = jest
      .fn()
      .mockImplementation(async (...param: string[]): Promise<boolean> => {
        if (param[2] === 'update') {
          return false;
        }
        return true;
      });

    conditionalStorageMock.filterConditions = jest
      .fn()
      .mockImplementation(
        async (
          _roleEntityRef: string,
          pluginId: string,
          resourceType: string,
        ) => {
          if (resourceType === 'catalog-entity' || pluginId === 'catalog') {
            return conditions;
          }

          if (
            resourceType === 'scaffolder-template' ||
            pluginId === 'scaffolder'
          ) {
            return [];
          }
          return conditions;
        },
      );

    pluginMetadataCollectorMock.getMetadataByPluginId = jest
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

    conditionalStorageMock.getCondition = jest
      .fn()
      .mockImplementation(async (id: number) => {
        return conditions[id - 1];
      });

    const options: RBACRouterOptions = {
      config: config,
      logger: mockLoggerService,
      discovery: mockDiscovery,
      httpAuth: mockHttpAuth,
      auth: mockAuthService,
      policy: await RBACPermissionPolicy.build(
        mockLoggerService,
        mockAuditorService,
        config,
        conditionalStorageMock,
        enforcerDelegateMock as EnforcerDelegate,
        roleMetadataStorageMock,
        mockClientKnex,
        pluginMetadataCollectorMock as PluginPermissionMetadataCollector,
        mockAuthService,
      ),
      userInfo: mockUserInfoService,
      permissionsRegistry: mockPermissionRegistry,
    };

    server = new PoliciesServer(
      mockPermissionEvaluator,
      options,
      enforcerDelegateMock as EnforcerDelegate,
      conditionalStorageMock,
      pluginMetadataCollectorMock as PluginPermissionMetadataCollector,
      roleMetadataStorageMock,
      mockAuditorService,
    );

    const router = await server.serve();
    app = express().use(router);
    app.use(
      MiddlewareFactory.create({ logger: mockLoggerService, config }).error(),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /roles', () => {
    it('should be returned roles in which the user is assigned ownership', async () => {
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
            modifiedBy: 'user:default/some_user',
            owner: 'user:default/mock',
          },
        },
      ]);
    });
  });

  describe('GET /roles/:kind/:namespace/:name', () => {
    it('should return role by role reference in which the user is an owner of', async () => {
      const result = await request(app).get('/roles/role/default/test').send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual([
        {
          memberReferences: ['group:default/test'],
          name: 'role:default/test',
          metadata: {
            source: 'rest',
            modifiedBy: 'user:default/some_user',
            owner: 'user:default/mock',
          },
        },
      ]);
    });

    it('should return not found error by role reference in which the user is not an owner', async () => {
      enforcerDelegateMock.getFilteredGroupingPolicy = jest
        .fn()
        .mockImplementation(
          async (_fieldIndex: number, ..._fieldValues: string[]) => {
            return [['group:default/team_a', 'role:default/team_a']];
          },
        );

      const result = await request(app)
        .get('/roles/role/default/team_a')
        .send();
      expect(result.statusCode).toBe(404);
      expect(result.body).toEqual({
        error: { message: '', name: 'NotFoundError' },
        request: {
          method: 'GET',
          url: '/roles/role/default/team_a',
        },
        response: { statusCode: 404 },
      });
    });
  });

  describe('PUT /roles/:kind/:namespace/:name', () => {
    it('should fail to update role - old role not found because user is not an owner', async () => {
      const result = await request(app)
        .put('/roles/role/default/team_a')
        .send({
          oldRole: {
            memberReferences: ['group:default/team_a'],
          },
          newRole: {
            memberReferences: ['user:default/test'],
            name: 'role:default/team_a',
          },
        });

      expect(result.statusCode).toEqual(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should update description and set owner for role that the user is an owner of', async () => {
      enforcerDelegateMock.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/roles/role/default/test')
        .send({
          oldRole: {
            memberReferences: ['user:default/guest'],
            metadata: {
              source: 'rest',
              description: 'some admin role.',
              owner: 'user:default/mock',
            },
          },
          newRole: {
            memberReferences: ['user:default/guest'],
            name: 'role:default/test',
            metadata: {
              source: 'rest',
              description: 'some admin role.',
              owner: 'user:default/some_user',
            },
          },
        });

      expect(result.statusCode).toEqual(200);
      expect(enforcerDelegateMock.updateGroupingPolicies).toHaveBeenCalledWith(
        [['user:default/guest', 'role:default/test']],
        [['user:default/guest', 'role:default/test']],
        {
          description: 'some admin role.',
          modifiedBy: 'user:default/mock',
          roleEntityRef: 'role:default/test',
          source: 'rest',
          owner: 'user:default/some_user',
        },
      );
    });

    it.each([
      ['user:default/permission_admin', 'user:default/test'],
      ['user:default/Permission_Admin', 'user:default/Test'],
    ])('should update role that the user owns', async (oldUser, newUser) => {
      enforcerDelegateMock.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[0] === newUser.toLocaleLowerCase('en-US')) {
            return false;
          }
          return true;
        });
      enforcerDelegateMock.updateGroupingPolicies = jest
        .fn()
        .mockImplementation();

      const result = await request(app)
        .put('/roles/role/default/test')
        .send({
          oldRole: {
            memberReferences: [oldUser],
            metadata: {
              source: 'rest',
              description: 'some admin role.',
              owner: 'user:default/mock',
            },
          },
          newRole: {
            memberReferences: [newUser],
            name: 'role:default/test',
            metadata: {
              source: 'rest',
              description: 'some admin role.',
              owner: 'user:default/mock',
            },
          },
        });

      expect(result.statusCode).toEqual(200);
      expect(enforcerDelegateMock.hasGroupingPolicy).toHaveBeenNthCalledWith(
        1,
        'user:default/test',
        'role:default/test',
      );
      expect(enforcerDelegateMock.hasGroupingPolicy).toHaveBeenNthCalledWith(
        2,
        'user:default/permission_admin',
        'role:default/test',
      );
    });

    it('should update role where newRole has multiple roles and where the user is an owner of', async () => {
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
        .put('/roles/role/default/test')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
            metadata: {
              source: 'rest',
              description: 'some admin role.',
              owner: 'user:default/mock',
            },
          },
          newRole: {
            memberReferences: ['user:default/test', 'user:default/test2'],
            name: 'role:default/test',
            metadata: {
              source: 'rest',
              description: 'some admin role.',
              owner: 'user:default/mock',
            },
          },
        });

      expect(result.statusCode).toEqual(200);
    });

    it('should update role where newRole has multiple roles with one being from oldRole and where the user is an owner of', async () => {
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
        .put('/roles/role/default/test')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
            metadata: {
              source: 'rest',
              description: 'some admin role.',
              owner: 'user:default/mock',
            },
          },
          newRole: {
            memberReferences: [
              'user:default/permission_admin',
              'user:default/test',
            ],
            name: 'role:default/test',
            metadata: {
              source: 'rest',
              description: 'some admin role.',
              owner: 'user:default/mock',
            },
          },
        });

      expect(result.statusCode).toEqual(200);
    });

    it('should update role name of a role that the user is an owner of', async () => {
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
        .put('/roles/role/default/test')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
            metadata: {
              source: 'rest',
              description: 'some admin role.',
              owner: 'user:default/mock',
            },
          },
          newRole: {
            memberReferences: ['user:default/test'],
            name: 'role:default/new_name',
            metadata: {
              source: 'rest',
              description: 'some admin role.',
              owner: 'user:default/mock',
            },
          },
        });

      expect(result.statusCode).toEqual(200);
    });
  });

  describe('DELETE /roles/:kind/:namespace/:name', () => {
    it('should fail to delete, because user is not an owner', async () => {
      const result = await request(app)
        .delete(
          '/roles/role/default/team_a?memberReferences=group:default/test',
        )
        .send();

      expect(result.statusCode).toEqual(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it.each(['group:default/test', 'group:default/Test'])(
      'should delete a user / group %s from a role that the user is an owner of',
      async member => {
        const result = await request(app)
          .delete(`/roles/role/default/test?memberReferences=${member}`)
          .send();

        expect(result.statusCode).toEqual(204);
        expect(
          enforcerDelegateMock.getFilteredGroupingPolicy,
        ).toHaveBeenCalledWith(0, 'group:default/test', 'role:default/test');
      },
    );

    it('should delete a role that the user is an owner of', async () => {
      const result = await request(app)
        .delete('/roles/role/default/test')
        .send();

      expect(result.statusCode).toEqual(204);
    });
  });

  describe('GET /policies', () => {
    it('should all policies that the user owns', async () => {
      const result = await request(app).get('/policies').send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual([
        {
          entityReference: 'role:default/test',
          permission: 'policy.entity.create',
          policy: 'create',
          effect: 'allow',
          metadata: {
            source: 'rest',
          },
        },
        {
          entityReference: 'role:default/test',
          permission: 'policy-entity',
          policy: 'read',
          effect: 'allow',
          metadata: {
            source: 'rest',
          },
        },
      ]);
    });

    it('should return filtered policies that the user owns', async () => {
      const result = await request(app)
        .get(
          '/policies?entityRef=role:default/test&permission=policy-entity&policy=read&effect=allow',
        )
        .send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual([
        {
          entityReference: 'role:default/test',
          permission: 'policy-entity',
          policy: 'read',
          effect: 'allow',
          metadata: {
            source: 'rest',
          },
        },
      ]);
    });

    it('should be return no policies because the user is not an owner', async () => {
      const result = await request(app)
        .get(
          '/policies?entityRef=role:default/guest&permission=policy-entity&policy=read&effect=allow',
        )
        .send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual([]);
    });
  });

  describe('GET /policies/:kind/:namespace/:name', () => {
    it('should return permission policies by user reference that the user owns', async () => {
      const result = await request(app)
        .get('/policies/role/default/test')
        .send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual([
        {
          entityReference: 'role:default/test',
          permission: 'policy.entity.create',
          policy: 'create',
          effect: 'allow',
          metadata: {
            source: 'rest',
          },
        },
        {
          entityReference: 'role:default/test',
          permission: 'policy-entity',
          policy: 'read',
          effect: 'allow',
          metadata: {
            source: 'rest',
          },
        },
      ]);
    });

    it('should not return policies by user reference not found because user does not own them', async () => {
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

  describe('PUT /policies/:kind/:namespace/:name', () => {
    it('should fail to update policy - user does not own old policy', async () => {
      const result = await request(app)
        .put('/policies/role/default/permission_admin')
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

      expect(result.statusCode).toEqual(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should update policy that a user owns', async () => {
      enforcerDelegateMock.updatePolicies = jest.fn().mockImplementation();

      const result = await request(app)
        .put('/policies/role/default/test')
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
              policy: 'update',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toEqual(200);
    });
  });

  describe('DELETE /policies/:kind/:namespace/:name', () => {
    it('should fail to delete, because policy not found because user is not an owner', async () => {
      const result = await request(app)
        .delete('/policies/role/default/permission_admin')
        .send([
          {
            permission: 'policy-entity',
            policy: 'read',
            effect: 'allow',
          },
        ]);

      expect(result.statusCode).toEqual(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should delete policy', async () => {
      const result = await request(app)
        .delete(
          '/policies/role/default/test?permission=policy-entity&policy=read&effect=allow',
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

  describe('GET /roles/conditions', () => {
    it('should return all condition decisions that the user is an owner of', async () => {
      const result = await request(app).get('/roles/conditions').send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual(expectedConditions);
      expect(mockHttpAuth.credentials).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /roles/condition/:id', () => {
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

    it('should return 404', async () => {
      const result = await request(app).get('/roles/conditions/3').send();
      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual({
        message: '',
        name: 'NotFoundError',
      });
    });

    it('should return nothing when the user is not an owner of the condition', async () => {
      const result = await request(app).get('/roles/conditions/2').send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual([]);
    });
  });

  describe('PUT /roles/conditions', () => {
    it('should return return 403 for condition that the user is not an owner of', async () => {
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
        .put('/roles/conditions/2')
        .send(conditionDecision);
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        message: '',
        name: 'NotAllowedError',
      });
    });

    it('should update condition decision that the user is an owner of', async () => {
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

  describe('DELETE /roles/conditions/:id', () => {
    it('should delete condition decision by id where the user is an owner', async () => {
      const result = await request(app).delete('/roles/conditions/1').send();

      expect(result.statusCode).toEqual(204);
      expect(mockHttpAuth.credentials).toHaveBeenCalledTimes(1);
      expect(conditionalStorageMock.deleteCondition).toHaveBeenCalled();
    });

    it('should fail to delete condition decision by id because user is not an owner', async () => {
      const result = await request(app).delete('/roles/conditions/2').send();

      expect(result.statusCode).toEqual(403);
      expect(result.body.error.message).toEqual('');
    });
  });
});
