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
import { mockServices } from '@backstage/backend-test-utils';
import { MCPClient } from './MCPClient';

const logger = mockServices.logger.mock();

function jsonRpc(
  body: unknown,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

/** Route the mock by the JSON-RPC `method` in the request body. */
function mockFetch(handlers: Record<string, () => Response>) {
  return jest
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async (_url, init) => {
      const method = JSON.parse(String(init?.body ?? '{}')).method as string;
      return (
        handlers[method]?.() ??
        new Response('{}', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );
    });
}

function methodsCalled(spy: jest.SpyInstance): string[] {
  return spy.mock.calls.map(
    c => JSON.parse(String((c[1] as RequestInit).body)).method as string,
  );
}

describe('MCPClient', () => {
  afterEach(() => jest.restoreAllMocks());

  it('handshakes and discovers only advertised capabilities', async () => {
    const spy = mockFetch({
      initialize: () =>
        jsonRpc(
          {
            jsonrpc: '2.0',
            id: 1,
            result: {
              protocolVersion: '2025-06-18',
              serverInfo: { name: 'demo', version: '1.2.3' },
              // tools + resources advertised, prompts NOT
              capabilities: { tools: {}, resources: {} },
              instructions: 'use me',
            },
          },
          { 'mcp-session-id': 'sess-1' },
        ),
      'notifications/initialized': () => new Response(null, { status: 202 }),
      'tools/list': () =>
        jsonRpc({
          jsonrpc: '2.0',
          id: 2,
          result: {
            tools: [
              {
                name: 'search',
                description: 'Search',
                inputSchema: { type: 'object' },
              },
            ],
          },
        }),
      'resources/list': () =>
        jsonRpc({
          jsonrpc: '2.0',
          id: 3,
          result: { resources: [{ uri: 'file://x', name: 'x' }] },
        }),
    });

    const spec = await new MCPClient(
      { url: 'http://mcp.test/mcp' },
      logger,
    ).discover();

    expect(spec.serverInfo).toEqual({ name: 'demo', version: '1.2.3' });
    expect(spec.protocolVersion).toBe('2025-06-18');
    expect(spec.instructions).toBe('use me');
    expect(spec.capabilities).toEqual({
      tools: true,
      resources: true,
      prompts: false,
    });
    expect(spec.tools).toEqual([
      {
        name: 'search',
        description: 'Search',
        inputSchema: { type: 'object' },
      },
    ]);
    expect(spec.resources).toHaveLength(1);
    expect(spec.prompts).toEqual([]);

    // prompts capability absent -> prompts/list never called
    expect(methodsCalled(spy)).not.toContain('prompts/list');
    // session id captured from initialize and echoed on later requests
    const toolsCall = spy.mock.calls.find(
      c =>
        JSON.parse(String((c[1] as RequestInit).body)).method === 'tools/list',
    )!;
    expect(
      (toolsCall[1] as RequestInit).headers as Record<string, string>,
    ).toMatchObject({ 'Mcp-Session-Id': 'sess-1' });
  });

  it('parses text/event-stream (SSE) responses', async () => {
    mockFetch({
      initialize: () =>
        new Response(
          'event: message\ndata: {"jsonrpc":"2.0","id":1,"result":{"capabilities":{}}}\n\n',
          { status: 200, headers: { 'content-type': 'text/event-stream' } },
        ),
      'notifications/initialized': () => new Response(null, { status: 202 }),
    });

    const spec = await new MCPClient(
      { url: 'http://mcp.test/mcp' },
      logger,
    ).discover();

    expect(spec.capabilities).toEqual({
      tools: false,
      resources: false,
      prompts: false,
    });
  });

  it('returns an empty list when a list call reports a JSON-RPC error', async () => {
    mockFetch({
      initialize: () =>
        jsonRpc({
          jsonrpc: '2.0',
          id: 1,
          result: { capabilities: { tools: {} } },
        }),
      'notifications/initialized': () => new Response(null, { status: 202 }),
      'tools/list': () =>
        jsonRpc({
          jsonrpc: '2.0',
          id: 2,
          error: { code: -32601, message: 'not supported' },
        }),
    });

    const spec = await new MCPClient(
      { url: 'http://mcp.test/mcp' },
      logger,
    ).discover();

    expect(spec.capabilities?.tools).toBe(true);
    expect(spec.tools).toEqual([]);
  });

  it('throws on a non-OK HTTP response', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response('nope', { status: 500, statusText: 'Server Error' }),
      );

    await expect(
      new MCPClient({ url: 'http://mcp.test/mcp' }, logger).discover(),
    ).rejects.toThrow(/HTTP 500/);
  });
});
