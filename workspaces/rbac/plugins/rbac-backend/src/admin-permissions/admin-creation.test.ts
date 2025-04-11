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
import { mockServices } from '@backstage/backend-test-utils';
import { Config } from '@backstage/config';

import * as Knex from 'knex';

import type { RoleMetadata } from '@backstage-community/plugin-rbac-common';

import {
  mockAuditorService,
  catalogApiMock,
  csvPermFile,
  mockClientKnex,
  roleMetadataStorageMock,
} from '../../__fixtures__/mock-utils';
import {
  newAdapter,
  newConfig,
  newEnforcerDelegate,
  newPermissionPolicy,
} from '../../__fixtures__/test-utils';
import { RoleMetadataDao } from '../database/role-metadata';
import { EnforcerDelegate } from '../service/enforcer-delegate';
import {
  ADMIN_ROLE_NAME,
  setAdminPermissions,
  useAdminsFromConfig,
} from './admin-creation';

const modifiedBy = 'user:default/some-admin';
const adminRole = 'role:default/rbac_admin';
const groupPolicy = [['user:default/test_admin', 'role:default/rbac_admin']];
const permissions = [
  ['role:default/rbac_admin', 'policy-entity', 'read', 'allow'],
  ['role:default/rbac_admin', 'policy.entity.create', 'create', 'allow'],
  ['role:default/rbac_admin', 'policy-entity', 'delete', 'allow'],
  ['role:default/rbac_admin', 'policy-entity', 'update', 'allow'],
  ['role:default/rbac_admin', 'catalog-entity', 'read', 'allow'],
];
const oldGroupPolicy = ['user:default/old_admin', 'role:default/rbac_admin'];

describe('Admin Creation', () => {
  describe('Admin role and permission creation to a user', () => {
    let enfDelegate: EnforcerDelegate;
    let config: Config;
    roleMetadataStorageMock.findRoleMetadata = jest
      .fn()
      .mockImplementation(
        async (
          _roleEntityRef: string,
          _trx: Knex.Knex.Transaction,
        ): Promise<RoleMetadataDao> => {
          return {
            roleEntityRef: 'role:default/catalog-writer',
            source: 'legacy',
            modifiedBy,
          };
        },
      );

    const admins = new Array<{ name: string }>();
    admins.push({ name: 'user:default/test_admin' });
    const superUser = new Array<{ name: string }>();
    superUser.push({ name: 'user:default/super_user' });

    catalogApiMock.getEntities.mockReturnValue({ items: [] });

    beforeEach(async () => {
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(
          async (
            _roleEntityRef: string,
            _trx: Knex.Knex.Transaction,
          ): Promise<RoleMetadataDao> => {
            return {
              roleEntityRef: 'role:default/catalog-writer',
              source: 'legacy',
              modifiedBy,
            };
          },
        );

      config = newConfig(csvPermFile, admins, superUser);
      const adapter = await newAdapter(config);

      enfDelegate = await newEnforcerDelegate(adapter, config);

      await enfDelegate.addGroupingPolicy(oldGroupPolicy, {
        source: 'configuration',
        roleEntityRef: ADMIN_ROLE_NAME,
        modifiedBy: `user:default/tom`,
      });

      const adminUsers = config.getOptionalConfigArray(
        'permission.rbac.admin.users',
      );
      await useAdminsFromConfig(
        adminUsers || [],
        enfDelegate,
        mockAuditorService,
        roleMetadataStorageMock,
        mockClientKnex,
      );
      await setAdminPermissions(enfDelegate, mockAuditorService);
    });

    it('should assign an admin to the admin role and permissions', async () => {
      const enfRole = await enfDelegate.getFilteredGroupingPolicy(1, adminRole);
      const enfPermission = await enfDelegate.getFilteredPolicy(0, adminRole);
      expect(enfRole).toEqual(groupPolicy);
      expect(enfPermission).toEqual(permissions);
    });

    it(`should not assign an admin to the permissions if permissions are already assigned`, async () => {
      await expect(async () => {
        await setAdminPermissions(enfDelegate, mockAuditorService);
      }).not.toThrow();
    });

    it(`should assign an admin to the new permission`, async () => {
      const newDefaultPermission = [
        adminRole,
        'something-new',
        'create',
        'allow',
      ];
      await enfDelegate.addPolicy(newDefaultPermission);
      await setAdminPermissions(enfDelegate, mockAuditorService);
      const enfPermission = await enfDelegate.getFilteredPolicy(
        0,
        ...newDefaultPermission,
      );
      expect(enfPermission.length).toEqual(1);
    });

    it('should fail to build the admin permissions, problem with creating role metadata', async () => {
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(async (): Promise<void> => {
          return undefined;
        });

      roleMetadataStorageMock.createRoleMetadata = jest
        .fn()
        .mockImplementation(async (): Promise<void> => {
          throw new Error(`Failed to create`);
        });

      config = mockServices.rootConfig({
        data: {
          permission: {
            rbac: {
              'policies-csv-file': csvPermFile,
              policyFileReload: true,
            },
          },
          backend: {
            database: {
              client: 'better-sqlite3',
              connection: ':memory:',
            },
          },
        },
      });

      await expect(
        newPermissionPolicy(config, enfDelegate, roleMetadataStorageMock),
      ).rejects.toThrow('Failed to create');
    });

    it('should build and update a legacy admin permission', async () => {
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementationOnce(
          async (
            _roleEntityRef: string,
            _trx: Knex.Knex.Transaction,
          ): Promise<RoleMetadata> => {
            return { source: 'legacy' };
          },
        );

      const enfRole = await enfDelegate.getFilteredGroupingPolicy(1, adminRole);
      const enfPermission = await enfDelegate.getFilteredPolicy(0, adminRole);

      expect(enfRole).toEqual(groupPolicy);
      expect(enfPermission).toEqual(permissions);
      expect(roleMetadataStorageMock.updateRoleMetadata).toHaveBeenCalled();
    });

    it('should remove users that are no longer in the config file', async () => {
      const enfRole = await enfDelegate.getFilteredGroupingPolicy(1, adminRole);
      const enfPermission = await enfDelegate.getFilteredPolicy(0, adminRole);
      expect(enfRole).toEqual(groupPolicy);
      expect(enfRole).not.toContain(oldGroupPolicy);
      expect(enfPermission).toEqual(permissions);
    });
  });
});
