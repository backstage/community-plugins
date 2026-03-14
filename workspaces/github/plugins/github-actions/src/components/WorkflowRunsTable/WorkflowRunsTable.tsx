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
  Card,
  CardHeader,
  CardBody,
  Cell,
  CellText,
  Table,
  useTable,
  type ColumnConfig,
  type TableItem,
} from '@backstage/ui';
import { RiGithubLine, RiRefreshLine, RiRestartLine } from '@remixicon/react';
import { Link as RouterLink } from 'react-router-dom';
import { useWorkflowRuns, WorkflowRun } from '../useWorkflowRuns';
import { WorkflowRunStatus } from '../WorkflowRunStatus';
import { buildRouteRef } from '../../routes';
import { getProjectNameFromEntity } from '../getProjectNameFromEntity';
import { Entity } from '@backstage/catalog-model';
import { TooltipTrigger, Tooltip } from 'react-aria-components';

import { EmptyState, Link } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { getHostnameFromEntity } from '../getHostnameFromEntity';
import { useMemo, ReactElement } from 'react';

type WorkflowRunWithId = WorkflowRun & TableItem;

// Utility function to truncate string at the first newline character
const truncateAtNewline = (str: string) => {
  const newlineIndex = str.indexOf('\n');
  return newlineIndex !== -1 ? str.substring(0, newlineIndex) : str;
};

const createColumns = (): ColumnConfig<WorkflowRunWithId>[] => [
  {
    id: 'id',
    label: 'ID',
    isRowHeader: true,
    cell: (item): ReactElement => {
      const text = String(item.id);
      return <CellText title={text}>{text}</CellText>;
    },
  },
  {
    id: 'message',
    label: 'Message',
    cell: (item): ReactElement => {
      const LinkWrapper = () => {
        const routeLink = useRouteRef(buildRouteRef);
        const truncatedMessage = truncateAtNewline(item.message!);
        return (
          <Link
            component={RouterLink}
            to={routeLink({ id: item.id! })}
            title={item.message}
          >
            {truncatedMessage}
          </Link>
        );
      };

      return (
        <Cell>
          <LinkWrapper />
        </Cell>
      );
    },
  },
  {
    id: 'source',
    label: 'Source',
    cell: (item): ReactElement => (
      <Cell>
        <Flex direction="column">
          <Text variant="body-small">{item.source?.branchName}</Text>
          <Text variant="body-small">{item.source?.commit.hash}</Text>
        </Flex>
      </Cell>
    ),
  },
  {
    id: 'workflowName',
    label: 'Workflow',
    cell: (item): ReactElement => {
      const text = item.workflowName || '';
      return <CellText title={text}>{text}</CellText>;
    },
  },
  {
    id: 'status',
    label: 'Status',
    cell: (item): ReactElement => (
      <Cell>
        <Flex justify="center" align="center">
          <WorkflowRunStatus
            status={item.status}
            conclusion={item.conclusion}
          />
        </Flex>
      </Cell>
    ),
  },
  {
    id: 'age',
    label: 'Age',
    cell: (item): ReactElement => (
      <Cell>
        <Flex justify="center" align="center">
          <Text title={item.statusDate ?? ''}>{item.statusAge}</Text>
        </Flex>
      </Cell>
    ),
  },
  {
    id: 'actions',
    label: 'Actions',
    cell: (item): ReactElement => (
      <Cell>
        <TooltipTrigger>
          <ButtonIcon
            aria-label="Rerun workflow"
            onPress={item.onReRunClick}
            icon={<RiRestartLine size={16} />}
            variant="secondary"
          />
          <Tooltip>Rerun workflow</Tooltip>
        </TooltipTrigger>
      </Cell>
    ),
  },
];

type Props = {
  runs?: WorkflowRun[];
  projectName: string;
  loading: boolean;
  retry: () => void;
  title?: string;
};

export const WorkflowRunsTableView = ({
  projectName,
  loading,
  retry,
  runs,
  title,
}: Props) => {
  const runsWithId: WorkflowRunWithId[] = useMemo(
    () =>
      (runs || []).map((run, index) => ({
        ...run,
        id: run.id || `run-${index}`,
      })),
    [runs],
  );

  const columnConfig = useMemo(() => createColumns(), []);

  const { tableProps } = useTable({
    mode: 'complete',
    data: runsWithId,
    paginationOptions: {
      pageSize: 5,
      pageSizeOptions: [5, 10, 20, 50],
    },
  });

  return (
    <Card>
      <CardHeader>
        <Flex justify="between" align="center">
          <Flex align="center" style={{ gap: 'var(--bui-space-2)' }}>
            {!title && <RiGithubLine size={20} />}
            <Text variant="title-medium">{title || projectName}</Text>
          </Flex>
          <ButtonIcon
            aria-label="Reload workflow runs"
            icon={<RiRefreshLine size={20} />}
            onPress={retry}
            variant="secondary"
          />
        </Flex>
      </CardHeader>
      <CardBody>
        <Table
          columnConfig={columnConfig}
          {...tableProps}
          loading={loading}
          emptyState={
            <Text variant="body-medium">No workflow runs found.</Text>
          }
        />
      </CardBody>
    </Card>
  );
};

export const WorkflowRunsTable = ({
  entity,
  branch,
  title,
}: {
  entity: Entity;
  branch?: string;
  title?: string;
}) => {
  const projectName = getProjectNameFromEntity(entity);
  const hostname = getHostnameFromEntity(entity);
  const [owner, repo] = (projectName ?? '/').split('/');
  const [{ runs, loading }, { retry }] = useWorkflowRuns({
    hostname,
    owner,
    repo,
    branch,
    fetchAllBranches: false,
  });

  const githubHost = hostname || 'github.com';
  const hasNoRuns = !loading && !runs;

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
      runs={runs}
      loading={loading}
      retry={retry}
      projectName={projectName ?? ''}
      title={title}
    />
  );
};
