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
import type { Namespace } from '@backstage-community/plugin-kiali-common/types';
import {
  DRAWER,
  ENTITY,
  NamespaceInfo,
  SortField,
} from '@backstage-community/plugin-kiali-common/types';
import {
  Box,
  CircularProgress,
  Paper,
  SortDirection,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@material-ui/core';
import { default as React } from 'react';
import { kialiStyle } from '../../styles/StyleUtils';
import { StatefulFiltersProps } from '../Filters/StatefulFilters';
import { config, RenderResource, Resource, ResourceType } from './Config';
import { VirtualItem } from './VirtualItem';

const emptyStyle = kialiStyle({
  borderBottom: 0,
});

// ******************************
// VirtualList and its associated classes are intended to be used for main list pages: Applications,
// Workloads, Services and Istio Config. They share common style and filter integration. They have
// have limitations in scenarios where different personalization is needed (columns style, or layout).
// For a secondary list, rendered inside a detail page, it is recommended the imple be based on a
// Table component, such as in WorkloadServices, WorkloadPods, ServiceInfoWorkload, IstioConfigSubList,
// or TrafficListComponent.
// ******************************

type VirtualListProps<R> = {
  actions?: JSX.Element[];
  activeNamespaces: Namespace[];
  children?: React.ReactNode;
  hiddenColumns?: string[];
  rows: R[];
  sort?: (sortField: SortField<NamespaceInfo>, isAscending: boolean) => void;
  statefulProps?: StatefulFiltersProps;
  tableToolbar?: React.ReactNode;
  type: string;
  view?: string;
  loading: boolean;
};

export const VirtualList = <R extends RenderResource>(
  listProps: VirtualListProps<R>,
) => {
  const [order, setOrder] = React.useState<SortDirection>('asc');
  const [orderBy, setOrderBy] = React.useState<String>('');
  // @ts-ignore
  const [conf] = React.useState<Resource>(config[listProps.type] as Resource);

  const getColumns = (): ResourceType<R>[] => {
    let columns = [] as ResourceType<any>[];
    if (conf.columns) {
      columns = conf.columns.filter(
        info =>
          !listProps.hiddenColumns ||
          !listProps.hiddenColumns.includes(
            info.title.toLocaleLowerCase('en-US'),
          ),
      );
    }
    return columns;
  };
  const columns = getColumns();

  const { rows } = listProps;
  const typeDisplay =
    listProps.type === 'istio' ? 'Istio config' : listProps.type;

  const tableEntityHeaderStyle: any = {
    minWidth: '100px',
    fontWeight: '700',
    color: 'grey',
    borderTop: '1px solid #d5d5d5',
    borderBottom: '1px solid #d5d5d5',
    whiteSpace: 'nowrap',
    padding: '15px',
  };

  const tableHeaderStyle: any = {
    minWidth: '120px',
    fontWeight: '700',
    color: 'grey',
    borderTop: '1px solid #d5d5d5',
    borderBottom: '1px solid #d5d5d5',
    whiteSpace: 'nowrap',
  };

  function descendingComparator(a: string, b: string): number {
    if (b < a) {
      return -1;
    }
    if (b > a) {
      return 1;
    }
    return 0;
  }

  function getComparator(): any {
    return order === 'desc'
      ? (a: string, b: string) => descendingComparator(a, b)
      : (a: string, b: string) => -descendingComparator(a, b);
  }

  function stableSort(
    array: RenderResource[],
    comparator: any,
  ): RenderResource[] {
    const stabilizedThis: [RenderResource, number][] = array.map(
      (el, index) => [el, index],
    );
    stabilizedThis.sort(
      (a: [RenderResource, number], b: [RenderResource, number]): number => {
        // @ts-ignore
        const aProp = a[0][orderBy];
        // @ts-ignore
        const bProp = b[0][orderBy];
        if (aProp === undefined || bProp === undefined) {
          return 0;
        }
        const sort = comparator(aProp, bProp);
        if (sort !== 0) return sort;
        return a[1] - b[1];
      },
    );
    return stabilizedThis.map(el => el[0]);
  }

  const handleRequestSort = (
    _: React.MouseEvent<unknown>,
    property: string,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property.toLocaleLowerCase('en-US'));
  };
  const heightStyle =
    listProps.view === ENTITY || listProps.view === DRAWER
      ? { maxHeight: '300px' }
      : {};
  return (
    <div>
      <Paper className="Paper">
        {listProps.tableToolbar}
        <TableContainer style={heightStyle}>
          <Table stickyHeader>
            <TableHead style={{ border: 'collapse', background: 'white' }}>
              <TableRow>
                {columns.map((column: ResourceType<any>, index: number) => (
                  <TableCell
                    key={`column_${index}`}
                    align="center"
                    style={
                      listProps.view === ENTITY || listProps.view === DRAWER
                        ? tableEntityHeaderStyle
                        : tableHeaderStyle
                    }
                    sortDirection={
                      column.sortable &&
                      orderBy === column.title.toLocaleLowerCase('en-US')
                        ? order
                        : false
                    }
                  >
                    <TableSortLabel
                      active={
                        orderBy === column.title.toLocaleLowerCase('en-US')
                      }
                      // @ts-ignore
                      direction={
                        orderBy === column.title.toLocaleLowerCase('en-US')
                          ? order
                          : 'asc'
                      }
                      onClick={e =>
                        handleRequestSort(
                          e,
                          column.title.toLocaleLowerCase('en-US'),
                        )
                      }
                    >
                      {(listProps.view === ENTITY &&
                        column.title === 'Configuration') ||
                      (listProps.view === DRAWER &&
                        column.title === 'Configuration')
                        ? 'CONFIG'
                        : column.title.toLocaleUpperCase('en-US')}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* eslint-disable-next-line no-nested-ternary */}
              {listProps.loading === true ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  minHeight="10vh"
                  marginLeft="60vh"
                >
                  <CircularProgress />
                </Box>
              ) : listProps.rows.length > 0 ? (
                stableSort(rows, getComparator()).map(
                  (row: RenderResource, index: number) => (
                    <VirtualItem
                      key={`vItem_${index}`}
                      item={row}
                      index={index}
                      columns={columns}
                      config={conf}
                      statefulFilterProps={listProps.statefulProps}
                      view={listProps.view}
                      action={
                        listProps.actions && listProps.actions[index]
                          ? listProps.actions[index]
                          : undefined
                      }
                    />
                  ),
                )
              ) : (
                <TableRow className={emptyStyle}>
                  <TableCell colSpan={columns.length}>
                    {listProps.activeNamespaces.length > 0
                      ? `No ${typeDisplay} in namespace 
                  ${
                    listProps.activeNamespaces.length === 1
                      ? ` ${listProps.activeNamespaces[0].name}`
                      : `s: ${listProps.activeNamespaces
                          .map(ns => ns.name)
                          .join(', ')}`
                  }`
                      : `There is currently no namespace selected, please select one using the Namespace selector.`}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
};
