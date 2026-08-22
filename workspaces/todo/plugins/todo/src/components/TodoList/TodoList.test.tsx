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

import { Entity } from '@backstage/catalog-model';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { act, fireEvent, screen } from '@testing-library/react';
import { TodoApi, todoApiRef } from '../../api';
import { TodoList } from './TodoList';

const mockEntity = {
  metadata: { name: 'mock' },
  kind: 'MockKind',
} as Entity;

const mockListResult = {
  items: [
    {
      text: 'My TODO',
      tag: 'FIXME',
      author: 'Rugvip',
      viewUrl: 'https://example.com',
      repoFilePath: '/my-file.js',
    },
  ],
  totalCount: 1,
  limit: 10,
  offset: 0,
};

const renderTodoList = (mockApi: jest.Mocked<TodoApi>) =>
  renderInTestApp(
    <TestApiProvider apis={[[todoApiRef, mockApi]]}>
      <EntityProvider entity={mockEntity}>
        <TodoList />
      </EntityProvider>
    </TestApiProvider>,
  );

const flushPendingTimers = async () => {
  await act(async () => {
    jest.runOnlyPendingTimers();
  });
};

describe('TodoList', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render and request todos for the entity', async () => {
    const mockApi: jest.Mocked<TodoApi> = {
      listTodos: jest.fn().mockResolvedValue(mockListResult),
    };

    await renderTodoList(mockApi);

    await expect(screen.findByText('FIXME')).resolves.toBeInTheDocument();
    expect(mockApi.listTodos).toHaveBeenCalledWith({
      entity: mockEntity,
      offset: 0,
      limit: 10,
      orderBy: undefined,
      filters: undefined,
    });
  });

  it('translates filter inputs into wildcard server-side filters', async () => {
    const mockApi: jest.Mocked<TodoApi> = {
      listTodos: jest.fn().mockResolvedValue(mockListResult),
    };

    await renderTodoList(mockApi);
    await screen.findByText('FIXME');

    fireEvent.change(screen.getByLabelText('Filter by text'), {
      target: { value: '  pagination  ' },
    });
    fireEvent.change(screen.getByLabelText('Filter by file'), {
      target: { value: 'TodoList' },
    });
    fireEvent.change(screen.getByLabelText('Filter by author'), {
      target: { value: 'Rugvip' },
    });

    await flushPendingTimers();

    await screen.findByText('FIXME');

    expect(mockApi.listTodos).toHaveBeenLastCalledWith({
      entity: mockEntity,
      offset: 0,
      limit: 10,
      orderBy: undefined,
      filters: [
        { field: 'text', value: '*pagination*' },
        { field: 'repoFilePath', value: '*TodoList*' },
        { field: 'author', value: '*Rugvip*' },
      ],
    });
  });

  it('translates table sort into server-side orderBy', async () => {
    const mockApi: jest.Mocked<TodoApi> = {
      listTodos: jest.fn().mockResolvedValue(mockListResult),
    };

    await renderTodoList(mockApi);
    await screen.findByText('FIXME');

    fireEvent.click(screen.getByRole('columnheader', { name: 'Author' }));

    await flushPendingTimers();

    await screen.findByText('FIXME');

    expect(mockApi.listTodos).toHaveBeenLastCalledWith({
      entity: mockEntity,
      offset: 0,
      limit: 10,
      orderBy: { field: 'author', direction: 'asc' },
      filters: undefined,
    });

    fireEvent.click(screen.getByRole('columnheader', { name: 'Author' }));

    await flushPendingTimers();

    await screen.findByText('FIXME');

    expect(mockApi.listTodos).toHaveBeenLastCalledWith({
      entity: mockEntity,
      offset: 0,
      limit: 10,
      orderBy: { field: 'author', direction: 'desc' },
      filters: undefined,
    });
  });
});
