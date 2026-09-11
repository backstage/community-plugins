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

import { memo } from 'react';
import { get, round } from 'lodash';
import { Cell, CellText, Table, Text, useTable } from '@backstage/ui';
import AllocationChart from './AllocationChart';
import { toCurrency } from '../util';
import styles from './AllocationReport.module.css';

const AllocationReport = ({
  allocationData,
  cumulativeData,
  totalData,
  currency,
}) => {
  const efficiencyText = row => {
    if (row.name?.indexOf('__idle__') >= 0) return '—';
    if (
      row.totalEfficiency === 1.0 &&
      row.cpuReqCoreHrs === 0 &&
      row.ramReqByteHrs === 0
    ) {
      return 'Inf%';
    }
    return `${round(row.totalEfficiency * 100, 1)}%`;
  };

  const columns = [
    {
      id: 'name',
      label: 'Name',
      isRowHeader: true,
      isSortable: true,
      cell: row => <CellText title={row.name ?? ''} />,
    },
    {
      id: 'cpuCost',
      label: 'CPU',
      isSortable: true,
      cell: row => <CellText title={toCurrency(row.cpuCost, currency)} />,
    },
    {
      id: 'ramCost',
      label: 'RAM',
      isSortable: true,
      cell: row => <CellText title={toCurrency(row.ramCost, currency)} />,
    },
    {
      id: 'pvCost',
      label: 'PV',
      isSortable: true,
      cell: row => <CellText title={toCurrency(row.pvCost, currency)} />,
    },
    {
      id: 'totalEfficiency',
      label: 'Efficiency',
      isSortable: true,
      cell: row => (
        <Cell>
          <CellText title={efficiencyText(row)} />
        </Cell>
      ),
    },
    {
      id: 'totalCost',
      label: 'Total cost',
      isSortable: true,
      cell: row => <CellText title={toCurrency(row.totalCost, currency)} />,
    },
  ];

  // Normalise names and add the required TableItem `id` field
  const rowData = Array.isArray(cumulativeData)
    ? cumulativeData.map(row => {
        const name = row.name === '__unmounted__' ? 'Unmounted PVs' : row.name;
        return { ...row, id: name, name };
      })
    : [];

  // Prepend a totals summary row so it is always pinned at position 0
  const tableData = [{ ...totalData, id: '__summary__', name: '' }, ...rowData];

  const sortFn = (data, sort) => {
    const { column, direction } = sort;
    const [summary, ...rows] = data;
    const sorted = [...rows].sort((a, b) => {
      const av = get(a, String(column)) ?? 0;
      const bv = get(b, String(column)) ?? 0;
      if (bv < av) return direction === 'ascending' ? 1 : -1;
      if (bv > av) return direction === 'ascending' ? -1 : 1;
      return 0;
    });
    return [summary, ...sorted];
  };

  const { tableProps } = useTable({
    mode: 'complete',
    data: allocationData.length > 0 ? tableData : [],
    paginationOptions: {
      type: 'page',
      pageSize: 25,
      pageSizeOptions: [10, 25, 50],
    },
    sortFn,
  });

  if (allocationData.length === 0) {
    return (
      <Text variant="body-small" className={styles.noResults}>
        No results
      </Text>
    );
  }

  return (
    <div id="report">
      <AllocationChart
        allocationRange={allocationData}
        currency={currency}
        n={10}
        height={300}
      />
      <Table
        columnConfig={columns}
        emptyState={<Text variant="body-small">No results</Text>}
        {...tableProps}
      />
    </div>
  );
};

export default memo(AllocationReport);
