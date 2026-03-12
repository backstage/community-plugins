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
import type { LoggerService } from '@backstage/backend-plugin-api';
import type {
  AdminConfigKey,
  ProviderType,
} from '@backstage-community/plugin-agentic-chat-common';
import { isProviderScopedKey } from '@backstage-community/plugin-agentic-chat-common';
import type { ConfigLoader } from '../providers/llamastack/ConfigLoader';
import type { AdminConfigService } from './AdminConfigService';
import { CONFIG_CACHE_TTL_MS } from '../constants';
import type {
  EffectiveConfig,
  ToolChoiceConfig,
  MCPServerConfig,
} from '../types';
import { toErrorMessage } from './utils';

/**
 * Resolves the effective runtime configuration by merging
 * the immutable YAML baseline with DB-persisted admin overrides.
 *
 * Design:
 * - YAML is the baseline, loaded once at construction from ConfigLoader.
 * - DB overrides are read per-resolve with a short-lived in-memory cache
 *   (default 5 s TTL) to avoid unnecessary DB pressure under high load.
 * - On DB read failure the resolver logs a warning and returns the YAML
 *   baseline — a database outage never blocks chat.
 * - After an admin save, call `invalidateCache()` for immediate effect.
 */
export class RuntimeConfigResolver {
  private readonly configLoader: ConfigLoader;
  private readonly adminConfig: AdminConfigService;
  private readonly logger: LoggerService;
  private readonly cacheTtlMs: number;
  private readonly providerId: ProviderType;

  private cachedConfig: EffectiveConfig | null = null;
  private cacheTimestamp = 0;
  private inflightResolve: Promise<EffectiveConfig> | null = null;
  /** Monotonically increasing counter to detect stale in-flight results */
  private generation = 0;

  constructor(options: {
    configLoader: ConfigLoader;
    adminConfig: AdminConfigService;
    logger: LoggerService;
    cacheTtlMs?: number;
    providerId?: ProviderType;
  }) {
    this.configLoader = options.configLoader;
    this.adminConfig = options.adminConfig;
    this.logger = options.logger;
    this.cacheTtlMs = options.cacheTtlMs ?? CONFIG_CACHE_TTL_MS;
    this.providerId = options.providerId ?? 'llamastack';
  }

  /**
   * Resolve the effective config. Returns cached value if within TTL.
   * Concurrent callers share a single in-flight build to avoid
   * redundant DB reads under high load.
   */
  async resolve(): Promise<EffectiveConfig> {
    const now = Date.now();
    if (this.cachedConfig && now - this.cacheTimestamp < this.cacheTtlMs) {
      return this.snapshot(this.cachedConfig);
    }

    if (this.inflightResolve) {
      return this.inflightResolve.then(c => this.snapshot(c));
    }

    const startGen = ++this.generation;

    this.inflightResolve = this.buildEffectiveConfig()
      .then(config => {
        // Only cache if no invalidation happened while we were building
        if (this.generation === startGen) {
          this.cachedConfig = config;
          this.cacheTimestamp = Date.now();
        }
        return this.snapshot(config);
      })
      .finally(() => {
        this.inflightResolve = null;
      });

    return this.inflightResolve;
  }

  /**
   * Drop the cached config so the next resolve() re-reads from DB.
   * Bumps the generation counter so any in-flight build won't
   * cache its (now-stale) result.
   */
  invalidateCache(): void {
    this.cachedConfig = null;
    this.cacheTimestamp = 0;
    this.generation++;
  }

  private async buildEffectiveConfig(): Promise<EffectiveConfig> {
    const baseline = this.loadYamlBaseline();

    try {
      return await this.applyDbOverrides(baseline);
    } catch (error) {
      const msg = toErrorMessage(error);
      this.logger.warn(
        `Failed to read admin config overrides, using YAML baseline: ${msg}`,
      );
      return baseline;
    }
  }

  /**
   * Build an EffectiveConfig from YAML-only (no DB).
   * This is synchronous because ConfigLoader reads from in-memory
   * Backstage config which was loaded at startup.
   */
  private loadYamlBaseline(): EffectiveConfig {
    const ls = this.configLoader.loadLlamaStackConfig();
    const systemPrompt = this.configLoader.loadSystemPrompt();
    const yamlMcpServers = this.configLoader.loadMcpServerConfigs();
    const yamlBranding = this.configLoader.loadBrandingOverrides();

    return {
      model: ls.model,
      baseUrl: ls.baseUrl,
      systemPrompt,
      toolChoice: ls.toolChoice,
      parallelToolCalls: ls.parallelToolCalls,
      textFormat: ls.textFormat,
      enableWebSearch: ls.enableWebSearch ?? false,
      enableCodeInterpreter: ls.enableCodeInterpreter ?? false,
      fileSearchMaxResults: ls.fileSearchMaxResults,
      fileSearchScoreThreshold: ls.fileSearchScoreThreshold,
      vectorStoreIds: [...ls.vectorStoreIds],
      vectorStoreName: ls.vectorStoreName,
      embeddingModel: ls.embeddingModel,
      embeddingDimension: ls.embeddingDimension ?? 384,
      searchMode: ls.searchMode,
      bm25Weight: ls.bm25Weight,
      semanticWeight: ls.semanticWeight,
      chunkingStrategy: ls.chunkingStrategy,
      maxChunkSizeTokens: ls.maxChunkSizeTokens,
      chunkOverlapTokens: ls.chunkOverlapTokens,
      skipTlsVerify: ls.skipTlsVerify ?? false,
      zdrMode: ls.zdrMode ?? false,
      functions: ls.functions,
      token: ls.token,
      verboseStreamLogging: ls.verboseStreamLogging ?? false,
      mcpServers: yamlMcpServers.length > 0 ? yamlMcpServers : undefined,
      branding:
        Object.keys(yamlBranding).length > 0
          ? (yamlBranding as Partial<
              import('@backstage-community/plugin-agentic-chat-common').BrandingConfig
            >)
          : undefined,
      reasoning: ls.reasoning,
    };
  }

  /**
   * Layer DB overrides on top of the baseline. All keys are read
   * in parallel for performance; each read has its own error
   * isolation via getTyped() so a corrupt key doesn't block others.
   */
  private async applyDbOverrides(
    baseline: EffectiveConfig,
  ): Promise<EffectiveConfig> {
    const config = { ...baseline };

    const [
      model,
      baseUrl,
      systemPrompt,
      toolChoice,
      enableWebSearch,
      enableCodeInterpreter,
      vectorStoreIds,
      vectorStoreConfig,
      safetyPatterns,
      dbBranding,
      mcpProxyUrl,
      dbMcpServers,
      disabledIds,
      safetyEnabled,
      inputShields,
      outputShields,
      safetyOnError,
      evaluationEnabled,
      scoringFunctions,
      minScoreThreshold,
      evaluationOnError,
    ] = await Promise.all([
      this.getTyped<string>('model'),
      this.getTyped<string>('baseUrl'),
      this.getTyped<string>('systemPrompt'),
      this.getTyped<ToolChoiceConfig>('toolChoice'),
      this.getTyped<boolean>('enableWebSearch'),
      this.getTyped<boolean>('enableCodeInterpreter'),
      this.getTyped<string[]>('activeVectorStoreIds'),
      this.getTyped<Record<string, unknown>>('vectorStoreConfig'),
      this.getTyped<string[]>('safetyPatterns'),
      this.getTyped<
        Partial<
          import('@backstage-community/plugin-agentic-chat-common').BrandingConfig
        >
      >('branding'),
      this.getTyped<string>('mcpProxyUrl'),
      this.getTyped<MCPServerConfig[]>('mcpServers'),
      this.getTyped<string[]>('disabledMcpServerIds'),
      this.getTyped<boolean>('safetyEnabled'),
      this.getTyped<string[]>('inputShields'),
      this.getTyped<string[]>('outputShields'),
      this.getTyped<'allow' | 'block'>('safetyOnError'),
      this.getTyped<boolean>('evaluationEnabled'),
      this.getTyped<string[]>('scoringFunctions'),
      this.getTyped<number>('minScoreThreshold'),
      this.getTyped<'skip' | 'fail'>('evaluationOnError'),
    ]);

    if (typeof model === 'string') config.model = model;
    if (typeof baseUrl === 'string') config.baseUrl = baseUrl;
    if (typeof systemPrompt === 'string') config.systemPrompt = systemPrompt;
    if (toolChoice !== undefined) config.toolChoice = toolChoice;
    if (typeof enableWebSearch === 'boolean')
      config.enableWebSearch = enableWebSearch;
    if (typeof enableCodeInterpreter === 'boolean')
      config.enableCodeInterpreter = enableCodeInterpreter;
    if (vectorStoreIds !== undefined && Array.isArray(vectorStoreIds))
      config.vectorStoreIds = vectorStoreIds;
    if (vectorStoreConfig !== undefined) {
      this.applyVectorStoreOverrides(config, vectorStoreConfig);
    }
    if (safetyPatterns !== undefined) config.safetyPatterns = safetyPatterns;
    if (dbBranding !== undefined) {
      config.branding = { ...(config.branding ?? {}), ...dbBranding };
    }
    if (typeof mcpProxyUrl === 'string') config.mcpProxyUrl = mcpProxyUrl;
    if (
      dbMcpServers !== undefined ||
      (disabledIds !== undefined && Array.isArray(disabledIds))
    ) {
      config.mcpServers = this.mergeMcpServers(
        config.mcpServers ?? [],
        Array.isArray(dbMcpServers) ? dbMcpServers : [],
        Array.isArray(disabledIds) ? new Set(disabledIds) : new Set(),
      );
    }
    if (typeof safetyEnabled === 'boolean')
      config.safetyEnabled = safetyEnabled;
    if (inputShields !== undefined && Array.isArray(inputShields))
      config.inputShields = inputShields;
    if (outputShields !== undefined && Array.isArray(outputShields))
      config.outputShields = outputShields;
    if (safetyOnError === 'allow' || safetyOnError === 'block')
      config.safetyOnError = safetyOnError;
    if (typeof evaluationEnabled === 'boolean')
      config.evaluationEnabled = evaluationEnabled;
    if (scoringFunctions !== undefined && Array.isArray(scoringFunctions))
      config.scoringFunctions = scoringFunctions;
    if (typeof minScoreThreshold === 'number')
      config.minScoreThreshold = minScoreThreshold;
    if (evaluationOnError === 'skip' || evaluationOnError === 'fail')
      config.evaluationOnError = evaluationOnError;

    return config;
  }

  private applyVectorStoreOverrides(
    config: EffectiveConfig,
    overrides: Record<string, unknown>,
  ): void {
    if (typeof overrides.embeddingModel === 'string')
      config.embeddingModel = overrides.embeddingModel;
    if (Number.isFinite(overrides.embeddingDimension))
      config.embeddingDimension = overrides.embeddingDimension as number;
    if (
      overrides.searchMode === 'semantic' ||
      overrides.searchMode === 'keyword' ||
      overrides.searchMode === 'hybrid'
    )
      config.searchMode = overrides.searchMode;
    if (Number.isFinite(overrides.bm25Weight))
      config.bm25Weight = overrides.bm25Weight as number;
    if (Number.isFinite(overrides.semanticWeight))
      config.semanticWeight = overrides.semanticWeight as number;
    if (
      overrides.chunkingStrategy === 'auto' ||
      overrides.chunkingStrategy === 'static'
    )
      config.chunkingStrategy = overrides.chunkingStrategy;
    if (Number.isFinite(overrides.maxChunkSizeTokens))
      config.maxChunkSizeTokens = overrides.maxChunkSizeTokens as number;
    if (Number.isFinite(overrides.chunkOverlapTokens))
      config.chunkOverlapTokens = overrides.chunkOverlapTokens as number;
    if (Number.isFinite(overrides.fileSearchMaxResults))
      config.fileSearchMaxResults = overrides.fileSearchMaxResults as number;
    if (Number.isFinite(overrides.fileSearchScoreThreshold))
      config.fileSearchScoreThreshold =
        overrides.fileSearchScoreThreshold as number;
    if (typeof overrides.vectorStoreName === 'string')
      config.vectorStoreName = overrides.vectorStoreName;
  }

  /**
   * Merge YAML and DB MCP servers.
   *
   * - DB servers whose ID matches a YAML server **override** the YAML
   *   version's url/name/type/allowedTools/headers/requireApproval while
   *   preserving YAML-only auth fields (authRef, oauth, serviceAccount)
   *   unless the DB entry also provides them.
   * - DB servers with new IDs are appended as-is.
   * - Servers whose ID is in `disabledIds` are excluded.
   */
  private mergeMcpServers(
    yamlServers: MCPServerConfig[],
    dbServers: MCPServerConfig[],
    disabledIds: Set<string> = new Set(),
  ): MCPServerConfig[] {
    const dbById = new Map(dbServers.map(s => [s.id, s]));

    const merged: MCPServerConfig[] = yamlServers
      .filter(s => !disabledIds.has(s.id))
      .map(yaml => {
        const override = dbById.get(yaml.id);
        if (!override) return yaml;
        return {
          ...yaml,
          name: override.name ?? yaml.name,
          type: override.type ?? yaml.type,
          url: override.url ?? yaml.url,
          allowedTools: override.allowedTools ?? yaml.allowedTools,
          ...(override.headers !== undefined
            ? { headers: override.headers }
            : {}),
          ...(override.requireApproval !== undefined
            ? { requireApproval: override.requireApproval }
            : {}),
        };
      });

    const yamlIds = new Set(yamlServers.map(s => s.id));
    for (const db of dbServers) {
      if (!yamlIds.has(db.id) && !disabledIds.has(db.id)) {
        merged.push(db);
      }
    }

    return merged;
  }

  /**
   * Read a single admin config key with per-key error isolation.
   * Provider-scoped keys are automatically resolved using the
   * provider ID. A corrupt value in one key does not prevent
   * other keys from loading.
   */
  private async getTyped<T>(key: string): Promise<T | undefined> {
    try {
      const adminKey = key as AdminConfigKey;
      const value = isProviderScopedKey(key)
        ? await this.adminConfig.getScopedValue(adminKey, this.providerId)
        : await this.adminConfig.get(adminKey);
      return value as T | undefined;
    } catch (error) {
      const msg = toErrorMessage(error);
      this.logger.warn(`Failed to read admin config key "${key}": ${msg}`);
      return undefined;
    }
  }

  /**
   * Deep-clone the config so callers cannot corrupt the cache
   * by mutating the returned object, its arrays, or nested objects.
   */
  private snapshot(config: EffectiveConfig): EffectiveConfig {
    const clone: EffectiveConfig = {
      ...config,
      vectorStoreIds: config.vectorStoreIds ? [...config.vectorStoreIds] : [],
    };
    if (config.safetyPatterns)
      clone.safetyPatterns = [...config.safetyPatterns];
    if (config.inputShields) clone.inputShields = [...config.inputShields];
    if (config.outputShields) clone.outputShields = [...config.outputShields];
    if (config.scoringFunctions)
      clone.scoringFunctions = [...config.scoringFunctions];
    if (config.mcpServers)
      clone.mcpServers = config.mcpServers.map(s => ({
        ...s,
        ...(s.headers ? { headers: { ...s.headers } } : {}),
        ...(s.allowedTools ? { allowedTools: [...s.allowedTools] } : {}),
      }));
    if (config.branding) {
      clone.branding = { ...config.branding };
      if (config.branding.customCssVariables) {
        clone.branding.customCssVariables = {
          ...config.branding.customCssVariables,
        };
      }
      if (config.branding.glassConfig) {
        clone.branding.glassConfig = { ...config.branding.glassConfig };
      }
    }
    return clone;
  }
}
