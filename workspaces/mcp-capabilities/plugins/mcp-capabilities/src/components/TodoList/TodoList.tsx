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
import { Table, useTable, CellText, type ColumnConfig } from '@backstage/ui';

export type TodoItem = {
  title: string;
  id: string;
  createdBy: string;
  createdAt: string;
};

const columns: ColumnConfig<TodoItem>[] = [
  {
    id: 'title',
    label: 'Title',
    cell: item => <CellText title={item.title} />,
  },
  {
    id: 'createdBy',
    label: 'Created by',
    cell: item => <CellText title={item.createdBy} />,
  },
  {
    id: 'createdAt',
    label: 'Created at',
    cell: item => (
      <CellText title={new Date(item.createdAt).toLocaleString()} />
    ),
  },
];

export const TodoList = ({ todos }: { todos: TodoItem[] }) => {
  const { tableProps } = useTable({
    mode: 'complete',
    data: todos,
    paginationOptions: { pageSize: todos.length || 1 },
  });

  return (
    <Table
      columnConfig={columns}
      {...tableProps}
      pagination={{ type: 'none' }}
    />
  );
};
