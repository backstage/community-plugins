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

import { AncestorSearchMemoPG } from './ancestor-search-memo-pg';
import { Relation } from './ancestor-search-memo';

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

  const catalogDBClient = Knex.knex({ client: MockClient });

  let asm: AncestorSearchMemoPG;

  beforeEach(() => {
    asm = new AncestorSearchMemoPG('user:default/adam', catalogDBClient);
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
      const allRelationsTest = await asm.getAllASMGroups();
      expect(allRelationsTest).toEqual(allRelations);
    });

    it('should fail to return anything when there is an error getting all relations', async () => {
      const allRelationsTest = await asm.getAllASMGroups();
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
      const relations = await asm.getUserASMGroups();

      expect(relations).toEqual(userRelations);
    });

    it('should fail to return anything when there is an error getting user relations', async () => {
      const relations = await asm.getUserASMGroups();

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
      const userRelationsTest = await asm.getUserASMGroups();

      tracker.reset();
      tracker.on
        .select(
          /select "source_entity_ref", "target_entity_ref" from "relations" where "type" = ?/,
        )
        .response(allRelations);
      const allRelationsTest = await asm.getAllASMGroups();

      userRelationsTest.forEach(relation =>
        asm.traverse(relation as Relation, allRelationsTest as Relation[], 0),
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
      const asmMaxDepth = new AncestorSearchMemoPG(
        'user:default/adam',
        catalogDBClient,
        1,
      );

      tracker.on
        .select(
          /select "source_entity_ref", "target_entity_ref" from "relations" where "type" = ?/,
        )
        .response(userRelations);
      const userRelationsTest = await asmMaxDepth.getUserASMGroups();

      tracker.reset();
      tracker.on
        .select(
          /select "source_entity_ref", "target_entity_ref" from "relations" where "type" = ?/,
        )
        .response(allRelations);
      const allRelationsTest = await asmMaxDepth.getAllASMGroups();

      userRelationsTest.forEach(relation =>
        asmMaxDepth.traverse(
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

  describe('buildUserGraph', () => {
    let tracker: Tracker;

    const asmUserGraph = new AncestorSearchMemoPG(
      'user:default/adam',
      catalogDBClient,
    );

    const userRelationsSpy = jest
      .spyOn(asmUserGraph, 'getUserASMGroups')
      .mockImplementation(() => Promise.resolve(userRelations));
    const allRelationsSpy = jest
      .spyOn(asmUserGraph, 'getAllASMGroups')
      .mockImplementation(() => Promise.resolve(allRelations));

    beforeAll(() => {
      tracker = createTracker(catalogDBClient);
    });

    afterEach(() => {
      tracker.reset();
    });

    // user:default/adam -> group:default/team-a -> group:default/team-b -> group:default/team-c
    it('should build the user graph using relations table', async () => {
      await asmUserGraph.buildUserGraph();

      expect(userRelationsSpy).toHaveBeenCalled();
      expect(allRelationsSpy).toHaveBeenCalled();
      expect(asmUserGraph.hasEntityRef('user:default/adam')).toBeTruthy();
      expect(asmUserGraph.hasEntityRef('group:default/team-a')).toBeTruthy();
      expect(asmUserGraph.hasEntityRef('group:default/team-b')).toBeTruthy();
      expect(asmUserGraph.hasEntityRef('group:default/team-c')).toBeTruthy();
      expect(asmUserGraph.hasEntityRef('group:default/team-d')).toBeFalsy();
    });
  });
});
