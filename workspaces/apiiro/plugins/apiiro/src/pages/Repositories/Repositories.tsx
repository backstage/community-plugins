/*
 * Copyright 2025 The Backstage Authors
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
import { Content, Page } from '@backstage/core-components';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import Typography from '@mui/material/Typography';
import { apiiroApiRef } from '../../api';
import { DataGrid } from '../../components/DataGrid';
import { Header } from '../../components/Header';
import { RepositoryType, useRepositoriesData } from '../../queries';
import { columnVisibilityModal, repositoryColumns } from './tableConfig';
import { StatusContainer } from '../../components/common';

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

export const RepositoriesContent = ({
  applicationId,
}: {
  applicationId?: string;
}) => {
  const connectBackendApi = useApi(apiiroApiRef);
  const { fetch } = useApi(fetchApiRef);

  const { repositoriesData, repositoriesDataLoading, repositoriesDataError } =
    useRepositoriesData({
      connectApi: connectBackendApi,
      fetchApi: fetch,
      applicationId,
    });

  const rows = useMemo(
    () => repositoriesData?.repositories || [],
    [repositoriesData?.repositories],
  );

  return (
    <StatusContainer
      isLoading={repositoriesDataLoading}
      error={repositoriesDataError}
      isEmpty={!rows}
      notFoundMessage="No repositories found."
      showLogo={applicationId ? true : false}
    >
      <DataGrid<RepositoryType>
        getRowId={row => `${row.key}-${row.entityUrl}`}
        loading={repositoriesDataLoading}
        tableKey="repositories"
        columns={repositoryColumns}
        rows={rows}
        dataLabel="repositories"
        searchBarPlaceHolder="Search repository name..."
        features={DATA_GRID_FEATURES}
        initialState={{
          sorting: {
            sortModel: INITIAL_SORTING,
          },
        }}
        initialPageSize={PAGE_SIZE_OPTIONS[0]}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        columnVisibility={columnVisibilityModal}
      />
    </StatusContainer>
  );
};

export const Repositories = () => {
  return (
    <Page themeId="tool">
      <Header />
      <Content>
        <Typography variant="h4" sx={{ color: 'text.primary', mb: 2 }}>
          Repositories
        </Typography>
        <RepositoriesContent />
      </Content>
    </Page>
  );
};
