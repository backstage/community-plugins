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
import { discoverFromClient, type McpDiscoveryClient } from './discovery';

function fakeClient(
  overrides: Partial<McpDiscoveryClient> = {},
): McpDiscoveryClient {
  return {
    getServerVersion: () => undefined,
    getInstructions: () => undefined,
    getServerCapabilities: () => ({}),
    listTools: async () => ({ tools: [] }),
    listResources: async () => ({ resources: [] }),
    listPrompts: async () => ({ prompts: [] }),
    ...overrides,
  };
}

describe('discoverFromClient', () => {
  it('lists only advertised capabilities and maps the results', async () => {
    const listPrompts = jest.fn(async () => ({ prompts: [] }));
    const spec = await discoverFromClient(
      fakeClient({
        getServerVersion: () => ({ name: 'demo', version: '1.2.3' }),
        getInstructions: () => 'use me',
        getServerCapabilities: () => ({ tools: {}, resources: {} }),
        listTools: async () => ({
          tools: [
            {
              name: 'search',
              description: 'Search',
              inputSchema: { type: 'object' },
            },
          ],
        }),
        listResources: async () => ({
          resources: [{ uri: 'file://x', name: 'x' }],
        }),
        listPrompts,
      }),
    );

    expect(spec.serverInfo).toEqual({ name: 'demo', version: '1.2.3' });
    expect(spec.instructions).toBe('use me');
    expect(spec.capabilities).toEqual({
      tools: true,
      resources: true,
      prompts: false,
    });
    // tool mapped, missing inputSchema would default to {}
    expect(spec.tools).toEqual([
      {
        name: 'search',
        description: 'Search',
        inputSchema: { type: 'object' },
      },
    ]);
    expect(spec.resources).toHaveLength(1);
    expect(spec.prompts).toEqual([]);
    // prompts capability absent -> listPrompts never called
    expect(listPrompts).not.toHaveBeenCalled();
  });

  it('isolates a failing list call, leaving the others intact', async () => {
    const onListError = jest.fn();
    const spec = await discoverFromClient(
      fakeClient({
        getServerCapabilities: () => ({ tools: {}, resources: {} }),
        listTools: async () => {
          throw new Error('boom');
        },
        listResources: async () => ({ resources: [{ uri: 'u', name: 'r' }] }),
      }),
      { onListError },
    );

    expect(spec.tools).toEqual([]);
    expect(spec.resources).toHaveLength(1);
    expect(onListError).toHaveBeenCalledWith(
      expect.stringContaining('tools/list failed'),
    );
  });
});
