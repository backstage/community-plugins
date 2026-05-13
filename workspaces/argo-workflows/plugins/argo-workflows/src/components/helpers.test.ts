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

import { buildColumns, workflowSortFn, baseColumns } from './helpers';
import { makeWorkflowItem } from './testUtils';

describe('baseColumns', () => {
  it('contains 5 data columns', () => {
    expect(baseColumns).toHaveLength(5);
  });

  it('has the expected column ids', () => {
    const ids = baseColumns.map(c => c.id);
    expect(ids).toEqual([
      'name',
      'status',
      'taskStatus',
      'duration',
      'startDate',
    ]);
  });

  it('marks name as sortable row header', () => {
    const nameCol = baseColumns.find(c => c.id === 'name');
    expect(nameCol?.isRowHeader).toBe(true);
    expect(nameCol?.isSortable).toBe(true);
  });

  it('marks startDate as sortable', () => {
    const col = baseColumns.find(c => c.id === 'startDate');
    expect(col?.isSortable).toBe(true);
  });
});

describe('buildColumns', () => {
  it('includes expand + base columns when single instance', () => {
    const singleInstance = new Map([['main', 'argo-api']]);
    const cols = buildColumns(null, singleInstance);
    // expand + 5 base = 6
    expect(cols).toHaveLength(6);
    expect(cols[0].id).toBe('expand');
    expect(cols[1].id).toBe('name');
  });

  it('includes expand + instanceType + base columns when multiple instances', () => {
    const multiInstance = new Map([
      ['argo-server', 'argo-api'],
      ['k8s-prod', 'kubernetes'],
    ]);
    const cols = buildColumns(null, multiInstance);
    // expand + instanceType + 5 base = 7
    expect(cols).toHaveLength(7);
    expect(cols[0].id).toBe('expand');
    expect(cols[1].id).toBe('instanceType');
    expect(cols[2].id).toBe('name');
  });

  it('does not include instanceType when map is empty', () => {
    const cols = buildColumns(null, new Map());
    expect(cols.find(c => c.id === 'instanceType')).toBeUndefined();
  });
});

describe('workflowSortFn', () => {
  const items = [
    makeWorkflowItem({
      name: 'beta',
      namespace: 'ns-b',
      startedAt: '2024-01-02T00:00:00Z',
    }),
    makeWorkflowItem({
      name: 'alpha',
      namespace: 'ns-a',
      startedAt: '2024-01-01T00:00:00Z',
    }),
    makeWorkflowItem({
      name: 'gamma',
      namespace: 'ns-a',
      startedAt: '2024-01-03T00:00:00Z',
    }),
  ];

  it('sorts by name ascending (uses full namespace/name)', () => {
    const sorted = workflowSortFn(items, {
      column: 'name',
      direction: 'ascending',
    });
    // Sorted by "namespace/name": ns-a/alpha, ns-a/gamma, ns-b/beta
    expect(sorted.map(i => i.metadata.name)).toEqual([
      'alpha',
      'gamma',
      'beta',
    ]);
  });

  it('sorts by name descending', () => {
    const sorted = workflowSortFn(items, {
      column: 'name',
      direction: 'descending',
    });
    expect(sorted.map(i => i.metadata.name)).toEqual([
      'beta',
      'gamma',
      'alpha',
    ]);
  });

  it('sorts by startDate ascending', () => {
    const sorted = workflowSortFn(items, {
      column: 'startDate',
      direction: 'ascending',
    });
    expect(sorted.map(i => i.metadata.name)).toEqual([
      'alpha',
      'beta',
      'gamma',
    ]);
  });

  it('sorts by startDate descending', () => {
    const sorted = workflowSortFn(items, {
      column: 'startDate',
      direction: 'descending',
    });
    expect(sorted.map(i => i.metadata.name)).toEqual([
      'gamma',
      'beta',
      'alpha',
    ]);
  });

  it('sorts by name using full namespace/name for disambiguation', () => {
    const nsItems = [
      makeWorkflowItem({ name: 'wf', namespace: 'z-ns' }),
      makeWorkflowItem({ name: 'wf', namespace: 'a-ns' }),
    ];
    const sorted = workflowSortFn(nsItems, {
      column: 'name',
      direction: 'ascending',
    });
    expect(sorted.map(i => i.metadata.namespace)).toEqual(['a-ns', 'z-ns']);
  });

  it('returns items unchanged for unknown column', () => {
    const sorted = workflowSortFn(items, {
      column: 'unknown',
      direction: 'ascending',
    });
    expect(sorted.map(i => i.metadata.name)).toEqual([
      'beta',
      'alpha',
      'gamma',
    ]);
  });

  it('does not mutate the original array', () => {
    const original = [...items];
    workflowSortFn(items, { column: 'name', direction: 'ascending' });
    expect(items.map(i => i.metadata.name)).toEqual(
      original.map(i => i.metadata.name),
    );
  });
});
