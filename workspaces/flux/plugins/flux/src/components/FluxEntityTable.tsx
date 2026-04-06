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
import { ReactElement, useMemo } from 'react';
import {
  Table,
  Cell,
  CellText,
  Text,
  useTable,
  Flex,
  SearchField,
  Skeleton,
  Header,
  Container,
} from '@backstage/ui';
import type { ColumnConfig, TableItem } from '@backstage/ui';
import styles from './utils.module.css';

/**
 * Column configuration compatible with the old TableColumn interface,
 * but rendered using BUI Table primitives.
 */
export interface FluxColumn<T extends object> {
  title: string;
  field?: string;
  render?: (row: T) => ReactElement | string | null;
  hidden?: boolean;
  width?: number;
  customSort?: (a: T, b: T) => number;
  customFilterAndSearch?: (filter: string, item: T) => boolean;
}

interface FluxEntityTableProps<T extends TableItem> {
  title?: string;
  data: T[];
  isLoading: boolean;
  columns: FluxColumn<T>[];
  many?: boolean;
}

function toColumnConfig<T extends TableItem>(
  col: FluxColumn<T>,
  index: number,
  isRowHeader: boolean,
): ColumnConfig<T> {
  return {
    id: col.field ?? `col-${index}`,
    label: col.title,
    isHidden: col.hidden,
    isRowHeader,
    ...(col.width ? { width: col.width } : {}),
    cell: (item: T) => {
      if (col.render) {
        const content = col.render(item);
        if (content === null || content === undefined) return <Cell />;
        if (typeof content === 'string') return <CellText title={content} />;
        return <Cell>{content}</Cell>;
      }
      if (col.field) {
        return <CellText title={String((item as any)[col.field] ?? '')} />;
      }
      return <Cell />;
    },
    isSortable: true,
  };
}

export function FluxEntityTable<T extends TableItem>({
  title,
  data,
  isLoading,
  columns,
  many,
}: FluxEntityTableProps<T>) {
  const columnConfig = useMemo(() => {
    const firstVisibleIndex = columns.findIndex(c => !c.hidden);
    return columns.map((col, i) =>
      toColumnConfig(col, i, i === firstVisibleIndex),
    );
  }, [columns]);

  const filterableColumns = useMemo(
    () => columns.filter(c => c.customFilterAndSearch),
    [columns],
  );

  const searchFn = useMemo(() => {
    if (filterableColumns.length === 0) return undefined;
    return (items: T[], search: string) =>
      items.filter(item =>
        filterableColumns.some(col => col.customFilterAndSearch!(search, item)),
      );
  }, [filterableColumns]);

  const { tableProps, search } = useTable<T>({
    mode: 'complete',
    data,
    paginationOptions: many
      ? { pageSize: 5, showPageSizeOptions: true }
      : undefined,
    searchFn,
  });

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

  if (data.length === 0) {
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
    <Container>
      <Header
        title={title}
        customActions={
          <>
            {many && (
              <Flex className={styles.searchBar}>
                <SearchField
                  aria-label={`Search ${title || 'items'}`}
                  placeholder="Search..."
                  value={search.value}
                  onChange={search.onChange}
                />
              </Flex>
            )}
          </>
        }
      />
      <Table
        aria-label={title || 'Flux table'}
        columnConfig={columnConfig}
        {...tableProps}
      />
    </Container>
  );
}
