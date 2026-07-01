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
import { Progress } from '@backstage/core-components';
import { useApi, fetchApiRef } from '@backstage/frontend-plugin-api';
import { Header, Container } from '@backstage/ui';
import useAsync from 'react-use/esm/useAsync';
import { TodoList } from '../TodoList';
import type { TodoItem } from '../TodoList';

const exampleTodos: TodoItem[] = [
  {
    id: '1',
    title: 'Install the backend plugin',
    createdBy: 'user:default/guest',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Connect the frontend to real data',
    createdBy: 'user:default/guest',
    createdAt: new Date().toISOString(),
  },
];

// TEMPLATE NOTE:
// This is a simple example of fetching data from the backend plugin.
// You can replace this with your own data fetching logic or use a
// generated client from an OpenAPI schema.
function useTodos() {
  const { fetch } = useApi(fetchApiRef);

  return useAsync(async (): Promise<TodoItem[]> => {
    const response = await fetch(`plugin://mcp-capabilities/todos`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch todos: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data.items;
  }, [fetch]);
}

export const TodoPage = () => {
  const { value: todos, loading, error } = useTodos();

  if (loading) {
    return <Progress />;
  }

  return (
    <>
      <Header title="Welcome to mcp-capabilities!" />
      <Container>
        <TodoList todos={error ? exampleTodos : todos ?? []} />
      </Container>
    </>
  );
};
