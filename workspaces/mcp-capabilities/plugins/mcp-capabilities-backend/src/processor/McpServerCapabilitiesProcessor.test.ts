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
import { Entity } from '@backstage/catalog-model';
import { CatalogProcessorCache } from '@backstage/plugin-catalog-node';
import { McpServerCapabilitiesProcessor } from './McpServerCapabilitiesProcessor';
import { MCPClient } from '../lib/MCPClient';

jest.mock('../lib/MCPClient');
const MockMCPClient = MCPClient as jest.MockedClass<typeof MCPClient>;

const logger = mockServices.logger.mock();
const anyLocation = {} as any;
const emit = jest.fn();

function inMemoryCache(): CatalogProcessorCache {
  const store = new Map<string, unknown>();
  return {
    get: async (key: string) => store.get(key),
    set: async (key: string, value: unknown) => {
      store.set(key, value);
    },
  } as unknown as CatalogProcessorCache;
}

const mcpEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'API',
  metadata: { name: 'demo', namespace: 'default' },
  spec: {
    type: 'mcp-server',
    remotes: [{ type: 'streamable-http', url: 'http://mcp.test/mcp' }],
  },
};

describe('McpServerCapabilitiesProcessor', () => {
  beforeEach(() => {
    MockMCPClient.mockClear();
    MockMCPClient.prototype.discover = jest.fn().mockResolvedValue({
      capabilities: { tools: true, resources: false, prompts: false },
      serverInfo: { name: 'demo', version: '1.0.0' },
      tools: [
        { name: 'a', inputSchema: {} },
        { name: 'b', inputSchema: {} },
      ],
      resources: [],
      prompts: [],
    });
  });

  const processor = () => new McpServerCapabilitiesProcessor({ logger });

  it('leaves non-mcp-server entities untouched', async () => {
    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'API',
      metadata: { name: 'openapi-thing' },
      spec: { type: 'openapi' },
    };
    const out = await processor().preProcessEntity(
      entity,
      anyLocation,
      emit,
      anyLocation,
      inMemoryCache(),
    );
    expect(out).toBe(entity);
    expect(MockMCPClient).not.toHaveBeenCalled();
  });

  it('enriches an mcp-server entity with the discovered summary, preserving native fields', async () => {
    const out = await processor().preProcessEntity(
      mcpEntity,
      anyLocation,
      emit,
      anyLocation,
      inMemoryCache(),
    );
    expect(out.spec).toMatchObject({
      type: 'mcp-server',
      capabilities: { tools: true, resources: false, prompts: false },
      serverInfo: { name: 'demo', version: '1.0.0' },
      toolCount: 2,
      resourceCount: 0,
      promptCount: 0,
      toolNames: ['a', 'b'],
      remotes: [{ type: 'streamable-http', url: 'http://mcp.test/mcp' }],
    });
  });

  it('returns the entity unchanged when discovery fails (graceful skip)', async () => {
    MockMCPClient.prototype.discover = jest
      .fn()
      .mockRejectedValue(new Error('unreachable'));
    const out = await processor().preProcessEntity(
      mcpEntity,
      anyLocation,
      emit,
      anyLocation,
      inMemoryCache(),
    );
    expect(out).toBe(mcpEntity);
  });

  it('caches discovery per remote within the TTL', async () => {
    const cache = inMemoryCache();
    const p = processor();
    await p.preProcessEntity(mcpEntity, anyLocation, emit, anyLocation, cache);
    await p.preProcessEntity(mcpEntity, anyLocation, emit, anyLocation, cache);
    expect(MockMCPClient.prototype.discover).toHaveBeenCalledTimes(1);
  });
});
