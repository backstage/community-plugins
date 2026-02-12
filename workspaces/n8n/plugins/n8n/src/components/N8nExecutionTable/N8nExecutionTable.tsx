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
import { useApi } from '@backstage/core-plugin-api';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import SyncIcon from '@material-ui/icons/Sync';
import useAsyncRetry from 'react-use/esm/useAsyncRetry';
import { n8nApiRef } from '../../api';
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

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString();
}

function ExecutionStatus(props: { status: N8nExecution['status'] }) {
  switch (props.status) {
    case 'success':
      return <StatusOK>Success</StatusOK>;
    case 'error':
      return <StatusError>Error</StatusError>;
    case 'running':
      return <StatusRunning>Running</StatusRunning>;
    case 'waiting':
      return <StatusPending>Waiting</StatusPending>;
    default:
      return <StatusAborted>Unknown</StatusAborted>;
  }
}

/** @public */
export const N8nExecutionTable = (props: {
  workflowIds: string[];
  limit?: number;
}) => {
  const { workflowIds, limit = 20 } = props;
  const api = useApi(n8nApiRef);

  const {
    value: executions = [],
    loading,
    error,
    retry,
  } = useAsyncRetry(async () => {
    if (workflowIds.length === 0) return [];
    const results = await Promise.all(
      workflowIds.map(id => api.getExecutions(id, limit)),
    );
    return results
      .flat()
      .sort(
        (a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
      );
  }, [workflowIds.join(','), limit]);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  const showWorkflowColumn = workflowIds.length > 1;

  const columns: TableColumn<N8nExecution>[] = [
    {
      title: 'ID',
      field: 'id',
      width: '80px',
    },
    {
      title: 'Status',
      field: 'status',
      render: (row: N8nExecution) => <ExecutionStatus status={row.status} />,
      width: '130px',
    },
    ...(showWorkflowColumn
      ? [
          {
            title: 'Workflow',
            field: 'workflowName' as const,
            render: (row: N8nExecution) => row.workflowName ?? row.workflowId,
          },
        ]
      : []),
    {
      title: 'Started',
      field: 'startedAt',
      defaultSort: 'desc' as const,
      render: (row: N8nExecution) =>
        row.startedAt ? (
          <Tooltip title={new Date(row.startedAt).toLocaleString()}>
            <Typography variant="body2" component="span">
              {formatRelativeTime(row.startedAt)}
            </Typography>
          </Tooltip>
        ) : (
          '-'
        ),
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
      actions={[
        {
          icon: () => <SyncIcon />,
          tooltip: 'Refresh executions',
          isFreeAction: true,
          onClick: () => retry(),
        },
      ]}
      options={{
        padding: 'dense',
        paging: executions.length > 20,
        pageSize: 20,
        search: false,
      }}
    />
  );
};
