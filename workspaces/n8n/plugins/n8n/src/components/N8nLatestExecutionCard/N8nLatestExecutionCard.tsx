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
  InfoCard,
  Progress,
  StatusAborted,
  StatusError,
  StatusOK,
  StatusPending,
  StatusRunning,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import useAsync from 'react-use/esm/useAsync';
import { n8nApiRef } from '../../api';
import { N8N_ANNOTATION } from '../../constants';
import type { N8nExecution } from '../../api/types';

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

function formatDuration(startedAt: string, stoppedAt: string): string {
  if (!startedAt || !stoppedAt) return '-';
  const start = new Date(startedAt).getTime();
  const stop = new Date(stoppedAt).getTime();
  const durationMs = stop - start;

  if (durationMs < 1000) return `${durationMs}ms`;
  if (durationMs < 60000) return `${Math.round(durationMs / 1000)}s`;
  return `${Math.round(durationMs / 60000)}m`;
}

/** @public */
export const N8nLatestExecutionCard = () => {
  const api = useApi(n8nApiRef);
  const { entity } = useEntity();

  const workflowIds =
    entity.metadata.annotations?.[N8N_ANNOTATION]?.split(',').map(id =>
      id.trim(),
    ) ?? [];

  const firstWorkflowId = workflowIds[0];

  const {
    value: execution,
    loading,
    error,
  } = useAsync(async () => {
    if (!firstWorkflowId) return undefined;
    const executions = await api.getExecutions(firstWorkflowId, 1);
    return executions[0];
  }, [firstWorkflowId]);

  const { value: workflow } = useAsync(async () => {
    if (!firstWorkflowId) return undefined;
    return api.getWorkflow(firstWorkflowId);
  }, [firstWorkflowId]);

  if (loading) {
    return (
      <InfoCard title="n8n - Latest Execution">
        <Progress />
      </InfoCard>
    );
  }

  if (error) {
    return (
      <InfoCard title="n8n - Latest Execution">
        <Typography color="error">
          Failed to load execution: {error.message}
        </Typography>
      </InfoCard>
    );
  }

  if (!execution) {
    return (
      <InfoCard title="n8n - Latest Execution">
        <Typography>No executions found</Typography>
      </InfoCard>
    );
  }

  return (
    <InfoCard title="n8n - Latest Execution">
      <Box display="flex" flexDirection="column" gridGap={8}>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="subtitle2">Workflow</Typography>
          <Typography variant="body2">
            {workflow?.name ?? execution.workflowId}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="subtitle2">Status</Typography>
          <ExecutionStatus status={execution.status} />
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="subtitle2">Started</Typography>
          <Typography variant="body2">
            {new Date(execution.startedAt).toLocaleString()}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="subtitle2">Duration</Typography>
          <Typography variant="body2">
            {formatDuration(execution.startedAt, execution.stoppedAt)}
          </Typography>
        </Box>
      </Box>
    </InfoCard>
  );
};
