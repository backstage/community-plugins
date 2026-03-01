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
import {
  Flex,
  Text,
  Button,
  ButtonIcon,
  TooltipTrigger,
  Tooltip,
} from '@backstage/ui';
import { RiGithubLine, RiRefreshLine, RiRestartLine } from '@remixicon/react';
import { Link as RouterLink } from 'react-router-dom';
import { useWorkflowRuns, WorkflowRun } from '../useWorkflowRuns';
import { WorkflowRunStatus } from '../WorkflowRunStatus';
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

// Utility function to truncate string at the first newline character
const truncateAtNewline = (str: string) => {
  const newlineIndex = str.indexOf('\n');
  return newlineIndex !== -1 ? str.substring(0, newlineIndex) : str;
};

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
        const truncatedMessage = truncateAtNewline(row.message!);
        return (
          <Link
            component={RouterLink}
            to={routeLink({ id: row.id! })}
            title={row.message} // display full message on hover
          >
            {truncatedMessage}
          </Link>
        );
      };

      return <LinkWrapper />;
    },
  },
  {
    title: 'Source',
    render: row => (
      <div>
        <Text variant="body-small">{row.source?.branchName}</Text>
        <Text variant="body-small">{row.source?.commit.hash}</Text>
      </div>
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
      <Flex justify="center" align="center">
        <WorkflowRunStatus status={row.status} conclusion={row.conclusion} />
      </Flex>
    ),
  },
  {
    title: 'Age',
    render: row => (
      <Flex justify="center" align="center">
        <Text title={row.statusDate ?? ''}>{row.statusAge}</Text>
      </Flex>
    ),
  },
  {
    title: 'Actions',
    render: (row: Partial<WorkflowRun>) => (
      <TooltipTrigger>
        <ButtonIcon
          aria-label="Rerun workflow"
          onPress={row.onReRunClick}
          icon={<RiRestartLine size={16} />}
          variant="secondary"
        />
        <Tooltip>Rerun workflow</Tooltip>
      </TooltipTrigger>
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
          icon: () => <RiRefreshLine size={20} />,
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
        <Flex align="center" style={{ gap: 'var(--bui-space-2)' }}>
          <RiGithubLine size={20} />
          <Text variant="title-small">{projectName}</Text>
        </Flex>
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
      fetchAllBranches: false,
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
          variant="primary"
          onClick={() =>
            window.open(
              `https://${githubHost}/${projectName}/actions/new`,
              '_blank',
            )
          }
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
