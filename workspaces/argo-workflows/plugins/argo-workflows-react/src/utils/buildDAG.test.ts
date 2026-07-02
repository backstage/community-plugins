/*
 * Copyright 2026 The Backstage Authors
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

import type { Workflow } from '@backstage-community/plugin-argo-workflows-common';
import { buildDAG } from './buildDAG';

function makeWorkflow(
  nodes: Record<string, { displayName: string; children?: string[] }>,
): Workflow {
  const statusNodes: Record<string, any> = {};
  for (const [id, def] of Object.entries(nodes)) {
    statusNodes[id] = {
      id,
      name: id,
      displayName: def.displayName,
      type: 'Pod',
      phase: 'Succeeded',
      startedAt: '2024-01-01T00:00:00Z',
      finishedAt: '2024-01-01T00:01:00Z',
      ...(def.children ? { children: def.children } : {}),
    };
  }
  return {
    metadata: {
      name: 'test-wf',
      namespace: 'default',
      uid: 'uid-1',
      creationTimestamp: '2024-01-01T00:00:00Z',
    },
    status: {
      phase: 'Succeeded',
      nodes: statusNodes,
    },
  };
}

describe('buildDAG', () => {
  it('creates a node for each entry in status.nodes', () => {
    const wf = makeWorkflow({
      a: { displayName: 'Step A' },
      b: { displayName: 'Step B' },
      c: { displayName: 'Step C' },
    });

    const dag = buildDAG(wf);
    expect(dag.nodes).toHaveLength(3);
    expect(dag.nodes.map(n => n.id).sort()).toEqual(['a', 'b', 'c']);
  });

  it('creates directed edges for parent→child relationships', () => {
    const wf = makeWorkflow({
      a: { displayName: 'Step A', children: ['b', 'c'] },
      b: { displayName: 'Step B' },
      c: { displayName: 'Step C' },
    });

    const dag = buildDAG(wf);
    expect(dag.edges).toHaveLength(2);
    expect(dag.edges).toContainEqual({ source: 'a', target: 'b' });
    expect(dag.edges).toContainEqual({ source: 'a', target: 'c' });
  });

  it('returns empty graph when status.nodes is undefined', () => {
    const wf: Workflow = {
      metadata: {
        name: 'test-wf',
        namespace: 'default',
        uid: 'uid-1',
        creationTimestamp: '2024-01-01T00:00:00Z',
      },
      status: {
        phase: 'Pending',
      },
    };

    const dag = buildDAG(wf);
    expect(dag.nodes).toHaveLength(0);
    expect(dag.edges).toHaveLength(0);
  });

  it('detects cycles and throws a descriptive error', () => {
    const wf = makeWorkflow({
      a: { displayName: 'Step A', children: ['b'] },
      b: { displayName: 'Step B', children: ['c'] },
      c: { displayName: 'Step C', children: ['a'] },
    });

    expect(() => buildDAG(wf)).toThrow(/[Cc]ycle detected/);
  });

  it('detects self-referencing cycles', () => {
    const wf = makeWorkflow({
      a: { displayName: 'Step A', children: ['a'] },
    });

    expect(() => buildDAG(wf)).toThrow(/[Cc]ycle detected/);
  });

  it('nodes without parents have no incoming edges', () => {
    const wf = makeWorkflow({
      root: { displayName: 'Root', children: ['child1', 'child2'] },
      child1: { displayName: 'Child 1' },
      child2: { displayName: 'Child 2', children: ['grandchild'] },
      grandchild: { displayName: 'Grandchild' },
    });

    const dag = buildDAG(wf);
    const targets = new Set(dag.edges.map(e => e.target));

    // 'root' should not be a target of any edge
    expect(targets.has('root')).toBe(false);

    // 'child1', 'child2', 'grandchild' should be targets
    expect(targets.has('child1')).toBe(true);
    expect(targets.has('child2')).toBe(true);
    expect(targets.has('grandchild')).toBe(true);
  });

  it('calculates duration in seconds when both dates are present', () => {
    const wf = makeWorkflow({
      a: { displayName: 'Step A' },
    });

    const dag = buildDAG(wf);
    // startedAt: 2024-01-01T00:00:00Z, finishedAt: 2024-01-01T00:01:00Z → 60 seconds
    expect(dag.nodes[0].duration).toBe(60);
  });

  it('sets duration to undefined when finishedAt is missing', () => {
    const wf: Workflow = {
      metadata: {
        name: 'test-wf',
        namespace: 'default',
        uid: 'uid-1',
        creationTimestamp: '2024-01-01T00:00:00Z',
      },
      status: {
        phase: 'Running',
        nodes: {
          a: {
            id: 'a',
            name: 'a',
            displayName: 'Step A',
            type: 'Pod',
            phase: 'Running',
            startedAt: '2024-01-01T00:00:00Z',
          },
        },
      },
    };

    const dag = buildDAG(wf);
    expect(dag.nodes[0].duration).toBeUndefined();
  });

  it('maps node properties correctly', () => {
    const wf: Workflow = {
      metadata: {
        name: 'test-wf',
        namespace: 'default',
        uid: 'uid-1',
        creationTimestamp: '2024-01-01T00:00:00Z',
      },
      status: {
        phase: 'Succeeded',
        nodes: {
          'node-1': {
            id: 'node-1',
            name: 'node-1',
            displayName: 'Build Image',
            type: 'Pod',
            phase: 'Succeeded',
            startedAt: '2024-01-01T00:00:00Z',
            finishedAt: '2024-01-01T00:05:00Z',
          },
        },
      },
    };

    const dag = buildDAG(wf);
    expect(dag.nodes[0]).toEqual({
      id: 'node-1',
      label: 'Build Image',
      status: 'Succeeded',
      startedAt: '2024-01-01T00:00:00Z',
      finishedAt: '2024-01-01T00:05:00Z',
      duration: 300,
      type: 'Pod',
    });
  });
});
