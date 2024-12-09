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
import { IdentityApi } from '@backstage/core-plugin-api';

import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { Role } from '@backstage-community/plugin-rbac-common';

import { RBACAPI, RBACBackendClient } from './RBACBackendClient';

const LOCAL_ADDR = 'https://localhost:7007';
let lastRequest: any;
const handlers = [
  rest.get(`${LOCAL_ADDR}/api/permission`, (req, res, ctx) => {
    lastRequest = {
      url: req.url.toString(),
      authorizationHeader: req.headers.get('authorization'),
    };
    return res(ctx.status(200), ctx.json({ status: 'ok' }));
  }),
  rest.get(`${LOCAL_ADDR}/api/permission/roles`, (req, res, ctx) => {
    const authorizationHeader = req.headers.get('Authorization');
    if (authorizationHeader === 'Bearer test-token') {
      return res(
        ctx.status(200),
        ctx.json([
          { name: 'testrole:testns/name1' },
          { name: 'testrole:testns/name2' },
        ]),
      );
    }
    return res(ctx.status(404));
  }),
  rest.get(`${LOCAL_ADDR}/api/permission/policies`, (req, res, ctx) => {
    const authorizationHeader = req.headers.get('Authorization');
    if (authorizationHeader === 'Bearer test-token') {
      return res(
        ctx.status(200),
        ctx.json([
          { policy: 'read', effect: 'allow' },
          { policy: 'create', effect: 'allow' },
        ]),
      );
    }
    return res(ctx.status(404));
  }),
  rest.get(
    `${LOCAL_ADDR}/api/permission/policies/:kind/:namespace/:name`,
    (req, res, ctx) => {
      const { kind, namespace, name } = req.params;

      if (
        kind === 'validKind' &&
        namespace === 'validNamespace' &&
        name === 'validName'
      ) {
        return res(
          ctx.status(200),
          ctx.json([
            { policy: 'read', effect: 'allow' },
            { policy: 'create', effect: 'allow' },
          ]),
        );
      }
      return res(ctx.status(404));
    },
  ),
  rest.delete(
    `${LOCAL_ADDR}/api/permission/roles/:kind/:namespace/:name`,
    (req, res, ctx) => {
      const authorizationHeader = req.headers.get('Authorization');
      lastRequest = {
        url: req.url.toString(),
        authorizationHeader: authorizationHeader,
      };

      if (authorizationHeader === 'Bearer test-token') {
        return res(ctx.status(200));
      }
      return res(ctx.status(404));
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/api/permission/roles/:kind/:namespace/:name`,
    (req, res, ctx) => {
      const authorizationHeader = req.headers.get('Authorization');
      lastRequest = {
        url: req.url.toString(),
        authorizationHeader: authorizationHeader,
      };

      if (authorizationHeader === 'Bearer test-token') {
        return res(
          ctx.status(200),
          ctx.json({ name: 'targetRole:targetNamespace/targetName' }),
        );
      }
      return res(ctx.status(404));
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/api/catalog/entities?filter=kind=user&filter=kind=group`,
    (req, res, ctx) => {
      const authorizationHeader = req.headers.get('Authorization');
      lastRequest = {
        url: req.url.toString(),
        authorizationHeader: authorizationHeader,
      };
      if (authorizationHeader === 'Bearer test-token') {
        return res(ctx.status(200), ctx.json([{ kind: 'User', spec: {} }]));
      }
      return res(ctx.status(404));
    },
  ),
  rest.get(`${LOCAL_ADDR}/api/permission/plugins/policies`, (req, res, ctx) => {
    const authorizationHeader = req.headers.get('Authorization');
    lastRequest = {
      url: req.url.toString(),
      authorizationHeader: authorizationHeader,
    };
    if (authorizationHeader === 'Bearer test-token') {
      return res(
        ctx.status(200),
        ctx.json([
          {
            pluginId: 'plugin1',
            policies: [{ policy: 'read', effect: 'allow' }],
          },
          {
            pluginId: 'plugin2',
            policies: [{ policy: 'create', effect: 'allow' }],
          },
        ]),
      );
    }
    return res(ctx.status(404));
  }),
  rest.post(`${LOCAL_ADDR}/api/permission/roles`, async (req, res, ctx) => {
    const requestBody = await req.json();
    const { name } = requestBody;
    if (name === '') {
      return res(ctx.status(400), ctx.json({ message: 'Error creating role' }));
    }
    return res(
      ctx.status(200),
      ctx.json({ message: 'Role created successfully', ...requestBody }),
    );
  }),
  rest.put(
    `${LOCAL_ADDR}/api/permission/roles/:kind/:namespace/:name`,
    async (req, res, ctx) => {
      const requestBody = await req.json();
      const { newRole } = requestBody;

      if (newRole.name === '') {
        return res(
          ctx.status(400),
          ctx.json({ message: 'Error updating role' }),
        );
      }

      return res(
        ctx.status(200),
        ctx.json({ message: 'Role updated successfully', ...requestBody }),
      );
    },
  ),
  rest.put(
    `${LOCAL_ADDR}/api/permission/policies/:kind/:namespace/:name`,
    async (req, res, ctx) => {
      const requestBody = await req.json();
      const { newPolicy } = requestBody;

      if (
        newPolicy?.length === 0 ||
        newPolicy.some(
          (policy: { entityReference: string }) =>
            policy.entityReference === '',
        )
      ) {
        return res(
          ctx.status(400),
          ctx.json({ message: 'Error updating policies' }),
        );
      }

      return res(
        ctx.status(200),
        ctx.json({ message: 'Policies updated successfully', ...requestBody }),
      );
    },
  ),
  rest.delete(
    `${LOCAL_ADDR}/api/permission/policies/:kind/:namespace/:name`,
    (req, res, ctx) => {
      const authorizationHeader = req.headers.get('Authorization');
      lastRequest = {
        url: req.url.toString(),
        authorizationHeader: authorizationHeader,
      };
      if (authorizationHeader === 'Bearer test-token') {
        return res(ctx.status(200));
      }
      return res(
        ctx.status(400),
        ctx.json({ message: 'Error deleting policies' }),
      );
    },
  ),
  rest.post(`${LOCAL_ADDR}/api/permission/policies`, async (req, res, ctx) => {
    const policies = await req.json();
    if (
      !policies ||
      policies.length === 0 ||
      policies.some(
        (policy: { entityReference: string }) => policy.entityReference === '',
      )
    ) {
      return res(
        ctx.status(400),
        ctx.json({ message: 'Error creating policies' }),
      );
    }
    return res(
      ctx.status(200),
      ctx.json({ message: 'Policies created successfully', ...policies }),
    );
  }),
];
const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.restoreHandlers());
afterAll(() => server.close());

describe('RBACBackendClient', () => {
  let rbacApi: RBACAPI;
  const getConfigApi = (getOptionalStringFn: any) => ({
    has: jest.fn(),
    keys: jest.fn(),
    get: jest.fn(),
    getBoolean: jest.fn(),
    getConfig: jest.fn(),
    getConfigArray: jest.fn(),
    getNumber: jest.fn(),
    getString: jest.fn(key => {
      if (key === 'backend.baseUrl') {
        return LOCAL_ADDR;
      }
      return '';
    }),
    getStringArray: jest.fn(),
    getOptional: jest.fn(),
    getOptionalStringArray: jest.fn(),
    getOptionalBoolean: jest.fn(),
    getOptionalConfig: jest.fn(),
    getOptionalConfigArray: jest.fn(),
    getOptionalNumber: jest.fn(),
    getOptionalString: getOptionalStringFn,
  });

  const bearerToken = 'test-token';

  const identityApi = {
    async getCredentials() {
      return { token: bearerToken };
    },
  } as IdentityApi;

  beforeEach(() => {
    rbacApi = new RBACBackendClient({
      configApi: getConfigApi(() => {
        return '/api';
      }),
      identityApi: identityApi,
    });
  });

  it('getUserAuthorization should call fetch with correct URL and headers', async () => {
    const result = await rbacApi.getUserAuthorization();

    expect(result).toEqual({ status: 'ok' });
    expect(lastRequest).not.toBeNull();
    expect(lastRequest.url).toBe('https://localhost:7007/api/permission/');
    expect(lastRequest.authorizationHeader).toBe('Bearer test-token');
  });

  describe('getRoles', () => {
    it('getRoles should retrieve roles successfully', async () => {
      const roles = await rbacApi.getRoles();
      expect(roles).toEqual([
        { name: 'testrole:testns/name1' },
        { name: 'testrole:testns/name2' },
      ]);
    });

    it('getRoles should handle non-200/204 responses correctly', async () => {
      server.use(
        rest.get(`${LOCAL_ADDR}/api/permission/roles`, (_req, res, ctx) => {
          return res(ctx.status(404));
        }),
      );

      await expect(rbacApi.getRoles()).resolves.toEqual(
        expect.objectContaining({
          status: 404,
        }),
      );
    });
  });

  describe('getPolicies', () => {
    it('getPolicies should retrieve policies successfully', async () => {
      const policies = await rbacApi.getPolicies();
      expect(policies).toEqual([
        { policy: 'read', effect: 'allow' },
        { policy: 'create', effect: 'allow' },
      ]);
    });

    it('getPolicies should handle non-200/204 responses correctly', async () => {
      server.use(
        rest.get(`${LOCAL_ADDR}/api/permission/policies`, (_req, res, ctx) => {
          return res(ctx.status(404));
        }),
      );

      await expect(rbacApi.getPolicies()).resolves.toEqual(
        expect.objectContaining({
          status: 404,
        }),
      );
    });
  });

  describe('getAssociatedPolicies', () => {
    const entityReference = 'validKind:validNamespace/validName';
    it('getAssociatedPolicies should retrieve policies successfully', async () => {
      const policies = await rbacApi.getAssociatedPolicies(entityReference);
      expect(policies).toEqual([
        { policy: 'read', effect: 'allow' },
        { policy: 'create', effect: 'allow' },
      ]);
    });

    it('getAssociatedPolicies should handle non-200/204 responses correctly', async () => {
      const invalidEntityReference = 'invalidKind:invalidNamespace/invalidName';

      await expect(
        rbacApi.getAssociatedPolicies(invalidEntityReference),
      ).resolves.toEqual(
        expect.objectContaining({
          status: 404,
        }),
      );
    });
  });

  describe('deleteRole', () => {
    it('deleteRole should send a DELETE request and handle successful response', async () => {
      const targetRole = 'targetRole:targetNamespace/targetName';
      const response = await rbacApi.deleteRole(targetRole);

      expect(response.status).toBe(200);
      expect(lastRequest).not.toBeNull();
      expect(lastRequest.url).toBe(
        'https://localhost:7007/api/permission/roles/targetRole/targetNamespace/targetName',
      );
      expect(lastRequest.authorizationHeader).toBe('Bearer test-token');
    });

    it('deleteRole should handle unauthorized response', async () => {
      server.use(
        rest.delete(
          `${LOCAL_ADDR}/api/permission/roles/:kind/:namespace/:name`,
          (_req, res, ctx) => {
            return res(ctx.status(404));
          },
        ),
      );

      const targetRole = 'targetRole:targetNamespace/targetName';
      const response = await rbacApi.deleteRole(targetRole);

      expect(response.status).toBe(404);
    });
  });

  describe('getRole', () => {
    it('getRole should send a GET request and handle successful response', async () => {
      const targetRole = 'targetRole:targetNamespace/targetName';
      const response = await rbacApi.getRole(targetRole);

      expect(response).toEqual({
        name: 'targetRole:targetNamespace/targetName',
      });
      expect(lastRequest).not.toBeNull();
      expect(lastRequest.url).toBe(
        'https://localhost:7007/api/permission/roles/targetRole/targetNamespace/targetName',
      );
      expect(lastRequest.authorizationHeader).toBe('Bearer test-token');
    });
    it('getRole should handle unauthorized response', async () => {
      server.use(
        rest.get(
          `${LOCAL_ADDR}/api/permission/roles/:kind/:namespace/:name`,
          (_req, res, ctx) => {
            return res(ctx.status(404));
          },
        ),
      );

      const targetRole = 'targetRole:targetNamespace/targetName';
      await expect(rbacApi.getRole(targetRole)).resolves.toEqual(
        expect.objectContaining({
          status: 404,
        }),
      );
    });
  });

  describe('getMembers', () => {
    it('getMembers should send a GET request and handle successful response', async () => {
      const response = await rbacApi.getMembers();

      expect(response).toEqual([{ kind: 'User', spec: {} }]);
      expect(lastRequest).not.toBeNull();
      expect(lastRequest.url).toBe(
        'https://localhost:7007/api/catalog/entities?filter=kind=user&filter=kind=group',
      );
      expect(lastRequest.authorizationHeader).toBe('Bearer test-token');
    });
    it('getMembers should handle unauthorized response', async () => {
      server.use(
        rest.get(
          `${LOCAL_ADDR}/api/catalog/entities?filter=kind=user&filter=kind=group`,
          (_req, res, ctx) => {
            return res(ctx.status(404));
          },
        ),
      );

      await expect(rbacApi.getMembers()).resolves.toEqual(
        expect.objectContaining({
          status: 404,
        }),
      );
    });
  });

  describe('listPermissions', () => {
    it('listPermissions should send a GET request and handle successful response', async () => {
      const response = await rbacApi.listPermissions();

      expect(response).toEqual([
        {
          pluginId: 'plugin1',
          policies: [{ policy: 'read', effect: 'allow' }],
        },
        {
          pluginId: 'plugin2',
          policies: [{ policy: 'create', effect: 'allow' }],
        },
      ]);
      expect(lastRequest).not.toBeNull();
      expect(lastRequest.url).toBe(
        'https://localhost:7007/api/permission/plugins/policies',
      );
      expect(lastRequest.authorizationHeader).toBe('Bearer test-token');
    });
    it('listPermissions should handle unauthorized response', async () => {
      server.use(
        rest.get(
          `${LOCAL_ADDR}/api/permission/plugins/policies`,
          (_req, res, ctx) => {
            return res(ctx.status(404));
          },
        ),
      );

      await expect(rbacApi.listPermissions()).resolves.toEqual(
        expect.objectContaining({
          status: 404,
        }),
      );
    });
  });

  describe('createRole', () => {
    it('createRole should send a POST request and handle successful response', async () => {
      const newRole: Role = {
        name: 'testRole',
        memberReferences: ['testUser1', 'testUser2'],
      };
      const response = await rbacApi.createRole(newRole);
      expect(response).toHaveProperty('status', 200);
    });
    it('createRole should handle error response', async () => {
      const newRole: Role = { name: '', memberReferences: [] };
      const response = await rbacApi.createRole(newRole);
      expect(response).toEqual(
        expect.objectContaining({ message: 'Error creating role' }),
      );
    });
  });

  describe('updateRole', () => {
    it('updateRole should send a PUT request and handle successful response', async () => {
      const oldRole: Role = {
        name: 'testRole:testNamespace/testName',
        memberReferences: ['testUser1', 'testUser2'],
      };
      const newRole: Role = {
        name: 'testRole:testNamespace/testName',
        memberReferences: ['testUser1', 'testUser2', 'testUser3'],
      };
      const response = await rbacApi.updateRole(oldRole, newRole);
      expect(response).toHaveProperty('status', 200);
    });
    it('updateRole should handle error response', async () => {
      const oldRole: Role = {
        name: 'testRole:testNamespace/testName',
        memberReferences: ['testUser1', 'testUser2'],
      };
      const newRole: Role = {
        name: '',
        memberReferences: ['testUser1', 'testUser2', 'testUser3'],
      };
      const response = await rbacApi.updateRole(oldRole, newRole);
      expect(response).toEqual(
        expect.objectContaining({ message: 'Error updating role' }),
      );
    });
  });

  describe('updatePolicies', () => {
    it('updatePolicies should send a POST request and handle successful response', async () => {
      const response = await rbacApi.updatePolicies(
        'testRole:testNamespace/testName',
        [
          {
            entityReference: 'testRole:testNamespace/testName',
            policy: 'read',
            effect: 'allow',
          },
        ],
        [
          {
            entityReference: 'testRole:testNamespace/testName',
            policy: 'read',
            effect: 'allow',
          },
          {
            entityReference: 'testRole:testNamespace/testName',
            policy: 'update',
            effect: 'allow',
          },
        ],
      );
      expect(response).toHaveProperty('status', 200);
    });
    it('updatePolicies should handle error response', async () => {
      const oldPolicies = [
        {
          entityReference: 'testRole:testNamespace/testName',
          policy: 'read',
          effect: 'allow',
        },
      ];
      const newPolicies = [
        { entityReference: '', policy: 'read', effect: 'allow' },
        {
          entityReference: 'testRole:testNamespace/testName',
          policy: 'update',
          effect: 'allow',
        },
      ];
      const response = await rbacApi.updatePolicies(
        'testRole:testNamespace/testName',
        oldPolicies,
        newPolicies,
      );
      expect(response).toEqual(
        expect.objectContaining({ message: 'Error updating policies' }),
      );
    });
  });

  describe('deletePolicies', () => {
    it('deletePolicies should send a DELETE request and handle successful response', async () => {
      const response = await rbacApi.deletePolicies(
        'testRole:testNamespace/testName',
        [
          {
            entityReference: 'testRole:testNamespace/testName',
            policy: 'read',
            effect: 'allow',
          },
        ],
      );
      expect(response).toHaveProperty('status', 200);
    });
    it('deletePolicies should handle error response', async () => {
      server.use(
        rest.delete(
          `${LOCAL_ADDR}/api/permission/policies/:kind/:namespace/:name`,
          (_req, res, ctx) => {
            return res(
              ctx.status(404),
              ctx.json({ message: 'Error deleting policies' }),
            );
          },
        ),
      );

      const targetEntityReference = 'testRole:testNamespace/testName';
      const targetPolicies = [
        {
          entityReference: 'testRole:testNamespace/testName',
          policy: 'read',
          effect: 'allow',
        },
      ];
      const response = await rbacApi.deletePolicies(
        targetEntityReference,
        targetPolicies,
      );
      expect(response).toEqual(
        expect.objectContaining({ message: 'Error deleting policies' }),
      );
    });
  });

  describe('createPolicies', () => {
    it('createPolicies should send a POST request and handle successful response', async () => {
      const response = await rbacApi.createPolicies([
        {
          entityReference: 'testRole:testNamespace/testName',
          policy: 'read',
          effect: 'allow',
        },
      ]);
      expect(response).toHaveProperty('status', 200);
    });
    it('createPolicies should handle error response', async () => {
      const newPolicies = [
        { entityReference: '', policy: 'read', effect: 'allow' },
      ];
      const response = await rbacApi.createPolicies(newPolicies);
      expect(response).toEqual(
        expect.objectContaining({ message: 'Error creating policies' }),
      );
    });
  });
});
