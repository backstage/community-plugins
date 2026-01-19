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

import { useEffect, useState, MouseEvent, ChangeEvent, useMemo } from 'react';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';

import {
  CatalogFilterLayout,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { Table } from '@backstage/core-components';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';

import {
  Order,
  SortingOrderEnum,
} from '@backstage-community/plugin-servicenow-common';

import { IncidentsFilter } from './IncidentsFilter';
import { useIncidentsListColumns } from './IncidentsListColumns';
import { IncidentsTableBody } from './IncidentsTableBody';
import { IncidentsTableHeader } from './IncidentsTableHeader';
import {
  IncidentTableFieldEnum,
  type IncidentsData,
  type IncidentTableField,
} from '../../types';
import { buildIncidentQueryParams } from '../../utils/queryParamsUtils';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useQueryState } from '../../hooks/useQueryState';
import { useQueryArrayState } from '../../hooks/useQueryArrayState';
import { serviceNowApiRef } from '../../api/ServiceNowBackendClient';
import useUserEmail from '../../hooks/useUserEmail';
import { useUpdateQueryParams } from '../../hooks/useQueryHelpers';
import { useTranslation } from '../../hooks/useTranslation';

export const EntityServicenowContent = () => {
  const { t } = useTranslation();
  const { entity } = useEntity();
  const serviceNowApi = useApi(serviceNowApiRef);
  const incidentsListColumns = useIncidentsListColumns();

  const [search, setSearch] = useQueryState<string>('search', '');
  const [input, setInput] = useState(search);
  const debouncedInput = useDebouncedValue(input, 300);

  const [order, setOrder] = useQueryState<Order>('order', SortingOrderEnum.Asc);
  const [orderBy, setOrderBy] = useQueryState<IncidentTableField>(
    'orderBy',
    IncidentTableFieldEnum.Number,
  );

  const [rowsPerPage] = useQueryState<number>('limit', 5);
  const [offset, setOffset] = useQueryState<number>('offset', 0);
  const [state] = useQueryArrayState('state', []);
  const [priority] = useQueryArrayState('priority', []);

  const pageNumber = Math.floor(offset / rowsPerPage);

  const [count, setCount] = useState<number>(0);
  const [incidentsData, setIncidentsData] = useState<IncidentsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const updateQueryParams = useUpdateQueryParams();

  const servicenowAnnotations = useMemo(() => {
    const annotations = entity.metadata.annotations;
    const snAnnotations: Record<string, string> = {};
    if (annotations) {
      for (const [key, value] of Object.entries(annotations)) {
        if (key.startsWith('servicenow.com/entity-id')) {
          snAnnotations.entityId = value;
          continue;
        }
        if (key.startsWith('servicenow.com/')) {
          const field = key.substring('servicenow.com/'.length);
          snAnnotations[field] = value;
        }
      }
    }
    return snAnnotations;
  }, [entity.metadata.annotations]);

  const kind = entity.kind.toLocaleLowerCase('en-US');
  const userEmail = useUserEmail(kind);

  const identityApi = useApi(identityApiRef);

  useEffect(() => {
    identityApi.getBackstageIdentity().then(identity => {
      if (identity.userEntityRef) {
        localStorage.setItem('userEntityRef', identity.userEntityRef);
      }
    });
  }, [identityApi]);

  useEffect(() => {
    if (debouncedInput !== search) {
      setSearch(debouncedInput);
      setOffset(0);
    }
  }, [debouncedInput, search, setSearch, setOffset]);

  useEffect(() => {
    async function fetchIncidents() {
      setLoading(true);
      setError(null);

      if (!userEmail && Object.keys(servicenowAnnotations).length === 0) {
        setIncidentsData([]);
        setLoading(false);
        return;
      }

      try {
        const queryParams = buildIncidentQueryParams({
          limit: rowsPerPage,
          offset,
          order,
          orderBy,
          search: search,
          priority: priority ?? undefined,
          state: state ?? undefined,
          userEmail,
          ...servicenowAnnotations,
        });

        const { incidents, totalCount } = await serviceNowApi.getIncidents(
          queryParams,
        );
        setIncidentsData(incidents);
        setCount(totalCount);
      } catch (e) {
        setError((e as Error).message);
        setIncidentsData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchIncidents();
  }, [
    rowsPerPage,
    offset,
    order,
    orderBy,
    search,
    serviceNowApi,
    servicenowAnnotations,
    priority,
    state,
    userEmail,
  ]);

  const handleRowsPerPageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    updateQueryParams({
      limit: String(newLimit),
      offset: '0',
    });
  };

  const handlePageChange = (_event: unknown, page: number) => {
    setOffset(page * rowsPerPage);
  };

  const handleRequestSort = (
    _event: MouseEvent<unknown>,
    property: IncidentTableField,
  ) => {
    const isAsc = orderBy === property && order === SortingOrderEnum.Asc;
    setOrder(isAsc ? SortingOrderEnum.Desc : SortingOrderEnum.Asc);
    setOrderBy(property);
    setOffset(0);
  };

  const handleSearch = (str: string) => {
    setInput(str);
  };

  const IncidentsTableHeaderComponent = () => (
    <IncidentsTableHeader
      order={order}
      orderBy={orderBy}
      onRequestSort={handleRequestSort}
    />
  );

  const IncidentsTableBodyComponent = () =>
    loading ? (
      <TableBody>
        <TableRow>
          <TableCell colSpan={incidentsListColumns.length} align="center">
            <Box sx={{ py: 3 }}>
              <CircularProgress />
            </Box>
          </TableCell>
        </TableRow>
      </TableBody>
    ) : (
      <IncidentsTableBody rows={incidentsData} />
    );

  const TablePaginationComponent = () => {
    return (
      <TablePagination
        rowsPerPageOptions={[5, 10, 20, 50, 100].map(n => ({
          value: n,
          label: t('table.labelRowsSelect', { count: String(n) }),
        }))}
        component="div"
        sx={{ mr: 1 }}
        count={count ?? 0}
        rowsPerPage={rowsPerPage}
        page={pageNumber}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        labelRowsPerPage={null}
        showFirstButton
        showLastButton
      />
    );
  };

  return (
    <Box>
      <CatalogFilterLayout>
        <CatalogFilterLayout.Filters>
          <IncidentsFilter />
        </CatalogFilterLayout.Filters>
        <CatalogFilterLayout.Content>
          {error ? (
            <Box sx={{ padding: 2, color: 'error.main' }}>
              {t('errors.loadingIncidents', { error })}
            </Box>
          ) : (
            <Table
              data={loading ? [] : incidentsData}
              columns={incidentsListColumns}
              onSearchChange={handleSearch}
              title={
                count === 0
                  ? t('page.title')
                  : t('page.titleWithCount', { count: String(count) })
              }
              localization={{
                toolbar: { searchPlaceholder: t('table.searchPlaceholder') },
              }}
              components={{
                Header: IncidentsTableHeaderComponent,
                Body: IncidentsTableBodyComponent,
                Pagination: TablePaginationComponent,
              }}
              emptyContent={
                loading ? null : (
                  <Box
                    data-testid="no-incidents-found"
                    sx={{
                      padding: 2,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    {t('table.emptyContent')}
                  </Box>
                )
              }
              isLoading={loading}
            />
          )}
        </CatalogFilterLayout.Content>
      </CatalogFilterLayout>
    </Box>
  );
};
