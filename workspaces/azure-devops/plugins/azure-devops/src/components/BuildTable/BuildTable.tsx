/*
 * Copyright 2021 The Backstage Authors
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
import { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Cell,
  CellText,
  Flex,
  Link,
  SearchField,
  Skeleton,
  Table,
  Text,
  useTable,
  type ColumnConfig,
} from '@backstage/ui';
import {
  BuildResult,
  BuildRun,
  BuildStatus,
} from '@backstage-community/plugin-azure-devops-common';
import {
  ResponseErrorPanel,
  StatusAborted,
  StatusError,
  StatusOK,
  StatusPending,
  StatusRunning,
  StatusWarning,
} from '@backstage/core-components';

import { DateTime } from 'luxon';
import { getDurationFromDates } from '../../utils/getDurationFromDates';
import { BuildLogDrawer } from './lib/BuildLogDrawer';
import { EmptyBuildResults } from './lib/EmptyBuildResults';
import { Entity } from '@backstage/catalog-model';
import { RiSpaceShip2Line } from '@remixicon/react';

export const getBuildResultComponent = (result: number | undefined) => {
  switch (result) {
    case BuildResult.Succeeded:
      return (
        <Flex align="center" gap="small">
          <StatusOK />
          <Text style={{ marginTop: '5px' }}>Succeeded</Text>
        </Flex>
      );
    case BuildResult.PartiallySucceeded:
      return (
        <Flex align="center" gap="small">
          <StatusWarning />
          <Text style={{ marginTop: '5px' }}>Partially Succeeded</Text>
        </Flex>
      );
    case BuildResult.Failed:
      return (
        <Flex align="center" gap="small">
          <StatusError />
          <Text style={{ marginTop: '5px' }}>Failed</Text>
        </Flex>
      );
    case BuildResult.Canceled:
      return (
        <Flex align="center" gap="small">
          <StatusAborted />
          <Text style={{ marginTop: '5px' }}>Canceled</Text>
        </Flex>
      );
    case BuildResult.None:
    default:
      return (
        <Flex align="center" gap="small">
          <StatusWarning />
          <Text style={{ marginTop: '5px' }}>Unknown</Text>
        </Flex>
      );
  }
};

export const getBuildStateComponent = (
  status: number | undefined,
  result: number | undefined,
) => {
  switch (status) {
    case BuildStatus.InProgress:
      return (
        <Flex align="center" gap="small">
          <StatusRunning />
          <Text style={{ marginTop: '5px' }}>In Progress</Text>
        </Flex>
      );
    case BuildStatus.Completed:
      return getBuildResultComponent(result);
    case BuildStatus.Cancelling:
      return (
        <Flex align="center" gap="small">
          <StatusAborted />
          <Text style={{ marginTop: '5px' }}>Cancelling</Text>
        </Flex>
      );
    case BuildStatus.Postponed:
      return (
        <Flex align="center" gap="small">
          <StatusPending />
          <Text style={{ marginTop: '5px' }}>Postponed</Text>
        </Flex>
      );
    case BuildStatus.NotStarted:
      return (
        <Flex align="center" gap="small">
          <StatusAborted />
          <Text style={{ marginTop: '5px' }}>Not Started</Text>
        </Flex>
      );
    case BuildStatus.None:
    default:
      return (
        <Flex align="center" gap="small">
          <StatusWarning />
          <Text style={{ marginTop: '5px' }}>Unknown</Text>
        </Flex>
      );
  }
};

type BuildTableProps = {
  items?: BuildRun[];
  loading: boolean;
  error?: Error;
  entity?: Entity;
};

type BuildRunWithId = Omit<BuildRun, 'id'> & {
  id: string;
  buildId?: number;
};

export const BuildTable = ({
  items,
  loading,
  error,
  entity,
}: BuildTableProps) => {
  // State for log drawer
  const [selectedBuildId, setSelectedBuildId] = useState<number | undefined>(
    undefined,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOpenDrawer = (buildId?: number) => {
    setSelectedBuildId(buildId);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Cache build logs
  const [logsCache, setLogsCache] = useState<Record<number, string[]>>({});

  const updateLogsCache = (buildId: number, logs: string[]) => {
    setLogsCache(prev => ({
      ...prev,
      [buildId]: logs,
    }));
  };

  // Transform items to include id property required by BUI Table
  const tableData = useMemo(
    () =>
      (items ?? []).map((item, index) => ({
        ...item,
        buildId: item.id,
        id: item.id?.toString() ?? `build-${index}`,
      })),
    [items],
  );

  const columns: ColumnConfig<BuildRunWithId>[] = [
    {
      id: 'buildId',
      label: 'ID',
      isRowHeader: true,
      isSortable: true,
      cell: (row: BuildRunWithId) => (
        <CellText title={row.buildId?.toString() ?? '-'} />
      ),
    },
    {
      id: 'title',
      label: 'Build',
      isSortable: true,
      cell: (row: BuildRunWithId) => (
        <Cell>
          <Link href={row.link ?? ''}>{row.title}</Link>
        </Cell>
      ),
    },
    {
      id: 'source',
      label: 'Source',
      isSortable: true,
      cell: (row: BuildRunWithId) => <CellText title={row.source ?? '-'} />,
    },
    {
      id: 'status',
      label: 'State',
      isSortable: true,
      cell: (row: BuildRunWithId) => (
        <Cell>{getBuildStateComponent(row.status, row.result)}</Cell>
      ),
    },
    {
      id: 'duration',
      label: 'Duration',
      isSortable: false,
      cell: (row: BuildRunWithId) => (
        <CellText title={getDurationFromDates(row.startTime, row.finishTime)} />
      ),
    },
    {
      id: 'queueTime',
      label: 'Age',
      isSortable: true,
      cell: (row: BuildRunWithId) => (
        <CellText
          title={
            (row.queueTime
              ? DateTime.fromISO(row.queueTime)
              : DateTime.now()
            ).toRelative() ?? '-'
          }
        />
      ),
    },
    {
      id: 'logs',
      label: 'Logs',
      isSortable: false,
      cell: (row: BuildRunWithId) => (
        <Cell>
          <Button
            variant="primary"
            size="small"
            onClick={() => handleOpenDrawer(row.buildId)}
            isDisabled={!row.buildId}
          >
            View Logs
          </Button>
        </Cell>
      ),
    },
  ];

  const { tableProps, reload, search } = useTable({
    mode: 'complete',
    getData: () => tableData,
    searchFn: (data, query) => {
      if (!query) return data;
      const lowerQuery = query.toLowerCase();
      return data.filter(
        item =>
          item.buildId?.toString().includes(lowerQuery) ||
          item.title?.toLowerCase().includes(lowerQuery) ||
          item.source?.toLowerCase().includes(lowerQuery),
      );
    },
    sortFn: (data, sort) => {
      if (!sort) return data;

      return [...data].sort((a, b) => {
        const aValue = a[sort.column as keyof BuildRunWithId];
        const bValue = b[sort.column as keyof BuildRunWithId];

        // Handle null/undefined values
        if (!aValue && !bValue) return 0;
        if (!aValue) return sort.direction === 'ascending' ? 1 : -1;
        if (!bValue) return sort.direction === 'ascending' ? -1 : 1;

        // Special handling for dates
        if (sort.column === 'queueTime') {
          const aDate = DateTime.fromISO(String(aValue));
          const bDate = DateTime.fromISO(String(bValue));
          const comparison = aDate.toMillis() - bDate.toMillis();
          return sort.direction === 'ascending' ? comparison : -comparison;
        }

        // Special handling for numbers (buildId)
        if (sort.column === 'buildId') {
          const comparison = Number(aValue) - Number(bValue);
          return sort.direction === 'ascending' ? comparison : -comparison;
        }

        // Compare values as strings
        const comparison = String(aValue).localeCompare(String(bValue));
        return sort.direction === 'ascending' ? comparison : -comparison;
      });
    },
    initialSort: { column: 'queueTime', direction: 'descending' },
  });

  useEffect(() => {
    reload();
  }, [tableData, reload]);

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <Flex align="center" justify="between" gap="small">
            <Flex align="center" gap="small">
              <RiSpaceShip2Line style={{ fontSize: 30 }} />
              <Text
                variant="title-small"
                weight="bold"
                style={{ paddingLeft: '5px' }}
              >
                Azure Pipelines - Builds ({items ? items.length : 0})
              </Text>
            </Flex>
            <Flex justify="end" style={{ flex: '0 0 25%', minWidth: '200px' }}>
              <SearchField
                placeholder="Search builds..."
                value={search.value}
                onChange={search.onChange}
                aria-label="Search builds"
                style={{ width: '100%' }}
              />
            </Flex>
          </Flex>
        </CardHeader>
        <CardBody>
          {loading && (
            <Flex direction="column" gap="3" style={{ width: '100%' }}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Flex
                  key={index}
                  gap="4"
                  align="center"
                  style={{ width: '100%' }}
                >
                  <Skeleton width="5%" height={24} />
                  <Skeleton width="25%" height={24} />
                  <Skeleton width="15%" height={24} />
                  <Skeleton width="15%" height={24} />
                  <Skeleton width="12%" height={24} />
                  <Skeleton width="10%" height={24} />
                  <Skeleton width="10%" height={32} />
                </Flex>
              ))}
            </Flex>
          )}
          {!loading && (!items || items.length === 0) && (
            <EmptyBuildResults entity={entity} />
          )}
          {!loading && items && items.length > 0 && (
            <Table columnConfig={columns} {...tableProps} />
          )}
        </CardBody>
      </Card>

      <BuildLogDrawer
        buildId={selectedBuildId}
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        logsCache={logsCache}
        updateCache={updateLogsCache}
      />
    </>
  );
};
