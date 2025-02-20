/*
 * Copyright 2025 The Backstage Authors
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
import type { Entity } from '@backstage/catalog-model';

import { alg, Graph } from '@dagrejs/graphlib';

export interface Relation {
  source_entity_ref: string;
  target_entity_ref: string;
}

export type ASMGroup = Relation | Entity;

// AncestorSearchMemo - should be used to build group hierarchy graph for User entity reference.
// It supports search group entity reference link in the graph.
// Also AncestorSearchMemo supports detection cycle dependencies between groups in the graph.
//
export abstract class AncestorSearchMemo<T extends ASMGroup> {
  protected graph: Graph;

  constructor() {
    this.graph = new Graph({ directed: true });
  }

  isAcyclic(): boolean {
    return alg.isAcyclic(this.graph);
  }

  findCycles(): string[][] {
    return alg.findCycles(this.graph);
  }

  setEdge(parentEntityRef: string, childEntityRef: string) {
    this.graph.setEdge(parentEntityRef, childEntityRef);
  }

  setNode(entityRef: string): void {
    this.graph.setNode(entityRef);
  }

  hasEntityRef(groupRef: string): boolean {
    return this.graph.hasNode(groupRef);
  }

  debugNodesAndEdges(logger: LoggerService, userEntity: string): void {
    logger.debug(
      `SubGraph edges: ${JSON.stringify(this.graph.edges())} for ${userEntity}`,
    );
    logger.debug(
      `SubGraph nodes: ${JSON.stringify(this.graph.nodes())} for ${userEntity}`,
    );
  }

  getNodes(): string[] {
    return this.graph.nodes();
  }

  abstract traverse(
    relation: T,
    allRelations: T[],
    current_depth: number,
  ): void;

  abstract buildUserGraph(): Promise<void>;

  abstract getUserASMGroups(): Promise<T[]>;

  abstract getAllASMGroups(): Promise<T[]>;
}
