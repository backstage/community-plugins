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

import classNames from 'classnames';
import { Cell, CellText, Flex, Text } from '@backstage/ui';
import type { ColumnConfig } from '@backstage/ui';
import type { SortDescriptor } from 'react-stately';
import { WorkflowStatusIcon } from '@backstage-community/plugin-argo-workflows-react';
import { RiArrowRightSLine } from '@remixicon/react';
import { TaskStatusBar } from './TaskStatusBar';
import { getInstanceTypeIcon } from '../images/icons';
import { formatDuration, formatDate, workflowFullName } from './utils';
import type { WorkflowItem } from './utils';
import styles from './WorkflowRunsTable/WorkflowRunsTable.module.css';

/** Name cell: bold namespace/name with optional instance name below. */
export const NameLabel = ({ item }: { item: WorkflowItem }): JSX.Element => (
  <Flex align="start" direction="column" style={{ gap: 3 }}>
    <Text
      weight="bold"
      className={classNames(styles.textOverflow, styles.nameLabel)}
    >
      {workflowFullName(item)}
    </Text>
    {item.sourceInstance && (
      <Text variant="body-small" color="secondary">
        instance: {item.sourceInstance}
      </Text>
    )}
  </Flex>
);

export const nameColumn: ColumnConfig<WorkflowItem> = {
  id: 'name',
  label: 'Name',
  isRowHeader: true,
  isSortable: true,
  cell: item => (
    <Cell>
      <NameLabel item={item} />
    </Cell>
  ),
};

export const statusColumn: ColumnConfig<WorkflowItem> = {
  id: 'status',
  label: 'Status',
  cell: item => (
    <Cell>
      <WorkflowStatusIcon status={item.status.phase} />
    </Cell>
  ),
};

export const taskStatusColumn: ColumnConfig<WorkflowItem> = {
  id: 'taskStatus',
  label: 'Task Status',
  cell: item => (
    <Cell>
      <TaskStatusBar nodes={item.status.nodes} />
    </Cell>
  ),
};

export const durationColumn: ColumnConfig<WorkflowItem> = {
  id: 'duration',
  label: 'Duration',
  cell: item => (
    <CellText
      title={formatDuration(item.status.startedAt, item.status.finishedAt)}
    />
  ),
};

export const startDateColumn: ColumnConfig<WorkflowItem> = {
  id: 'startDate',
  label: 'Start Date',
  isSortable: true,
  cell: item => <CellText title={formatDate(item.status.startedAt)} />,
};

export const expandColumn = (
  expandedRow: string | null,
): ColumnConfig<WorkflowItem> => ({
  id: 'expand',
  label: '',
  width: 25,
  cell: item => {
    const isExpanded = expandedRow === item.metadata.name;
    return (
      <Cell>
        <RiArrowRightSLine
          aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
          className={styles.expandIndicator}
          data-expanded={isExpanded || undefined}
          size={20}
        />
      </Cell>
    );
  },
});

export const instanceTypeColumn = (
  instanceTypeMap: Map<string, string>,
): ColumnConfig<WorkflowItem> => ({
  id: 'instanceType',
  label: '',
  width: 25,
  cell: item => {
    const instanceType = item.sourceInstance
      ? instanceTypeMap.get(item.sourceInstance)
      : undefined;
    const icon = getInstanceTypeIcon(instanceType);
    return (
      <Cell>
        <div className={styles.instanceIcon}>{icon}</div>
      </Cell>
    );
  },
});

/** Base data columns (without expand/instance type). */
export const baseColumns: ColumnConfig<WorkflowItem>[] = [
  nameColumn,
  statusColumn,
  taskStatusColumn,
  durationColumn,
  startDateColumn,
];

/** Builds the full column config including expand indicator and optional instance type. */
export function buildColumns(
  expandedRow: string | null,
  instanceTypeMap: Map<string, string>,
): ColumnConfig<WorkflowItem>[] {
  const cols: ColumnConfig<WorkflowItem>[] = [expandColumn(expandedRow)];

  if (instanceTypeMap.size > 1) {
    cols.push(instanceTypeColumn(instanceTypeMap));
  }

  cols.push(...baseColumns);
  return cols;
}

/** Sort comparator for the workflow table. */
export function workflowSortFn(
  items: WorkflowItem[],
  sort: SortDescriptor,
): WorkflowItem[] {
  if (!sort) return items;
  const col = String(sort.column);
  const sorted = [...items].sort((a, b) => {
    if (col === 'name') {
      return workflowFullName(a).localeCompare(workflowFullName(b));
    }
    if (col === 'startDate') {
      const dateA = a.status.startedAt
        ? new Date(a.status.startedAt).getTime()
        : 0;
      const dateB = b.status.startedAt
        ? new Date(b.status.startedAt).getTime()
        : 0;
      return dateA - dateB;
    }
    return 0;
  });
  return sort.direction === 'descending' ? sorted.reverse() : sorted;
}
