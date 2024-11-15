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
export interface Vertex {
  name: string;
  level: number;
  dependancy: { [key: string]: any };
  dependancyNames: string[];
  hasOutgoing: boolean;
  data: any;
}

type Vertices = Map<string, Vertex>;

export class DAG {
  names: string[];

  vertices: Vertices;

  constructor() {
    this.names = [];
    this.vertices = new Map();
  }

  private visit(
    vertex: Vertex,
    fn: (v: Vertex, path: string[]) => void,
    visited?: any,
    path?: string[],
  ) {
    const { name } = vertex;
    const vertices = vertex.dependancy;
    const names = vertex.dependancyNames;
    const len = names.length;

    if (!visited) {
      // eslint-disable-next-line no-param-reassign
      visited = new Map();
    }
    if (!path) {
      // eslint-disable-next-line no-param-reassign
      path = [];
    }
    if (visited.has(name)) {
      return;
    }
    path.push(name);
    visited.set(name, true);
    for (let i = 0; i < len; i++) {
      this.visit(vertices[names[i]], fn, visited, path);
    }
    fn(vertex, path);
    path.pop();
  }

  private map(name: string, data: any) {
    const vertex = this.addVertex(name) as Vertex;
    vertex.data = data;
  }

  addVertex(name: string) {
    if (!name) {
      return null;
    }
    if (this.vertices.has(name)) {
      return this.vertices.get(name);
    }

    const vertex: Vertex = {
      name,
      level: 0,
      dependancy: {},
      dependancyNames: [],
      hasOutgoing: false,
      data: {},
    };
    this.vertices.set(name, vertex);
    this.names.push(name);
    return vertex;
  }

  addEdge(source: string, target: string): void {
    if (!source || !target || source === target) {
      return;
    }
    const fromNode = this.addVertex(source) as Vertex;
    const toNode = this.addVertex(target) as Vertex;

    if (toNode.dependancy[source]) {
      return;
    }

    const printPath = (path: string[], tar: string): string => {
      const reversedPath = [...path].reverse();
      return `${reversedPath.join(' --> ')} --> ${tar}`;
    };

    const checkCycle = (vertex: Vertex, path: string[]) => {
      if (vertex.name === target) {
        throw new Error(`cycle detected: ${printPath(path, target)}`);
      } else {
        vertex.level = path.length;
      }
    };
    this.visit(fromNode, checkCycle);
    fromNode.hasOutgoing = true;
    toNode.dependancy[source] = fromNode;
    toNode.dependancyNames.push(source);
  }

  addEdges(
    name: string,
    data: any,
    before: string | string[],
    after: string | string[],
  ): void {
    this.map(name, data);

    if (before) {
      if (typeof before === 'string') {
        this.addEdge(name, before);
      } else {
        before.forEach(b => this.addEdge(name, b));
      }
    }
    if (after) {
      if (typeof after === 'string') {
        this.addEdge(after, name);
      } else {
        after.forEach(a => this.addEdge(a, name));
      }
    }
  }

  topologicalSort(fn: any): void {
    const visited = new Map();
    const { vertices } = this;
    const { names } = this;
    const len = names.length;

    for (let i = 0; i < len; i++) {
      const vertex = vertices.get(names[i]) as Vertex;
      if (!vertex.hasOutgoing) {
        this.visit(vertex, fn, visited);
      }
    }
  }

  printGraph() {
    const orderedNodes: string[] = [];
    this.topologicalSort((v: Vertex, t: string) => {
      v.data.stage = this.names.length - t.length;
      orderedNodes.push(v.name);
    });
    // eslint-disable-next-line no-console
    console.log(orderedNodes.join(' --> '));
    return orderedNodes.join(' --> ');
  }
}
