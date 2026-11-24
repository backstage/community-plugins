/*
 * Copyright 2026 The Backstage Authors
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
import {
  CellText,
  Column,
  Row,
  TableBody,
  TableHeader,
  TableRoot,
} from '@backstage/ui';
import { formatValue } from './formatValue';

/**
 * Column of a {@link DataTable}.
 *
 * @public
 */
export type DataTableColumn = {
  title: string;
  /** Property of each row shown in this column. */
  field: string;
};

/**
 * Props for {@link DataTable}.
 *
 * @public
 */
export type DataTableProps = {
  columns: DataTableColumn[];
  data: Array<Record<string, unknown>>;
  /** Accessible name of the table. */
  label?: string;
  emptyText?: string;
};

/**
 * Table for showing rows of data in templates.
 *
 * @public
 */
export const DataTable = ({
  columns,
  data,
  label = 'Data',
  emptyText = 'No data',
}: DataTableProps) => (
  <TableRoot aria-label={label}>
    <TableHeader>
      {columns.map((column, index) => (
        <Column key={column.field} id={column.field} isRowHeader={index === 0}>
          {column.title}
        </Column>
      ))}
    </TableHeader>
    <TableBody renderEmptyState={() => emptyText}>
      {data.map((row, index) => (
        <Row key={index} id={index}>
          {columns.map(column => (
            <CellText
              key={column.field}
              title={formatValue(row[column.field])}
            />
          ))}
        </Row>
      ))}
    </TableBody>
  </TableRoot>
);
