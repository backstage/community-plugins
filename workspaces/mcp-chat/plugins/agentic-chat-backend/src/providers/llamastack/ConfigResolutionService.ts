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
import type { LlamaStackConfig, EffectiveConfig } from '../../types';
import { DEFAULT_EMBEDDING_DIMENSION } from '../../constants';
import type { ClientManager } from './ClientManager';
import type { RuntimeConfigResolver } from '../../services/RuntimeConfigResolver';

/**
 * Encapsulates effective-config resolution (YAML + DB admin overrides)
 * and the side-effects of keeping lastResolvedModel, verbose-logging
 * flag, and the HTTP client in sync.
 *
 * Extracted from LlamaStackOrchestrator so config-resolution logic
 * lives in a single, testable place instead of being interleaved with
 * initialization and chat orchestration.
 */
export class ConfigResolutionService {
  private llamaStackConfig: LlamaStackConfig | null = null;
  private systemPrompt: string = '';
  private resolver: RuntimeConfigResolver | null = null;
  private lastResolvedModel: string | null = null;
  private lastResolvedVerboseLogging: boolean | null = null;

  constructor(private readonly clientManager: ClientManager) {}

  getLlamaStackConfig(): LlamaStackConfig | null {
    return this.llamaStackConfig;
  }

  setLlamaStackConfig(config: LlamaStackConfig): void {
    this.llamaStackConfig = config;
  }

  setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
  }

  setResolver(resolver: RuntimeConfigResolver): void {
    this.resolver = resolver;
  }

  getResolver(): RuntimeConfigResolver | null {
    return this.resolver;
  }

  getLastResolvedModel(): string | null {
    return this.lastResolvedModel;
  }

  setLastResolvedModel(model: string | null): void {
    this.lastResolvedModel = model;
  }

  setLastResolvedVerboseLogging(value: boolean | null): void {
    this.lastResolvedVerboseLogging = value;
  }

  isVerboseStreamLoggingEnabled(): boolean {
    return (
      this.lastResolvedVerboseLogging ??
      this.llamaStackConfig?.verboseStreamLogging ??
      false
    );
  }

  invalidateCache(): void {
    this.resolver?.invalidateCache();
  }

  /**
   * Resolve the effective configuration (YAML + DB admin overrides).
   *
   * Side-effects:
   * - Updates lastResolvedModel / lastResolvedVerboseLogging
   * - Passes resolved connection fields to ClientManager, which recreates
   *   the HTTP client when baseUrl, token, or skipTlsVerify change.
   */
  async resolve(): Promise<EffectiveConfig> {
    if (!this.llamaStackConfig) {
      throw new Error('Llama Stack not configured');
    }

    const config = this.resolver
      ? await this.resolver.resolve()
      : this.buildYamlFallback();

    this.lastResolvedModel = config.model;
    this.lastResolvedVerboseLogging = config.verboseStreamLogging;

    this.clientManager.getClient({
      ...this.llamaStackConfig,
      baseUrl: config.baseUrl,
      token: config.token,
      skipTlsVerify: config.skipTlsVerify,
    });

    return config;
  }

  /**
   * Build an EffectiveConfig from YAML-only values (no DB).
   * Used as fallback when no RuntimeConfigResolver is available.
   */
  buildYamlFallback(): EffectiveConfig {
    if (!this.llamaStackConfig) {
      throw new Error('Llama Stack not configured');
    }
    const cfg = this.llamaStackConfig;
    return {
      model: cfg.model,
      baseUrl: cfg.baseUrl,
      systemPrompt: this.systemPrompt,
      toolChoice: cfg.toolChoice,
      parallelToolCalls: cfg.parallelToolCalls,
      textFormat: cfg.textFormat,
      enableWebSearch: cfg.enableWebSearch ?? false,
      enableCodeInterpreter: cfg.enableCodeInterpreter ?? false,
      fileSearchMaxResults: cfg.fileSearchMaxResults,
      fileSearchScoreThreshold: cfg.fileSearchScoreThreshold,
      vectorStoreIds: [...cfg.vectorStoreIds],
      vectorStoreName: cfg.vectorStoreName,
      embeddingModel: cfg.embeddingModel,
      embeddingDimension: cfg.embeddingDimension ?? DEFAULT_EMBEDDING_DIMENSION,
      searchMode: cfg.searchMode,
      bm25Weight: cfg.bm25Weight,
      semanticWeight: cfg.semanticWeight,
      chunkingStrategy: cfg.chunkingStrategy,
      maxChunkSizeTokens: cfg.maxChunkSizeTokens,
      chunkOverlapTokens: cfg.chunkOverlapTokens,
      skipTlsVerify: cfg.skipTlsVerify ?? false,
      zdrMode: cfg.zdrMode ?? false,
      functions: cfg.functions,
      token: cfg.token,
      verboseStreamLogging: cfg.verboseStreamLogging ?? false,
    };
  }
}
