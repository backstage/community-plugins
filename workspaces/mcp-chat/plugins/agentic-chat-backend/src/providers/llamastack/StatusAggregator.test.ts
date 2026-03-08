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

import { aggregateStatus, type StatusAggregatorDeps } from './StatusAggregator';
import { createMockLogger } from '../../test-utils';

function createBaseDeps(
  overrides: Partial<StatusAggregatorDeps> = {},
): StatusAggregatorDeps {
  const mockStatus = {
    providerId: 'llamastack',
    provider: {
      id: 'llamastack',
      model: 'test-model',
      baseUrl: 'http://localhost:8321',
      connected: true,
    },
    vectorStore: { id: 'default', connected: true },
    mcpServers: [],
    securityMode: 'plugin-only' as const,
    timestamp: '2025-01-01T00:00:00Z',
    ready: true,
    configurationErrors: [],
  };

  return {
    llamaStackConfig: {
      baseUrl: 'http://localhost:8321',
      model: 'test-model',
      vectorStoreIds: ['vs-1'],
      vectorStoreName: 'test-store',
      embeddingModel: 'all-MiniLM-L6-v2',
      embeddingDimension: 384,
      chunkingStrategy: 'auto',
      maxChunkSizeTokens: 512,
      chunkOverlapTokens: 50,
    },
    resolved: {
      baseUrl: 'http://localhost:8321',
      model: 'test-model',
      vectorStoreIds: ['vs-1'],
      vectorStoreName: 'test-store',
      embeddingModel: 'all-MiniLM-L6-v2',
      embeddingDimension: 384,
      systemPrompt: '',
      enableWebSearch: false,
      enableCodeInterpreter: false,
      chunkingStrategy: 'auto' as const,
      maxChunkSizeTokens: 512,
      chunkOverlapTokens: 50,
      skipTlsVerify: false,
      zdrMode: false,
      verboseStreamLogging: false,
    },
    clientManager: {} as StatusAggregatorDeps['clientManager'],
    mcpAuth: null,
    mcpServers: [],
    yamlMcpServers: [],
    securityConfig: { mode: 'plugin-only' as const },
    vectorStoreReady: true,
    statusService: {
      getStatus: jest.fn().mockResolvedValue(mockStatus),
    } as unknown as StatusAggregatorDeps['statusService'],
    logger: createMockLogger(),
    ...overrides,
  };
}

describe('StatusAggregator', () => {
  describe('aggregateStatus', () => {
    it('delegates to statusService when llamaStackConfig is null', async () => {
      const deps = createBaseDeps({ llamaStackConfig: null });
      await aggregateStatus(deps);

      expect(deps.statusService.getStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          config: null,
          mcpServers: deps.yamlMcpServers,
        }),
      );
    });

    it('merges resolved config into statusConfig when llamaStackConfig is set', async () => {
      const deps = createBaseDeps();
      await aggregateStatus(deps);

      expect(deps.statusService.getStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            model: 'test-model',
            baseUrl: 'http://localhost:8321',
            vectorStoreIds: ['vs-1'],
            vectorStoreName: 'test-store',
            embeddingModel: 'all-MiniLM-L6-v2',
          }),
        }),
      );
    });

    it('uses resolved model/baseUrl over llamaStackConfig values', async () => {
      const deps = createBaseDeps({
        llamaStackConfig: {
          baseUrl: 'http://yaml-url:8321',
          model: 'yaml-model',
          vectorStoreIds: [],
          vectorStoreName: 'yaml-store',
          embeddingModel: 'yaml-embed',
          embeddingDimension: 384,
          chunkingStrategy: 'auto',
          maxChunkSizeTokens: 512,
          chunkOverlapTokens: 50,
        },
        resolved: {
          baseUrl: 'http://admin-override:8321',
          model: 'admin-model',
          vectorStoreIds: ['vs-admin'],
          vectorStoreName: 'admin-store',
          embeddingModel: 'admin-embed',
          embeddingDimension: 768,
          systemPrompt: '',
          enableWebSearch: false,
          enableCodeInterpreter: false,
          chunkingStrategy: 'auto' as const,
          maxChunkSizeTokens: 512,
          chunkOverlapTokens: 50,
          skipTlsVerify: false,
          zdrMode: false,
          verboseStreamLogging: false,
        },
      });

      await aggregateStatus(deps);

      const call = (deps.statusService.getStatus as jest.Mock).mock.calls[0][0];
      expect(call.config.model).toBe('admin-model');
      expect(call.config.baseUrl).toBe('http://admin-override:8321');
      expect(call.config.vectorStoreIds).toEqual(['vs-admin']);
      expect(call.config.vectorStoreName).toBe('admin-store');
      expect(call.config.embeddingModel).toBe('admin-embed');
    });

    it('passes yamlServerIds derived from yamlMcpServers', async () => {
      const yamlServers = [
        { id: 'server-1', name: 'S1', url: 'http://s1' },
        { id: 'server-2', name: 'S2', url: 'http://s2' },
      ] as StatusAggregatorDeps['yamlMcpServers'];

      const deps = createBaseDeps({ yamlMcpServers: yamlServers });
      await aggregateStatus(deps);

      const call = (deps.statusService.getStatus as jest.Mock).mock.calls[0][0];
      expect(call.yamlServerIds).toEqual(new Set(['server-1', 'server-2']));
    });

    it('passes vectorStoreReady and securityConfig through', async () => {
      const deps = createBaseDeps({
        vectorStoreReady: false,
        securityConfig: { mode: 'full' as const },
      });

      await aggregateStatus(deps);

      const call = (deps.statusService.getStatus as jest.Mock).mock.calls[0][0];
      expect(call.vectorStoreReady).toBe(false);
      expect(call.securityConfig.mode).toBe('full');
    });
  });
});
