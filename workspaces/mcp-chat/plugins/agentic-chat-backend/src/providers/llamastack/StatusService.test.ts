/*
 * Copyright 2025 The Backstage Authors
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
import { StatusService, StatusDeps } from './StatusService';
import type { ClientManager } from './ClientManager';
import type { McpAuthService } from './McpAuthService';
import type { LlamaStackConfig, MCPServerConfig } from '../../types';

function createMockClient(overrides?: {
  healthOk?: boolean;
  healthError?: Error;
  vectorStoreOk?: boolean;
  vectorStoreTotal?: number;
  models?: string[];
}) {
  return {
    request: jest.fn().mockImplementation((path: string) => {
      if (path === '/v1/health') {
        if (overrides?.healthError) throw overrides.healthError;
        if (overrides?.healthOk === false)
          throw new Error('Connection refused');
        return Promise.resolve({ status: 'ok' });
      }
      if (path === '/v1/openai/v1/models') {
        if (overrides?.healthError) throw overrides.healthError;
        if (overrides?.healthOk === false)
          throw new Error('Connection refused');
        const modelList = overrides?.models ?? ['test-model'];
        return Promise.resolve({
          data: modelList.map(id => ({ id })),
        });
      }
      if (path.startsWith('/v1/openai/v1/vector_stores/')) {
        if (overrides?.vectorStoreOk === false) throw new Error('Not found');
        return Promise.resolve({
          file_counts: { total: overrides?.vectorStoreTotal ?? 5 },
        });
      }
      return Promise.resolve({});
    }),
  };
}

function createMockClientManager(
  client: ReturnType<typeof createMockClient>,
  hasClient = true,
): ClientManager {
  return {
    hasClient: jest.fn().mockReturnValue(hasClient),
    getExistingClient: jest.fn().mockReturnValue(client),
    getClient: jest.fn().mockReturnValue(client),
    invalidate: jest.fn(),
  } as unknown as ClientManager; // Partial mock; full ClientManager requires real LlamaStackClient
}

const mockLogger = {
  child: () => mockLogger,
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
} as unknown as import('@backstage/backend-plugin-api').LoggerService;

function baseDeps(overrides?: Partial<StatusDeps>): StatusDeps {
  const client = createMockClient();
  return {
    config: {
      baseUrl: 'https://llama.test',
      model: 'test-model',
      vectorStoreIds: ['vs_1'],
      vectorStoreName: 'test-db',
      embeddingModel: 'all-MiniLM-L6-v2',
      embeddingDimension: 384,
      chunkingStrategy: 'auto' as const,
      maxChunkSizeTokens: 200,
      chunkOverlapTokens: 50,
    } as LlamaStackConfig,
    clientManager: createMockClientManager(client),
    mcpAuth: null,
    mcpServers: [],
    yamlServerIds: new Set(),
    securityConfig: { mode: 'plugin-only' },
    vectorStoreReady: true,
    logger: mockLogger,
    ...overrides,
  };
}

describe('StatusService', () => {
  let service: StatusService;

  beforeEach(() => {
    service = new StatusService();
  });

  // ===========================================================================
  // Not-configured state
  // ===========================================================================

  it('returns not-configured when config is null', async () => {
    const status = await service.getStatus(baseDeps({ config: null }));

    expect(status.ready).toBe(false);
    expect(status.provider.connected).toBe(false);
    expect(status.provider.error).toContain('not configured');
    expect(status.configurationErrors).toHaveLength(1);
  });

  it('returns not-configured when client manager has no client', async () => {
    const client = createMockClient();
    const deps = baseDeps({
      clientManager: createMockClientManager(client, false),
    });
    const status = await service.getStatus(deps);

    expect(status.ready).toBe(false);
    expect(status.provider.connected).toBe(false);
  });

  // ===========================================================================
  // Healthy state
  // ===========================================================================

  it('returns healthy status when provider and vector store are ok', async () => {
    const status = await service.getStatus(baseDeps());

    expect(status.ready).toBe(true);
    expect(status.provider.connected).toBe(true);
    expect(status.provider.model).toBe('test-model');
    expect(status.vectorStore.connected).toBe(true);
    expect(status.vectorStore.totalDocuments).toBe(5);
    expect(status.configurationErrors).toHaveLength(0);
  });

  it('includes capabilities in healthy status', async () => {
    const status = await service.getStatus(baseDeps());

    expect(status.capabilities?.chat).toBe(true);
    expect(status.capabilities?.rag.available).toBe(true);
    expect(status.capabilities?.mcpTools.available).toBe(false);
    expect(status.capabilities?.mcpTools.reason).toBe(
      'No MCP servers configured',
    );
  });

  // ===========================================================================
  // Provider health failures
  // ===========================================================================

  it('reports provider disconnected on health check failure', async () => {
    const client = createMockClient({ healthOk: false });
    const deps = baseDeps({
      clientManager: createMockClientManager(client),
    });
    const status = await service.getStatus(deps);

    expect(status.provider.connected).toBe(false);
    expect(status.provider.error).toContain('Connection refused');
    expect(status.ready).toBe(false);
    expect(status.configurationErrors).toHaveLength(1);
  });

  // ===========================================================================
  // Vector store health
  // ===========================================================================

  it('reports vector store not ready when not initialized', async () => {
    const status = await service.getStatus(
      baseDeps({ vectorStoreReady: false }),
    );

    expect(status.vectorStore.connected).toBe(false);
    expect(status.vectorStore.error).toContain('Not initialized');
  });

  it('reports vector store error when no IDs configured', async () => {
    const deps = baseDeps({
      config: {
        ...baseDeps().config!,
        vectorStoreIds: [],
      } as LlamaStackConfig,
    });
    const status = await service.getStatus(deps);

    expect(status.vectorStore.connected).toBe(false);
    expect(status.vectorStore.error).toContain('No vector store IDs');
  });

  it('reports vector store error on fetch failure', async () => {
    const client = createMockClient({ vectorStoreOk: false });
    const deps = baseDeps({
      clientManager: createMockClientManager(client),
    });
    const status = await service.getStatus(deps);

    expect(status.vectorStore.connected).toBe(false);
  });

  // ===========================================================================
  // MCP server health
  // ===========================================================================

  it('reports MCP server as connected when health check succeeds', async () => {
    const mcpServers: MCPServerConfig[] = [
      {
        id: 'mcp-1',
        name: 'Test MCP',
        type: 'streamable-http',
        url: 'http://mcp.test/sse',
      },
    ];

    const originalFetch = global.fetch;
    const mockHeaders = { get: () => null };
    global.fetch = jest.fn().mockImplementation((_url, opts) => {
      const body = opts?.body ? JSON.parse(opts.body) : {};
      if (body.method === 'tools/list') {
        const toolsPayload = JSON.stringify({
          result: {
            tools: [{ name: 'test-tool', description: 'A test tool' }],
          },
        });
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: mockHeaders,
          text: () => Promise.resolve(toolsPayload),
        });
      }
      return Promise.resolve({ ok: true, status: 200, headers: mockHeaders });
    });

    try {
      const status = await service.getStatus(baseDeps({ mcpServers }));

      expect(status.mcpServers).toHaveLength(1);
      expect(status.mcpServers[0].connected).toBe(true);
      expect(status.mcpServers[0].toolCount).toBe(1);
      expect(status.mcpServers[0].tools).toEqual([
        { name: 'test-tool', description: 'A test tool' },
      ]);
      expect(status.capabilities?.mcpTools.available).toBe(true);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('reports MCP server as disconnected when health check fails', async () => {
    const mcpServers: MCPServerConfig[] = [
      {
        id: 'mcp-1',
        name: 'Test MCP',
        type: 'streamable-http',
        url: 'http://mcp.test/sse',
      },
    ];

    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 502,
      headers: { get: () => null },
    });

    try {
      const status = await service.getStatus(baseDeps({ mcpServers }));

      expect(status.mcpServers[0].connected).toBe(false);
      expect(status.mcpServers[0].error).toBe('HTTP 502');
      expect(status.capabilities?.mcpTools.available).toBe(false);
      expect(status.capabilities?.mcpTools.reason).toContain('not reachable');
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('reports MCP server error on network failure', async () => {
    const mcpServers: MCPServerConfig[] = [
      {
        id: 'mcp-1',
        name: 'Test MCP',
        type: 'streamable-http',
        url: 'http://mcp.test/sse',
      },
    ];

    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));

    try {
      const status = await service.getStatus(baseDeps({ mcpServers }));

      expect(status.mcpServers[0].connected).toBe(false);
      expect(status.mcpServers[0].error).toBe('ECONNREFUSED');
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('includes MCP auth headers when mcpAuth is provided', async () => {
    const mcpServers: MCPServerConfig[] = [
      {
        id: 'mcp-1',
        name: 'Test MCP',
        type: 'streamable-http',
        url: 'http://mcp.test/sse',
      },
    ];

    const mockMcpAuth = {
      getServerHeaders: jest
        .fn()
        .mockResolvedValue({ Authorization: 'Bearer tok' }),
    };

    const originalFetch = global.fetch;
    const mockHeaders = { get: () => null };
    global.fetch = jest.fn().mockImplementation((_url, opts) => {
      const body = opts?.body ? JSON.parse(opts.body) : {};
      if (body.method === 'tools/list') {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: mockHeaders,
          text: () =>
            Promise.resolve(JSON.stringify({ result: { tools: [] } })),
        });
      }
      return Promise.resolve({ ok: true, status: 200, headers: mockHeaders });
    });

    try {
      await service.getStatus(
        baseDeps({
          mcpServers,
          mcpAuth: mockMcpAuth as unknown as McpAuthService, // Partial mock for getServerHeaders only
        }),
      );

      expect(mockMcpAuth.getServerHeaders).toHaveBeenCalledWith(mcpServers[0]);
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1].headers).toHaveProperty(
        'Authorization',
        'Bearer tok',
      );
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('tags MCP servers with correct source', async () => {
    const mcpServers: MCPServerConfig[] = [
      {
        id: 'yaml-srv',
        name: 'YAML',
        type: 'streamable-http',
        url: 'http://yaml.test',
      },
      {
        id: 'admin-srv',
        name: 'Admin',
        type: 'sse',
        url: 'http://admin.test',
      },
    ];

    const originalFetch = global.fetch;
    const mockHeaders = { get: () => null };
    global.fetch = jest.fn().mockImplementation((_url, opts) => {
      const body = opts?.body ? JSON.parse(opts.body) : {};
      if (body.method === 'tools/list') {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: mockHeaders,
          text: () =>
            Promise.resolve(JSON.stringify({ result: { tools: [] } })),
        });
      }
      return Promise.resolve({ ok: true, status: 200, headers: mockHeaders });
    });

    try {
      const status = await service.getStatus(
        baseDeps({
          mcpServers,
          yamlServerIds: new Set(['yaml-srv']),
        }),
      );

      expect(status.mcpServers[0].source).toBe('yaml');
      expect(status.mcpServers[1].source).toBe('admin');
    } finally {
      global.fetch = originalFetch;
    }
  });

  // ===========================================================================
  // Security mode
  // ===========================================================================

  it('reflects the security mode in status', async () => {
    const status = await service.getStatus(
      baseDeps({ securityConfig: { mode: 'full' } }),
    );
    expect(status.securityMode).toBe('full');
  });

  // ===========================================================================
  // Parallel health checks
  // ===========================================================================

  it('runs all health checks in parallel', async () => {
    const mcpServers: MCPServerConfig[] = [
      {
        id: 'mcp-1',
        name: 'A',
        type: 'streamable-http',
        url: 'http://a.test/sse',
      },
      {
        id: 'mcp-2',
        name: 'B',
        type: 'streamable-http',
        url: 'http://b.test/sse',
      },
    ];

    const originalFetch = global.fetch;
    const mockHeaders = { get: () => null };
    global.fetch = jest.fn().mockImplementation((_url, opts) => {
      const body = opts?.body ? JSON.parse(opts.body) : {};
      if (body.method === 'tools/list') {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: mockHeaders,
          text: () =>
            Promise.resolve(JSON.stringify({ result: { tools: [] } })),
        });
      }
      return Promise.resolve({ ok: true, status: 200, headers: mockHeaders });
    });

    try {
      const status = await service.getStatus(baseDeps({ mcpServers }));

      expect(status.provider.connected).toBe(true);
      expect(status.vectorStore.connected).toBe(true);
      expect(status.mcpServers).toHaveLength(2);
      expect(status.mcpServers.every(s => s.connected)).toBe(true);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
