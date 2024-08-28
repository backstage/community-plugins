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
import { ResourcesSearchBar } from './ResourcesSearchBar';
import { ResourcesFilterBy } from './ResourcesFilterBy';
import { Order, Resource } from '../../types';

interface ResourcesTableProps {
  resources: Resource[];
  createdAt: string;
}

const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

export const ResourcesTable: FC<ResourcesTableProps> = ({
  resources,
  createdAt,
}) => {
  const classes = useStyles();

  const [searchValue, setSearchValue] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<string | null>(null);
  const [orderById, setOrderById] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const getSortableRowValues = useCallback(
    (res: Resource) => {
      const {
        kind,
        status,
        health: { status: healthStatus },
      } = res;

      return [undefined, kind, createdAt, status, healthStatus];
    },
    [createdAt],
  );

  const allResources = React.useMemo(
    () => resources.map((r, idx) => ({ ...r, id: idx })) ?? [],
    [resources],
  );

  const filteredResources = React.useMemo(() => {
    let items = allResources;

    // Filter by health status
    if (filterValue && filterValue !== 'All') {
      items = items.filter(resource => resource.health.status === filterValue);
    }

    // Search by kind
    if (searchValue) {
      items = items.filter(resource =>
        resource.kind
          .toLocaleLowerCase()
          .includes(searchValue.toLocaleLowerCase()),
      );
    }

    // Sort
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
  }, [
    allResources,
    filterValue,
    searchValue,
    orderById,
    order,
    getSortableRowValues,
  ]);

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

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setSearchValue(event.target.value),
    [],
  );

  const handleSearchClear = useCallback(() => setSearchValue(''), []);

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
      <ResourcesFilterBy setFilterValue={setFilterValue} />
      <ResourcesSearchBar
        value={searchValue}
        onChange={handleSearchChange}
        onSearchClear={handleSearchClear}
      />
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
    </div>
  );

  return (
    <>
      {toolbar}
      <Table aria-labelledby="Resources" style={{ width: '100%' }}>
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
