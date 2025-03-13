/*
 * Copyright 2024 The Backstage Authors
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
import { ConfigReader } from '@backstage/config';
import fetch from 'node-fetch';
import { GithubClient } from './GithubClient';

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('GithubClient', () => {
  const config = new ConfigReader({
    copilot: {
      host: 'github.com',
      enterprise: 'test-enterprise',
      organization: 'test-org',
    },
    integrations: {
      github: [
        {
          host: 'github.com',
          token: 'test-token',
        },
      ],
    },
  });

  const client = GithubClient.fromConfig(config);

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should fetch all enterprise teams with paging', async () => {
    mockFetch
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ id: 1 }, { id: 2 }])),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 3 }])))
      .mockResolvedValueOnce(new Response(JSON.stringify([])));

    const teams = await (await client).fetchEnterpriseTeams();
    expect(teams).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('should fetch all organization teams with paging', async () => {
    mockFetch
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ id: 1 }, { id: 2 }])),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 3 }])))
      .mockResolvedValueOnce(new Response(JSON.stringify([])));

    const teams = await (await client).fetchOrganizationTeams();
    expect(teams).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });
});
