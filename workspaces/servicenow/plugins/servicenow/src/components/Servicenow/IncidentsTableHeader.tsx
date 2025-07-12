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

import { MouseEvent } from 'react';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';

import { IncidentsListColumns } from './IncidentsListColumns';
import type { Order } from '@backstage-community/plugin-servicenow-common';
import { IncidentTableField } from '../../types';

type IncidentsTableHeaderProps = {
  order: Order;
  orderBy: IncidentTableField | undefined;
  onRequestSort: (
    event: MouseEvent<unknown>,
    property: IncidentTableField,
  ) => void;
};

export const IncidentsTableHeader = ({
  order,
  orderBy,
  onRequestSort,
}: IncidentsTableHeaderProps) => {
  const createSortHandler =
    (property: IncidentTableField) => (event: MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow sx={{ marginLeft: '6px', borderBottom: '1px solid #e0e0e0' }}>
        {IncidentsListColumns.map(column => (
          <TableCell
            key={column.id as string}
            align="left"
            padding="normal"
            style={{
              lineHeight: '1.5rem',
              fontSize: '0.875rem',
              padding: '24px 16px 24px 20px',
              fontWeight: '700',
            }}
            sortDirection={orderBy === column.field ? order : 'asc'}
          >
            <TableSortLabel
              active={orderBy === column.field}
              direction={orderBy === column.field ? order : 'asc'}
              onClick={
                column.sorting === false
                  ? undefined
                  : createSortHandler(column.field as IncidentTableField)
              }
              disabled={column.sorting === false}
            >
              {column.title}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
