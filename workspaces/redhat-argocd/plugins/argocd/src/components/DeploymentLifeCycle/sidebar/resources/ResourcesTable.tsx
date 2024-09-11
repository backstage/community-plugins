import React, { FC, useCallback, useState } from 'react';
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
import { ResourcesColumnHeaders } from './ResourcesColumnHeader';
import { ResourcesFilterBy } from './filters/ResourcesFilterBy';
import { Order, Resource } from '../../../../types/application';
import { FiltersType } from '../../../../types/resources';

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

  const getSortableRowValues = useCallback(
    (res: Resource) => {
      const {
        name = '',
        kind = '',
        status = '',
        health = { status: '' },
      } = res;
      const healthStatus = health.status || '';

      return [undefined, name, kind, createdAt, status, healthStatus];
    },
    [createdAt],
  );

  const allResources = React.useMemo(
    () => resources.map((r, idx) => ({ ...r, id: idx })) ?? [],
    [resources],
  );

  const getAllKinds = React.useMemo(() => {
    return resources.reduce((kinds: string[], resource) => {
      if (resource.kind && !kinds.includes(resource.kind)) {
        kinds.push(resource.kind);
      }
      return kinds;
    }, []);
  }, [resources]);

  const filteredResources = React.useMemo(() => {
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
        const aValue = getSortableRowValues(a)[parseInt(orderById, 10)];
        const bValue = getSortableRowValues(b)[parseInt(orderById, 10)];

        if (aValue === undefined || bValue === undefined) return 0;

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return order === 'asc' ? aValue - bValue : bValue - aValue;
        }
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return order === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return 0;
      });
    }

    return items;
  }, [allResources, filters, orderById, order, getSortableRowValues]);

  const visibleRows = React.useMemo(
    () =>
      filteredResources.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredResources, page, rowsPerPage, order, orderById],
  );

  const handleRequestSort = useCallback(
    (_event: React.MouseEvent<unknown>, property: string, id: string) => {
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
    (event: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <>
      {toolbar}
      <Table aria-labelledby="Resources" className={classes.table}>
        <ResourcesTableHeader
          order={order}
          orderBy={orderBy}
          orderById={orderById}
          onRequestSort={handleRequestSort}
        />
        {visibleRows.length > 0 ? (
          <TableBody>
            <ResourcesTableBody rows={visibleRows} createdAt={createdAt} />
            {emptyRows > 0 && (
              <TableRow style={{ height: 55 * emptyRows }}>
                <TableCell colSpan={ResourcesColumnHeaders.length} />
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
              <td colSpan={ResourcesColumnHeaders.length}>
                <div data-testid="no-resources" className={classes.empty}>
                  No Resources found
                </div>
              </td>
            </tr>
          </tbody>
        )}
      </Table>
    </>
  );
};
