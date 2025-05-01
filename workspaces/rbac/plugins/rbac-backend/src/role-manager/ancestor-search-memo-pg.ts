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

import { Knex } from 'knex';
import { AncestorSearchMemo, Relation } from './ancestor-search-memo';

export class AncestorSearchMemoPG extends AncestorSearchMemo<Relation> {
  constructor(
    private readonly userEntityRef: string,
    private readonly catalogDBClient: Knex,
    private readonly maxDepth?: number,
  ) {
    super();
  }

  async getAllASMGroups(): Promise<Relation[]> {
    try {
      const rows = await this.catalogDBClient('relations')
        .select('source_entity_ref', 'target_entity_ref')
        .where('type', 'childOf');
      return rows;
    } catch (error) {
      return [];
    }
  }

  async getUserASMGroups(): Promise<Relation[]> {
    try {
      const rows = await this.catalogDBClient('relations')
        .select('source_entity_ref', 'target_entity_ref')
        .where({ type: 'memberOf', source_entity_ref: this.userEntityRef });
      return rows;
    } catch (error) {
      return [];
    }
  }

  traverse(
    relation: Relation,
    allRelations: Relation[],
    current_depth: number,
  ) {
    // We add one to the maxDepth here because the user is considered the starting node
    if (this.maxDepth !== undefined && current_depth >= this.maxDepth + 1) {
      return;
    }
    const depth = current_depth + 1;

    if (!super.hasEntityRef(relation.source_entity_ref)) {
      super.setNode(relation.source_entity_ref);
    }

    super.setEdge(relation.target_entity_ref, relation.source_entity_ref);

    const parentGroup = allRelations.find(
      g => g.source_entity_ref === relation.target_entity_ref,
    );

    if (parentGroup && super.isAcyclic()) {
      this.traverse(parentGroup, allRelations, depth);
    }
  }

  async buildUserGraph() {
    const userRelations = await this.getUserASMGroups();
    const allRelations = await this.getAllASMGroups();
    userRelations.forEach(group =>
      this.traverse(group as Relation, allRelations as Relation[], 0),
    );
  }
}
