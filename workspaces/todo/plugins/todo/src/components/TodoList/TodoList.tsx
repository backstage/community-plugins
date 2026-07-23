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
import { useState } from 'react';
import { todoApiRef } from '../../api';
import { TodoItem, TodoListFields, TodoListOptions } from '../../api/types';
import { ResponseErrorPanel } from '@backstage/core-components';
import {
  Card,
  CardBody,
  CardHeader,
  Cell,
  CellText,
  Link,
  SearchField,
  Table,
  Text,
  Flex,
  useTable,
  type ColumnConfig,
} from '@backstage/ui';
import { useApi } from '@backstage/core-plugin-api';

const PAGE_SIZE = 10;

type TodoRow = TodoItem & { id: string };

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

type TodoFilters = {
  text?: string;
  repoFilePath?: string;
  author?: string;
};

const columns: (ColumnConfig<TodoRow> & { id: TodoListFields })[] = [
  {
    id: 'tag',
    label: 'Tag',
    width: '10%',
    isSortable: true,
    cell: item => <CellText title={item.tag} />,
  },
  {
    id: 'text',
    label: 'Text',
    width: '55%',
    isRowHeader: true,
    isSortable: true,
    cell: item => (
      <Cell>
        <Text variant="body-medium" weight="bold" truncate title={item.text}>
          {item.text}
        </Text>
      </Cell>
    ),
  },
  {
    id: 'repoFilePath',
    label: 'File',
    width: '25%',
    isSortable: true,
    cell: item =>
      item.viewUrl ? (
        <Cell>
          <Link
            href={item.viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            truncate
            title={item.repoFilePath ? item.repoFilePath : '-'}
          >
            {item.repoFilePath ? item.repoFilePath : '-'}
          </Link>
        </Cell>
      ) : (
        <CellText title={item.repoFilePath ? item.repoFilePath : '-'} />
      ),
  },
  {
    id: 'author',
    label: 'Author',
    width: '10%',
    isSortable: true,
    cell: item => <CellText title={item.author ? item.author : '-'} />,
  },
];

export const TodoList = () => {
  const { entity } = useEntity();
  const todoApi = useApi(todoApiRef);
  const [error, setError] = useState<Error>();

  const { tableProps, filter } = useTable<TodoRow, TodoFilters>({
    mode: 'offset',
    paginationOptions: { pageSize: PAGE_SIZE },
    getData: async ({ offset, pageSize, sort, filter: activeFilter }) => {
      try {
        const filters: TodoListOptions['filters'] = [];
        const text = activeFilter?.text?.trim();
        if (text) {
          filters.push({ field: 'text', value: `*${text}*` });
        }
        const repoFilePath = activeFilter?.repoFilePath?.trim();
        if (repoFilePath) {
          filters.push({ field: 'repoFilePath', value: `*${repoFilePath}*` });
        }
        const author = activeFilter?.author?.trim();
        if (author) {
          filters.push({ field: 'author', value: `*${author}*` });
        }

        const result = await todoApi.listTodos({
          entity,
          offset,
          limit: pageSize,
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

  const hasActiveFilter = Boolean(
    filter.value?.text?.trim() ||
      filter.value?.repoFilePath?.trim() ||
      filter.value?.author?.trim(),
  );

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <Card>
      <CardHeader>
        <Text as="h2" variant="title-medium">
          TODOs
        </Text>
        <Flex>
          <div style={{ width: '10%' }} />
          <div style={{ width: '55%' }}>
            <SearchField
              aria-label="Filter by text"
              value={filter.value?.text ? filter.value.text : ''}
              onChange={value =>
                filter.onChange({ ...filter.value, text: value })
              }
            />
          </div>
          <div style={{ width: '25%' }}>
            <SearchField
              aria-label="Filter by file"
              value={
                filter.value?.repoFilePath ? filter.value.repoFilePath : ''
              }
              onChange={value =>
                filter.onChange({ ...filter.value, repoFilePath: value })
              }
            />
          </div>
          <div style={{ width: '10%' }}>
            <SearchField
              aria-label="Filter by author"
              value={filter.value?.author ? filter.value.author : ''}
              onChange={value =>
                filter.onChange({ ...filter.value, author: value })
              }
            />
          </div>
        </Flex>
      </CardHeader>
      <CardBody>
        <Table<TodoRow>
          columnConfig={columns}
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
