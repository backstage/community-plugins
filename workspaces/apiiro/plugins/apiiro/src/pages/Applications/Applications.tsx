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
import { useMemo } from 'react';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { apiiroApiRef } from '../../api';
import { DataGrid } from '../../components/DataGrid';
import { ApplicationType, useApplicationsData } from '../../queries';
import { applicationColumns, applicationColumnVisibility } from './tableConfig';
import { StatusContainer } from '../../components/common';
import { Content } from '@backstage/core-components';

const INITIAL_SORTING = [
  {
    field: 'riskScore',
    sort: 'desc' as const,
  },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const DATA_GRID_FEATURES = {
  quickSearch: true,
  columnPinning: true,
  columnReordering: true,
  customPagination: true,
  columnMenu: true,
  persistLayout: true,
} as const;

export const Applications = () => {
  const connectBackendApi = useApi(apiiroApiRef);
  const { fetch } = useApi(fetchApiRef);
  const enableApplicationsView = connectBackendApi.getEnableApplicationsView();

  const { applicationsData, applicationsDataLoading, applicationsDataError } =
    useApplicationsData({
      connectApi: connectBackendApi,
      fetchApi: fetch,
      enabled: enableApplicationsView,
    });

  const rows = useMemo(
    () => applicationsData?.applications || [],
    [applicationsData?.applications],
  );

  if (!enableApplicationsView) {
    return (
      <StatusContainer
        isLoading={false}
        isEmpty
        wrapper={Content}
        notFoundMessage="Please enable the applications view in the Apiiro plugin configuration."
        showLogo={false}
      >
        {null}
      </StatusContainer>
    );
  }

  return (
    <StatusContainer
      isLoading={applicationsDataLoading}
      error={applicationsDataError}
      isEmpty={!rows}
      notFoundMessage="No Apiiro applications found."
      showLogo={false}
    >
      <DataGrid<ApplicationType>
        getRowId={row => `${row.key}-${row.entityUrl}`}
        loading={applicationsDataLoading}
        tableKey="applications"
        columns={applicationColumns}
        rows={rows}
        dataLabel="applications"
        searchBarPlaceHolder="Search application name..."
        features={DATA_GRID_FEATURES}
        initialState={{
          sorting: {
            sortModel: INITIAL_SORTING,
          },
        }}
        initialPageSize={PAGE_SIZE_OPTIONS[0]}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        columnVisibility={applicationColumnVisibility}
      />
    </StatusContainer>
  );
};
