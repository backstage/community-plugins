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
import type { GroupEntity } from '@backstage/catalog-model';

import { AncestorSearchMemoSQLite } from './ancestor-search-memo-sqlite';
import { catalogMock, testGroups } from '../../__fixtures__/mock-utils';
import { convertGroupsToEntity } from '../../__fixtures__/test-utils';

const mockAuthService = mockServices.auth();

describe('ancestor-search-memo', () => {
  const testUserGroups = convertGroupsToEntity([
    {
      name: 'team-hr',
      namespace: null,
      title: 'HR Group',
      children: [],
      parent: 'team-management',
      hasMember: ['user:default/sally'],
    },
  ]);

  let asm: AncestorSearchMemoSQLite;

  beforeEach(() => {
    asm = new AncestorSearchMemoSQLite(
      'user:default/sally',
      catalogMock,
      mockAuthService,
    );
  });

  describe('getAllGroups and getAllRelations', () => {
    it('should return all groups', async () => {
      const allGroupsTest = await asm.getAllASMGroups();
      expect(allGroupsTest).toEqual(testGroups);
    });
  });

  describe('getUserGroups and getUserRelations', () => {
    it('should return all user groups', async () => {
      const userGroups = await asm.getUserASMGroups();
      expect(userGroups).toEqual(testUserGroups);
    });
  });

  describe('traverseGroups', () => {
    // user:default/sally
    // |- group:default/team-hr
    // |- group:default/team-management
    // |- group:hq/team-management
    // |- group:hq/team-administration
    // |- group:default/root-group
    it('should build a graph for a particular user', async () => {
      const userGroupsTest = await asm.getUserASMGroups();

      const allGroupsTest = await asm.getAllASMGroups();

      userGroupsTest.forEach(group =>
        asm.traverse(group as GroupEntity, allGroupsTest as GroupEntity[], 0),
      );

      expect(asm.hasEntityRef('group:default/team-hr')).toBeTruthy();
      expect(asm.hasEntityRef('group:default/team-management')).toBeTruthy();
      expect(asm.hasEntityRef('group:hq/team-management')).toBeTruthy();
      expect(asm.hasEntityRef('group:hq/team-administration')).toBeTruthy();
      expect(asm.hasEntityRef('group:default/root-group')).toBeTruthy();
      expect(asm.hasEntityRef('group:default/team-b')).toBeFalsy();
    });

    // maxDepth of one
    //
    // user:default/sally
    // |- group:default/team-hr
    // |- group:default/team-management <- stops here
    // |- group:hq/team-management
    // |- group:hq/team-administration
    // |- group:default/root-group
    it('should build the graph but stop based on the maxDepth', async () => {
      const asmMaxDepth = new AncestorSearchMemoSQLite(
        'user:default/sally',
        catalogMock,
        mockAuthService,
        1,
      );

      const userGroupsTest = await asmMaxDepth.getUserASMGroups();

      const allGroupsTest = await asmMaxDepth.getAllASMGroups();

      userGroupsTest.forEach(group =>
        asmMaxDepth.traverse(
          group as GroupEntity,
          allGroupsTest as GroupEntity[],
          0,
        ),
      );

      expect(asmMaxDepth.hasEntityRef('group:default/team-hr')).toBeTruthy();
      expect(
        asmMaxDepth.hasEntityRef('group:default/team-management'),
      ).toBeTruthy();
      expect(asmMaxDepth.hasEntityRef('group:hq/team-management')).toBeFalsy();
      expect(
        asmMaxDepth.hasEntityRef('group:hq/team-administration'),
      ).toBeFalsy();
      expect(asmMaxDepth.hasEntityRef('group:default/root-group')).toBeFalsy();
      expect(asmMaxDepth.hasEntityRef('group:default/team-b')).toBeFalsy();
    });
  });
});
