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
import { ButtonIcon, Flex, Text, Tooltip, TooltipTrigger } from '@backstage/ui';
import { RiCloudLine, RiRefreshLine, RiRestartLine } from '@remixicon/react';
import { useWorkflowRuns, WorkflowRun } from '../useWorkflowRuns';
import { WorkflowRunStatus } from '../WorkflowRunStatus';
import { useProjectName } from '../useProjectName';
import { Entity } from '@backstage/catalog-model';
import { buildRouteRef } from '../../routes';
import { DateTime } from 'luxon';
import { Table, TableColumn, Link } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { getLocation } from '../useLocation';
import { getCloudbuildFilter } from '../useCloudBuildFilter';
import styles from './WorkflowRunsTable.module.css';

const generatedColumns: TableColumn[] = [
  {
    title: 'Status',
    width: '150px',

    render: (row: Partial<WorkflowRun>) => (
      <Flex align="center">
        <WorkflowRunStatus status={row.status} />
      </Flex>
    ),
  },
  {
    title: 'Build',
    field: 'id',
    type: 'numeric',
    width: '150px',
    render: (row: Partial<WorkflowRun>) => {
      const LinkWrapper = () => {
        const routeLink = useRouteRef(buildRouteRef);
        return (
          <Link data-testid="cell-source" to={routeLink({ id: row.id! })}>
            {row.id?.substring(0, 8)}
          </Link>
        );
      };

      return <LinkWrapper />;
    },
  },
  {
    title: 'Trigger Name',
    render: (row: Partial<WorkflowRun>) => (
      <Text variant="body-medium" style={{ whiteSpace: 'nowrap' }}>
        {row.substitutions?.TRIGGER_NAME}
      </Text>
    ),
  },
  {
    title: 'Source',
    field: 'source',
    highlight: true,
    width: '200px',
    render: (row: Partial<WorkflowRun>) => (
      <Text variant="body-medium" style={{ whiteSpace: 'nowrap' }}>
        {row.message}
      </Text>
    ),
  },
  {
    title: 'Ref',
    render: (row: Partial<WorkflowRun>) => (
      <Text variant="body-medium" style={{ whiteSpace: 'nowrap' }}>
        {row.substitutions?.REF_NAME}
      </Text>
    ),
  },
  {
    title: 'Commit',
    render: (row: Partial<WorkflowRun>) => (
      <Text variant="body-medium" style={{ whiteSpace: 'nowrap' }}>
        {row.substitutions?.SHORT_SHA}
      </Text>
    ),
  },
  {
    title: 'Created',
    render: (row: Partial<WorkflowRun>) => (
      <Text
        data-testid="cell-created"
        variant="body-medium"
        style={{ whiteSpace: 'nowrap' }}
      >
        {DateTime.fromISO(row.createTime ?? DateTime.now().toISO()!).toFormat(
          'dd-MM-yyyy hh:mm:ss',
        )}
      </Text>
    ),
  },
  {
    title: 'Actions',
    render: (row: Partial<WorkflowRun>) => (
      <TooltipTrigger>
        <ButtonIcon
          data-testid="action-rerun"
          aria-label="Rerun workflow"
          variant="tertiary"
          icon={<RiRestartLine />}
          onPress={() => row.rerun?.()}
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
          icon: () => <RiRefreshLine />,
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
        <Flex align="center" gap="2" className={styles.titleRow}>
          <RiCloudLine className={styles.titleIcon} />
          <Text variant="title-small">{projectName}</Text>
        </Flex>
      }
      columns={generatedColumns}
    />
  );
};

export const WorkflowRunsTable = (props: { entity: Entity }) => {
  const { value: projectName, loading } = useProjectName(props.entity);
  const [projectId] = (projectName ?? '/').split('/');
  const location = getLocation(props.entity);
  const cloudBuildFilter = getCloudbuildFilter(props.entity);
  const [tableProps, { retry, setPage, setPageSize }] = useWorkflowRuns({
    projectId,
    location,
    cloudBuildFilter,
  });

  return (
    <WorkflowRunsTableView
      {...tableProps}
      loading={loading || tableProps.loading}
      retry={retry}
      onChangePageSize={setPageSize}
      onChangePage={setPage}
    />
  );
};
