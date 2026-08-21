/* not changing the working code at this point */
/* eslint no-nested-ternary: 0 */
/* eslint react-hooks/rules-of-hooks: 0 */

/*
 * Copyright 2023 The Backstage Authors
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

import { memo, useEffect, useState } from 'react';

import { get, round } from 'lodash';
import { Button, Text } from '@backstage/ui';
import { RiArrowUpSLine, RiArrowDownSLine } from '@remixicon/react';
import AllocationChart from './AllocationChart';
import { toCurrency } from '../util';
import styles from './AllocationReport.module.css';

function descendingComparator(a, b, orderBy) {
  if (get(b, orderBy) < get(a, orderBy)) {
    return -1;
  }
  if (get(b, orderBy) > get(a, orderBy)) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

const headCells = [
  { id: 'name', numeric: false, label: 'Name', width: 'auto' },
  { id: 'cpuCost', numeric: true, label: 'CPU', width: 100 },
  { id: 'ramCost', numeric: true, label: 'RAM', width: 100 },
  { id: 'pvCost', numeric: true, label: 'PV', width: 100 },
  { id: 'totalEfficiency', numeric: true, label: 'Efficiency', width: 130 },
  { id: 'totalCost', numeric: true, label: 'Total cost', width: 130 },
];

const AllocationReport = ({
  allocationData,
  cumulativeData,
  totalData,
  currency,
}) => {
  if (allocationData.length === 0) {
    return (
      <Text variant="body-small" className={styles.noResults}>
        No results
      </Text>
    );
  }

  const [order, setOrder] = React.useState('desc');
  const [orderBy, setOrderBy] = React.useState('totalCost');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const numData = cumulativeData.length;

  useEffect(() => {
    setPage(0);
  }, [numData]);

  const lastPage = Math.floor(numData / rowsPerPage);

  const handleChangePage = newPage => setPage(newPage);

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = property => {
    const isDesc = orderBy === property && order === 'desc';
    setOrder(isDesc ? 'asc' : 'desc');
    setOrderBy(property);
  };

  const createSortHandler = property => () => handleRequestSort(property);

  const orderedRows = stableSort(cumulativeData, getComparator(order, orderBy));
  const pageRows = orderedRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <div id="report">
      <AllocationChart
        allocationRange={allocationData}
        currency={currency}
        n={10}
        height={300}
      />
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {headCells.map(cell => (
                <th
                  key={cell.id}
                  style={{
                    width: cell.width,
                    textAlign: cell.numeric ? 'right' : 'left',
                  }}
                >
                  <Button
                    className={styles.sortButton}
                    onPress={createSortHandler(cell.id)}
                    style={{
                      justifyContent: cell.numeric ? 'flex-end' : 'flex-start',
                      width: '100%',
                    }}
                  >
                    {cell.label}
                    {orderBy === cell.id ? (
                      order === 'desc' ? (
                        <RiArrowDownSLine size={16} />
                      ) : (
                        <RiArrowUpSLine size={16} />
                      )
                    ) : null}
                  </Button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className={styles.summaryRow}>
              {headCells.map(cell => {
                return (
                  <td
                    key={cell.id}
                    style={{ textAlign: cell.numeric ? 'right' : 'left' }}
                  >
                    {cell.numeric
                      ? cell.label === 'Efficiency'
                        ? totalData.totalEfficiency === 1.0 &&
                          totalData.cpuReqCoreHrs === 0 &&
                          totalData.ramReqByteHrs === 0
                          ? 'Inf%'
                          : `${round(totalData.totalEfficiency * 100, 1)}%`
                        : toCurrency(totalData[cell.id], currency)
                      : totalData[cell.id]}
                  </td>
                );
              })}
            </tr>
            {pageRows.map((row, key) => {
              if (row.name === '__unmounted__') {
                row.name = 'Unmounted PVs';
              }

              const isIdle = row.name.indexOf('__idle__') >= 0;
              const isUnallocated = row.name.indexOf('__unallocated__') >= 0;
              const isUnmounted = row.name.indexOf('Unmounted PVs') >= 0;

              // Replace "efficiency" with Inf if there is usage w/o request
              let efficiency = round(row.totalEfficiency * 100, 1);
              if (
                row.totalEfficiency === 1.0 &&
                row.cpuReqCoreHrs === 0 &&
                row.ramReqByteHrs === 0
              ) {
                efficiency = 'Inf';
              }

              // Do not allow drill-down for idle and unallocated rows
              if (isIdle || isUnallocated || isUnmounted) {
                return (
                  <tr key={key}>
                    <td style={{ textAlign: 'left' }}>{row.name}</td>
                    <td style={{ textAlign: 'right' }}>
                      {toCurrency(row.cpuCost, currency)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {toCurrency(row.ramCost, currency)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {toCurrency(row.pvCost, currency)}
                    </td>
                    {isIdle ? (
                      <td style={{ textAlign: 'right' }}>&mdash;</td>
                    ) : (
                      <td style={{ textAlign: 'right' }}>{efficiency}%</td>
                    )}
                    <td style={{ textAlign: 'right' }}>
                      {toCurrency(row.totalCost, currency)}
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={key}>
                  <td style={{ textAlign: 'left' }}>{row.name}</td>
                  <td style={{ textAlign: 'right' }}>
                    {toCurrency(row.cpuCost, currency)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {toCurrency(row.ramCost, currency)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {toCurrency(row.pvCost, currency)}
                  </td>
                  <td style={{ textAlign: 'right' }}>{efficiency}%</td>
                  <td style={{ textAlign: 'right' }}>
                    {toCurrency(row.totalCost, currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className={styles.pagination}>
        <Text variant="body-small">Rows per page:</Text>
        <select
          className={styles.paginationSelect}
          value={rowsPerPage}
          onChange={handleChangeRowsPerPage}
        >
          {[10, 25, 50].map(n => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <Text variant="body-small">
          {Math.min(page, lastPage) * rowsPerPage + 1}–
          {Math.min((Math.min(page, lastPage) + 1) * rowsPerPage, numData)} of{' '}
          {numData}
        </Text>
        <Button
          className={styles.paginationButton}
          isDisabled={page === 0}
          onPress={() => handleChangePage(Math.max(0, page - 1))}
        >
          {'<'}
        </Button>
        <Button
          className={styles.paginationButton}
          isDisabled={page >= lastPage}
          onPress={() => handleChangePage(Math.min(lastPage, page + 1))}
        >
          {'>'}
        </Button>
      </div>
    </div>
  );
};

export default memo(AllocationReport);
