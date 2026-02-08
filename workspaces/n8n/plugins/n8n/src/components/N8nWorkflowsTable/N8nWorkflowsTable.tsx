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

import { useState } from 'react';
import {
  Progress,
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import SyncIcon from '@material-ui/icons/Sync';
import { n8nApiRef } from '../../api';
import { useWorkflows } from '../../hooks/useWorkflows';
import type { N8nWorkflow } from '../../api/types';

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

/** @public */
export const N8nWorkflowsTable = () => {
  const api = useApi(n8nApiRef);
  const { workflows, loading, error, retry } = useWorkflows();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleToggleActive = async (workflow: N8nWorkflow) => {
    setActionLoading(workflow.id);
    try {
      if (workflow.active) {
        await api.deactivateWorkflow(workflow.id);
      } else {
        await api.activateWorkflow(workflow.id);
      }
      retry();
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  const columns: TableColumn<N8nWorkflow>[] = [
    {
      title: 'Name',
      field: 'name',
      highlight: true,
    },
    {
      title: 'ID',
      field: 'id',
      width: '100px',
    },
    {
      title: 'Status',
      field: 'active',
      render: (row: N8nWorkflow) => (
        <Chip
          label={row.active ? 'Active' : 'Inactive'}
          size="small"
          color={row.active ? 'primary' : 'default'}
          variant={row.active ? 'default' : 'outlined'}
        />
      ),
      width: '120px',
    },
    {
      title: 'Tags',
      sorting: false,
      render: (row: N8nWorkflow) =>
        row.tags && row.tags.length > 0 ? (
          <Box display="flex" flexWrap="wrap" style={{ gap: 4 }}>
            {row.tags.map(tag => (
              <Chip
                key={tag.id}
                label={tag.name}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        ) : (
          '-'
        ),
    },
    {
      title: 'Updated',
      field: 'updatedAt',
      render: (row: N8nWorkflow) => (
        <Tooltip title={new Date(row.updatedAt).toLocaleString()}>
          <Typography variant="body2" component="span">
            {formatRelativeTime(row.updatedAt)}
          </Typography>
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      sorting: false,
      render: (row: N8nWorkflow) => (
        <Tooltip
          title={row.active ? 'Deactivate workflow' : 'Activate workflow'}
        >
          <IconButton
            size="small"
            onClick={() => handleToggleActive(row)}
            disabled={actionLoading === row.id}
          >
            {row.active ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
        </Tooltip>
      ),
      width: '80px',
    },
  ];

  return (
    <Table<N8nWorkflow>
      title="n8n Workflows"
      data={workflows}
      columns={columns}
      actions={[
        {
          icon: () => <SyncIcon />,
          tooltip: 'Refresh workflows',
          isFreeAction: true,
          onClick: () => retry(),
        },
      ]}
      options={{
        padding: 'dense',
        paging: workflows.length > 20,
        pageSize: 20,
        search: true,
      }}
    />
  );
};
