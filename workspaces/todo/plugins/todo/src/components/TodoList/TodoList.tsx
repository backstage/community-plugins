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

const columnWidths = {
  tag: '10%',
  text: '55%',
  repoFilePath: '25%',
  author: '10%',
} as const;

type TodoRow = TodoItem & { id: string };

const toRow = (item: TodoItem, index: number): TodoRow => ({
  ...item,
  id: `${item.repoFilePath ? item.repoFilePath : 'unknown'}:${
    item.lineNumber ? item.lineNumber : 'n'
  }:${item.tag}:${index}`,
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
    width: columnWidths.tag,
    isSortable: true,
    cell: item => <CellText title={item.tag} />,
  },
  {
    id: 'text',
    label: 'Text',
    width: columnWidths.text,
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
    width: columnWidths.repoFilePath,
    isSortable: true,
    cell: item =>
      item.viewUrl ? (
        <Cell>
          <Link
            href={item.viewUrl}
            target="_blank"
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
    width: columnWidths.author,
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
          data: result.items.map(toRow),
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
          <div style={{ width: columnWidths.tag }} />
          <div style={{ width: columnWidths.text }}>
            <SearchField
              aria-label="Filter by text"
              value={filter.value?.text ? filter.value.text : ''}
              onChange={value =>
                filter.onChange({ ...filter.value, text: value })
              }
            />
          </div>
          <div style={{ width: columnWidths.repoFilePath }}>
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
          <div style={{ width: columnWidths.author }}>
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
