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

import * as Knex from 'knex';
import { createTracker, MockClient, Tracker } from 'knex-mock-client';

import { AncestorSearchMemo, Relation } from './ancestor-search-memo';

const mockAuthService = mockServices.auth();

describe('ancestor-search-memo', () => {
  const userRelations = [
    {
      source_entity_ref: 'user:default/adam',
      target_entity_ref: 'group:default/team-a',
    },
  ];

  const allRelations = [
    {
      source_entity_ref: 'user:default/adam',
      target_entity_ref: 'group:default/team-a',
    },
    {
      source_entity_ref: 'group:default/team-a',
      target_entity_ref: 'group:default/team-b',
    },
    {
      source_entity_ref: 'group:default/team-b',
      target_entity_ref: 'group:default/team-c',
    },
    {
      source_entity_ref: 'user:default/george',
      target_entity_ref: 'group:default/team-d',
    },
    {
      source_entity_ref: 'group:default/team-d',
      target_entity_ref: 'group:default/team-e',
    },
    {
      source_entity_ref: 'group:default/team-e',
      target_entity_ref: 'group:default/team-f',
    },
  ];

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

  const catalogDBClient = Knex.knex({ client: MockClient });

  let asm: AncestorSearchMemo;

  beforeEach(() => {
    asm = new AncestorSearchMemo(
      'user:default/adam',
      catalogApiMock,
      catalogDBClient,
      mockAuthService,
    );
  });

  describe('getAllGroups and getAllRelations', () => {
    let tracker: Tracker;

    beforeAll(() => {
      tracker = createTracker(catalogDBClient);
    });

    afterEach(() => {
      tracker.reset();
    });

    it('should return all relations', async () => {
      tracker.on
        .select(
          /select "source_entity_ref", "target_entity_ref" from "relations" where "type" = ?/,
        )
        .response(allRelations);
      const allRelationsTest = await asm.getAllRelations();
      expect(allRelationsTest).toEqual(allRelations);
    });

    it('should return all groups', async () => {
      const allGroupsTest = await asm.getAllGroups();
      expect(allGroupsTest).toEqual(testGroups);
    });

    it('should fail to return anything when there is an error getting all relations', async () => {
      const allRelationsTest = await asm.getAllRelations();
      expect(allRelationsTest).toEqual([]);
    });
  });

  describe('getUserGroups and getUserRelations', () => {
    let tracker: Tracker;

    beforeAll(() => {
      tracker = createTracker(catalogDBClient);
    });

    afterEach(() => {
      tracker.reset();
    });

    it('should return all user relations', async () => {
      tracker.on
        .select(
          /select "source_entity_ref", "target_entity_ref" from "relations" where "type" = ?/,
        )
        .response(userRelations);
      const relations = await asm.getUserRelations();

      expect(relations).toEqual(userRelations);
    });

    it('should return all user groups', async () => {
      const userGroups = await asm.getUserGroups();
      expect(userGroups).toEqual(testUserGroups);
    });

    it('should fail to return anything when there is an error getting user relations', async () => {
      const relations = await asm.getUserRelations();

      expect(relations).toEqual([]);
    });
  });

  describe('traverseRelations', () => {
    let tracker: Tracker;

    beforeAll(() => {
      tracker = createTracker(catalogDBClient);
    });

    afterEach(() => {
      tracker.reset();
    });

    // user:default/adam -> group:default/team-a -> group:default/team-b -> group:default/team-c
    it('should build a graph for a particular user', async () => {
      tracker.on
        .select(
          /select "source_entity_ref", "target_entity_ref" from "relations" where "type" = ?/,
        )
        .response(userRelations);
      const userRelationsTest = await asm.getUserRelations();

      tracker.reset();
      tracker.on
        .select(
          /select "source_entity_ref", "target_entity_ref" from "relations" where "type" = ?/,
        )
        .response(allRelations);
      const allRelationsTest = await asm.getAllRelations();

      userRelationsTest.forEach(relation =>
        asm.traverseRelations(
          asm,
          relation as Relation,
          allRelationsTest as Relation[],
          0,
        ),
      );

      expect(asm.hasEntityRef('user:default/adam')).toBeTruthy();
      expect(asm.hasEntityRef('group:default/team-a')).toBeTruthy();
      expect(asm.hasEntityRef('group:default/team-b')).toBeTruthy();
      expect(asm.hasEntityRef('group:default/team-c')).toBeTruthy();
      expect(asm.hasEntityRef('group:default/team-d')).toBeFalsy();
    });

    // maxDepth of one                                  stops here
    //                                                       |
    // user:default/adam -> group:default/team-a -> group:default/team-b -> group:default/team-c
    it('should build the graph but stop based on the maxDepth', async () => {
      const asmMaxDepth = new AncestorSearchMemo(
        'user:default/adam',
        catalogApiMock,
        catalogDBClient,
        mockAuthService,
        1,
      );

      tracker.on
        .select(
          /select "source_entity_ref", "target_entity_ref" from "relations" where "type" = ?/,
        )
        .response(userRelations);
      const userRelationsTest = await asmMaxDepth.getUserRelations();

      tracker.reset();
      tracker.on
        .select(
          /select "source_entity_ref", "target_entity_ref" from "relations" where "type" = ?/,
        )
        .response(allRelations);
      const allRelationsTest = await asmMaxDepth.getAllRelations();

      userRelationsTest.forEach(relation =>
        asmMaxDepth.traverseRelations(
          asmMaxDepth,
          relation as Relation,
          allRelationsTest as Relation[],
          0,
        ),
      );

      expect(asmMaxDepth.hasEntityRef('user:default/adam')).toBeTruthy();
      expect(asmMaxDepth.hasEntityRef('group:default/team-a')).toBeTruthy();
      expect(asmMaxDepth.hasEntityRef('group:default/team-b')).toBeTruthy();
      expect(asmMaxDepth.hasEntityRef('group:default/team-c')).toBeFalsy();
      expect(asmMaxDepth.hasEntityRef('group:default/team-d')).toBeFalsy();
    });
  });

  describe('traverseGroups', () => {
    // user:default/adam -> group:default/team-a -> group:default/team-b -> group:default/team-c
    it('should build a graph for a particular user', async () => {
      const userGroupsTest = await asm.getUserGroups();

      const allGroupsTest = await asm.getAllGroups();

      userGroupsTest.forEach(group =>
        asm.traverseGroups(
          asm,
          group as GroupEntity,
          allGroupsTest as GroupEntity[],
          0,
        ),
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
      const asmMaxDepth = new AncestorSearchMemo(
        'user:default/adam',
        catalogApiMock,
        catalogDBClient,
        mockAuthService,
        1,
      );

      const userGroupsTest = await asmMaxDepth.getUserGroups();

      const allGroupsTest = await asmMaxDepth.getAllGroups();

      userGroupsTest.forEach(group =>
        asmMaxDepth.traverseGroups(
          asmMaxDepth,
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

  describe('buildUserGraph', () => {
    let tracker: Tracker;

    const asmUserGraph = new AncestorSearchMemo(
      'user:default/adam',
      catalogApiMock,
      catalogDBClient,
      mockAuthService,
    );

    const asmDBSpy = jest
      .spyOn(asmUserGraph, 'doesRelationTableExist')
      .mockImplementation(() => Promise.resolve(true));
    const userRelationsSpy = jest
      .spyOn(asmUserGraph, 'getUserRelations')
      .mockImplementation(() => Promise.resolve(userRelations));
    const allRelationsSpy = jest
      .spyOn(asmUserGraph, 'getAllRelations')
      .mockImplementation(() => Promise.resolve(allRelations));

    beforeAll(() => {
      tracker = createTracker(catalogDBClient);
    });

    afterEach(() => {
      tracker.reset();
    });

    // user:default/adam -> group:default/team-a -> group:default/team-b -> group:default/team-c
    it('should build the user graph using relations table', async () => {
      await asmUserGraph.buildUserGraph(asmUserGraph);

      expect(asmDBSpy).toHaveBeenCalled();
      expect(userRelationsSpy).toHaveBeenCalled();
      expect(allRelationsSpy).toHaveBeenCalled();
      expect(asmUserGraph.hasEntityRef('user:default/adam')).toBeTruthy();
      expect(asmUserGraph.hasEntityRef('group:default/team-a')).toBeTruthy();
      expect(asmUserGraph.hasEntityRef('group:default/team-b')).toBeTruthy();
      expect(asmUserGraph.hasEntityRef('group:default/team-c')).toBeTruthy();
      expect(asmUserGraph.hasEntityRef('group:default/team-d')).toBeFalsy();
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
