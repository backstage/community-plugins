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
import { ConfigResolutionService } from './ConfigResolutionService';
import type { ClientManager } from './ClientManager';
import type { RuntimeConfigResolver } from '../../services/RuntimeConfigResolver';
import type { LlamaStackConfig } from '../../types';

function createMockClientManager(): jest.Mocked<ClientManager> {
  return {
    getClient: jest.fn().mockReturnValue({}),
    getExistingClient: jest.fn().mockReturnValue({}),
  } as unknown as jest.Mocked<ClientManager>;
}

function createBasicConfig(): LlamaStackConfig {
  return {
    baseUrl: 'http://localhost:8321',
    model: 'test-model',
    vectorStoreIds: ['vs-1'],
    vectorStoreName: 'test-store',
    embeddingModel: 'test-embed',
    embeddingDimension: 384,
    chunkingStrategy: 'auto' as const,
    maxChunkSizeTokens: 512,
    chunkOverlapTokens: 50,
  } as LlamaStackConfig;
}

describe('ConfigResolutionService', () => {
  let service: ConfigResolutionService;
  let mockClientManager: jest.Mocked<ClientManager>;

  beforeEach(() => {
    mockClientManager = createMockClientManager();
    service = new ConfigResolutionService(mockClientManager);
  });

  describe('llamaStackConfig management', () => {
    it('returns null before config is set', () => {
      expect(service.getLlamaStackConfig()).toBeNull();
    });

    it('stores and retrieves config', () => {
      const config = createBasicConfig();
      service.setLlamaStackConfig(config);
      expect(service.getLlamaStackConfig()).toBe(config);
    });
  });

  describe('resolver management', () => {
    it('returns null before resolver is set', () => {
      expect(service.getResolver()).toBeNull();
    });

    it('stores and retrieves resolver', () => {
      const resolver = {
        resolve: jest.fn(),
        invalidateCache: jest.fn(),
      } as unknown as RuntimeConfigResolver;
      service.setResolver(resolver);
      expect(service.getResolver()).toBe(resolver);
    });

    it('invalidateCache is safe when resolver is null', () => {
      expect(() => service.invalidateCache()).not.toThrow();
    });

    it('invalidateCache delegates to resolver', () => {
      const resolver = {
        resolve: jest.fn(),
        invalidateCache: jest.fn(),
      } as unknown as RuntimeConfigResolver;
      service.setResolver(resolver);
      service.invalidateCache();
      expect(resolver.invalidateCache).toHaveBeenCalled();
    });
  });

  describe('resolve()', () => {
    it('throws when llamaStackConfig is not set', async () => {
      await expect(service.resolve()).rejects.toThrow(
        'Llama Stack not configured',
      );
    });

    it('returns YAML fallback when no resolver is set', async () => {
      service.setLlamaStackConfig(createBasicConfig());
      service.setSystemPrompt('test prompt');

      const result = await service.resolve();

      expect(result.model).toBe('test-model');
      expect(result.baseUrl).toBe('http://localhost:8321');
      expect(result.systemPrompt).toBe('test prompt');
    });

    it('delegates to resolver when available', async () => {
      const resolvedConfig = {
        model: 'override-model',
        baseUrl: 'http://override:8321',
        verboseStreamLogging: true,
        skipTlsVerify: false,
        token: 'tok',
      };
      const resolver = {
        resolve: jest.fn().mockResolvedValue(resolvedConfig),
        invalidateCache: jest.fn(),
      } as unknown as RuntimeConfigResolver;
      service.setLlamaStackConfig(createBasicConfig());
      service.setResolver(resolver);

      const result = await service.resolve();

      expect(result).toEqual(resolvedConfig);
      expect(resolver.resolve).toHaveBeenCalled();
    });

    it('updates lastResolvedModel on resolve', async () => {
      service.setLlamaStackConfig(createBasicConfig());
      expect(service.getLastResolvedModel()).toBeNull();

      await service.resolve();

      expect(service.getLastResolvedModel()).toBe('test-model');
    });

    it('updates client via clientManager on resolve', async () => {
      const config = createBasicConfig();
      service.setLlamaStackConfig(config);

      await service.resolve();

      expect(mockClientManager.getClient).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: 'http://localhost:8321',
          model: 'test-model',
        }),
      );
    });
  });

  describe('buildYamlFallback()', () => {
    it('throws when llamaStackConfig is not set', () => {
      expect(() => service.buildYamlFallback()).toThrow(
        'Llama Stack not configured',
      );
    });

    it('builds config from YAML values', () => {
      service.setLlamaStackConfig(createBasicConfig());
      service.setSystemPrompt('fallback prompt');

      const result = service.buildYamlFallback();

      expect(result.model).toBe('test-model');
      expect(result.systemPrompt).toBe('fallback prompt');
      expect(result.vectorStoreIds).toEqual(['vs-1']);
      expect(result.skipTlsVerify).toBe(false);
      expect(result.verboseStreamLogging).toBe(false);
    });

    it('copies vectorStoreIds to prevent mutation', () => {
      const config = createBasicConfig();
      service.setLlamaStackConfig(config);

      const result = service.buildYamlFallback();
      result.vectorStoreIds.push('vs-new');

      expect(config.vectorStoreIds).toEqual(['vs-1']);
    });
  });

  describe('isVerboseStreamLoggingEnabled()', () => {
    it('returns false by default', () => {
      expect(service.isVerboseStreamLoggingEnabled()).toBe(false);
    });

    it('returns resolved value when set', () => {
      service.setLastResolvedVerboseLogging(true);
      expect(service.isVerboseStreamLoggingEnabled()).toBe(true);
    });

    it('falls back to llamaStackConfig when resolved is null', () => {
      const config: LlamaStackConfig = {
        ...createBasicConfig(),
        verboseStreamLogging: true,
      };
      service.setLlamaStackConfig(config);

      expect(service.isVerboseStreamLoggingEnabled()).toBe(true);
    });
  });
});
