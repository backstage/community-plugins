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
  TextField,
  TooltipTrigger,
  Tooltip,
  type ColumnConfig,
  type TableItem,
} from '@backstage/ui';
import { RiGithubLine, RiRefreshLine, RiRestartLine } from '@remixicon/react';
import { Link as RouterLink } from 'react-router-dom';
import { fetchWorkflowRuns, WorkflowRun } from '../useWorkflowRuns';
import { WorkflowRunStatus } from '../WorkflowRunStatus';
import { buildRouteRef } from '../../routes';
import { getProjectNameFromEntity } from '../getProjectNameFromEntity';
import { Entity } from '@backstage/catalog-model';

import { EmptyState, Link } from '@backstage/core-components';
import { useApi, useRouteRef, errorApiRef } from '@backstage/core-plugin-api';
import { getHostnameFromEntity } from '../getHostnameFromEntity';
import { useMemo, ReactElement, useState } from 'react';
import { githubActionsApiRef } from '../../api';

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
  hostname?: string;
  owner: string;
  repo: string;
  branch?: string;
  projectName: string;
  title?: string;
};

export const WorkflowRunsTableView = ({
  hostname,
  owner,
  repo,
  branch,
  projectName,
  title,
}: Props) => {
  const api = useApi(githubActionsApiRef);
  const errorApi = useApi(errorApiRef);
  const [searchQuery, setSearchQuery] = useState('');

  const columnConfig = useMemo(() => createColumns(), []);

  const { tableProps, reload } = useTable<WorkflowRun>({
    mode: 'offset',
    getData: async ({ offset, pageSize }) => {
      const page = Math.floor(offset / pageSize) + 1;

      const { runs, totalCount } = await fetchWorkflowRuns({
        api,
        errorApi,
        hostname,
        owner,
        repo,
        branch,
        page,
        pageSize,
      });

      return {
        data: runs,
        totalCount,
      };
    },
    paginationOptions: {
      pageSize: 5,
      pageSizeOptions: [5, 10, 20, 50],
    },
  });

  const filteredData = useMemo(() => {
    if (!searchQuery || !tableProps.data) {
      return tableProps.data;
    }

    const query = searchQuery.toLowerCase();
    return tableProps.data.filter((item: WorkflowRun) => {
      return (
        String(item.id).toLowerCase().includes(query) ||
        item.message?.toLowerCase().includes(query) ||
        item.workflowName?.toLowerCase().includes(query) ||
        item.source?.branchName?.toLowerCase().includes(query) ||
        item.source?.commit.hash?.toLowerCase().includes(query)
      );
    });
  }, [tableProps.data, searchQuery]);

  return (
    <Card>
      <CardHeader>
        <Flex justify="between" align="center">
          <Flex align="center" style={{ gap: 'var(--bui-space-2)' }}>
            {!title && <RiGithubLine size={20} />}
            <Text variant="title-medium">{title || projectName}</Text>
          </Flex>
          <Flex
            align="center"
            style={{ gap: 'var(--bui-space-2)', flexShrink: 0 }}
          >
            <TextField
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Filter..."
              aria-label="Search workflow runs"
              style={{ width: '200px' }}
            />
            <ButtonIcon
              aria-label="Reload workflow runs"
              icon={<RiRefreshLine size={20} />}
              onPress={reload}
              variant="secondary"
            />
          </Flex>
        </Flex>
      </CardHeader>
      <CardBody>
        <Table
          columnConfig={columnConfig}
          {...tableProps}
          data={filteredData}
          emptyState={
            <Text variant="body-medium">
              {searchQuery
                ? 'No matching workflow runs found.'
                : 'No workflow runs found.'}
            </Text>
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

  const githubHost = hostname || 'github.com';

  if (!owner || !repo) {
    return (
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
                'noopener,noreferrer',
              )
            }
          >
            Create new Workflow
          </Button>
        }
      />
    );
  }

  return (
    <WorkflowRunsTableView
      hostname={hostname}
      owner={owner}
      repo={repo}
      branch={branch}
      projectName={projectName ?? ''}
      title={title}
    />
  );
};
