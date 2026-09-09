/*
 * Copyright 2021 The Backstage Authors
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

import { useEntity } from '@backstage/plugin-catalog-react';
import { useMemo, useState, type ReactElement } from 'react';
import { todoApiRef } from '../../api';
import { TodoItem, TodoListFields, TodoListOptions } from '../../api/types';

import { ResponseErrorPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import {
  Card,
  CardBody,
  CardHeader,
  Cell,
  CellText,
  Flex,
  Link,
  Table,
  Text,
  TextField,
  useTable,
  type ColumnConfig,
  type TableItem,
} from '@backstage/ui';

const PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50];

type TodoRow = TodoItem & TableItem;

type TodoFilters = {
  text?: string;
};

const toRowId = (item: TodoItem): string => {
  const repoFilePath = item.repoFilePath ?? 'unknown';
  const lineNumber =
    item.lineNumber !== undefined ? String(item.lineNumber) : 'n';

  return `${repoFilePath}:${lineNumber}:${item.tag}:${item.text}`;
};

const toRow = (item: TodoItem, offset: number, index: number): TodoRow => ({
  ...item,
  id: `${toRowId(item)}:${offset}:${index}`,
});

const columns: (ColumnConfig<TodoRow> & { id: TodoListFields })[] = [
  {
    id: 'tag',
    label: 'Tag',
    width: '10%',
    isSortable: true,
    cell: (row): ReactElement => <CellText title={row.tag} />,
  },
  {
    id: 'text',
    label: 'Text',
    width: '55%',
    isRowHeader: true,
    isSortable: true,
    cell: (row): ReactElement => <CellText title={row.text} />,
  },
  {
    id: 'repoFilePath',
    label: 'File',
    width: '25%',
    isSortable: true,
    cell: (row): ReactElement => {
      const path = row.repoFilePath ?? '';
      if (row.viewUrl) {
        return (
          <Cell>
            <Link href={row.viewUrl} target="_blank" rel="noopener noreferrer">
              {path || row.viewUrl}
            </Link>
          </Cell>
        );
      }
      return <CellText title={path || '-'} />;
    },
  },
  {
    id: 'author',
    label: 'Author',
    width: '10%',
    isSortable: true,
    cell: (row): ReactElement => <CellText title={row.author ?? ''} />,
  },
];

type TodoListTableProps = {
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
};

const TodoListTable = ({ pageSize, onPageSizeChange }: TodoListTableProps) => {
  const { entity } = useEntity();
  const todoApi = useApi(todoApiRef);
  const [error, setError] = useState<Error>();
  const columnConfig = useMemo(() => columns, []);

  const { tableProps, filter } = useTable<TodoRow, TodoFilters>({
    mode: 'offset',
    paginationOptions: {
      pageSize,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
      onPageSizeChange,
    },
    getData: async ({
      offset,
      pageSize: limit,
      sort,
      filter: activeFilter,
    }) => {
      try {
        const filters: NonNullable<TodoListOptions['filters']> = [];
        const text = activeFilter?.text?.trim();
        if (text) {
          filters.push({ field: 'text', value: `*${text}*` });
        }

        const result = await todoApi.listTodos({
          entity,
          offset,
          limit,
          orderBy: sort
            ? {
                field: sort.column as TodoListFields,
                direction: sort.direction === 'ascending' ? 'asc' : 'desc',
              }
            : undefined,
          filters: filters.length ? filters : undefined,
        });

        return {
          data: result.items.map((item, index) => toRow(item, offset, index)),
          totalCount: result.totalCount,
        };
      } catch (loadingError) {
        setError(loadingError as Error);
        return { data: [], totalCount: 0 };
      }
    },
  });

  const hasActiveFilter = Boolean(filter.value?.text?.trim());

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <Card>
      <CardHeader>
        <Flex justify="between" align="center">
          <Text variant="title-medium">TODOs</Text>
          <TextField
            value={filter.value?.text ?? ''}
            onChange={value =>
              filter.onChange({ ...filter.value, text: value })
            }
            placeholder="Filter..."
            aria-label="Filter TODOs"
            style={{ width: '200px' }}
          />
        </Flex>
      </CardHeader>
      <CardBody>
        <Table
          columnConfig={columnConfig}
          {...tableProps}
          aria-label="TODOs"
          emptyState={
            <Text variant="body-medium">
              {hasActiveFilter
                ? 'No TODOs match the current filters.'
                : 'No TODOs found.'}
            </Text>
          }
        />
      </CardBody>
    </Card>
  );
};

export const TodoList = () => {
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  // Remount useTable when page size changes. BUI offset mode can keep a stale
  // cached page of rows after the page-size dropdown changes.
  return (
    <TodoListTable
      key={pageSize}
      pageSize={pageSize}
      onPageSizeChange={setPageSize}
    />
  );
};
