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
import type { Entity, GroupEntity } from '@backstage/catalog-model';

import { AncestorSearchMemoSQLite } from './ancestor-search-memo-sqlite';

const mockAuthService = mockServices.auth();

describe('ancestor-search-memo', () => {
  const testGroups = [
    createGroupEntity('team-a', 'team-b', [], ['adam']),
    createGroupEntity('team-b', 'team-c', [], []),
    createGroupEntity('team-c', '', [], []),
    createGroupEntity('team-d', 'team-e', [], ['george']),
    createGroupEntity('team-e', 'team-f', [], []),
    createGroupEntity('team-f', '', [], []),
  ];

  const testUserGroups = [createGroupEntity('team-a', 'team-b', [], ['adam'])];

  // TODO: Move to 'catalogServiceMock' from '@backstage/plugin-catalog-node/testUtils'
  // once '@backstage/plugin-catalog-node' is upgraded
  const catalogApiMock: any = {
    getEntities: jest.fn().mockImplementation((arg: any) => {
      const hasMember = arg.filter['relations.hasMember'];
      if (hasMember && hasMember === 'user:default/adam') {
        return { items: testUserGroups };
      }
      return { items: testGroups };
    }),
  };

  let asm: AncestorSearchMemoSQLite;

  beforeEach(() => {
    asm = new AncestorSearchMemoSQLite(
      'user:default/adam',
      catalogApiMock,
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
    // user:default/adam -> group:default/team-a -> group:default/team-b -> group:default/team-c
    it('should build a graph for a particular user', async () => {
      const userGroupsTest = await asm.getUserASMGroups();

      const allGroupsTest = await asm.getAllASMGroups();

      userGroupsTest.forEach(group =>
        asm.traverse(group as GroupEntity, allGroupsTest as GroupEntity[], 0),
      );

      expect(asm.hasEntityRef('group:default/team-a')).toBeTruthy();
      expect(asm.hasEntityRef('group:default/team-b')).toBeTruthy();
      expect(asm.hasEntityRef('group:default/team-c')).toBeTruthy();
      expect(asm.hasEntityRef('group:default/team-d')).toBeFalsy();
    });

    // maxDepth of one                                  stops here
    //                                                       |
    // user:default/adam -> group:default/team-a -> group:default/team-b -> group:default/team-c
    it('should build the graph but stop based on the maxDepth', async () => {
      const asmMaxDepth = new AncestorSearchMemoSQLite(
        'user:default/adam',
        catalogApiMock,
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

      expect(asmMaxDepth.hasEntityRef('group:default/team-a')).toBeTruthy();
      expect(asmMaxDepth.hasEntityRef('group:default/team-b')).toBeTruthy();
      expect(asmMaxDepth.hasEntityRef('group:default/team-c')).toBeFalsy();
      expect(asmMaxDepth.hasEntityRef('group:default/team-d')).toBeFalsy();
    });
  });

  function createGroupEntity(
    name: string,
    parent?: string,
    children?: string[],
    members?: string[],
  ): Entity {
    const entity: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name,
        namespace: 'default',
      },
      spec: {},
    };

    if (children) {
      entity.spec!.children = children;
    }

    if (members) {
      entity.spec!.members = members;
    }

    if (parent) {
      entity.spec!.parent = parent;
    }

    return entity;
  }
});
