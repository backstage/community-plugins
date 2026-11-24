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
import { configApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import {
  mockApis,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/test-utils';
import { ApiFetcher, ApiFetcherContent, ApiFetcherData } from './ApiFetcher';

describe('ApiFetcher', () => {
  const fetch = jest.fn();

  const renderFetcher = (element: JSX.Element) =>
    renderInTestApp(
      <TestApiProvider
        apis={[
          [
            configApiRef,
            mockApis.config({
              data: { backend: { baseUrl: 'http://backend' } },
            }),
          ],
          [fetchApiRef, { fetch }],
        ]}
      >
        {element}
      </TestApiProvider>,
    );

  beforeEach(() => fetch.mockReset());

  it('renders values from the response by path', async () => {
    fetch.mockResolvedValue(
      new Response(JSON.stringify({ items: [{ name: 'first' }] }), {
        headers: { 'content-type': 'application/json' },
      }),
    );

    await renderFetcher(
      <ApiFetcher url="/api/catalog/entities">
        <ApiFetcherContent>
          <ApiFetcherData
            path="items.0.name"
            render={value => <span>{String(value)}</span>}
          />
        </ApiFetcherContent>
      </ApiFetcher>,
    );

    expect(await screen.findByText('first')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith('http://backend/api/catalog/entities');
  });

  it('renders request failures', async () => {
    fetch.mockResolvedValue(
      new Response('', { status: 500, statusText: 'Internal Server Error' }),
    );

    await renderFetcher(
      <ApiFetcher url="/api/broken">
        <ApiFetcherContent>
          <span>never</span>
        </ApiFetcherContent>
      </ApiFetcher>,
    );

    expect(
      await screen.findByText('API request failed: 500 Internal Server Error'),
    ).toBeInTheDocument();
  });
});
