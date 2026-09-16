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
import { Entity } from '@backstage/catalog-model';
import { Link } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import {
  ButtonIcon,
  Card,
  CardBody,
  CardHeader,
  Cell,
  CellText,
  Flex,
  Table,
  Text,
  Tooltip,
  TooltipTrigger,
  useTable,
  type ColumnConfig,
  type TableItem,
} from '@backstage/ui';
import { RiCloudLine, RiRefreshLine, RiRestartLine } from '@remixicon/react';
import { DateTime } from 'luxon';
import { ReactElement, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { buildRouteRef } from '../../routes';
import { getCloudbuildFilter } from '../useCloudBuildFilter';
import { getLocation } from '../useLocation';
import { useProjectName } from '../useProjectName';
import { useWorkflowRuns, WorkflowRun } from '../useWorkflowRuns';
import { WorkflowRunStatus } from '../WorkflowRunStatus';

type WorkflowRunTableItem = WorkflowRun & TableItem;

const createColumns = (): ColumnConfig<WorkflowRunTableItem>[] => [
  {
    id: 'status',
    label: 'Status',
    cell: item => (
      <Cell>
        <WorkflowRunStatus status={item.status} />
      </Cell>
    ),
  },
  {
    id: 'id',
    label: 'Build',
    isRowHeader: true,
    cell: (item): ReactElement => {
      const BuildLink = () => {
        const routeLink = useRouteRef(buildRouteRef);
        return (
          <Link
            component={RouterLink}
            data-testid="cell-source"
            to={routeLink({ id: item.id })}
          >
            {item.id.substring(0, 8)}
          </Link>
        );
      };
      return (
        <Cell>
          <BuildLink />
        </Cell>
      );
    },
  },
  {
    id: 'triggerName',
    label: 'Trigger Name',
    cell: item => <CellText title={item.substitutions.TRIGGER_NAME ?? ''} />,
  },
  {
    id: 'source',
    label: 'Source',
    cell: item => <CellText title={item.message ?? ''} />,
  },
  {
    id: 'ref',
    label: 'Ref',
    cell: item => <CellText title={item.substitutions.REF_NAME ?? ''} />,
  },
  {
    id: 'commit',
    label: 'Commit',
    cell: item => <CellText title={item.substitutions.SHORT_SHA ?? ''} />,
  },
  {
    id: 'created',
    label: 'Created',
    cell: item => (
      <CellText
        data-testid="cell-created"
        title={DateTime.fromISO(item.createTime).toFormat(
          'dd-MM-yyyy hh:mm:ss',
        )}
      />
    ),
  },
  {
    id: 'actions',
    label: 'Actions',
    cell: item => (
      <Cell>
        <TooltipTrigger>
          <ButtonIcon
            aria-label="Rerun workflow"
            data-testid="action-rerun"
            icon={<RiRestartLine size={16} />}
            onPress={item.rerun}
            variant="secondary"
          />
          <Tooltip>Rerun workflow</Tooltip>
        </TooltipTrigger>
      </Cell>
    ),
  },
];

type Props = {
  loading: boolean;
  retry: () => void;
  runs?: WorkflowRun[];
  projectName: string;
  title?: string;
  error?: Error;
};

export const WorkflowRunsTableView = ({
  projectName,
  title,
  loading,
  retry,
  runs,
  error,
}: Props) => {
  const columnConfig = useMemo(() => createColumns(), []);
  const { tableProps } = useTable<WorkflowRunTableItem>({
    mode: 'complete',
    data: runs,
    paginationOptions: {
      pageSize: 5,
      pageSizeOptions: [5, 10, 20, 50],
    },
  });

  return (
    <Card>
      <CardHeader>
        <Flex justify="between" align="center">
          <Flex align="center" gap="2">
            <RiCloudLine size={20} />
            <Text variant="title-medium">{title ?? projectName}</Text>
          </Flex>
          <TooltipTrigger>
            <ButtonIcon
              aria-label="Reload workflow runs"
              icon={<RiRefreshLine size={20} />}
              onPress={retry}
              variant="secondary"
            />
            <Tooltip>Reload workflow runs</Tooltip>
          </TooltipTrigger>
        </Flex>
      </CardHeader>
      <CardBody>
        <Table
          columnConfig={columnConfig}
          {...tableProps}
          isPending={loading}
          error={error}
          emptyState={<Text>No workflow runs found.</Text>}
        />
      </CardBody>
    </Card>
  );
};

export const WorkflowRunsTable = (props: {
  entity: Entity;
  title?: string;
}) => {
  const { value: projectName, loading } = useProjectName(props.entity);
  const [projectId] = (projectName ?? '/').split('/');
  const location = getLocation(props.entity);
  const cloudBuildFilter = getCloudbuildFilter(props.entity);
  const [tableProps, { retry }] = useWorkflowRuns({
    projectId,
    location,
    cloudBuildFilter,
  });

  return (
    <WorkflowRunsTableView
      loading={loading || tableProps.loading}
      projectName={tableProps.projectName}
      title={props.title}
      runs={tableProps.runs}
      error={tableProps.error}
      retry={retry}
    />
  );
};
