/*
 * Copyright 2024 The Backstage Authors
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
import type { MouseEvent, ChangeEvent } from 'react';

import { useMemo, FC, useCallback, useState } from 'react';
import {
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TablePagination,
  TableRow,
} from '@material-ui/core';

import { ResourcesTableBody } from './ResourcesTableBody';
import { ResourcesTableHeader } from './ResourcesTableHeader';
import { getResourcesColumnHeaders } from './ResourcesColumnHeader';
import { ResourcesFilterBy } from './filters/ResourcesFilterBy';
import {
  Order,
  Resource,
} from '@backstage-community/plugin-redhat-argocd-common';
import { FiltersType } from '../../../../types/resources';
import {
  getResourceCreateTimestamp,
  sortValues,
} from '../../../../utils/utils';
import { useArgoResources } from '../rollouts/RolloutContext';
import { useTranslation } from '../../../../hooks/useTranslation';

interface ResourcesTableProps {
  resources: Resource[];
  createdAt: string;
}

const useStyles = makeStyles(theme => ({
  table: {
    width: '100%',
    marginTop: theme.spacing(2),
    minHeight: theme.spacing(20),
  },
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
  footer: {
    '&:nth-of-type(odd)': {
      backgroundColor: `${theme.palette.background.paper}`,
    },
  },
}));

export const ResourcesTable: FC<ResourcesTableProps> = ({
  resources,
  createdAt,
}) => {
  const classes = useStyles();

  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<string | null>(null);
  const [orderById, setOrderById] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [filters, setFilters] = useState<FiltersType>({
    Kind: [],
    HealthStatus: [],
    SyncStatus: [],
    SearchByName: [],
  });

  const getSortableRowValues = useCallback((res: Resource) => {
    const {
      name = '',
      kind = '',
      status = '',
      health = { status: '' },
      createTimestamp,
    } = res;
    const healthStatus = health.status || '';

    return [undefined, name, kind, createTimestamp, status, healthStatus];
  }, []);

  const { argoResources } = useArgoResources();

  const allResources = useMemo(() => {
    const getTimestamp = (row: Resource) =>
      getResourceCreateTimestamp(argoResources, row) || createdAt;

    return (
      resources.map((r, idx) => ({
        ...r,
        id: idx,
        createTimestamp: getTimestamp(r),
      })) ?? []
    );
  }, [resources, argoResources, createdAt]);

  const getAllKinds = useMemo(() => {
    return resources.reduce((kinds: string[], resource) => {
      if (resource.kind && !kinds.includes(resource.kind)) {
        kinds.push(resource.kind);
      }
      return kinds;
    }, []);
  }, [resources]);

  const filteredResources = useMemo(() => {
    let items = allResources;

    // Filters
    if (filters.HealthStatus.length) {
      items = items.filter(resource =>
        filters.HealthStatus.includes(resource.health?.status ?? ''),
      );
    }
    if (filters.SyncStatus.length) {
      items = items.filter(resource =>
        filters.SyncStatus.includes(resource.status),
      );
    }
    if (filters.Kind.length) {
      items = items.filter(resource => filters.Kind.includes(resource.kind));
    }
    if (filters.SearchByName.length) {
      items = items.filter(resource =>
        resource.name
          .toLocaleLowerCase()
          .includes(filters.SearchByName[0].toLocaleLowerCase()),
      );
    }

    // Sorting
    if (orderById && order) {
      items = items.sort((a, b) => {
        let aValue = getSortableRowValues(a)[parseInt(orderById, 10)];
        let bValue = getSortableRowValues(b)[parseInt(orderById, 10)];

        if (aValue === undefined || bValue === undefined) return 0;

        if (orderBy === 'created-at') {
          aValue = new Date(aValue).toISOString();
          bValue = new Date(bValue).toISOString();
        }

        return sortValues(aValue, bValue, order);
      });
    }

    return items;
  }, [allResources, filters, orderById, order, orderBy, getSortableRowValues]);

  const visibleRows = useMemo(
    () =>
      filteredResources.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredResources, page, rowsPerPage, order, orderById],
  );

  const handleRequestSort = useCallback(
    (_event: MouseEvent<unknown>, property: string, id: string) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
      setOrderById(id);
    },
    [order, orderBy],
  );

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    },
    [],
  );

  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - (filteredResources.length ?? 0))
      : 0;

  const toolbar = (
    <div
      id="search-input-filter-toolbar"
      style={{ display: 'flex', alignItems: 'center' }}
    >
      <ResourcesFilterBy
        filters={filters}
        setFilters={setFilters}
        allKinds={getAllKinds}
      />
    </div>
  );

  const { t } = useTranslation();
  const resourcesColumnHeaders = getResourcesColumnHeaders(t);

  return (
    <>
      {toolbar}
      <Table
        aria-labelledby={t(
          'deploymentLifecycle.sidebar.resources.resourcesTable.ariaLabelledBy',
        )}
        className={classes.table}
      >
        <ResourcesTableHeader
          order={order}
          orderBy={orderBy}
          orderById={orderById}
          onRequestSort={handleRequestSort}
        />
        {visibleRows.length > 0 ? (
          <TableBody>
            <ResourcesTableBody rows={visibleRows} />
            {emptyRows > 0 && (
              <TableRow style={{ height: 55 * emptyRows }}>
                <TableCell colSpan={resourcesColumnHeaders.length} />
              </TableRow>
            )}
            <TableRow className={classes.footer}>
              <TablePagination
                rowsPerPageOptions={[
                  { value: 5, label: '5 rows' },
                  { value: 10, label: '10 rows' },
                  { value: 25, label: '25 rows' },
                ]}
                count={filteredResources.length}
                style={{ marginLeft: 'auto' }}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage={null}
              />
            </TableRow>
          </TableBody>
        ) : (
          <tbody>
            <tr>
              <td colSpan={resourcesColumnHeaders.length}>
                <div data-testid="no-resources" className={classes.empty}>
                  {t(
                    'deploymentLifecycle.sidebar.resources.resourcesTable.noneFound',
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        )}
      </Table>
    </>
  );
};
