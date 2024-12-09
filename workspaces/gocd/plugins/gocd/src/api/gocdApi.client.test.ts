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

import { setupRequestMockHandlers } from '@backstage/test-utils';
import { GoCdClientApi } from './gocdApi.client';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { PipelineHistory } from './gocdApi.model';

describe('GoCdClientApi', () => {
  const server = setupServer();
  setupRequestMockHandlers(server);

  it('makes requests through the proxy, using the provided fetch api', async () => {
    const response: PipelineHistory = {
      _links: { next: { href: '' } },
      pipelines: [],
    };

    server.use(
      http.get(
        'http://example.com/api/proxy/gocd/pipelines/my-pipeline/history',
        ({ request }) => {
          expect(new URL(request.url).searchParams.get('page_size')).toBe(
            '100',
          );
          return HttpResponse.json(response);
        },
      ),
    );

    const discoveryApi = {
      getBaseUrl: async (pluginId: string) =>
        `http://example.com/api/${pluginId}`,
    };

    const fetch = jest.fn().mockImplementation(global.fetch);
    const fetchApi = { fetch };
    const client = new GoCdClientApi(discoveryApi, fetchApi);

    await expect(client.getPipelineHistory('my-pipeline')).resolves.toEqual(
      response,
    );
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
