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
import { MyMetricsClient } from './MyMetricsClient';

describe('MyMetricsClient', () => {
  const discoveryApi = { getBaseUrl: jest.fn() };
  const fetchApi = { fetch: jest.fn() };

  beforeEach(() => {
    jest.resetAllMocks();
    discoveryApi.getBaseUrl.mockResolvedValue('http://localhost/api/copilot');
  });

  it('calls only the /v2/me/dashboard route on the copilot backend plugin', async () => {
    fetchApi.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ matched: false }),
    });

    const client = new MyMetricsClient({ discoveryApi, fetchApi });
    const result = await client.getMyDashboard({
      type: 'organization',
      entityId: 'my-org',
      from: '2026-01-01',
      to: '2026-01-31',
    });

    expect(discoveryApi.getBaseUrl).toHaveBeenCalledWith('copilot');
    expect(fetchApi.fetch).toHaveBeenCalledWith(
      expect.stringMatching(
        /^http:\/\/localhost\/api\/copilot\/v2\/me\/dashboard\?/,
      ),
    );
    const [calledUrl] = fetchApi.fetch.mock.calls[0];
    const params = new URL(calledUrl).searchParams;
    // Only the non-identifying scope/date params are ever sent — never a
    // user or team identifier.
    expect([...params.keys()].sort()).toEqual([
      'entityId',
      'from',
      'to',
      'type',
    ]);
    expect(result).toEqual({ matched: false });
  });

  it('throws a ResponseError when the request fails', async () => {
    fetchApi.fetch.mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      text: async () => '',
      json: async () => ({}),
    });

    const client = new MyMetricsClient({ discoveryApi, fetchApi });
    await expect(
      client.getMyDashboard({
        type: 'organization',
        entityId: 'my-org',
        from: '2026-01-01',
        to: '2026-01-31',
      }),
    ).rejects.toThrow();
  });
});
