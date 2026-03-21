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
import { ReactNode, useMemo, useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  Column,
  Row,
  Text,
  useTable,
  TablePagination,
  Flex,
  SearchField,
  Skeleton,
} from '@backstage/ui';
import { Cell } from 'react-aria-components';
import styles from './utils.module.css';

/**
 * Column configuration compatible with the old TableColumn interface,
 * but rendered using BUI Table primitives.
 */
export interface FluxColumn<T extends object> {
  title: ReactNode;
  field?: string;
  render?: (row: T) => ReactNode;
  hidden?: boolean;
  width?: string;
  minWidth?: string;
  align?: string;
  customSort?: (a: T, b: T) => number;
  customFilterAndSearch?: (filter: string, item: T) => boolean;
  cellStyle?: Record<string, any>;
  headerStyle?: Record<string, any>;
}

interface FluxEntityTableProps<T extends object> {
  title?: string;
  data: T[];
  isLoading: boolean;
  columns: FluxColumn<T>[];
  many?: boolean;
}

export function FluxEntityTable<T extends object & { id?: string }>({
  title,
  data,
  isLoading,
  columns,
  many,
}: FluxEntityTableProps<T>) {
  const [searchText, setSearchText] = useState('');

  const visibleColumns = useMemo(
    () => columns.filter(c => !c.hidden),
    [columns],
  );

  const filterableColumns = useMemo(
    () => columns.filter(c => c.customFilterAndSearch),
    [columns],
  );

  const filteredData = useMemo(() => {
    if (!searchText || filterableColumns.length === 0) return data;
    return data.filter(item =>
      filterableColumns.some(col =>
        col.customFilterAndSearch!(searchText, item),
      ),
    );
  }, [data, searchText, filterableColumns]);

  const { data: pageData, paginationProps } = useTable({
    data: filteredData,
    pagination: many
      ? { defaultPageSize: 5, showPageSizeOptions: true }
      : undefined,
  });

  const displayData = many ? pageData ?? filteredData : filteredData;

  function renderCellContent(col: FluxColumn<T>, row: T): ReactNode {
    if (col.render) return col.render(row);
    if (col.field) return String((row as any)[col.field] ?? '');
    return '';
  }

  if (isLoading) {
    return (
      <Flex direction="column" gap="2">
        <Skeleton style={{ height: 40, width: '100%' }} />
        <Skeleton style={{ height: 32, width: '100%' }} />
        <Skeleton style={{ height: 32, width: '100%' }} />
        <Skeleton style={{ height: 32, width: '100%' }} />
      </Flex>
    );
  }

  if (displayData.length === 0) {
    return (
      <div className={styles.empty}>
        <Text>
          No {title || 'items'} found
          {title === 'flux controllers' ? '' : ' for this entity'}.
        </Text>
      </div>
    );
  }

  return (
    <Flex direction="column" gap="3">
      {many && (
        <SearchField
          aria-label={`Search ${title || 'items'}`}
          value={searchText}
          onChange={setSearchText}
        />
      )}
      <Table aria-label={title || 'Flux table'}>
        <TableHeader>
          {visibleColumns.map((col, i) => (
            <Column key={i} id={`col-${i}`} isRowHeader={i === 0}>
              {col.title}
            </Column>
          ))}
        </TableHeader>
        <TableBody>
          {displayData.map((row, rowIndex) => (
            <Row
              key={(row as any).id ?? rowIndex}
              id={(row as any).id ?? `row-${rowIndex}`}
            >
              {visibleColumns.map((col, colIndex) => (
                <Cell key={colIndex}>{renderCellContent(col, row)}</Cell>
              ))}
            </Row>
          ))}
        </TableBody>
      </Table>
      {many && <TablePagination {...paginationProps} />}
    </Flex>
  );
}
