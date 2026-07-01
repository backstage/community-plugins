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
import { screen } from '@testing-library/react';
import { renderInTestApp } from '@backstage/frontend-test-utils';
import { TodoList } from './TodoList';

describe('TodoList', () => {
  it('renders a list of todos', async () => {
    const todos = [
      {
        id: '1',
        title: 'First task',
        createdBy: 'user:default/guest',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: '2',
        title: 'Second task',
        createdBy: 'user:default/admin',
        createdAt: '2025-01-02T00:00:00.000Z',
      },
    ];

    await renderInTestApp(<TodoList todos={todos} />);

    expect(await screen.findByText('First task')).toBeInTheDocument();
    expect(await screen.findByText('Second task')).toBeInTheDocument();
    expect(await screen.findByText('user:default/guest')).toBeInTheDocument();
  });
});
