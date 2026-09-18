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

import { createServiceFactory } from '@backstage/backend-plugin-api';
import {
  mockCredentials,
  mockServices,
  startTestBackend,
  type TestBackend,
} from '@backstage/backend-test-utils';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';
import permissionBackend from '@backstage/plugin-permission-backend';
import request from 'supertest';

import { rbacPlugin } from './plugin';

jest.setTimeout(120_000);

const SQLITE_DB = {
  backend: {
    database: {
      client: 'better-sqlite3',
      connection: ':memory:',
    },
  },
};

function buildConfig(permissionOverrides: Record<string, unknown> = {}) {
  return {
    ...SQLITE_DB,
    permission: {
      enabled: true,
      rbac: {
        admin: {
          users: [{ name: 'user:default/admin' }],
        },
      },
      ...permissionOverrides,
    },
  };
}

async function startBackend(config: object) {
  return startTestBackend({
    features: [
      permissionBackend,
      rbacPlugin,
      mockServices.rootConfig.factory({ data: config }),
      mockServices.httpAuth.factory({
        defaultCredentials: mockCredentials.service(),
      }),
    ],
  });
}

// Workaround: MockAuthService OBO flow drops the actor from user
// credentials, causing the permission backend to reject with 400.
// We patch mockCredentials.user to inject a default actor.
function patchUserCredentials() {
  const origUser = mockCredentials.user;
  const patched = (ref?: string, opts?: any) =>
    origUser(ref, {
      ...opts,
      actor: opts?.actor ?? { subject: 'plugin:permission' },
    });
  Object.assign(patched, origUser);
  (mockCredentials as any).user = patched;
  return () => {
    (mockCredentials as any).user = origUser;
  };
}

async function startBackendWithUserAuth(config: object) {
  return startTestBackend({
    features: [
      permissionBackend,
      rbacPlugin,
      mockServices.rootConfig.factory({ data: config }),
      mockServices.httpAuth.factory({
        defaultCredentials: mockCredentials.service(),
      }),
      createServiceFactory({
        service: catalogServiceRef,
        deps: {},
        factory: () =>
          catalogServiceMock({
            entities: [
              {
                apiVersion: 'backstage.io/v1alpha1',
                kind: 'User',
                metadata: { name: 'admin', namespace: 'default' },
                spec: { memberOf: [] },
              },
            ],
          }),
      }),
    ],
  });
}

describe('rbacPlugin', () => {
  let backend: TestBackend;

  afterEach(async () => {
    await backend?.stop();
  });

  describe('module wiring', () => {
    it('registers RBAC routes on the permission plugin', async () => {
      backend = await startBackend(buildConfig());
      const response = await request(backend.server).get(
        '/api/permission/roles',
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('serves the policies endpoint', async () => {
      backend = await startBackend(buildConfig());
      const response = await request(backend.server).get(
        '/api/permission/policies',
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('starts without errors when permission framework is disabled', async () => {
      backend = await startBackend(buildConfig({ enabled: false }));
      const response = await request(backend.server).get(
        '/api/permission/health',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });

    it('serves the health endpoint', async () => {
      backend = await startBackend(buildConfig());
      const response = await request(backend.server).get(
        '/api/permission/health',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });

    describe('with user credentials', () => {
      let restoreUser: () => void;

      beforeEach(() => {
        restoreUser = patchUserCredentials();
      });

      afterEach(() => {
        restoreUser();
      });

      it('allows super-admin user to list roles', async () => {
        backend = await startBackendWithUserAuth(
          buildConfig({
            rbac: {
              admin: {
                users: [{ name: 'user:default/admin' }],
                superUsers: [{ name: 'user:default/admin' }],
              },
            },
          }),
        );
        const response = await request(backend.server)
          .get('/api/permission/roles')
          .set(
            'Authorization',
            mockCredentials.user.header('user:default/admin'),
          );

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });

      it('rejects non-admin user with 403', async () => {
        backend = await startBackendWithUserAuth(
          buildConfig({
            rbac: {
              admin: {
                users: [{ name: 'user:default/admin' }],
                superUsers: [{ name: 'user:default/admin' }],
              },
            },
          }),
        );
        const response = await request(backend.server)
          .get('/api/permission/roles')
          .set(
            'Authorization',
            mockCredentials.user.header('user:default/not-an-admin'),
          );

        expect(response.status).toBe(403);
      });
    });
  });

  describe('config contract', () => {
    it('accepts admin.superUsers configuration', async () => {
      backend = await startBackend(
        buildConfig({
          rbac: {
            admin: {
              users: [{ name: 'user:default/admin' }],
              superUsers: [{ name: 'user:default/super_user' }],
            },
          },
        }),
      );
      const response = await request(backend.server).get(
        '/api/permission/roles',
      );

      expect(response.status).toBe(200);
    });

    it('exposes configured pluginsWithPermission via the plugins/id endpoint', async () => {
      backend = await startBackend(
        buildConfig({
          rbac: {
            admin: {
              users: [{ name: 'user:default/admin' }],
            },
            pluginsWithPermission: ['catalog', 'scaffolder'],
          },
        }),
      );
      const response = await request(backend.server).get(
        '/api/permission/plugins/id',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ids: ['catalog', 'scaffolder'],
      });
    });

    it('returns empty plugin list when pluginsWithPermission is omitted', async () => {
      backend = await startBackend(buildConfig());
      const response = await request(backend.server).get(
        '/api/permission/plugins/id',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ids: [] });
    });

    describe('condition validation limits', () => {
      let restoreUser: () => void;

      beforeEach(() => {
        restoreUser = patchUserCredentials();
      });

      afterEach(() => {
        restoreUser();
      });

      it('rejects conditions that exceed configured maxCriteriaItems', async () => {
        backend = await startBackendWithUserAuth(
          buildConfig({
            rbac: {
              admin: {
                users: [{ name: 'user:default/admin' }],
                superUsers: [{ name: 'user:default/admin' }],
              },
              validation: {
                conditionalPolicies: {
                  maxCriteriaItems: 1,
                },
              },
            },
          }),
        );
        const condition = {
          roleEntityRef: 'role:default/test',
          result: 'CONDITIONAL',
          pluginId: 'catalog',
          resourceType: 'catalog-entity',
          permissionMapping: ['read'],
          conditions: {
            anyOf: [
              {
                rule: 'IS_ENTITY_OWNER',
                resourceType: 'catalog-entity',
                params: {},
              },
              {
                rule: 'IS_ENTITY_KIND',
                resourceType: 'catalog-entity',
                params: {},
              },
            ],
          },
        };
        const response = await request(backend.server)
          .post('/api/permission/roles/conditions')
          .set(
            'Authorization',
            mockCredentials.user.header('user:default/admin'),
          )
          .send(condition);

        expect(response.status).toBe(400);
        expect(response.body.error.message).toContain(
          'supports at most 1 items',
        );
      });
    });

    it('does not register RBAC routes when permission.enabled is omitted', async () => {
      backend = await startBackend({
        ...SQLITE_DB,
        permission: {
          rbac: {
            admin: {
              users: [{ name: 'user:default/admin' }],
            },
          },
        },
      });

      const health = await request(backend.server).get(
        '/api/permission/health',
      );
      expect(health.status).toBe(200);
      expect(health.body).toEqual({ status: 'ok' });

      const roles = await request(backend.server).get('/api/permission/roles');
      expect(roles.status).toBe(404);

      const policies = await request(backend.server).get(
        '/api/permission/policies',
      );
      expect(policies.status).toBe(404);
    });
  });
});
