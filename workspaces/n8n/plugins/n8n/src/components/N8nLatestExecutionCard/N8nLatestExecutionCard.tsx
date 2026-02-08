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
import Chip from '@material-ui/core/Chip';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import useAsync from 'react-use/esm/useAsync';
import { n8nApiRef } from '../../api';
import { N8N_ANNOTATION } from '../../constants';
import type { N8nExecution } from '../../api/types';

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

function statusColor(status: N8nExecution['status']): string {
  switch (status) {
    case 'success':
      return '#388e3c';
    case 'error':
      return '#d32f2f';
    case 'running':
      return '#1976d2';
    case 'waiting':
      return '#f57c00';
    default:
      return '#757575';
  }
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

function formatDuration(startedAt: string, stoppedAt: string): string {
  if (!startedAt || !stoppedAt) return '-';
  const start = new Date(startedAt).getTime();
  const stop = new Date(stoppedAt).getTime();
  const durationMs = stop - start;

  if (durationMs < 1000) return `${durationMs}ms`;
  if (durationMs < 60000) return `${Math.round(durationMs / 1000)}s`;
  return `${Math.round(durationMs / 60000)}m`;
}

const useStyles = makeStyles(theme => ({
  cardContent: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  statusBar: {
    borderRadius: 4,
    padding: theme.spacing(1.5, 2),
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusText: {
    color: '#fff',
    fontWeight: 600,
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 0),
  },
  label: {
    color: theme.palette.text.secondary,
    fontWeight: 500,
  },
}));

/** @public */
export const N8nLatestExecutionCard = () => {
  const classes = useStyles();
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
      <InfoCard title="n8n - Latest Execution" variant="gridItem">
        <Progress />
      </InfoCard>
    );
  }

  if (error) {
    return (
      <InfoCard title="n8n - Latest Execution" variant="gridItem">
        <Typography color="error">
          Failed to load execution: {error.message}
        </Typography>
      </InfoCard>
    );
  }

  if (!execution) {
    return (
      <InfoCard title="n8n - Latest Execution" variant="gridItem">
        <Typography>No executions found</Typography>
      </InfoCard>
    );
  }

  const bgColor = statusColor(execution.status);

  return (
    <InfoCard title="n8n - Latest Execution" variant="gridItem">
      <Box className={classes.cardContent}>
        <Box className={classes.statusBar} style={{ backgroundColor: bgColor }}>
          <Typography variant="body2" className={classes.statusText}>
            {workflow?.name ?? execution.workflowId}
          </Typography>
          <Chip
            label={execution.status.toUpperCase()}
            size="small"
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              fontWeight: 600,
            }}
          />
        </Box>

        <Box className={classes.row}>
          <Typography variant="body2" className={classes.label}>
            Status
          </Typography>
          <ExecutionStatus status={execution.status} />
        </Box>
        <Divider />

        <Box className={classes.row}>
          <Typography variant="body2" className={classes.label}>
            Started
          </Typography>
          <Tooltip title={new Date(execution.startedAt).toLocaleString()}>
            <Typography variant="body2">
              {formatRelativeTime(execution.startedAt)}
            </Typography>
          </Tooltip>
        </Box>
        <Divider />

        <Box className={classes.row}>
          <Typography variant="body2" className={classes.label}>
            Duration
          </Typography>
          <Typography variant="body2">
            {formatDuration(execution.startedAt, execution.stoppedAt)}
          </Typography>
        </Box>
        <Divider />

        <Box className={classes.row}>
          <Typography variant="body2" className={classes.label}>
            Mode
          </Typography>
          <Chip label={execution.mode} size="small" variant="outlined" />
        </Box>
        <Divider />

        <Box className={classes.row}>
          <Typography variant="body2" className={classes.label}>
            Workflows
          </Typography>
          <Typography variant="body2">
            {workflowIds.length} configured
          </Typography>
        </Box>
      </Box>
    </InfoCard>
  );
};
