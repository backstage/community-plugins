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
import { GrowthbookFlagsClient } from './api';

function makeClient(response: {
  status?: number;
  body?: unknown;
  text?: string;
}) {
  const fetch = jest.fn(async (_url: string) => ({
    ok: (response.status ?? 200) < 400,
    status: response.status ?? 200,
    json: async () => response.body,
    text: async () => response.text ?? '',
  }));
  const client = new GrowthbookFlagsClient({
    discoveryApi: {
      getBaseUrl: async () =>
        'http://localhost/api/backstage-community-growthbook',
    },
    fetchApi: { fetch } as any,
  });
  return { client, fetch };
}

describe('GrowthbookFlagsClient experiments', () => {
  it('requests experiments for a project', async () => {
    const { client, fetch } = makeClient({ body: [{ id: 'e1' }] });
    expect(await client.getExperiments('My Project')).toEqual([{ id: 'e1' }]);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost/api/backstage-community-growthbook/experiments?project=My+Project',
    );
  });

  it('omits the project parameter when none is given', async () => {
    const { client, fetch } = makeClient({ body: [] });
    await client.getExperiments();
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost/api/backstage-community-growthbook/experiments',
    );
  });

  it('resolves to an empty list on 501 (SDK mode)', async () => {
    const { client } = makeClient({ status: 501, text: 'needs secretKey' });
    expect(await client.getExperiments('p')).toEqual([]);
  });

  it('throws on other errors', async () => {
    const { client } = makeClient({ status: 502, text: 'bad gateway' });
    await expect(client.getExperiments('p')).rejects.toThrow(/502/);
  });
});

describe('GrowthbookFlagsClient results and details', () => {
  it('url-encodes experiment ids and flag keys', async () => {
    const { client, fetch } = makeClient({ body: {} });
    await client.getExperimentResults('a/b c');
    await client.getFlagDetail('my.flag/x');
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      'http://localhost/api/backstage-community-growthbook/experiments/a%2Fb%20c/results',
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      'http://localhost/api/backstage-community-growthbook/flags/my.flag%2Fx',
    );
  });

  it('throws with status and body on failure', async () => {
    const { client } = makeClient({ status: 404, text: 'Flag not found' });
    await expect(client.getFlagDetail('x')).rejects.toThrow(
      /404.*Flag not found/,
    );
  });
});
