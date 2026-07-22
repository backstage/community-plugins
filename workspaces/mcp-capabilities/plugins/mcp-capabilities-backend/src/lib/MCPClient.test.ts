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
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { MCPClient } from './MCPClient';

jest.mock('@modelcontextprotocol/sdk/client/index.js');
jest.mock('@modelcontextprotocol/sdk/client/streamableHttp.js');

const MockedClient = Client as jest.MockedClass<typeof Client>;
const logger = mockServices.logger.mock();

interface MockClient {
  connect: jest.Mock;
  getServerCapabilities: jest.Mock;
  getServerVersion: jest.Mock;
  getInstructions: jest.Mock;
  listTools: jest.Mock;
  listResources: jest.Mock;
  listPrompts: jest.Mock;
  close: jest.Mock;
}

function installMockClient(overrides: Partial<MockClient> = {}): MockClient {
  const client: MockClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    getServerCapabilities: jest.fn().mockReturnValue({}),
    getServerVersion: jest.fn().mockReturnValue(undefined),
    getInstructions: jest.fn().mockReturnValue(undefined),
    listTools: jest.fn().mockResolvedValue({ tools: [] }),
    listResources: jest.fn().mockResolvedValue({ resources: [] }),
    listPrompts: jest.fn().mockResolvedValue({ prompts: [] }),
    close: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  MockedClient.mockImplementation(() => client as unknown as Client);
  return client;
}

describe('MCPClient', () => {
  beforeEach(() => jest.clearAllMocks());

  it('connects and discovers only advertised capabilities, mapping the results', async () => {
    const client = installMockClient({
      getServerCapabilities: jest
        .fn()
        // tools + resources advertised, prompts NOT
        .mockReturnValue({ tools: {}, resources: {} }),
      getServerVersion: jest
        .fn()
        .mockReturnValue({ name: 'demo', version: '1.2.3' }),
      getInstructions: jest.fn().mockReturnValue('use me'),
      listTools: jest.fn().mockResolvedValue({
        tools: [
          {
            name: 'search',
            description: 'Search',
            inputSchema: { type: 'object' },
          },
        ],
      }),
      listResources: jest
        .fn()
        .mockResolvedValue({ resources: [{ uri: 'file://x', name: 'x' }] }),
    });

    const spec = await new MCPClient(
      { url: 'http://mcp.test/mcp' },
      logger,
    ).discover();

    expect(client.connect).toHaveBeenCalled();
    expect(spec.serverInfo).toEqual({ name: 'demo', version: '1.2.3' });
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
    // prompts capability absent -> listPrompts never called
    expect(client.listPrompts).not.toHaveBeenCalled();
    // client is always cleaned up
    expect(client.close).toHaveBeenCalled();
  });

  it('returns an empty list when a list call fails, leaving the others intact', async () => {
    installMockClient({
      getServerCapabilities: jest
        .fn()
        .mockReturnValue({ tools: {}, resources: {} }),
      listTools: jest.fn().mockRejectedValue(new Error('boom')),
      listResources: jest
        .fn()
        .mockResolvedValue({ resources: [{ uri: 'u', name: 'r' }] }),
    });

    const spec = await new MCPClient(
      { url: 'http://mcp.test/mcp' },
      logger,
    ).discover();

    expect(spec.tools).toEqual([]);
    expect(spec.resources).toHaveLength(1);
  });

  it('rejects when the connection fails, and still closes the client', async () => {
    const client = installMockClient({
      connect: jest.fn().mockRejectedValue(new Error('unreachable')),
    });

    await expect(
      new MCPClient({ url: 'http://mcp.test/mcp' }, logger).discover(),
    ).rejects.toThrow('unreachable');
    expect(client.close).toHaveBeenCalled();
  });
});
