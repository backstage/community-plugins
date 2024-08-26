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

  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(5);

  const getSortableRowValues = (
    res: Resource,
  ): (string | number | undefined)[] => {
    const {
      kind,
      status,
      health: { status: healthStatus },
    } = res;

    return [
      undefined,
      kind,
      undefined,
      createdAt,
      status,
      healthStatus,
      undefined,
    ];
  };

  const allResources = React.useMemo(() => {
    const items =
      resources.map((r, idx) => ({
        ...r,
        id: idx,
      })) ?? [];
    return items as Resource[];
  }, [resources]);

  const filteredResources = React.useMemo(() => {
    let items = allResources;

    // Filter by health status
    if (filterValue && filterValue !== undefined) {
      items = items.filter(resource => {
        return resource.health.status === filterValue || filterValue === 'All';
      });
    }

    // Search by kind
    if (searchValue && searchValue !== undefined) {
      items = items.filter(resource => {
        return resource.kind
          .toLocaleLowerCase()
          .includes(searchValue.toLocaleLowerCase());
      });
    }

    // Sort
    if (orderById && order) {
      items = items.sort((a, b) => {
        const aValue = getSortableRowValues(a)[parseInt(orderById, 10)];
        const bValue = getSortableRowValues(b)[parseInt(orderById, 10)];

        if (typeof aValue === 'number') {
          if (order === 'asc') {
            return (aValue as number) - (bValue as number);
          }
          return (bValue as number) - (aValue as number);
        }
        if (order === 'asc') {
          return (aValue as string).localeCompare(bValue as string);
        }
        return (bValue as string).localeCompare(aValue as string);
      });
    }

    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allResources, filterValue, searchValue, orderById, order]);

  const visibleRows = React.useMemo(() => {
    return filteredResources.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredResources, page, rowsPerPage, order, orderBy, orderById]);

  const handleRequestSort = useCallback(
    (_event: React.MouseEvent<unknown>, property: string, id: string) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
      setOrderById(id);
    },
    [order, orderBy],
  );

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    setSearchValue(value);
  };

  const handleSearchClear = (): void => {
    setSearchValue('');
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
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
        onChange={onSearchChange}
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
        {visibleRows?.length > 0 ? (
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
                <div data-testid="no-pipeline-runs" className={classes.empty}>
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
