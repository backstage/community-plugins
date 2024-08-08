import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import snakeCase from 'lodash/snakeCase';
import { ResponseErrorPanel, Table } from '@backstage/core-components';
import type {
  GetRecommendationListRequest,
  Recommendations,
} from '@backstage-community/plugin-redhat-resource-optimization-common';
import { useApi } from '@backstage/core-plugin-api';
import { optimizationsApiRef } from '../../apis';
import { IndexPageLayout } from './private/IndexPageLayout';
import { TableToolbar } from './private/table-toolbar';
import { Filters } from './private/filters';
import { BasePage } from '../private/BasePage';
import { useTableColumns } from './private/hooks/useTableColumns';
import {
  DEFAULT_SORTING_COLUMN,
  DEFAULT_SORTING_DIRECTION,
  DEFAULT_PAGE_SIZE_OPTIONS,
  DEFAULT_DEBOUNCE_INTERVAL,
  DEFAULT_PADDING,
} from './private/defaults';

/** This type actually represents what's going to be sent to the back-end. */
type QueryState = Omit<
  GetRecommendationListRequest['query'],
  'startDate' | 'endDate'
>;

type AvailableFilteringOptions = Pick<
  QueryState,
  'cluster' | 'project' | 'workload' | 'workloadType'
>;

const initialQueryState: QueryState = {
  limit: DEFAULT_PAGE_SIZE_OPTIONS[0],
  offset: 0,
  orderBy: DEFAULT_SORTING_COLUMN,
  orderHow: DEFAULT_SORTING_DIRECTION,
};

const availableFilteringOptionsInitialState: AvailableFilteringOptions = {
  cluster: [],
  project: [],
  workload: [],
  workloadType: [],
};

/** @public */
export function ResourceOptimizationIndexPage() {
  const [currentPage, setCurrentPage] = useState<number>(0); // First page starts from 0
  const [availableFilteringOptions, setAvailableFilteringOptions] =
    useState<AvailableFilteringOptions>(availableFilteringOptionsInitialState);
  const [queryState, setQueryState] = useState<QueryState>(initialQueryState);
  const api = useApi(optimizationsApiRef);
  const { value, error, loading } = useAsync(async () => {
    const response = await api.getRecommendationList({ query: queryState });
    return response.json();
  }, [queryState]);

  useEffect(() => {
    const uniqueClusterOptions = new Set<string>();
    const uniqueProjectOptions = new Set<string>();
    const uniqueWorkloadOptions = new Set<string>();
    const uniqueWorkloadTypeOptions = new Set<string>();
    for (const {
      clusterAlias,
      project,
      workload,
      workloadType,
    } of value?.data ?? []) {
      if (clusterAlias) {
        uniqueClusterOptions.add(clusterAlias);
      }
      if (project) {
        uniqueProjectOptions.add(project);
      }
      if (workload) {
        uniqueWorkloadOptions.add(workload);
      }
      if (workloadType) {
        uniqueWorkloadTypeOptions.add(workloadType);
      }
    }
    const nextAvailableFilteringOptions: AvailableFilteringOptions = {
      cluster: Array.from(uniqueClusterOptions),
      project: Array.from(uniqueProjectOptions),
      workload: Array.from(uniqueWorkloadOptions),
      workloadType: Array.from(uniqueWorkloadTypeOptions),
    };

    setAvailableFilteringOptions(nextAvailableFilteringOptions);
  }, [value?.data]);

  const columns = useTableColumns();
  const optimizableContainersCount = useMemo(
    () => value?.meta?.count ?? 0,
    [value?.meta?.count],
  );
  const data = useMemo(() => value?.data ?? [], [value?.data]);

  const handlePageChange = useCallback(
    (pageNumber: number, pageSize: number): void => {
      setCurrentPage(pageNumber);
      setQueryState(lastQueryState => ({
        ...lastQueryState,
        offset: pageNumber * pageSize,
        limit: pageSize,
      }));
    },
    [],
  );

  const handleRowsPerPageChange = useCallback((pageSize: number): void => {
    setQueryState(lastState => ({
      ...lastState,
      offset: (lastState.offset ?? 0) * pageSize,
      limit: pageSize,
    }));
  }, []);

  const handleOrderChange = useCallback(
    (orderBy: number, orderDirection: 'desc' | 'asc'): void => {
      const { field } = columns[orderBy];
      setQueryState(lastState => ({
        ...lastState,
        orderBy:
          field === 'clusterAlias'
            ? 'cluster'
            : (snakeCase(field) as NonNullable<typeof lastState.orderBy>),
        orderHow: orderDirection as NonNullable<typeof lastState.orderHow>,
      }));
    },
    [columns],
  );

  const handleFiltersChange = useCallback(
    (
      fieldId: 'cluster' | 'workloadType' | 'workload' | 'project',
      values: string[],
    ): void => {
      setQueryState(lastQueryState => ({
        ...lastQueryState,
        offset: 0,
        [fieldId]: values,
      }));
      setCurrentPage(0);
    },
    [],
  );

  const handleFiltersReset = useCallback((): void => {
    if (
      queryState.cluster?.length === 0 &&
      queryState.project?.length === 0 &&
      queryState.workload?.length === 0 &&
      queryState.workloadType?.length === 0
    ) {
      return;
    }

    setQueryState(lastQueryState => ({
      ...lastQueryState,
      ...availableFilteringOptionsInitialState,
    }));
  }, [
    queryState.cluster?.length,
    queryState.project?.length,
    queryState.workload?.length,
    queryState.workloadType?.length,
  ]);

  const handleSearchChange = useCallback((searchText: string): void => {
    setQueryState(lastState => ({
      ...lastState,
      container: Array.from(new Set(searchText.split(',').filter(Boolean))),
    }));
  }, []);

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <BasePage pageTitle="Resource Optimization">
      <IndexPageLayout>
        <IndexPageLayout.Filters>
          <Filters
            cluster={{
              options: availableFilteringOptions.cluster ?? [],
              label: 'CLUSTERS',
            }}
            project={{
              options: availableFilteringOptions.project ?? [],
              label: 'PROJECTS',
            }}
            workload={{
              options: availableFilteringOptions.workload ?? [],
              label: 'WORKLOADS',
            }}
            workloadType={{
              options: availableFilteringOptions.workloadType ?? [],
              label: 'TYPES',
            }}
            onFiltersChange={handleFiltersChange}
            onFiltersReset={handleFiltersReset}
          />
        </IndexPageLayout.Filters>
        <IndexPageLayout.Table>
          <Table<Recommendations>
            components={{
              Toolbar: TableToolbar,
            }}
            title={`Optimizable containers (${
              optimizableContainersCount ?? 'N/A'
            })`}
            options={{
              debounceInterval: DEFAULT_DEBOUNCE_INTERVAL,
              padding: DEFAULT_PADDING,
              pageSize: queryState.limit,
              pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
              paging: true,
              search: true,
              sorting: true,
              thirdSortClick: false,
            }}
            data={data}
            columns={columns}
            isLoading={loading}
            totalCount={optimizableContainersCount}
            page={currentPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onOrderChange={handleOrderChange}
            onSearchChange={handleSearchChange}
          />
        </IndexPageLayout.Table>
      </IndexPageLayout>
    </BasePage>
  );
}
