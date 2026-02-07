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

import {
  Progress,
  ResponseErrorPanel,
  StatusAborted,
  StatusError,
  StatusOK,
  StatusPending,
  StatusRunning,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { useExecutions } from '../../hooks/useExecutions';
import type { N8nExecution } from '../../api/types';

function formatDuration(startedAt: string, stoppedAt: string): string {
  if (!startedAt || !stoppedAt) return '-';
  const start = new Date(startedAt).getTime();
  const stop = new Date(stoppedAt).getTime();
  const durationMs = stop - start;

  if (durationMs < 1000) return `${durationMs}ms`;
  if (durationMs < 60000) return `${Math.round(durationMs / 1000)}s`;
  return `${Math.round(durationMs / 60000)}m`;
}

function ExecutionStatusIcon(props: { status: N8nExecution['status'] }) {
  switch (props.status) {
    case 'success':
      return <StatusOK />;
    case 'error':
      return <StatusError />;
    case 'running':
      return <StatusRunning />;
    case 'waiting':
      return <StatusPending />;
    default:
      return <StatusAborted />;
  }
}

/** @public */
export const N8nExecutionTable = (props: {
  workflowId: string;
  limit?: number;
}) => {
  const { workflowId, limit } = props;
  const { executions, loading, error } = useExecutions(workflowId, limit);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  const columns: TableColumn<N8nExecution>[] = [
    {
      title: 'ID',
      field: 'id',
      width: '100px',
    },
    {
      title: 'Status',
      field: 'status',
      render: (row: N8nExecution) => (
        <ExecutionStatusIcon status={row.status} />
      ),
      width: '80px',
    },
    {
      title: 'Started',
      field: 'startedAt',
      render: (row: N8nExecution) =>
        row.startedAt ? new Date(row.startedAt).toLocaleString() : '-',
    },
    {
      title: 'Duration',
      sorting: false,
      render: (row: N8nExecution) =>
        formatDuration(row.startedAt, row.stoppedAt),
      width: '100px',
    },
    {
      title: 'Mode',
      field: 'mode',
      width: '100px',
    },
  ];

  return (
    <Table<N8nExecution>
      title="Executions"
      data={executions}
      columns={columns}
      options={{
        padding: 'dense',
        paging: executions.length > 20,
        pageSize: 20,
        search: false,
      }}
    />
  );
};
