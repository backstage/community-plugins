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
  EffectiveConfig,
  DocumentInfo,
  VectorStoreInfo,
} from '../../types';
import type { VectorStoreService } from './VectorStoreService';
import type { DocumentSyncService, SyncResult } from './DocumentSyncService';
import type { ConfigResolutionService } from './ConfigResolutionService';
import { toErrorMessage } from '../../services/utils';

/**
 * Context provided by the orchestrator for vector store operations.
 * Config resolution is delegated to ConfigResolutionService; only
 * orchestrator lifecycle state is passed via callbacks.
 */
export interface VectorStoreFacadeContext {
  ensureInitialized: () => void;
  configResolution: ConfigResolutionService;
  getVectorStoreReady: () => boolean;
  setVectorStoreReady: (ready: boolean) => void;
  getInitialized: () => boolean;
}

/**
 * Dependencies for VectorStoreFacade.
 */
export interface VectorStoreFacadeDeps {
  vectorStore: VectorStoreService | null;
  docSync: DocumentSyncService | null;
  logger: LoggerService;
  context: VectorStoreFacadeContext;
}

/**
 * Facade for all vector-store-related operations.
 * Extracted from LlamaStackOrchestrator to separate concerns.
 */
export class VectorStoreFacade {
  private vectorStore: VectorStoreService | null;
  private docSync: DocumentSyncService | null;
  private readonly logger: LoggerService;
  private readonly ctx: VectorStoreFacadeContext;

  constructor(deps: VectorStoreFacadeDeps) {
    this.vectorStore = deps.vectorStore;
    this.docSync = deps.docSync;
    this.logger = deps.logger;
    this.ctx = deps.context;
  }

  /**
   * Update the underlying vector store and doc sync references.
   * Called by the orchestrator after initialization.
   */
  setServices(
    vectorStore: VectorStoreService | null,
    docSync: DocumentSyncService | null,
  ): void {
    this.vectorStore = vectorStore;
    this.docSync = docSync;
  }

  /**
   * Lazily ensure the vector store exists on the Llama Stack server.
   * Called on first sync or RAG operation rather than at plugin startup
   * so that boot time is not affected by network calls.
   */
  private async ensureVectorStoreReady(): Promise<void> {
    if (this.ctx.getVectorStoreReady()) return;
    if (!this.vectorStore) {
      throw new Error('Vector store service not created');
    }

    try {
      await this.vectorStore.ensureExists();
      this.ctx.configResolution.setLlamaStackConfig(
        this.vectorStore.getConfig(),
      );
      this.ctx.setVectorStoreReady(true);
      this.logger.info('Vector store initialized on first use');
    } catch (error) {
      throw new Error(
        `Vector store initialization failed: ${toErrorMessage(error)}`,
      );
    }
  }

  /**
   * List all documents in the vector store
   */
  async listDocuments(vectorStoreId?: string): Promise<DocumentInfo[]> {
    this.ctx.ensureInitialized();
    if (!this.vectorStore) {
      return [];
    }
    if (!this.ctx.getVectorStoreReady()) {
      return [];
    }
    return this.vectorStore.listDocuments(vectorStoreId);
  }

  /**
   * List all available vector stores
   */
  async listVectorStores(): Promise<VectorStoreInfo[]> {
    this.ctx.ensureInitialized();
    if (!this.vectorStore) {
      return [];
    }
    return this.vectorStore.listVectorStores();
  }

  /**
   * Get the default vector store ID
   */
  getDefaultVectorStoreId(): string | undefined {
    return this.vectorStore?.getDefaultVectorStoreId();
  }

  async getActiveVectorStoreIds(): Promise<string[]> {
    const config = this.ctx.configResolution.getLlamaStackConfig();
    if (!config) return [];
    try {
      const resolved = await this.ctx.configResolution.resolve();
      return resolved.vectorStoreIds;
    } catch (error) {
      this.logger.debug(
        'Config resolution failed, using fallback vector store IDs',
        error,
      );
      return config.vectorStoreIds ?? [];
    }
  }

  addVectorStoreId(id: string): void {
    const config = this.ctx.configResolution.getLlamaStackConfig();
    if (!config) return;
    if (!config.vectorStoreIds.includes(id)) {
      config.vectorStoreIds.push(id);
      if (this.vectorStore) {
        this.vectorStore.updateConfig(config);
      }
      this.ctx.configResolution.invalidateCache();
    }
  }

  removeVectorStoreId(id: string): void {
    const config = this.ctx.configResolution.getLlamaStackConfig();
    if (!config) return;
    config.vectorStoreIds = config.vectorStoreIds.filter(vsId => vsId !== id);
    if (this.vectorStore) {
      this.vectorStore.updateConfig(config);
    }
    this.ctx.configResolution.invalidateCache();
  }

  /**
   * Sync documents from configured sources to the vector store.
   * Lazily creates the vector store on first call.
   */
  async syncDocuments(): Promise<SyncResult> {
    this.ctx.ensureInitialized();
    if (!this.docSync) {
      return {
        added: 0,
        removed: 0,
        failed: 0,
        unchanged: 0,
        updated: 0,
        errors: [],
      };
    }

    await this.ensureVectorStoreReady();

    const config = this.ctx.configResolution.getLlamaStackConfig();
    if (config && this.vectorStore) {
      const cfg = await this.ctx.configResolution.resolve();
      this.vectorStore.updateConfig({
        ...config,
        chunkingStrategy: cfg.chunkingStrategy ?? config.chunkingStrategy,
        maxChunkSizeTokens: cfg.maxChunkSizeTokens ?? config.maxChunkSizeTokens,
        chunkOverlapTokens: cfg.chunkOverlapTokens ?? config.chunkOverlapTokens,
      });
    }

    return this.docSync.sync();
  }

  /**
   * Upload a single document to the vector store via the Files API.
   */
  async uploadDocument(
    fileName: string,
    content: Buffer,
    vectorStoreId?: string,
  ): Promise<{ fileId: string; fileName: string; status: string }> {
    this.ctx.ensureInitialized();
    if (!this.vectorStore) {
      throw new Error('Vector store service not available');
    }
    await this.ensureVectorStoreReady();

    const config = this.ctx.configResolution.getLlamaStackConfig();
    if (config) {
      const cfg = await this.ctx.configResolution.resolve();
      this.vectorStore.updateConfig({
        ...config,
        chunkingStrategy: cfg.chunkingStrategy ?? config.chunkingStrategy,
        maxChunkSizeTokens: cfg.maxChunkSizeTokens ?? config.maxChunkSizeTokens,
        chunkOverlapTokens: cfg.chunkOverlapTokens ?? config.chunkOverlapTokens,
      });
    }

    const result = await this.vectorStore.uploadDocuments(
      [{ fileName, content: content.toString('utf-8') }],
      vectorStoreId,
    );

    if (result.failed.length > 0) {
      throw new Error(
        `Upload failed for ${fileName}: ${result.failed[0].error}`,
      );
    }
    if (result.uploaded.length === 0) {
      throw new Error(`Upload produced no result for ${fileName}`);
    }

    const doc = result.uploaded[0];
    return { fileId: doc.id, fileName: doc.fileName, status: doc.status };
  }

  /**
   * Delete a document from the vector store.
   */
  async deleteDocument(
    fileId: string,
    vectorStoreId?: string,
  ): Promise<{ success: boolean }> {
    this.ctx.ensureInitialized();
    if (!this.vectorStore) {
      throw new Error('Vector store service not available');
    }
    if (!this.ctx.getVectorStoreReady()) {
      throw new Error('Vector store not initialized');
    }
    return this.vectorStore.deleteDocument(fileId, vectorStoreId);
  }

  /**
   * Permanently delete a vector store and all its files from the server.
   */
  async deleteVectorStore(
    vectorStoreId: string,
  ): Promise<{ success: boolean; filesDeleted: number }> {
    this.ctx.ensureInitialized();
    if (!this.vectorStore) {
      throw new Error('Vector store service not available');
    }
    return this.vectorStore.deleteVectorStore(vectorStoreId);
  }

  /**
   * Search one or more vector stores for chunks matching a query.
   */
  async searchVectorStore(
    query: string,
    maxResults: number = 5,
    targetVectorStoreId?: string,
    targetVectorStoreIds?: string[],
  ): Promise<{
    query: string;
    chunks: Array<{
      text: string;
      score?: number;
      fileId?: string;
      fileName?: string;
      vectorStoreId?: string;
    }>;
    vectorStoreId: string;
    totalResults: number;
  }> {
    this.ctx.ensureInitialized();
    if (!this.vectorStore) {
      throw new Error('Vector store service not available');
    }

    const ids: string[] =
      targetVectorStoreIds && targetVectorStoreIds.length > 0
        ? targetVectorStoreIds
        : [
            targetVectorStoreId ??
              this.vectorStore.getDefaultVectorStoreId() ??
              '',
          ].filter(Boolean);

    if (ids.length === 0) {
      throw new Error('No vector store available to search');
    }

    this.logger.info(
      `searchVectorStore: query="${query.substring(0, 80)}${
        query.length > 80 ? '...' : ''
      }", storeIds=[${ids.join(',')}], maxResults=${maxResults}`,
    );

    const perStore = await Promise.all(
      ids.map(storeId =>
        this.vectorStore!.searchSingle(storeId, query, maxResults),
      ),
    );
    const allChunks = perStore
      .flat()
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    this.logger.info(
      `searchVectorStore: ${allChunks.length} results across ${
        ids.length
      } store(s), topScore=${allChunks[0]?.score ?? 'N/A'}`,
    );

    return {
      query,
      chunks: allChunks,
      vectorStoreId: ids.join(','),
      totalResults: allChunks.length,
    };
  }

  /**
   * Get the sync schedule configuration
   */
  getSyncSchedule(): string | undefined {
    return this.docSync?.getSyncSchedule();
  }

  /**
   * Return the vector-store-related subset of the effective config.
   */
  async getVectorStoreConfig(): Promise<{
    vectorStoreName: string;
    embeddingModel: string;
    embeddingDimension: number;
    searchMode?: 'semantic' | 'keyword' | 'hybrid';
    bm25Weight?: number;
    semanticWeight?: number;
    chunkingStrategy: 'auto' | 'static';
    maxChunkSizeTokens: number;
    chunkOverlapTokens: number;
    fileSearchMaxResults?: number;
    fileSearchScoreThreshold?: number;
  } | null> {
    if (
      !this.ctx.getInitialized() ||
      !this.ctx.configResolution.getLlamaStackConfig()
    ) {
      return null;
    }
    let cfg: EffectiveConfig;
    try {
      cfg = await this.ctx.configResolution.resolve();
    } catch (error) {
      this.logger.debug(
        'Config resolution failed, using fallback vector store IDs',
        error,
      );
      cfg = this.ctx.configResolution.buildYamlFallback();
    }
    return {
      vectorStoreName: cfg.vectorStoreName,
      embeddingModel: cfg.embeddingModel,
      embeddingDimension: cfg.embeddingDimension,
      searchMode: cfg.searchMode,
      bm25Weight: cfg.bm25Weight,
      semanticWeight: cfg.semanticWeight,
      chunkingStrategy: cfg.chunkingStrategy,
      maxChunkSizeTokens: cfg.maxChunkSizeTokens,
      chunkOverlapTokens: cfg.chunkOverlapTokens,
      fileSearchMaxResults: cfg.fileSearchMaxResults,
      fileSearchScoreThreshold: cfg.fileSearchScoreThreshold,
    };
  }

  /**
   * Apply config overrides and create / find the vector store.
   */
  async createVectorStoreWithConfig(
    overrides: Record<string, unknown>,
  ): Promise<{
    vectorStoreId: string;
    vectorStoreName: string;
    created: boolean;
    embeddingModel: string;
    embeddingDimension?: number;
  }> {
    this.ctx.ensureInitialized();
    if (!this.vectorStore || !this.ctx.configResolution.getLlamaStackConfig()) {
      throw new Error('Vector store service not available');
    }

    const existingIds = await this.getActiveVectorStoreIds();
    const config = this.ctx.configResolution.getLlamaStackConfig()!;

    const result = await this.vectorStore.createWithConfig(config, overrides);

    this.ctx.configResolution.setLlamaStackConfig(this.vectorStore.getConfig());
    this.ctx.setVectorStoreReady(false);

    await this.ensureVectorStoreReady();

    const newId = result.vectorStoreId;

    const mergedIds = [...new Set([...existingIds, newId])];
    const updatedConfig = this.ctx.configResolution.getLlamaStackConfig()!;
    updatedConfig.vectorStoreIds = mergedIds;
    this.vectorStore.updateConfig(updatedConfig);

    return {
      vectorStoreId: newId,
      vectorStoreName: result.vectorStoreName,
      created: result.created,
      embeddingModel: result.embeddingModel,
      embeddingDimension: result.embeddingDimension,
    };
  }

  /**
   * Return the runtime status of the vector store.
   */
  async getVectorStoreStatus(): Promise<{
    exists: boolean;
    vectorStoreId?: string;
    vectorStoreName?: string;
    documentCount?: number;
    embeddingModel?: string;
    ready: boolean;
  }> {
    if (
      !this.ctx.getInitialized() ||
      !this.vectorStore ||
      !this.ctx.configResolution.getLlamaStackConfig()
    ) {
      return { exists: false, ready: false };
    }

    let resolved: EffectiveConfig;
    try {
      resolved = await this.ctx.configResolution.resolve();
    } catch (error) {
      this.logger.debug(
        'Config resolution failed, using fallback vector store IDs',
        error,
      );
      resolved = this.ctx.configResolution.buildYamlFallback();
    }

    if (!this.ctx.getVectorStoreReady()) {
      try {
        await this.ensureVectorStoreReady();
      } catch (error) {
        this.logger.debug(
          'Vector store readiness check failed, using existing store',
          error,
        );
        return {
          exists: false,
          ready: false,
          vectorStoreName: resolved.vectorStoreName,
          embeddingModel: resolved.embeddingModel,
        };
      }
    }

    try {
      const docs = await this.vectorStore.listDocuments();
      const vsId = this.vectorStore.getDefaultVectorStoreId();
      return {
        exists: true,
        ready: true,
        vectorStoreId: vsId,
        vectorStoreName: resolved.vectorStoreName,
        documentCount: docs.length,
        embeddingModel: resolved.embeddingModel,
      };
    } catch (error) {
      this.logger.warn(
        `Failed to get vector store status: ${toErrorMessage(
          error,
          'Unknown',
        )}`,
      );
      return {
        exists: true,
        ready: true,
        vectorStoreId: this.vectorStore.getDefaultVectorStoreId(),
        vectorStoreName: resolved.vectorStoreName,
        embeddingModel: resolved.embeddingModel,
      };
    }
  }
}
