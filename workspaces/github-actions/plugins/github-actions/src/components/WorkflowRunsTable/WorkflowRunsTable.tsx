/*
 * Copyright 2020 The Backstage Authors
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
import React from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import RetryIcon from '@material-ui/icons/Replay';
import GitHubIcon from '@material-ui/icons/GitHub';
import { Link as RouterLink } from 'react-router-dom';
import { useWorkflowRuns, WorkflowRun } from '../useWorkflowRuns';
import { WorkflowRunStatus } from '../WorkflowRunStatus';
import SyncIcon from '@material-ui/icons/Sync';
import { buildRouteRef } from '../../routes';
import { getProjectNameFromEntity } from '../getProjectNameFromEntity';
import { Entity } from '@backstage/catalog-model';

import {
  EmptyState,
  Table,
  TableColumn,
  Link,
} from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { getHostnameFromEntity } from '../getHostnameFromEntity';
import { getStatusDescription } from '../WorkflowRunStatus/WorkflowRunStatus';

const generatedColumns: TableColumn<Partial<WorkflowRun>>[] = [
  {
    title: 'ID',
    field: 'id',
    type: 'numeric',
    width: '150px',
  },
  {
    title: 'Message',
    field: 'message',
    highlight: true,
    render: row => {
      const LinkWrapper = () => {
        const routeLink = useRouteRef(buildRouteRef);
        return (
          <Link component={RouterLink} to={routeLink({ id: row.id! })}>
            {row.message}
          </Link>
        );
      };

      return <LinkWrapper />;
    },
  },
  {
    title: 'Source',
    render: row => (
      <Typography variant="body2" noWrap>
        <Typography paragraph variant="body2">
          {row.source?.branchName}
        </Typography>
        <Typography paragraph variant="body2">
          {row.source?.commit.hash}
        </Typography>
      </Typography>
    ),
  },
  {
    title: 'Workflow',
    field: 'workflowName',
  },
  {
    title: 'Status',
    customSort: (d1, d2) => {
      return getStatusDescription(d1).localeCompare(getStatusDescription(d2));
    },
    render: row => (
      <Box display="flex" alignItems="center">
        <WorkflowRunStatus status={row.status} conclusion={row.conclusion} />
      </Box>
    ),
  },
  {
    title: 'Actions',
    render: (row: Partial<WorkflowRun>) => (
      <Tooltip title="Rerun workflow">
        <IconButton onClick={row.onReRunClick}>
          <RetryIcon />
        </IconButton>
      </Tooltip>
    ),
    width: '10%',
  },
];

type Props = {
  loading: boolean;
  retry: () => void;
  runs?: WorkflowRun[];
  projectName: string;
  page: number;
  onChangePage: (page: number) => void;
  total: number;
  pageSize: number;
  onChangePageSize: (pageSize: number) => void;
};

export const WorkflowRunsTableView = ({
  projectName,
  loading,
  pageSize,
  page,
  retry,
  runs,
  onChangePage,
  onChangePageSize,
  total,
}: Props) => {
  return (
    <Table
      isLoading={loading}
      options={{ paging: true, pageSize, padding: 'dense' }}
      totalCount={total}
      page={page}
      actions={[
        {
          icon: () => <SyncIcon />,
          tooltip: 'Reload workflow runs',
          isFreeAction: true,
          onClick: () => retry(),
        },
      ]}
      data={runs ?? []}
      onPageChange={onChangePage}
      onRowsPerPageChange={onChangePageSize}
      style={{ width: '100%' }}
      title={
        <Box display="flex" alignItems="center">
          <GitHubIcon />
          <Box mr={1} />
          <Typography variant="h6">{projectName}</Typography>
        </Box>
      }
      columns={generatedColumns}
    />
  );
};

export const WorkflowRunsTable = ({
  entity,
  branch,
}: {
  entity: Entity;
  branch?: string;
}) => {
  const projectName = getProjectNameFromEntity(entity);
  const hostname = getHostnameFromEntity(entity);
  const [owner, repo] = (projectName ?? '/').split('/');
  const [{ runs, ...tableProps }, { retry, setPage, setPageSize }] =
    useWorkflowRuns({
      hostname,
      owner,
      repo,
      branch,
    });

  const githubHost = hostname || 'github.com';
  const hasNoRuns = !tableProps.loading && !runs;

  return hasNoRuns ? (
    <EmptyState
      missing="data"
      title="No Workflow Data"
      description="This component has GitHub Actions enabled, but no data was found. Have you created any Workflows? Click the button below to create a new Workflow."
      action={
        <Button
          variant="contained"
          color="primary"
          href={`https://${githubHost}/${projectName}/actions/new`}
        >
          Create new Workflow
        </Button>
      }
    />
  ) : (
    <WorkflowRunsTableView
      {...tableProps}
      runs={runs}
      loading={tableProps.loading}
      retry={retry}
      onChangePageSize={setPageSize}
      onChangePage={setPage}
    />
  );
};
