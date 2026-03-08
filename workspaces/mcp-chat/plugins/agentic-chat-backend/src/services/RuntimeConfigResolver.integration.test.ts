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

/**
 * Integration test: AdminConfigService → RuntimeConfigResolver → EffectiveConfig
 *
 * Uses a real in-memory SQLite database to verify the full pipeline:
 *   UI save (PUT) → AdminConfigService.set() → DB
 *   → RuntimeConfigResolver.resolve() → EffectiveConfig with override
 *   → AdminConfigService.delete() → RuntimeConfigResolver.resolve() → YAML baseline
 *
 * This proves that every admin-configurable key actually flows through
 * from the database into the resolved config used at runtime.
 */
import knex, { type Knex } from 'knex';
import type { DatabaseService } from '@backstage/backend-plugin-api';
import { AdminConfigService } from './AdminConfigService';
import { RuntimeConfigResolver } from './RuntimeConfigResolver';
import { validateAdminConfigValue } from './utils/configValidation';
import type { ConfigLoader } from '../providers/llamastack/ConfigLoader';
import type { LlamaStackConfig } from '../types';
import type { AdminConfigKey } from '@backstage-community/plugin-agentic-chat-common';
import { isProviderScopedKey } from '@backstage-community/plugin-agentic-chat-common';
import { createMockLogger } from '../test-utils';

const BASELINE_CONFIG: LlamaStackConfig = {
  baseUrl: 'https://yaml-server:8321',
  model: 'yaml-model/Llama-3-8B',
  vectorStoreIds: ['yaml-vs-1'],
  vectorStoreName: 'yaml-store',
  embeddingModel: 'yaml-embedding',
  embeddingDimension: 384,
  chunkingStrategy: 'auto' as const,
  maxChunkSizeTokens: 512,
  chunkOverlapTokens: 50,
  skipTlsVerify: false,
  verboseStreamLogging: false,
  zdrMode: false,
  enableWebSearch: false,
  enableCodeInterpreter: false,
};

const BASELINE_SYSTEM_PROMPT = 'YAML system prompt';

function createMockConfigLoader(): ConfigLoader {
  return {
    loadLlamaStackConfig: jest.fn().mockReturnValue({ ...BASELINE_CONFIG }),
    loadSystemPrompt: jest.fn().mockReturnValue(BASELINE_SYSTEM_PROMPT),
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

describe('Config Pipeline Integration: UI → DB → Resolver → EffectiveConfig', () => {
  let db: Knex;
  let adminConfig: AdminConfigService;
  let resolver: RuntimeConfigResolver;
  const logger = createMockLogger();

  beforeAll(async () => {
    db = knex({
      client: 'better-sqlite3',
      connection: ':memory:',
      useNullAsDefault: true,
    });

    const mockDatabase: DatabaseService = {
      getClient: async () => db,
    } as unknown as DatabaseService;

    adminConfig = new AdminConfigService(mockDatabase, logger);
    await adminConfig.initialize();

    resolver = new RuntimeConfigResolver({
      configLoader: createMockConfigLoader(),
      adminConfig,
      logger,
      cacheTtlMs: 0,
    });
  });

  afterAll(async () => {
    await db.destroy();
  });

  afterEach(async () => {
    await db('agentic_chat_admin_config').del();
    resolver.invalidateCache();
  });

  /**
   * Helper: simulates the full UI flow for a single config key.
   *   1. Validates the value (just like PUT /admin/config/:key does)
   *   2. Saves via AdminConfigService.set()
   *   3. Invalidates cache (just like onConfigChanged does)
   *   4. Resolves config and asserts the override is present
   *   5. Deletes the key (simulates "Reset to Defaults")
   *   6. Resolves config and asserts the baseline is restored
   */
  async function testConfigRoundTrip(
    key: AdminConfigKey,
    uiValue: unknown,
    assertOverride: (config: Record<string, unknown>) => void,
    assertBaseline: (config: Record<string, unknown>) => void,
  ) {
    validateAdminConfigValue(key, uiValue);
    if (isProviderScopedKey(key)) {
      await adminConfig.setScopedValue(
        key,
        uiValue,
        'llamastack',
        'user:default/admin',
      );
    } else {
      await adminConfig.set(key, uiValue, 'user:default/admin');
    }
    resolver.invalidateCache();

    const overridden = await resolver.resolve();
    assertOverride(overridden as unknown as Record<string, unknown>);

    if (isProviderScopedKey(key)) {
      await adminConfig.deleteScopedValue(key, 'llamastack');
    } else {
      await adminConfig.delete(key);
    }
    resolver.invalidateCache();

    const reverted = await resolver.resolve();
    assertBaseline(reverted as unknown as Record<string, unknown>);
  }

  // -------------------------------------------------------------------------
  // Core LlamaStack configs
  // -------------------------------------------------------------------------

  it('model: UI override → revert to YAML', async () => {
    await testConfigRoundTrip(
      'model',
      'ui-override-model',
      c => expect(c.model).toBe('ui-override-model'),
      c => expect(c.model).toBe(BASELINE_CONFIG.model),
    );
  });

  it('baseUrl: UI override → revert to YAML', async () => {
    await testConfigRoundTrip(
      'baseUrl',
      'https://ui-server:9999',
      c => expect(c.baseUrl).toBe('https://ui-server:9999'),
      c => expect(c.baseUrl).toBe(BASELINE_CONFIG.baseUrl),
    );
  });

  it('systemPrompt: UI override → revert to YAML', async () => {
    await testConfigRoundTrip(
      'systemPrompt',
      'UI custom prompt',
      c => expect(c.systemPrompt).toBe('UI custom prompt'),
      c => expect(c.systemPrompt).toBe(BASELINE_SYSTEM_PROMPT),
    );
  });

  it('toolChoice: UI override → revert to YAML', async () => {
    await testConfigRoundTrip(
      'toolChoice',
      'required',
      c => expect(c.toolChoice).toBe('required'),
      c => expect(c.toolChoice).toBeUndefined(),
    );
  });

  it('enableWebSearch: UI override → revert to YAML', async () => {
    await testConfigRoundTrip(
      'enableWebSearch',
      true,
      c => expect(c.enableWebSearch).toBe(true),
      c => expect(c.enableWebSearch).toBe(false),
    );
  });

  it('enableCodeInterpreter: UI override → revert to YAML', async () => {
    await testConfigRoundTrip(
      'enableCodeInterpreter',
      true,
      c => expect(c.enableCodeInterpreter).toBe(true),
      c => expect(c.enableCodeInterpreter).toBe(false),
    );
  });

  // -------------------------------------------------------------------------
  // Branding & UI-facing configs
  // -------------------------------------------------------------------------

  it('branding: UI override → revert to YAML', async () => {
    const brandingOverride = { appName: 'UI App', primaryColor: '#ff0000' };
    await testConfigRoundTrip(
      'branding',
      brandingOverride,
      c => expect(c.branding).toEqual(brandingOverride),
      c => expect(c.branding).toBeUndefined(),
    );
  });

  // -------------------------------------------------------------------------
  // Safety configs (destructive patterns)
  // -------------------------------------------------------------------------

  it('safetyPatterns: UI override → revert to YAML', async () => {
    await testConfigRoundTrip(
      'safetyPatterns',
      ['DROP TABLE', 'rm -rf'],
      c => expect(c.safetyPatterns).toEqual(['DROP TABLE', 'rm -rf']),
      c => expect(c.safetyPatterns).toBeUndefined(),
    );
  });

  // -------------------------------------------------------------------------
  // MCP Servers
  // -------------------------------------------------------------------------

  it('mcpServers: UI override → revert to YAML', async () => {
    const servers = [
      {
        id: 'ui-mcp',
        name: 'UI MCP',
        url: 'https://mcp.ui.test/sse',
        type: 'sse',
      },
    ];
    await testConfigRoundTrip(
      'mcpServers',
      servers,
      c => expect(c.mcpServers).toEqual(servers),
      c => expect(c.mcpServers).toBeUndefined(),
    );
  });

  // -------------------------------------------------------------------------
  // Vector Store configs
  // -------------------------------------------------------------------------

  it('activeVectorStoreIds: UI override → revert to YAML', async () => {
    await testConfigRoundTrip(
      'activeVectorStoreIds',
      ['ui-vs-1', 'ui-vs-2'],
      c => expect(c.vectorStoreIds).toEqual(['ui-vs-1', 'ui-vs-2']),
      c => expect(c.vectorStoreIds).toEqual(BASELINE_CONFIG.vectorStoreIds),
    );
  });

  it('vectorStoreConfig: UI override → revert to YAML', async () => {
    await testConfigRoundTrip(
      'vectorStoreConfig',
      { embeddingModel: 'ui-embedding', searchMode: 'hybrid', bm25Weight: 0.4 },
      c => {
        expect(c.embeddingModel).toBe('ui-embedding');
        expect(c.searchMode).toBe('hybrid');
        expect(c.bm25Weight).toBe(0.4);
      },
      c => {
        expect(c.embeddingModel).toBe(BASELINE_CONFIG.embeddingModel);
        expect(c.searchMode).toBeUndefined();
        expect(c.bm25Weight).toBeUndefined();
      },
    );
  });

  // -------------------------------------------------------------------------
  // Safety shield configs (Llama Stack Safety API)
  // -------------------------------------------------------------------------

  it('safetyEnabled: UI toggle on → revert to undefined', async () => {
    await testConfigRoundTrip(
      'safetyEnabled',
      true,
      c => expect(c.safetyEnabled).toBe(true),
      c => expect(c.safetyEnabled).toBeUndefined(),
    );
  });

  it('safetyEnabled: UI toggle off explicitly', async () => {
    await testConfigRoundTrip(
      'safetyEnabled',
      false,
      c => expect(c.safetyEnabled).toBe(false),
      c => expect(c.safetyEnabled).toBeUndefined(),
    );
  });

  it('inputShields: UI override → revert to undefined', async () => {
    await testConfigRoundTrip(
      'inputShields',
      ['content_safety', 'prompt_guard'],
      c => expect(c.inputShields).toEqual(['content_safety', 'prompt_guard']),
      c => expect(c.inputShields).toBeUndefined(),
    );
  });

  it('outputShields: UI override → revert to undefined', async () => {
    await testConfigRoundTrip(
      'outputShields',
      ['output_filter'],
      c => expect(c.outputShields).toEqual(['output_filter']),
      c => expect(c.outputShields).toBeUndefined(),
    );
  });

  // -------------------------------------------------------------------------
  // Evaluation configs (Llama Stack Scoring API)
  // -------------------------------------------------------------------------

  it('evaluationEnabled: UI toggle on → revert to undefined', async () => {
    await testConfigRoundTrip(
      'evaluationEnabled',
      true,
      c => expect(c.evaluationEnabled).toBe(true),
      c => expect(c.evaluationEnabled).toBeUndefined(),
    );
  });

  it('scoringFunctions: UI override → revert to undefined', async () => {
    await testConfigRoundTrip(
      'scoringFunctions',
      ['basic::subset_of', 'braintrust::faithfulness'],
      c =>
        expect(c.scoringFunctions).toEqual([
          'basic::subset_of',
          'braintrust::faithfulness',
        ]),
      c => expect(c.scoringFunctions).toBeUndefined(),
    );
  });

  it('minScoreThreshold: UI override → revert to undefined', async () => {
    await testConfigRoundTrip(
      'minScoreThreshold',
      0.85,
      c => expect(c.minScoreThreshold).toBe(0.85),
      c => expect(c.minScoreThreshold).toBeUndefined(),
    );
  });

  // -------------------------------------------------------------------------
  // Error-handling configs
  // -------------------------------------------------------------------------

  it('safetyOnError: UI override → revert to undefined', async () => {
    await testConfigRoundTrip(
      'safetyOnError',
      'block',
      c => expect(c.safetyOnError).toBe('block'),
      c => expect(c.safetyOnError).toBeUndefined(),
    );
  });

  it('evaluationOnError: UI override → revert to undefined', async () => {
    await testConfigRoundTrip(
      'evaluationOnError',
      'fail',
      c => expect(c.evaluationOnError).toBe('fail'),
      c => expect(c.evaluationOnError).toBeUndefined(),
    );
  });

  // -------------------------------------------------------------------------
  // MCP Server management: disabledMcpServerIds filters mcpServers
  // -------------------------------------------------------------------------

  it('disabledMcpServerIds: disabling an MCP server excludes it from resolved mcpServers', async () => {
    const servers = [
      { id: 'server-a', name: 'A', url: 'https://a.test/sse', type: 'sse' },
      { id: 'server-b', name: 'B', url: 'https://b.test/sse', type: 'sse' },
    ];
    await adminConfig.set('mcpServers', servers, 'admin');
    await adminConfig.set('disabledMcpServerIds', ['server-a'], 'admin');
    resolver.invalidateCache();

    const config = await resolver.resolve();
    const resolved = config as unknown as Record<string, unknown>;
    const mcpServers = resolved.mcpServers as Array<{ id: string }>;
    expect(mcpServers).toBeDefined();
    expect(mcpServers.map(s => s.id)).not.toContain('server-a');
    expect(mcpServers.map(s => s.id)).toContain('server-b');

    await adminConfig.delete('disabledMcpServerIds');
    await adminConfig.delete('mcpServers');
    resolver.invalidateCache();

    const reverted = await resolver.resolve();
    expect(reverted.mcpServers).toBeUndefined();
  });

  // -------------------------------------------------------------------------
  // Swim lanes: not part of EffectiveConfig — consumed via direct DB read
  // in the /swim-lanes route handler. Verified in adminRoutes.test.ts.
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // Cache invalidation (simulates what happens after UI save)
  // -------------------------------------------------------------------------

  it('cache invalidation makes new values available immediately', async () => {
    await adminConfig.setScopedValue(
      'model',
      'first-model',
      'llamastack',
      'admin',
    );
    resolver.invalidateCache();
    const c1 = await resolver.resolve();
    expect(c1.model).toBe('first-model');

    await adminConfig.setScopedValue(
      'model',
      'second-model',
      'llamastack',
      'admin',
    );
    resolver.invalidateCache();
    const c2 = await resolver.resolve();
    expect(c2.model).toBe('second-model');
  });

  // -------------------------------------------------------------------------
  // Multiple overrides at once
  // -------------------------------------------------------------------------

  it('multiple UI overrides coexist correctly', async () => {
    await adminConfig.setScopedValue(
      'model',
      'multi-model',
      'llamastack',
      'admin',
    );
    await adminConfig.set('systemPrompt', 'Multi prompt', 'admin');
    await adminConfig.setScopedValue(
      'safetyEnabled',
      true,
      'llamastack',
      'admin',
    );
    await adminConfig.setScopedValue(
      'evaluationEnabled',
      true,
      'llamastack',
      'admin',
    );
    await adminConfig.setScopedValue(
      'minScoreThreshold',
      0.9,
      'llamastack',
      'admin',
    );
    resolver.invalidateCache();

    const config = await resolver.resolve();
    expect(config.model).toBe('multi-model');
    expect(config.systemPrompt).toBe('Multi prompt');
    expect(config.safetyEnabled).toBe(true);
    expect(config.evaluationEnabled).toBe(true);
    expect(config.minScoreThreshold).toBe(0.9);
    expect(config.baseUrl).toBe(BASELINE_CONFIG.baseUrl);
  });
});
