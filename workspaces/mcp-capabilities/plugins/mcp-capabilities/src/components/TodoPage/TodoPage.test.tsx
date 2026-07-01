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
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import {
  registerMswTestHooks,
  renderInTestApp,
} from '@backstage/frontend-test-utils';
import { TodoPage } from './TodoPage';

describe('TodoPage', () => {
  const server = setupServer();
  registerMswTestHooks(server);

  it('renders todos from the backend', async () => {
    server.use(
      rest.get('*/api/mcp-capabilities/todos', (_, res, ctx) =>
        res(
          ctx.json({
            items: [
              {
                id: '1',
                title: 'Mocked task',
                createdBy: 'user:default/guest',
                createdAt: '2025-01-01T00:00:00.000Z',
              },
            ],
          }),
        ),
      ),
    );

    await renderInTestApp(<TodoPage />);

    expect(await screen.findByText('Mocked task')).toBeInTheDocument();
  });

  it('falls back to example data when the backend fails', async () => {
    server.use(
      rest.get('*/api/mcp-capabilities/todos', (_, res, ctx) =>
        res(ctx.status(500), ctx.json({ message: 'Internal Server Error' })),
      ),
    );

    await renderInTestApp(<TodoPage />);

    expect(
      await screen.findByText('Install the backend plugin'),
    ).toBeInTheDocument();
  });
});
