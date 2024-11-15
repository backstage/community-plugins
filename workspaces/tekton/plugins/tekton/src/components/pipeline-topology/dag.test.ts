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
import { DAG } from './dag';

describe('dag', () => {
  describe('addVertex:', () => {
    it('should add the vertex to the graph', () => {
      const dag = new DAG();

      dag.addVertex('task1');
      dag.addVertex('task2');

      expect(dag.names).toHaveLength(2);
    });

    it('should skip the duplicate vertex added to the graph', () => {
      const dag = new DAG();

      dag.addVertex('task1');
      dag.addVertex('task1');

      expect(dag.names).toHaveLength(1);
    });
  });

  describe('AddEdge:', () => {
    it('should add the vertex if it not available in the graph', () => {
      const dag = new DAG();

      dag.addEdge('task1', 'task2');
      expect(dag.names).toHaveLength(2);
    });

    it('should add the edges to the graph', () => {
      const dag = new DAG();

      dag.addVertex('task1');
      dag.addVertex('task2');

      dag.addEdge('task1', 'task2');
      expect(dag?.vertices?.get?.('task2')?.dependancyNames).toContain('task1');
    });

    it('should skip the duplicate edges added to the graph', () => {
      const dag = new DAG();

      dag.addVertex('task1');
      dag.addVertex('task2');

      dag.addEdge('task1', 'task2');
      dag.addEdge('task1', 'task2');
      expect(dag?.vertices?.get('task2')?.dependancyNames).toContain('task1');
    });
  });

  describe('AddEdges', () => {
    it('should form the dependancies when addEdges is called with multiple before and after tasks', () => {
      const dag = new DAG();

      dag.addVertex('task1');
      dag.addVertex('task2');
      dag.addVertex('task3');
      dag.addVertex('task4');
      dag.addVertex('task5');

      const runAfter = ['task1', 'task2'];
      const runBefore = ['task4', 'task5'];

      dag.addEdges('task3', { id: 'task3' }, runBefore, runAfter);

      expect(dag?.printGraph())?.toEqual(
        'task1 --> task2 --> task3 --> task4 --> task5',
      );
    });

    it('should throw an error if there is any cycle detected', () => {
      const dag = new DAG();

      dag.addVertex('task1');
      dag.addVertex('task2');
      dag.addVertex('task3');

      const runAfter = ['task1', 'task2'];
      const runBefore = ['task1'];

      expect(() =>
        dag.addEdges('task3', { id: 'task3' }, runBefore, runAfter),
      ).toThrow('cycle detected: task3 --> task1 --> task3');
    });
  });

  it('should print the tasks in topological sort order', () => {
    const dag = new DAG();

    dag.addVertex('task1');
    dag.addVertex('task2');
    dag.addVertex('task3');
    dag.addVertex('task4');

    dag.addEdge('task1', 'task2');
    dag.addEdge('task2', 'task3');
    dag.addEdge('task3', 'task4');

    expect(dag.printGraph()).toEqual('task1 --> task2 --> task3 --> task4');
  });
});
