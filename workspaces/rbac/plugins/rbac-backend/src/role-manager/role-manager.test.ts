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
import type { LoggerService } from '@backstage/backend-plugin-api';
import { mockServices } from '@backstage/backend-test-utils';
import { Config } from '@backstage/config';

import * as Knex from 'knex';
import { createTracker, MockClient, Tracker } from 'knex-mock-client';

import { BackstageRoleManager } from '../role-manager/role-manager';
import { catalogMock } from '../../__fixtures__/mock-utils';

describe('BackstageRoleManager', () => {
  const catalogDBClient = Knex.knex({ client: MockClient });
  const rbacDBClient = Knex.knex({ client: MockClient });

  const mockLoggerService = mockServices.logger.mock();

  const mockAuthService = mockServices.auth();

  let roleManager: BackstageRoleManager;
  beforeEach(() => {
    const config = newConfig();

    roleManager = new BackstageRoleManager(
      catalogMock,
      mockLoggerService as LoggerService,
      catalogDBClient,
      rbacDBClient,
      config,
      mockAuthService,
    );
  });

  jest.spyOn(catalogMock, 'getEntities');

  describe('initialize', () => {
    it('should initialize', () => {
      expect(roleManager).not.toBeUndefined();
    });

    it('should throw an error whenever max depth is less than 0', () => {
      let expectedError;
      let errorRoleManager;
      const config = newConfig(-1);

      try {
        errorRoleManager = new BackstageRoleManager(
          catalogMock,
          mockLoggerService as LoggerService,
          catalogDBClient,
          rbacDBClient,
          config,
          mockAuthService,
        );
      } catch (error) {
        expectedError = error;
      }

      expect(errorRoleManager).toBeUndefined();
      expect(expectedError).toMatchObject({
        message:
          'Max Depth for RBAC group hierarchy must be greater than or equal to zero',
      });
    });
  });

  describe('unimplemented methods', () => {
    it('should throw an error for syncedHasLink', () => {
      expect(() =>
        roleManager.syncedHasLink!('user:default/role1', 'user:default/role2'),
      ).toThrow('Method "syncedHasLink" not implemented.');
    });

    it('should throw an error for getUsers', async () => {
      await expect(roleManager.getUsers('name')).rejects.toThrow(
        'Method "getUsers" not implemented.',
      );
    });
  });

  describe('addLink test', () => {
    it('should create a link between two entities', async () => {
      roleManager.addLink('user:default/test', 'role:default/rbac_admin');
      const result = await roleManager.hasLink(
        'user:default/test',
        'role:default/rbac_admin',
      );
      expect(result).toBe(true);
    });
  });

  describe('deleteLink test', () => {
    it('should delete a link', async () => {
      roleManager.addLink('user:default/test', 'role:default/test', '');
      roleManager.addLink('user:default/test', 'role:default/test2', '');

      let roles = await roleManager.getRoles('user:default/test');
      expect(roles).toStrictEqual(['role:default/test', 'role:default/test2']);

      roleManager.deleteLink('user:default/test', 'role:default/test');
      roles = await roleManager.getRoles('user:default/test');
      expect(roles).toStrictEqual(['role:default/test2']);
    });
  });

  describe('hasLink tests', () => {
    afterEach(() => {
      (mockLoggerService.warn as jest.Mock).mockReset();
    });

    it('should throw an error for unsupported domain', async () => {
      await expect(
        roleManager.hasLink(
          'user:default/mike',
          'group:default/somegroup',
          'someDomain',
        ),
      ).rejects.toThrow('domain argument is not supported.');
    });

    it('should return true for hasLink when names are the same', async () => {
      const result = await roleManager.hasLink(
        'user:default/mike',
        'user:default/mike',
      );
      expect(result).toBe(true);
    });

    it('should return false for hasLink when name2 has a user kind', async () => {
      const result = await roleManager.hasLink(
        'user:default/mike',
        'user:default/some-user',
      );
      expect(result).toBe(false);
    });

    // user:default/bob should not inherits from group:default/team-x
    //
    //     Hierarchy:
    //
    // user:default/b -> user without group
    //
    it('should return false for hasLink when user without group', async () => {
      const result = await roleManager.hasLink(
        'user:default/bob',
        'group:default/team-x',
      );
      expect(catalogMock.getEntities).toHaveBeenCalledWith(
        {
          filter: {
            kind: 'Group',
          },
          fields: [
            'kind',
            'metadata.name',
            'metadata.namespace',
            'spec.parent',
          ],
        },
        {
          token: 'mock-service-token:{"sub":"plugin:test","target":"catalog"}',
        },
      );
      expect(result).toBeFalsy();
    });

    // user:default/mike should inherits from group:default/team-b
    //
    //     Hierarchy:
    //
    // group:default/team-b
    //          |
    //  user:default/mike
    //
    it('should return true for hasLink when user:default/mike inherits from group:default/team-b', async () => {
      const result = await roleManager.hasLink(
        'user:default/mike',
        'group:default/team-b',
      );
      expect(result).toBeTruthy();
    });

    // user:default/mike should not inherits from group:default/team-x
    //
    //     Hierarchy:
    //
    // group:default/team-b
    //         |
    // user:default/mike
    //
    it('should return false for hasLink when user:default/mike does not inherits group:default/team-x', async () => {
      const result = await roleManager.hasLink(
        'user:default/mike',
        'group:default/team-x',
      );
      expect(result).toBeFalsy();
    });

    // user:default/mike should inherits from group:default/team-a
    //
    //     Hierarchy:
    //
    // group:default/team-a
    //       |
    // group:default/team-b
    //       |
    // user:default/mike
    //
    it('should return true for hasLink, when user:default/mike inherits from group:default/team-a', async () => {
      const result = await roleManager.hasLink(
        'user:default/mike',
        'group:default/team-a',
      );
      expect(result).toBeTruthy();
    });

    // user:default/mike should inherits from group:default/team-a
    //
    //     Hierarchy:
    //
    // group:default/team-a
    //       |
    // group:default/team-b
    //       |
    // user:default/mike
    //
    it('should disable group inheritance when max-depth=0', async () => {
      // max-depth=0
      const config = newConfig(0);
      const rm = new BackstageRoleManager(
        catalogMock,
        mockLoggerService as LoggerService,
        catalogDBClient,
        rbacDBClient,
        config,
        mockAuthService,
      );
      let result = await rm.hasLink(
        'user:default/mike',
        'group:default/team-b',
      );
      expect(result).toBeTruthy();

      result = await rm.hasLink('user:default/mike', 'group:default/team-a');
      expect(result).toBeFalsy();
    });

    // user:default/mike should inherits from group:default/team-b.
    //
    //     Hierarchy:
    //
    //            |---------group:default/team-a---------|
    //            |                  |                   |
    // user:default/team-c group:default/team-b   group:default/team-d
    //            |                  |                   |
    //   user:default/tom       user:default/mike    user:default:john
    //
    it('should return true for hasLink, when user:default/mike inherits from group:default/team-b', async () => {
      const result = await roleManager.hasLink(
        'user:default/mike',
        'group:default/team-a',
      );
      expect(result).toBeTruthy();
    });

    // user:default/mike should not inherits from group:default/team-c
    //
    //     Hierarchy:
    //
    // group:default/team-a
    //       |
    // group:default/team-b
    //       |
    // user:default/mike
    //
    it('should return false for hasLink, when user:default/mike does not inherits from group:default/team-c', async () => {
      const result = await roleManager.hasLink(
        'user:default/mike',
        'group:default/team-c',
      );
      expect(result).toBeFalsy();
    });

    // user:default/mike should inherits from group:default/team-a
    //
    //     Hierarchy:
    //
    // group:default/team-a  group:default/team-z
    //       |                        |
    // group:default/team-c  group:default/team-y
    //                |              |
    //                user:default/mike
    //
    it('should return true for hasLink, when user:default/mike inherits group tree with group:default/team-a', async () => {
      const result = await roleManager.hasLink(
        'user:default/mike',
        'group:default/team-a',
      );
      expect(result).toBeTruthy();
    });

    // user:default/mike should not inherits from group:default/team-e
    //
    //     Hierarchy:
    //
    // group:default/team-a  group:default/team-z
    //       |                        |
    // group:default/team-c  group:default/team-y
    //                |              |
    //                user:default/mike
    //
    it('should return false for hasLink, when user:default/mike inherits from group:default/team-e', async () => {
      const result = await roleManager.hasLink(
        'user:default/mike',
        'group:default/team-e',
      );
      expect(result).toBeFalsy();
    });

    // user:default/john should inherits from group:default/team-e and group:default/team-f, but we have cycle dependency.
    // So return false on call hasLink.
    //
    //     Hierarchy:
    //
    // group:default/team-e
    //       ↓      ↑
    // group:default/team-f
    //          ↓
    // user:default/john
    //
    it('should return false for hasLink, when user:default/john inherits from group:default/team-e and group:default/team-f, but we have cycle dependency', async () => {
      let result = await roleManager.hasLink(
        'user:default/john',
        'group:default/team-f',
      );
      expect(result).toBeFalsy();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        'Detected cycle dependencies in the Group graph: [["group:default/team-e","group:default/team-f"]]. Admin/(catalog owner) have to fix it to make RBAC permission evaluation correct for groups: [["group:default/team-e","group:default/team-f"]]',
      );

      result = await roleManager.hasLink(
        'user:default/john',
        'group:default/team-e',
      );
      expect(result).toBeFalsy();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        'Detected cycle dependencies in the Group graph: [["group:default/team-e","group:default/team-f"]]. Admin/(catalog owner) have to fix it to make RBAC permission evaluation correct for groups: [["group:default/team-e","group:default/team-f"]]',
      );
    });

    // user:default/bill should inherits from group:default/team-e, group:default/team-f, group:default/team-g, but we have cycle dependency.
    // So return false on call hasLink.
    //
    //     Hierarchy:
    //
    // group:default/team-e
    //       ↓    ↑
    // group:default/team-f
    //          ↓
    // group:default/team-g
    //          ↓
    // user:default/bill
    //
    it('should return false for hasLink, when user:default/bill inherits from group:default/team-g, group:default/team-f, group:default/team-e, but we have cycle dependency', async () => {
      let result = await roleManager.hasLink(
        'user:default/bill',
        'group:default/team-g',
      );
      expect(result).toBeFalsy();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        'Detected cycle dependencies in the Group graph: [["group:default/team-e","group:default/team-f"]]. Admin/(catalog owner) have to fix it to make RBAC permission evaluation correct for groups: [["group:default/team-e","group:default/team-f"]]',
      );

      result = await roleManager.hasLink(
        'user:default/bill',
        'group:default/team-e',
      );
      expect(result).toBeFalsy();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        'Detected cycle dependencies in the Group graph: [["group:default/team-e","group:default/team-f"]]. Admin/(catalog owner) have to fix it to make RBAC permission evaluation correct for groups: [["group:default/team-e","group:default/team-f"]]',
      );

      result = await roleManager.hasLink(
        'user:default/bill',
        'group:default/team-f',
      );
      expect(result).toBeFalsy();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        'Detected cycle dependencies in the Group graph: [["group:default/team-e","group:default/team-f"]]. Admin/(catalog owner) have to fix it to make RBAC permission evaluation correct for groups: [["group:default/team-e","group:default/team-f"]]',
      );
    });

    // user:default/john should inherits from group:default/team-a, but we have cycle dependency: team-e -> team-f.
    // So return false on call hasLink.
    //
    //     Hierarchy:
    //
    // group:default/team-e  group:default/team-a
    //       ↓       ↑               ↓
    // group:default/team-f  group:default/team-d
    //               ↓               ↓
    //               user:default/john
    //
    it('should return false for hasLink, when user:default/mike inherits group tree with group:default/team-a, but we cycle dependency', async () => {
      const result = await roleManager.hasLink(
        'user:default/john',
        'group:default/team-e',
      );
      expect(result).toBeFalsy();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        'Detected cycle dependencies in the Group graph: [["group:default/team-e","group:default/team-f"]]. Admin/(catalog owner) have to fix it to make RBAC permission evaluation correct for groups: [["group:default/team-e","group:default/team-f"]]',
      );
    });

    // user:default/john should inherits from group:default/team-e, but we have cycle dependency: team-e -> team-f.
    // So return false on call hasLink.
    //
    // user:default/tom should inherits from group:default/team-a. Cycle dependency in the neighbor subgraph, should
    // not affect evaluation user:default/tom inheritance.
    //
    //                 Hierarchy:
    //
    //              group:default/root
    //                ↓             ↓
    // group:default/team-e  group:default/team-a
    //       ↓       ↑               ↓
    // group:default/team-f  group:default/team-c
    //               ↓               ↓
    //   user:default/john    user:default/tom
    //
    it('should return false for hasLink for user:default/john and group:default/team-e(cycle dependency), but should be true for user:default/tom and group:default/team-a', async () => {
      let result = await roleManager.hasLink(
        'user:default/john',
        'group:default/team-e',
      );
      expect(result).toBeFalsy();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        'Detected cycle dependencies in the Group graph: [["group:default/team-e","group:default/team-f"]]. Admin/(catalog owner) have to fix it to make RBAC permission evaluation correct for groups: [["group:default/team-e","group:default/team-f"]]',
      );

      result = await roleManager.hasLink(
        'user:default/tom',
        'group:default/team-a',
      );
      expect(result).toBeTruthy();
    });
  });

  describe('getRoles returns roles per user', () => {
    it('should returns role per user', async () => {
      roleManager.addLink('user:default/test', 'role:default/rbac_admin');
      roleManager.addLink('user:default/test-two', 'role:default/rbac_admin');
      roleManager.addLink(
        'user:default/test-three',
        'role:default/rbac_admin_test',
      );

      let roles = await roleManager.getRoles('user:default/test');
      expect(roles.length).toBe(1);
      expect(roles[0]).toEqual('role:default/rbac_admin');

      roles = await roleManager.getRoles('user:default/test-two');
      expect(roles.length).toBe(1);
      expect(roles[0]).toEqual('role:default/rbac_admin');

      roles = await roleManager.getRoles('user:default/test-three');
      expect(roles.length).toBe(1);
      expect(roles[0]).toEqual('role:default/rbac_admin_test');
    });

    it('getRoles returns role for user inherited from group', async () => {
      roleManager.addLink('group:default/team-a', 'role:default/rbac_admin');

      let roles = await roleManager.getRoles('user:default/mike');
      expect(roles.length).toBe(1);
      expect(roles[0]).toEqual('role:default/rbac_admin');

      // should return empty array for group
      roles = await roleManager.getRoles('group:default/team-a');
      expect(roles.length).toBe(0);

      // should return empty array for role
      roles = await roleManager.getRoles('role:default/rbac_admin');
      expect(roles.length).toBe(0);
    });
  });

  describe('getRoles returns roles per user with database', () => {
    let tracker: Tracker;

    beforeEach(() => {
      tracker = createTracker(rbacDBClient);
    });

    afterEach(() => {
      tracker.reset();
    });

    it('should returns role per user', async () => {
      roleManager.isPGClient = jest.fn().mockImplementation(() => true);

      roleManager.addLink('user:default/test', 'role:default/rbac_admin');

      let data = [{ v0: 'user:default/test', v1: 'role:default/rbac_admin' }];

      tracker.on.select('casbin_rule').response(data);

      let roles = await roleManager.getRoles('user:default/test');
      expect(roles.length).toBe(1);
      expect(roles[0]).toEqual('role:default/rbac_admin');

      roleManager.addLink('user:default/test-two', 'role:default/rbac_admin');

      tracker.resetHandlers();

      data = [{ v0: 'user:default/test-two', v1: 'role:default/rbac_admin' }];

      tracker.on.select('casbin_rule').response(data);

      roles = await roleManager.getRoles('user:default/test-two');
      expect(roles.length).toBe(1);
      expect(roles[0]).toEqual('role:default/rbac_admin');

      roleManager.addLink(
        'user:default/test-three',
        'role:default/rbac_admin_test',
      );

      tracker.resetHandlers();

      data = [
        { v0: 'user:default/test-three', v1: 'role:default/rbac_admin_test' },
      ];

      tracker.on.select('casbin_rule').response(data);

      roles = await roleManager.getRoles('user:default/test-three');
      expect(roles.length).toBe(1);
      expect(roles[0]).toEqual('role:default/rbac_admin_test');
    });

    it('getRoles returns role for user inherited from group', async () => {
      roleManager.isPGClient = jest.fn().mockImplementation(() => true);
      roleManager.addLink('group:default/team-a', 'role:default/rbac_admin');

      const data = [
        { v0: 'group:default/team-a', v1: 'role:default/rbac_admin' },
      ];

      tracker.on.select('casbin_rule').response(data);

      let roles = await roleManager.getRoles('user:default/test');
      expect(roles.length).toBe(1);
      expect(roles[0]).toEqual('role:default/rbac_admin');

      tracker.on
        .select('select "v1" from "casbin_rule" where "v0" = ?')
        .response([]);

      // should return empty array for group
      roles = await roleManager.getRoles('group:default/team-a');
      expect(roles.length).toBe(0);

      tracker.on
        .select('select "v1" from "casbin_rule" where "v0" = ?')
        .response([]);

      // should return empty array for role
      roles = await roleManager.getRoles('role:default/rbac_admin');
      expect(roles.length).toBe(0);
    });
  });
});

function newConfig(
  maxDepth?: number,
  users?: Array<{ name: string }>,
  superUsers?: Array<{ name: string }>,
): Config {
  const testUsers = [
    {
      name: 'user:default/guest',
    },
    {
      name: 'group:default/guests',
    },
  ];

  return mockServices.rootConfig({
    data: {
      permission: {
        rbac: {
          admin: {
            users: users || testUsers,
            superUsers: superUsers,
          },
          maxDepth,
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
}
