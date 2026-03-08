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
import { RuntimeConfigResolver } from './RuntimeConfigResolver';
import type { ConfigLoader } from '../providers/llamastack/ConfigLoader';
import type { AdminConfigService } from './AdminConfigService';
import type { LlamaStackConfig } from '../types';
import { createMockLogger } from '../test-utils';

function createMockLlamaStackConfig(
  overrides?: Partial<LlamaStackConfig>,
): LlamaStackConfig {
  return {
    baseUrl: 'https://llama.example.com',
    model: 'meta-llama/Llama-3-8B',
    vectorStoreIds: ['vs-123'],
    vectorStoreName: 'default-store',
    embeddingModel: 'all-MiniLM-L6-v2',
    embeddingDimension: 384,
    chunkingStrategy: 'auto',
    maxChunkSizeTokens: 512,
    chunkOverlapTokens: 50,
    skipTlsVerify: false,
    verboseStreamLogging: false,
    zdrMode: false,
    enableWebSearch: false,
    enableCodeInterpreter: false,
    ...overrides,
  };
}

function createMockConfigLoader(
  config?: Partial<LlamaStackConfig>,
  systemPrompt?: string,
): ConfigLoader {
  return {
    loadLlamaStackConfig: jest
      .fn()
      .mockReturnValue(createMockLlamaStackConfig(config)),
    loadSystemPrompt: jest
      .fn()
      .mockReturnValue(systemPrompt ?? 'You are a helpful assistant.'),
    validateRequiredConfig: jest.fn(),
    loadSecurityConfig: jest.fn(),
    loadDocumentsConfig: jest.fn(),
    loadMcpAuthConfigs: jest.fn(),
    loadMcpServerConfigs: jest.fn().mockReturnValue([]),
    loadBrandingOverrides: jest.fn().mockReturnValue({}),
    loadWorkflows: jest.fn(),
    loadQuickActions: jest.fn(),
    loadSwimLanes: jest.fn(),
  } as unknown as ConfigLoader;
}

function createMockAdminConfig(
  store: Record<string, unknown> = {},
): AdminConfigService {
  return {
    get: jest.fn(async (key: string) => store[key]),
    getScopedValue: jest.fn(async (key: string, providerId: string) => {
      const scopedKey = `${providerId}::${key}`;
      return store[scopedKey] ?? store[key];
    }),
    set: jest.fn(),
    delete: jest.fn(),
    getEntry: jest.fn(),
    listAll: jest.fn(),
    initialize: jest.fn(),
  } as unknown as AdminConfigService;
}

describe('RuntimeConfigResolver', () => {
  describe('resolve (YAML baseline only)', () => {
    it('returns baseline config when no DB overrides exist', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = createMockAdminConfig();

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();

      expect(config.model).toBe('meta-llama/Llama-3-8B');
      expect(config.baseUrl).toBe('https://llama.example.com');
      expect(config.systemPrompt).toBe('You are a helpful assistant.');
      expect(config.vectorStoreIds).toEqual(['vs-123']);
      expect(config.enableWebSearch).toBe(false);
      expect(config.enableCodeInterpreter).toBe(false);
      expect(config.embeddingModel).toBe('all-MiniLM-L6-v2');
      expect(config.chunkingStrategy).toBe('auto');
    });

    it('copies vectorStoreIds to prevent mutation of baseline', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader({ vectorStoreIds: ['a'] });
      const adminConfig = createMockAdminConfig();

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      config.vectorStoreIds.push('b');

      const config2 = await resolver.resolve();
      expect(config2.vectorStoreIds).toEqual(['a']);
    });
  });

  describe('resolve (DB overrides)', () => {
    it('DB model override wins over YAML', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = createMockAdminConfig({
        model: 'gpt-4o',
      });

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.model).toBe('gpt-4o');
      expect(config.baseUrl).toBe('https://llama.example.com');
    });

    it('DB systemPrompt override wins over YAML', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = createMockAdminConfig({
        systemPrompt: 'Custom prompt from admin.',
      });

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.systemPrompt).toBe('Custom prompt from admin.');
    });

    it('DB baseUrl override wins over YAML', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = createMockAdminConfig({
        baseUrl: 'https://new-server:8321',
      });

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.baseUrl).toBe('https://new-server:8321');
    });

    it('DB boolean overrides are applied', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = createMockAdminConfig({
        enableWebSearch: true,
        enableCodeInterpreter: true,
      });

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.enableWebSearch).toBe(true);
      expect(config.enableCodeInterpreter).toBe(true);
    });

    it('DB toolChoice string override is applied', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = createMockAdminConfig({
        toolChoice: 'required',
      });

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.toolChoice).toBe('required');
    });

    it('DB activeVectorStoreIds override replaces YAML', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader({
        vectorStoreIds: ['original'],
      });
      const adminConfig = createMockAdminConfig({
        activeVectorStoreIds: ['new-store-1', 'new-store-2'],
      });

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.vectorStoreIds).toEqual(['new-store-1', 'new-store-2']);
    });

    it('DB vectorStoreConfig overrides individual fields', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = createMockAdminConfig({
        vectorStoreConfig: {
          embeddingModel: 'custom-model',
          embeddingDimension: 768,
          searchMode: 'hybrid',
          bm25Weight: 0.3,
        },
      });

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.embeddingModel).toBe('custom-model');
      expect(config.embeddingDimension).toBe(768);
      expect(config.searchMode).toBe('hybrid');
      expect(config.bm25Weight).toBe(0.3);
      expect(config.chunkingStrategy).toBe('auto');
    });

    it('DB safetyPatterns and branding overrides are applied', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = createMockAdminConfig({
        safetyPatterns: ['drop', 'truncate'],
        branding: { appName: 'Custom App' },
      });

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.safetyPatterns).toEqual(['drop', 'truncate']);
      expect(config.branding).toEqual({ appName: 'Custom App' });
    });

    it('DB mcpProxyUrl override is applied', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = createMockAdminConfig({
        mcpProxyUrl: 'https://tunnel.example.com/api/agentic-chat',
      });

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.mcpProxyUrl).toBe(
        'https://tunnel.example.com/api/agentic-chat',
      );
    });

    it('mcpProxyUrl is undefined when not set in DB', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = createMockAdminConfig({});

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.mcpProxyUrl).toBeUndefined();
    });

    it('DB mcpServers override is applied', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const servers = [
        {
          id: 'mcp-1',
          name: 'Test',
          url: 'https://mcp.test/sse',
          type: 'sse' as const,
        },
      ];
      const adminConfig = createMockAdminConfig({ mcpServers: servers });

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.mcpServers).toEqual(servers);
    });

    it('merges YAML and DB MCP servers (DB overrides url/name/type, YAML auth preserved)', async () => {
      const logger = createMockLogger();
      const yamlServer = {
        id: 'yaml-srv',
        name: 'YAML Server',
        url: 'https://yaml.test',
        type: 'streamable-http' as const,
        headers: { Authorization: 'Bearer secret' },
      };
      const configLoader = createMockConfigLoader();
      (configLoader.loadMcpServerConfigs as jest.Mock).mockReturnValue([
        yamlServer,
      ]);

      const dbServers = [
        {
          id: 'yaml-srv',
          name: 'Updated Name',
          url: 'https://new-url.test',
          type: 'sse' as const,
        },
        {
          id: 'admin-srv',
          name: 'Admin Server',
          url: 'https://admin.test',
          type: 'sse' as const,
        },
      ];
      const adminConfig = createMockAdminConfig({ mcpServers: dbServers });

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.mcpServers).toHaveLength(2);

      const overridden = config.mcpServers![0];
      expect(overridden.id).toBe('yaml-srv');
      expect(overridden.name).toBe('Updated Name');
      expect(overridden.url).toBe('https://new-url.test');
      expect(overridden.type).toBe('sse');
      // YAML-only auth fields are preserved
      expect(overridden.headers).toEqual({ Authorization: 'Bearer secret' });

      expect(config.mcpServers![1].id).toBe('admin-srv');
    });

    it('merges requireApproval from DB override onto YAML server', async () => {
      const logger = createMockLogger();
      const yamlServer = {
        id: 'yaml-srv',
        name: 'YAML Server',
        url: 'https://yaml.test',
        type: 'streamable-http' as const,
      };
      const configLoader = createMockConfigLoader();
      (configLoader.loadMcpServerConfigs as jest.Mock).mockReturnValue([
        yamlServer,
      ]);

      const dbServers = [
        {
          id: 'yaml-srv',
          name: 'YAML Server',
          url: 'https://yaml.test',
          type: 'streamable-http' as const,
          requireApproval: 'always' as const,
        },
      ];
      const adminConfig = createMockAdminConfig({ mcpServers: dbServers });

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.mcpServers).toHaveLength(1);
      expect(config.mcpServers![0].requireApproval).toBe('always');
    });

    it('preserves YAML requireApproval when DB override does not set it', async () => {
      const logger = createMockLogger();
      const yamlServer = {
        id: 'yaml-srv',
        name: 'YAML Server',
        url: 'https://yaml.test',
        type: 'streamable-http' as const,
        requireApproval: 'always' as const,
      };
      const configLoader = createMockConfigLoader();
      (configLoader.loadMcpServerConfigs as jest.Mock).mockReturnValue([
        yamlServer,
      ]);

      const dbServers = [
        {
          id: 'yaml-srv',
          name: 'Updated Name',
          url: 'https://new.test',
          type: 'streamable-http' as const,
        },
      ];
      const adminConfig = createMockAdminConfig({ mcpServers: dbServers });

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.mcpServers).toHaveLength(1);
      expect(config.mcpServers![0].name).toBe('Updated Name');
      expect(config.mcpServers![0].requireApproval).toBe('always');
    });

    it('filters out disabled YAML servers', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      (configLoader.loadMcpServerConfigs as jest.Mock).mockReturnValue([
        { id: 'srv-a', name: 'A', url: 'https://a.test', type: 'sse' as const },
        { id: 'srv-b', name: 'B', url: 'https://b.test', type: 'sse' as const },
      ]);

      const adminConfig = createMockAdminConfig({
        disabledMcpServerIds: ['srv-a'],
      });

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.mcpServers).toHaveLength(1);
      expect(config.mcpServers![0].id).toBe('srv-b');
    });

    it('DB safetyEnabled override is applied', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = createMockAdminConfig({ safetyEnabled: true });

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.safetyEnabled).toBe(true);
    });

    it('DB safetyEnabled=false override disables safety', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = createMockAdminConfig({ safetyEnabled: false });

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.safetyEnabled).toBe(false);
    });

    it('DB inputShields override is applied', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = createMockAdminConfig({
        inputShields: ['content_safety', 'prompt_guard'],
      });

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.inputShields).toEqual(['content_safety', 'prompt_guard']);
    });

    it('DB outputShields override is applied', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = createMockAdminConfig({
        outputShields: ['output_filter'],
      });

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.outputShields).toEqual(['output_filter']);
    });

    it('DB evaluationEnabled override is applied', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = createMockAdminConfig({ evaluationEnabled: true });

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.evaluationEnabled).toBe(true);
    });

    it('DB scoringFunctions override is applied', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = createMockAdminConfig({
        scoringFunctions: ['basic::subset_of', 'braintrust::faithfulness'],
      });

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.scoringFunctions).toEqual([
        'basic::subset_of',
        'braintrust::faithfulness',
      ]);
    });

    it('DB minScoreThreshold override is applied', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = createMockAdminConfig({ minScoreThreshold: 0.85 });

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.minScoreThreshold).toBe(0.85);
    });

    it('safety/eval overrides are absent when not set in DB', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = createMockAdminConfig({});

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.safetyEnabled).toBeUndefined();
      expect(config.inputShields).toBeUndefined();
      expect(config.outputShields).toBeUndefined();
      expect(config.evaluationEnabled).toBeUndefined();
      expect(config.scoringFunctions).toBeUndefined();
      expect(config.minScoreThreshold).toBeUndefined();
    });
  });

  describe('caching', () => {
    it('returns cached config within TTL window', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = createMockAdminConfig();

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 60000,
      });

      const config1 = await resolver.resolve();
      const config2 = await resolver.resolve();

      expect(config1).toEqual(config2);
      expect(configLoader.loadLlamaStackConfig).toHaveBeenCalledTimes(1);
    });

    it('refreshes cache after TTL expires', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = createMockAdminConfig();

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 1,
      });

      const config1 = await resolver.resolve();
      await new Promise(r => setTimeout(r, 5));
      const config2 = await resolver.resolve();

      expect(config1).not.toBe(config2);
      expect(configLoader.loadLlamaStackConfig).toHaveBeenCalledTimes(2);
    });

    it('invalidateCache forces a fresh resolve', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = createMockAdminConfig();

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 60000,
      });

      await resolver.resolve();
      expect(configLoader.loadLlamaStackConfig).toHaveBeenCalledTimes(1);

      resolver.invalidateCache();
      await resolver.resolve();
      expect(configLoader.loadLlamaStackConfig).toHaveBeenCalledTimes(2);
    });
  });

  describe('graceful degradation', () => {
    it('returns YAML baseline when AdminConfigService throws', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = {
        get: jest.fn().mockRejectedValue(new Error('DB connection lost')),
      } as unknown as AdminConfigService;

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();

      expect(config.model).toBe('meta-llama/Llama-3-8B');
      expect(config.baseUrl).toBe('https://llama.example.com');
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('DB connection lost'),
      );
    });

    it('isolates per-key failures so other keys still apply', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      let callCount = 0;
      const keyHandler = async (key: string) => {
        callCount++;
        if (key === 'model') throw new Error('Corrupt row');
        if (key === 'systemPrompt') return 'From DB';
        return undefined;
      };
      const adminConfig = {
        get: jest.fn(keyHandler),
        getScopedValue: jest.fn(keyHandler),
      } as unknown as AdminConfigService;

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();

      expect(config.model).toBe('meta-llama/Llama-3-8B');
      expect(config.systemPrompt).toBe('From DB');
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Corrupt row'),
      );
    });
  });

  describe('delete reverts to YAML', () => {
    it('returns YAML baseline value when DB key is absent', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader(
        { model: 'yaml-model' },
        'yaml-prompt',
      );
      const adminConfig = createMockAdminConfig({});

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.model).toBe('yaml-model');
      expect(config.systemPrompt).toBe('yaml-prompt');
    });
  });

  describe('concurrency', () => {
    it('concurrent resolve() calls share a single in-flight build', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = {
        get: jest.fn(async () => {
          await new Promise(r => setTimeout(r, 50));
          return undefined;
        }),
      } as unknown as AdminConfigService;

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 60000,
      });

      const [c1, c2] = await Promise.all([
        resolver.resolve(),
        resolver.resolve(),
      ]);

      expect(c1).toEqual(c2);
      expect(configLoader.loadLlamaStackConfig).toHaveBeenCalledTimes(1);
    });

    it('invalidateCache() during in-flight build prevents stale caching', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      let resolveGate: () => void;
      const gate = new Promise<void>(r => {
        resolveGate = r;
      });
      const adminConfig = {
        get: jest.fn(async (key: string) => {
          if (key === 'model') {
            await gate;
            return 'stale-model';
          }
          return undefined;
        }),
      } as unknown as AdminConfigService;

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 60000,
      });

      const p1 = resolver.resolve();
      resolver.invalidateCache();
      resolveGate!();
      await p1;

      // The stale result should NOT have been cached (generation mismatch),
      // so the next resolve() must trigger a fresh build.
      (adminConfig.get as jest.Mock).mockResolvedValue(undefined);
      await resolver.resolve();
      expect(configLoader.loadLlamaStackConfig).toHaveBeenCalledTimes(2);
    });
  });

  describe('cache snapshot isolation', () => {
    it('mutating returned config does not corrupt the cache', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader({
        vectorStoreIds: ['original'],
      });
      const adminConfig = createMockAdminConfig();

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 60000,
      });

      const config1 = await resolver.resolve();
      config1.vectorStoreIds.push('injected');
      config1.model = 'corrupted';

      const config2 = await resolver.resolve();
      expect(config2.vectorStoreIds).toEqual(['original']);
      expect(config2.model).toBe('meta-llama/Llama-3-8B');
    });
  });

  describe('type safety', () => {
    it('rejects wrong-type DB value for model (number instead of string)', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = createMockAdminConfig({ model: 42 });

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.model).toBe('meta-llama/Llama-3-8B');
    });

    it('rejects wrong-type DB value for enableWebSearch (string instead of boolean)', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = createMockAdminConfig({
        enableWebSearch: 'yes',
      });

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.enableWebSearch).toBe(false);
    });

    it('rejects wrong-type DB value for minScoreThreshold (string instead of number)', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = createMockAdminConfig({
        minScoreThreshold: 'high',
      });

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.minScoreThreshold).toBeUndefined();
    });
  });

  describe('vectorStoreConfig completeness', () => {
    it('all 11 vectorStoreConfig sub-fields override correctly', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const adminConfig = createMockAdminConfig({
        vectorStoreConfig: {
          embeddingModel: 'custom-embed',
          embeddingDimension: 1024,
          searchMode: 'hybrid',
          bm25Weight: 0.3,
          semanticWeight: 0.7,
          chunkingStrategy: 'static',
          maxChunkSizeTokens: 256,
          chunkOverlapTokens: 25,
          fileSearchMaxResults: 10,
          fileSearchScoreThreshold: 0.8,
          vectorStoreName: 'custom-store',
        },
      });

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();
      expect(config.embeddingModel).toBe('custom-embed');
      expect(config.embeddingDimension).toBe(1024);
      expect(config.searchMode).toBe('hybrid');
      expect(config.bm25Weight).toBe(0.3);
      expect(config.semanticWeight).toBe(0.7);
      expect(config.chunkingStrategy).toBe('static');
      expect(config.maxChunkSizeTokens).toBe(256);
      expect(config.chunkOverlapTokens).toBe(25);
      expect(config.fileSearchMaxResults).toBe(10);
      expect(config.fileSearchScoreThreshold).toBe(0.8);
      expect(config.vectorStoreName).toBe('custom-store');
    });
  });

  describe('cascading DB failure', () => {
    it('DB completely down logs per-key warnings and returns baseline', async () => {
      const logger = createMockLogger();
      const configLoader = createMockConfigLoader();
      const dbError = new Error('ECONNREFUSED');
      const adminConfig = {
        get: jest.fn().mockRejectedValue(dbError),
        getScopedValue: jest.fn().mockRejectedValue(dbError),
      } as unknown as AdminConfigService;

      const resolver = new RuntimeConfigResolver({
        configLoader,
        adminConfig,
        logger,
        cacheTtlMs: 0,
      });

      const config = await resolver.resolve();

      expect(config.model).toBe('meta-llama/Llama-3-8B');
      expect(config.baseUrl).toBe('https://llama.example.com');
      expect(config.vectorStoreIds).toEqual(['vs-123']);

      const warnCalls = logger.warn.mock.calls.filter((call: unknown[]) =>
        (call[0] as string).includes('ECONNREFUSED'),
      );
      expect(warnCalls.length).toBeGreaterThanOrEqual(15);
    });
  });
});
