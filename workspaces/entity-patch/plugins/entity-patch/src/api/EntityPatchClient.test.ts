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
import { EntityPatchClient } from './EntityPatchClient';

const mockFetch = jest.fn();
const mockDiscovery = {
  getBaseUrl: jest
    .fn()
    .mockResolvedValue('http://localhost:7007/api/entity-patch'),
  getExternalBaseUrl: jest.fn(),
};

function makeClient() {
  return new EntityPatchClient({
    discoveryApi: mockDiscovery,
    fetchApi: { fetch: mockFetch },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('EntityPatchClient.savePatch', () => {
  it('sends patchName and data as JSON body', async () => {
    mockFetch.mockResolvedValue({ ok: true });

    const client = makeClient();
    await client.savePatch(
      'Component',
      'default',
      'my-svc',
      'component-metadata',
      {
        description: 'New description',
        lifecycle: 'production',
      },
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, options] = mockFetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.patchName).toBe('component-metadata');
    expect(body.data).toEqual({
      description: 'New description',
      lifecycle: 'production',
    });
  });

  it('throws immediately when data is empty — callers must skip empty patches', async () => {
    const client = makeClient();
    await expect(
      client.savePatch(
        'Component',
        'default',
        'my-svc',
        'component-metadata',
        {},
      ),
    ).rejects.toThrow(/empty data/);

    // fetch should never be called for empty data
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('throws when the backend returns a non-ok status', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => '{"error":"Invalid request body"}',
    });

    const client = makeClient();
    await expect(
      client.savePatch('Component', 'default', 'my-svc', 'component-metadata', {
        description: 'test',
      }),
    ).rejects.toThrow('Failed to save patch (400)');
  });
});
