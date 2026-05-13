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

import { parseWorkflow, formatWorkflow } from './serialization';
import type { Workflow } from './types';

function createValidRawWorkflow(
  overrides?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    metadata: {
      name: 'my-workflow',
      namespace: 'default',
      uid: 'abc-123',
      creationTimestamp: '2024-01-01T00:00:00Z',
    },
    status: {
      phase: 'Succeeded',
      startedAt: '2024-01-01T00:00:00Z',
      finishedAt: '2024-01-01T00:05:00Z',
    },
    ...overrides,
  };
}

describe('parseWorkflow', () => {
  it('parses a valid raw workflow with all required fields', () => {
    const raw = createValidRawWorkflow();
    const result = parseWorkflow(raw);

    expect(result.metadata.name).toBe('my-workflow');
    expect(result.metadata.namespace).toBe('default');
    expect(result.metadata.uid).toBe('abc-123');
    expect(result.status.phase).toBe('Succeeded');
    expect(result.status.startedAt).toBe('2024-01-01T00:00:00Z');
    expect(result.status.finishedAt).toBe('2024-01-01T00:05:00Z');
  });

  it('throws an error when metadata.name is missing', () => {
    const raw = createValidRawWorkflow({
      metadata: { namespace: 'default' },
    });
    expect(() => parseWorkflow(raw)).toThrow('metadata.name');
  });

  it('throws an error when metadata.namespace is missing', () => {
    const raw = createValidRawWorkflow({
      metadata: { name: 'my-workflow' },
    });
    expect(() => parseWorkflow(raw)).toThrow('metadata.namespace');
  });

  it('throws an error when status.phase is missing', () => {
    const raw = createValidRawWorkflow({
      status: { startedAt: '2024-01-01T00:00:00Z' },
    });
    expect(() => parseWorkflow(raw)).toThrow('status.phase');
  });

  it('throws an error listing all missing fields when multiple are absent', () => {
    const raw = { metadata: {}, status: {} };
    expect(() => parseWorkflow(raw)).toThrow('metadata.name');
    expect(() => parseWorkflow(raw)).toThrow('metadata.namespace');
    expect(() => parseWorkflow(raw)).toThrow('status.phase');
  });

  it('throws when metadata is entirely missing', () => {
    const raw = { status: { phase: 'Running' } };
    expect(() => parseWorkflow(raw as Record<string, unknown>)).toThrow(
      'metadata.name',
    );
  });

  it('throws when status is entirely missing', () => {
    const raw = {
      metadata: { name: 'wf', namespace: 'ns' },
    };
    expect(() => parseWorkflow(raw as Record<string, unknown>)).toThrow(
      'status.phase',
    );
  });

  it('throws when status.phase is an invalid value', () => {
    const raw = createValidRawWorkflow({
      status: { phase: 'InvalidPhase' },
    });
    expect(() => parseWorkflow(raw)).toThrow('status.phase');
  });

  it('silently ignores unknown fields', () => {
    const raw = createValidRawWorkflow({
      unknownTopLevel: 'should be ignored',
      metadata: {
        name: 'my-workflow',
        namespace: 'default',
        uid: 'abc-123',
        creationTimestamp: '2024-01-01T00:00:00Z',
        unknownMetaField: 42,
      },
      status: {
        phase: 'Succeeded',
        unknownStatusField: true,
      },
    });

    const result = parseWorkflow(raw);
    expect(result.metadata.name).toBe('my-workflow');
    expect(result.status.phase).toBe('Succeeded');
    // Unknown fields should not appear on the result
    expect(
      (result as unknown as Record<string, unknown>).unknownTopLevel,
    ).toBeUndefined();
    expect(
      (result.metadata as unknown as Record<string, unknown>).unknownMetaField,
    ).toBeUndefined();
  });

  it('parses optional metadata fields (labels, annotations)', () => {
    const raw = createValidRawWorkflow({
      metadata: {
        name: 'my-workflow',
        namespace: 'default',
        uid: 'abc-123',
        creationTimestamp: '2024-01-01T00:00:00Z',
        labels: { app: 'my-app' },
        annotations: { note: 'test' },
      },
    });

    const result = parseWorkflow(raw);
    expect(result.metadata.labels).toEqual({ app: 'my-app' });
    expect(result.metadata.annotations).toEqual({ note: 'test' });
  });

  it('parses status.nodes correctly', () => {
    const raw = createValidRawWorkflow({
      status: {
        phase: 'Succeeded',
        nodes: {
          'node-1': {
            id: 'node-1',
            name: 'step-1',
            displayName: 'Step 1',
            type: 'Pod',
            phase: 'Succeeded',
            startedAt: '2024-01-01T00:00:00Z',
            finishedAt: '2024-01-01T00:01:00Z',
            children: ['node-2'],
            templateName: 'my-template',
          },
          'node-2': {
            id: 'node-2',
            name: 'step-2',
            displayName: 'Step 2',
            type: 'Pod',
            phase: 'Running',
            message: 'In progress',
          },
        },
      },
    });

    const result = parseWorkflow(raw);
    expect(result.status.nodes).toBeDefined();
    expect(Object.keys(result.status.nodes!)).toHaveLength(2);

    const node1 = result.status.nodes!['node-1'];
    expect(node1.id).toBe('node-1');
    expect(node1.displayName).toBe('Step 1');
    expect(node1.type).toBe('Pod');
    expect(node1.phase).toBe('Succeeded');
    expect(node1.children).toEqual(['node-2']);
    expect(node1.templateName).toBe('my-template');

    const node2 = result.status.nodes!['node-2'];
    expect(node2.message).toBe('In progress');
  });
});

describe('formatWorkflow', () => {
  it('formats a workflow into a plain JSON object', () => {
    const workflow: Workflow = {
      metadata: {
        name: 'my-workflow',
        namespace: 'default',
        uid: 'abc-123',
        creationTimestamp: '2024-01-01T00:00:00Z',
      },
      status: {
        phase: 'Succeeded',
        startedAt: '2024-01-01T00:00:00Z',
        finishedAt: '2024-01-01T00:05:00Z',
      },
    };

    const result = formatWorkflow(workflow);
    expect(result).toEqual({
      metadata: {
        name: 'my-workflow',
        namespace: 'default',
        uid: 'abc-123',
        creationTimestamp: '2024-01-01T00:00:00Z',
      },
      status: {
        phase: 'Succeeded',
        startedAt: '2024-01-01T00:00:00Z',
        finishedAt: '2024-01-01T00:05:00Z',
      },
    });
  });

  it('includes optional metadata fields when present', () => {
    const workflow: Workflow = {
      metadata: {
        name: 'wf',
        namespace: 'ns',
        uid: 'uid',
        creationTimestamp: '2024-01-01T00:00:00Z',
        labels: { env: 'prod' },
        annotations: { note: 'important' },
      },
      status: { phase: 'Pending' },
    };

    const result = formatWorkflow(workflow);
    const meta = result.metadata as Record<string, unknown>;
    expect(meta.labels).toEqual({ env: 'prod' });
    expect(meta.annotations).toEqual({ note: 'important' });
  });

  it('omits optional fields when they are undefined', () => {
    const workflow: Workflow = {
      metadata: {
        name: 'wf',
        namespace: 'ns',
        uid: 'uid',
        creationTimestamp: '2024-01-01T00:00:00Z',
      },
      status: { phase: 'Pending' },
    };

    const result = formatWorkflow(workflow);
    const status = result.status as Record<string, unknown>;
    expect(status.startedAt).toBeUndefined();
    expect(status.finishedAt).toBeUndefined();
    expect(status.message).toBeUndefined();
    expect(status.nodes).toBeUndefined();
  });

  it('formats nodes correctly', () => {
    const workflow: Workflow = {
      metadata: {
        name: 'wf',
        namespace: 'ns',
        uid: 'uid',
        creationTimestamp: '2024-01-01T00:00:00Z',
      },
      status: {
        phase: 'Succeeded',
        nodes: {
          n1: {
            id: 'n1',
            name: 'step-1',
            displayName: 'Step 1',
            type: 'Pod',
            phase: 'Succeeded',
            children: ['n2'],
          },
          n2: {
            id: 'n2',
            name: 'step-2',
            displayName: 'Step 2',
            type: 'Pod',
            phase: 'Succeeded',
          },
        },
      },
    };

    const result = formatWorkflow(workflow);
    const nodes = (result.status as Record<string, unknown>).nodes as Record<
      string,
      unknown
    >;
    expect(Object.keys(nodes)).toHaveLength(2);
    expect((nodes.n1 as Record<string, unknown>).children).toEqual(['n2']);
  });
});

describe('round-trip: parseWorkflow(formatWorkflow(w))', () => {
  it('produces an equivalent workflow for a minimal valid workflow', () => {
    const workflow: Workflow = {
      metadata: {
        name: 'wf',
        namespace: 'ns',
        uid: 'uid-1',
        creationTimestamp: '2024-01-01T00:00:00Z',
      },
      status: { phase: 'Running' },
    };

    const roundTripped = parseWorkflow(formatWorkflow(workflow));
    expect(roundTripped).toEqual(workflow);
  });

  it('produces an equivalent workflow with nodes', () => {
    const workflow: Workflow = {
      metadata: {
        name: 'wf',
        namespace: 'ns',
        uid: 'uid-1',
        creationTimestamp: '2024-01-01T00:00:00Z',
        labels: { app: 'test' },
      },
      status: {
        phase: 'Succeeded',
        startedAt: '2024-01-01T00:00:00Z',
        finishedAt: '2024-01-01T00:05:00Z',
        message: 'done',
        nodes: {
          n1: {
            id: 'n1',
            name: 'step-1',
            displayName: 'Step 1',
            type: 'Pod',
            phase: 'Succeeded',
            startedAt: '2024-01-01T00:00:00Z',
            finishedAt: '2024-01-01T00:01:00Z',
            children: ['n2'],
            templateName: 'tmpl',
            message: 'ok',
          },
          n2: {
            id: 'n2',
            name: 'step-2',
            displayName: 'Step 2',
            type: 'Steps',
            phase: 'Succeeded',
          },
        },
      },
    };

    const roundTripped = parseWorkflow(formatWorkflow(workflow));
    expect(roundTripped).toEqual(workflow);
  });
});
