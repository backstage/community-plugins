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

import { useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderInTestApp } from '@backstage/test-utils';
import { GraphQLEndpoint } from '../../lib/api';
import { StorageBucket } from '../../lib/storage';
import { GraphiQLIcon } from '../../GraphiQLIcon';
import { GraphiQLBrowser } from './GraphiQLBrowser';

jest.mock('graphiql', () => ({
  GraphiQL: ({
    fetcher,
    storage,
    plugins,
  }: Pick<GraphQLEndpoint, 'fetcher' | 'plugins'> & { storage: Storage }) => {
    const [count, setCount] = useState(0);
    return (
      <div>
        <p>Stored query: {storage.getItem('query')}</p>
        <p>Plugin: {plugins?.[0].title}</p>
        <button
          onClick={() => {
            setCount(count + 1);
            fetcher({ query: storage.getItem('query') });
          }}
        >
          Execute query ({count})
        </button>
      </div>
    );
  },
}));

describe('GraphiQLBrowser endpoint switching', () => {
  afterEach(() => {
    StorageBucket.forLocalStorage('plugin/graphiql/data/a').clear();
    StorageBucket.forLocalStorage('plugin/graphiql/data/b').clear();
  });

  it('uses each endpoint fetcher, storage and plugins and remounts on switching', async () => {
    const user = userEvent.setup();
    const fetcherA = jest.fn().mockResolvedValue({ data: {} });
    const fetcherB = jest.fn().mockResolvedValue({ data: {} });
    const storageA = StorageBucket.forLocalStorage('plugin/graphiql/data/a');
    const storageB = StorageBucket.forLocalStorage('plugin/graphiql/data/b');
    storageA.setItem('query', '{ endpointA }');
    storageB.setItem('query', '{ endpointB }');

    await renderInTestApp(
      <GraphiQLBrowser
        endpoints={[
          {
            id: 'a',
            title: 'Endpoint A',
            fetcher: fetcherA,
            plugins: [
              { title: 'Plugin A', icon: GraphiQLIcon, content: () => null },
            ],
          },
          {
            id: 'b',
            title: 'Endpoint B',
            fetcher: fetcherB,
            plugins: [
              { title: 'Plugin B', icon: GraphiQLIcon, content: () => null },
            ],
          },
        ]}
      />,
    );

    expect(
      await screen.findByText('Stored query: { endpointA }'),
    ).toBeVisible();
    expect(screen.getByText('Plugin: Plugin A')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Execute query (0)' }));
    expect(fetcherA).toHaveBeenCalledWith({ query: '{ endpointA }' });
    expect(fetcherB).not.toHaveBeenCalled();

    await user.click(screen.getByRole('tab', { name: 'Endpoint B' }));
    expect(
      await screen.findByText('Stored query: { endpointB }'),
    ).toBeVisible();
    expect(screen.getByText('Plugin: Plugin B')).toBeVisible();
    expect(screen.queryByText('Plugin: Plugin A')).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Endpoint B' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await user.click(screen.getByRole('button', { name: 'Execute query (0)' }));
    expect(fetcherB).toHaveBeenCalledWith({ query: '{ endpointB }' });
    expect(fetcherA).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('tab', { name: 'Endpoint A' }));
    expect(
      await screen.findByText('Stored query: { endpointA }'),
    ).toBeVisible();
    expect(screen.getByText('Plugin: Plugin A')).toBeVisible();
    expect(screen.queryByText('Plugin: Plugin B')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Execute query (0)' }),
    ).toBeVisible();
  });
});
