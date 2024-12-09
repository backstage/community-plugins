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
import * as Knex from 'knex';
import { createTracker, MockClient, Tracker } from 'knex-mock-client';

import { RoleMemberList } from './member-list';

describe('RoleMemberList', () => {
  const member = 'user:default/developer';

  const rbacDBClient = Knex.knex({ client: MockClient });
  let roleList: RoleMemberList;
  let newRole: RoleMemberList;
  let memberList: RoleMemberList;

  beforeEach(() => {
    roleList = new RoleMemberList('role:default/test');
    newRole = new RoleMemberList('role:default/extra');
    memberList = new RoleMemberList('user:default/test');
  });

  describe('addMembers', () => {
    it('should add members to the role', () => {
      const members = ['user:default/test', 'user:default/developer'];
      roleList.addMembers(members);

      expect(roleList.hasMember('user:default/test')).toBeTruthy();
      expect(roleList.hasMember('user:default/developer')).toBeTruthy();
    });
  });

  describe('addMember', () => {
    it('should add a single member to the role', () => {
      roleList.addMember(member);

      expect(roleList.hasMember('user:default/developer')).toBeTruthy();
    });

    it('should not add a duplicate of an existing member', () => {
      roleList.addMember(member);

      expect(roleList.getMembers().length).toEqual(1);

      roleList.addMember(member);
      expect(roleList.getMembers().length).not.toEqual(2);
    });
  });

  describe('deleteMember', () => {
    it('should delete a member from a role', () => {
      roleList.addMember(member);

      expect(roleList.getMembers().length).toEqual(1);

      roleList.deleteMember(member);

      expect(roleList.getMembers().length).not.toEqual(1);
    });
  });

  describe('buildMembers', () => {
    let tracker: Tracker;

    beforeEach(() => {
      tracker = createTracker(rbacDBClient);
    });

    afterEach(() => {
      tracker.reset();
    });

    it('should build the members associated with a role using the database', async () => {
      const data = [{ v0: 'user:default/qa', v1: 'role:default/qa' }];

      tracker.on.select('casbin_rule').response(data);

      await newRole.buildMembers(newRole, rbacDBClient);
      expect(newRole.hasMember('user:default/qa')).toBeTruthy();
    });

    it('should fail to retrieve users and log an error', async () => {
      const error = new Error('test error');
      tracker.on.select('casbin_rule').simulateError(error);

      await expect(
        newRole.buildMembers(newRole, rbacDBClient),
      ).rejects.toMatchObject({
        message: expect.stringContaining('test error'),
      });
      expect(newRole.getMembers().length).toEqual(0);
    });
  });

  describe('addRoles', () => {
    it('should add roles to the role member list', () => {
      const roles = ['role:default/test', 'role:default/developer'];
      memberList.addRoles(roles);

      expect(memberList.getRoles().length).toEqual(2);
    });
  });

  describe('buildRoles', () => {
    let tracker: Tracker;
    const memberRoles = ['role:default/temp', 'role:default/qa'];

    beforeEach(() => {
      tracker = createTracker(rbacDBClient);
    });

    afterEach(() => {
      tracker.reset();
    });

    it('should build the roles associated with a user using the database', async () => {
      const data = [{ v0: 'user:default/test', v1: 'role:default/qa' }];

      tracker.on.select('casbin_rule').response(data);

      await newRole.buildRoles(newRole, memberRoles, rbacDBClient);
      const rolesExpect = newRole.getRoles();
      expect(rolesExpect.length).toEqual(1);
      expect(rolesExpect[0]).toEqual('role:default/qa');
    });

    it('should fail to retrieve roles and log an error', async () => {
      const error = new Error('test error');
      tracker.on.select('casbin_rule').simulateError(error);

      await expect(
        newRole.buildRoles(newRole, memberRoles, rbacDBClient),
      ).rejects.toMatchObject({
        message: expect.stringContaining('test error'),
      });
      expect(newRole.getRoles().length).toEqual(0);
    });
  });
});
