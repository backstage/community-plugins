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
import { LoggerService } from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import { LlamaStackClient } from './LlamaStackClient';
import { toErrorMessage } from '../../services/utils';
import {
  LlamaStackConfig,
  VectorStoreInfo,
  LlamaStackVectorStoreResponse,
  LlamaStackVectorStoreFileResponse,
} from '../../types';
import {
  uploadDocuments as uploadDocumentsImpl,
  type UploadFile,
  type UploadResult,
} from './DocumentUploader';
import {
  listDocuments as listDocumentsImpl,
  fetchAllVectorStoreFiles,
} from './DocumentLister';

/** Re-export for public API compatibility */
export type { UploadFile, UploadResult } from './DocumentUploader';

/**
 * Vector Store Service
 *
 * Manages all vector store operations including:
 * - Creating and validating vector stores
 * - Uploading documents
 * - Listing documents
 * - Deleting documents
 */
export class VectorStoreService {
  private readonly client: LlamaStackClient;
  private readonly logger: LoggerService;
  private config: LlamaStackConfig;

  constructor(
    client: LlamaStackClient,
    config: LlamaStackConfig,
    logger: LoggerService,
  ) {
    this.client = client;
    this.config = config;
    this.logger = logger;
  }

  /**
   * Get the current configuration
   */
  getConfig(): LlamaStackConfig {
    return this.config;
  }

  /**
   * Update configuration (e.g., after auto-creating vector store)
   */
  updateConfig(config: LlamaStackConfig): void {
    this.config = config;
  }

  /**
   * Get the default vector store ID from configuration
   */
  getDefaultVectorStoreId(): string | undefined {
    return this.config.vectorStoreIds[0];
  }

  /**
   * Ensure the vector store exists, creating it if necessary.
   *
   * Production-grade initialization logic:
   * 1. If vectorStoreIds are configured, validate they exist on the server
   * 2. If validation fails OR no vectorStoreIds configured, use vectorStoreName
   * 3. Find existing vector store by name, or create a new one
   * 4. Update config with the active vector store ID
   *
   * This ensures RAG is always enabled when vectorStoreName is configured.
   *
   * @throws Error if vectorStoreName is not configured and no valid vectorStoreIds exist
   */
  async ensureExists(): Promise<void> {
    const vectorStoreName = this.config.vectorStoreName;

    // Step 1: Validate configuration - vectorStoreName is required for production
    if (!vectorStoreName) {
      throw new Error(
        'CONFIGURATION ERROR: agenticChat.llamaStack.vectorStoreName is required. ' +
          'RAG cannot be initialized without a vector store name. ' +
          'Add vectorStoreName to your app-config.yaml.',
      );
    }

    this.logger.info(
      `Initializing RAG with vector store: "${vectorStoreName}"`,
    );

    // Step 2: If vectorStoreIds are explicitly configured, try to validate them first
    if (this.config.vectorStoreIds.length > 0) {
      const configuredId = this.config.vectorStoreIds[0];
      const validated = await this.validateVectorStore(configuredId);
      if (validated) {
        this.logger.info(`✓ Using configured vector store: ${configuredId}`);
        return;
      }
      this.logger.warn(
        `Configured vectorStoreId "${configuredId}" not found on server. ` +
          `Will find or create vector store by name: "${vectorStoreName}"`,
      );
    }

    // Step 3: Find or create vector store by name
    await this.findOrCreateVectorStore(vectorStoreName);
  }

  /**
   * Validate that a vector store exists on the server
   * @returns true if the vector store exists, false otherwise
   */
  private async validateVectorStore(vectorStoreId: string): Promise<boolean> {
    try {
      const response = await this.client.request<LlamaStackVectorStoreResponse>(
        `/v1/openai/v1/vector_stores/${vectorStoreId}`,
        { method: 'GET' },
      );
      this.logger.debug(
        `Vector store ${vectorStoreId} validated: status=${
          response.status
        }, files=${response.file_counts?.total || 0}`,
      );
      return true;
    } catch (error) {
      this.logger.debug(
        `Vector store ${vectorStoreId} validation failed: ${toErrorMessage(
          error,
        )}`,
      );
      return false;
    }
  }

  /**
   * Find an existing vector store by name, or create a new one.
   * Updates this.config.vectorStoreIds with the active vector store ID.
   *
   * @param vectorStoreName - The name to search for or use when creating
   * @throws Error if both find and create operations fail
   */
  private async findOrCreateVectorStore(
    vectorStoreName: string,
  ): Promise<void> {
    // Step 3a: List existing vector stores and find by name
    try {
      const existingStore = await this.findVectorStoreByName(vectorStoreName);
      if (existingStore) {
        this.config.vectorStoreIds = [existingStore.id];
        this.logger.info(
          `✓ Found existing vector store: ${existingStore.id} ("${vectorStoreName}") ` +
            `with ${existingStore.file_counts?.total || 0} files`,
        );
        return;
      }
    } catch (error) {
      this.logger.warn(
        `Could not list vector stores: ${toErrorMessage(
          error,
        )}. Will attempt to create new vector store.`,
      );
    }

    // Step 3b: Create new vector store
    this.logger.info(`Creating new vector store: "${vectorStoreName}"`);
    const createdStore = await this.createVectorStore(vectorStoreName);
    this.config.vectorStoreIds = [createdStore.id];
    this.logger.info(
      `✓ Created new vector store: ${createdStore.id} ("${vectorStoreName}")`,
    );
  }

  /**
   * Find a vector store by name from the list of existing stores
   * @returns The matching vector store or undefined if not found
   */
  private async findVectorStoreByName(
    vectorStoreName: string,
  ): Promise<LlamaStackVectorStoreResponse | undefined> {
    const listResponse = await this.client.request<{
      data?: LlamaStackVectorStoreResponse[];
    }>('/v1/openai/v1/vector_stores', { method: 'GET' });

    const existingStores = Array.isArray(listResponse)
      ? listResponse
      : listResponse.data || [];

    this.logger.debug(
      `Found ${existingStores.length} existing vector store(s) on server`,
    );

    return existingStores.find(
      (vs: LlamaStackVectorStoreResponse) => vs.name === vectorStoreName,
    );
  }

  /**
   * Create a new vector store with the configured settings
   * Includes embedding model, dimension, and hybrid search configuration
   *
   * @param vectorStoreName - Name for the new vector store
   * @returns The created vector store response
   * @throws Error if creation fails
   */
  private async createVectorStore(
    vectorStoreName: string,
  ): Promise<LlamaStackVectorStoreResponse> {
    // Build creation request body
    const createBody: Record<string, unknown> = {
      name: vectorStoreName,
    };

    // Embedding configuration
    if (this.config.embeddingModel) {
      createBody.embedding_model = this.config.embeddingModel;
    }
    if (this.config.embeddingDimension) {
      createBody.embedding_dimension = this.config.embeddingDimension;
    }

    // Hybrid search configuration
    if (this.config.searchMode) {
      createBody.search_mode = this.config.searchMode;
    }
    if (this.config.bm25Weight !== undefined) {
      createBody.bm25_weight = this.config.bm25Weight;
    }
    if (this.config.semanticWeight !== undefined) {
      createBody.semantic_weight = this.config.semanticWeight;
    }

    // Log configuration details
    this.logVectorStoreConfig(vectorStoreName);

    try {
      return await this.client.request<LlamaStackVectorStoreResponse>(
        '/v1/openai/v1/vector_stores',
        {
          method: 'POST',
          body: JSON.stringify(createBody),
        },
      );
    } catch (error) {
      const message = toErrorMessage(error);
      this.logger.error(
        `Failed to create vector store "${vectorStoreName}": ${message}`,
      );
      throw new Error(
        `Failed to create vector store "${vectorStoreName}": ${message}`,
      );
    }
  }

  /**
   * Log the vector store configuration for debugging
   */
  private logVectorStoreConfig(vectorStoreName: string): void {
    const configLines = [
      `  name: "${vectorStoreName}"`,
      `  embedding_model: ${this.config.embeddingModel || '(default)'}`,
      `  embedding_dimension: ${this.config.embeddingDimension || '(default)'}`,
    ];

    if (this.config.searchMode) {
      configLines.push(`  search_mode: ${this.config.searchMode}`);
      if (this.config.searchMode === 'hybrid') {
        configLines.push(`  bm25_weight: ${this.config.bm25Weight ?? 0.5}`);
        configLines.push(
          `  semantic_weight: ${this.config.semanticWeight ?? 0.5}`,
        );
      }
    }

    this.logger.info(`Vector store configuration:\n${configLines.join('\n')}`);
  }

  /**
   * Upload documents to the vector store
   */
  async uploadDocuments(
    files: UploadFile[],
    vectorStoreId?: string,
  ): Promise<UploadResult> {
    return uploadDocumentsImpl(
      files,
      { client: this.client, config: this.config, logger: this.logger },
      vectorStoreId,
    );
  }

  /**
   * Fetch all files from vector store with pagination
   * Handles pagination automatically to retrieve all files
   */
  private async fetchAllVectorStoreFiles(
    vectorStoreId?: string,
  ): Promise<LlamaStackVectorStoreFileResponse[]> {
    return fetchAllVectorStoreFiles(
      { client: this.client, config: this.config, logger: this.logger },
      vectorStoreId,
    );
  }

  /**
   * List all documents in the vector store
   * Uses vector store files endpoint first (source of truth), falls back to Files API
   * Implements pagination to fetch all documents when count exceeds page size
   */
  async listDocuments(vectorStoreId?: string) {
    return listDocumentsImpl(
      { client: this.client, config: this.config, logger: this.logger },
      vectorStoreId,
    );
  }

  /**
   * Search a single vector store for chunks matching a query.
   * Used by searchVectorStore when querying one or more stores.
   *
   * @param storeId - Vector store ID to search
   * @param query - Search query text
   * @param maxResults - Maximum number of results to return
   * @returns Array of chunks with text, score, fileId, fileName, vectorStoreId
   */
  async searchSingle(
    storeId: string,
    query: string,
    maxResults: number,
  ): Promise<
    Array<{
      text: string;
      score?: number;
      fileId?: string;
      fileName?: string;
      vectorStoreId?: string;
    }>
  > {
    const response = await this.client.request<{
      data?: Array<{
        content?: Array<{ text?: string; type?: string }>;
        score?: number;
        file_id?: string;
        filename?: string;
      }>;
    }>(`/v1/openai/v1/vector_stores/${storeId}/search`, {
      method: 'POST',
      body: { query, max_num_results: maxResults },
    });

    return (response.data ?? []).map(item => ({
      text: item.content?.map(c => c.text ?? '').join('') ?? '',
      score: item.score,
      fileId: item.file_id,
      fileName: item.filename,
      vectorStoreId: storeId,
    }));
  }

  /**
   * Create a vector store with config overrides merged onto a base config.
   * Handles override merging, duplicate name checking, and vector store creation.
   * Caller is responsible for merging the new ID into the active list and
   * updating orchestrator state (vectorStoreReady, etc.).
   *
   * @param baseConfig - Base Llama Stack config to merge overrides onto
   * @param overrides - Admin overrides (vectorStoreName, embeddingModel, etc.)
   * @returns Created vector store metadata
   * @throws Error if a store with the same name already exists
   */
  async createWithConfig(
    baseConfig: LlamaStackConfig,
    overrides: Record<string, unknown>,
  ): Promise<{
    vectorStoreId: string;
    vectorStoreName: string;
    created: boolean;
    embeddingModel: string;
    embeddingDimension?: number;
  }> {
    const cfg = { ...baseConfig } as LlamaStackConfig;

    if (typeof overrides.vectorStoreName === 'string')
      cfg.vectorStoreName = overrides.vectorStoreName;
    if (typeof overrides.embeddingModel === 'string')
      cfg.embeddingModel = overrides.embeddingModel;
    if (typeof overrides.embeddingDimension === 'number')
      cfg.embeddingDimension = overrides.embeddingDimension;
    if (
      overrides.searchMode === 'semantic' ||
      overrides.searchMode === 'keyword' ||
      overrides.searchMode === 'hybrid'
    )
      cfg.searchMode = overrides.searchMode;
    if (typeof overrides.bm25Weight === 'number')
      cfg.bm25Weight = overrides.bm25Weight;
    if (typeof overrides.semanticWeight === 'number')
      cfg.semanticWeight = overrides.semanticWeight;
    if (
      overrides.chunkingStrategy === 'auto' ||
      overrides.chunkingStrategy === 'static'
    )
      cfg.chunkingStrategy = overrides.chunkingStrategy;
    if (typeof overrides.maxChunkSizeTokens === 'number')
      cfg.maxChunkSizeTokens = overrides.maxChunkSizeTokens;
    if (typeof overrides.chunkOverlapTokens === 'number')
      cfg.chunkOverlapTokens = overrides.chunkOverlapTokens;
    if (typeof overrides.fileSearchMaxResults === 'number')
      cfg.fileSearchMaxResults = overrides.fileSearchMaxResults;
    if (typeof overrides.fileSearchScoreThreshold === 'number')
      cfg.fileSearchScoreThreshold = overrides.fileSearchScoreThreshold;

    try {
      const serverStores = await this.listVectorStores();
      const duplicate = serverStores.find(s => s.name === cfg.vectorStoreName);
      if (duplicate) {
        throw new Error(
          `A vector store named "${cfg.vectorStoreName}" already exists (ID: ${duplicate.id}). ` +
            'Use a different name or connect the existing store.',
        );
      }
    } catch (error) {
      // Re-throw our own duplicate error; swallow server list failures
      if (error instanceof Error && error.message.includes('already exists')) {
        throw error;
      }
      this.logger.debug(
        'Vector store registration error (non-duplicate), swallowed',
      );
    }

    cfg.vectorStoreIds = [];
    this.updateConfig(cfg);
    await this.ensureExists();

    const updatedCfg = this.getConfig();
    const newId =
      updatedCfg.vectorStoreIds.length > 0
        ? updatedCfg.vectorStoreIds[0]
        : undefined;

    if (!newId) {
      throw new Error(
        `Vector store "${cfg.vectorStoreName}" was created but no ID was returned. Check LlamaStack logs.`,
      );
    }

    return {
      vectorStoreId: newId,
      vectorStoreName: cfg.vectorStoreName,
      created: true,
      embeddingModel: cfg.embeddingModel,
      embeddingDimension: cfg.embeddingDimension,
    };
  }

  /**
   * List all available vector stores from Llama Stack
   * Returns vector stores that can be used for RAG queries
   */
  async listVectorStores(): Promise<VectorStoreInfo[]> {
    try {
      const response = await this.client.request<
        | {
            data?: LlamaStackVectorStoreResponse[];
          }
        | LlamaStackVectorStoreResponse[]
      >('/v1/openai/v1/vector_stores', {
        method: 'GET',
      });

      // Handle both array and object response formats
      const stores: LlamaStackVectorStoreResponse[] = Array.isArray(response)
        ? response
        : response.data || [];

      this.logger.info(`Found ${stores.length} vector stores`);

      return stores.map(store => ({
        id: store.id,
        name: store.name || store.id,
        status: store.status || 'unknown',
        fileCount: store.file_counts?.total || 0,
        createdAt: store.created_at ?? 0,
      }));
    } catch (error) {
      const errorMsg = toErrorMessage(error);
      this.logger.error(`Failed to list vector stores: ${errorMsg}`);

      // Return at least the configured vector stores
      return this.config.vectorStoreIds.map((id, index) => ({
        id,
        name: index === 0 ? 'Primary' : `Store ${index + 1}`,
        status: 'unknown',
        fileCount: 0,
        createdAt: 0,
      }));
    }
  }

  /**
   * Delete a document from the vector store and files API
   * Handles Llama Stack's different behavior where files may not be in vector store
   */
  async deleteDocument(
    fileId: string,
    vectorStoreId?: string,
  ): Promise<{ success: boolean }> {
    const targetId = vectorStoreId ?? this.config.vectorStoreIds[0];
    if (!targetId) {
      throw new InputError(
        'No vector store configured — cannot delete document',
      );
    }
    let deletedFromVectorStore = false;
    let deletedFromFiles = false;

    // Try to delete from vector store first
    try {
      await this.client.request(
        `/v1/openai/v1/vector_stores/${targetId}/files/${fileId}`,
        { method: 'DELETE' },
      );
      deletedFromVectorStore = true;
      this.logger.debug(`Deleted from vector store: ${fileId}`);
    } catch (error) {
      // File may not be in vector store, that's OK - try files API
      const errorMsg = toErrorMessage(error, '');
      if (errorMsg.includes('400') || errorMsg.includes('not found')) {
        this.logger.debug(
          `File ${fileId} not in vector store, trying files API`,
        );
      } else {
        this.logger.warn(
          `Vector store delete failed for ${fileId}: ${errorMsg}`,
        );
      }
    }

    // Also delete from files API to fully clean up
    try {
      await this.client.request(`/v1/openai/v1/files/${fileId}`, {
        method: 'DELETE',
      });
      deletedFromFiles = true;
      this.logger.debug(`Deleted from files API: ${fileId}`);
    } catch (error) {
      const errorMsg = toErrorMessage(error, '');
      if (!errorMsg.includes('404') && !errorMsg.includes('not found')) {
        this.logger.debug(`Files API delete failed for ${fileId}: ${errorMsg}`);
      }
    }

    if (deletedFromVectorStore || deletedFromFiles) {
      this.logger.info(`Deleted document: ${fileId}`);
      return { success: true };
    }

    // Neither deletion worked - consider it a failure but don't throw
    this.logger.warn(`Could not delete ${fileId} from either endpoint`);
    return { success: false };
  }

  /**
   * Permanently delete a vector store and all its files from the server.
   * First deletes all files in the store, then deletes the store itself.
   */
  async deleteVectorStore(
    vectorStoreId: string,
  ): Promise<{ success: boolean; filesDeleted: number }> {
    let filesDeleted = 0;

    // Step 1: Delete all files in the store
    try {
      const files = await this.fetchAllVectorStoreFiles(vectorStoreId);
      for (const file of files) {
        try {
          await this.deleteDocument(file.id, vectorStoreId);
          filesDeleted++;
        } catch (err) {
          this.logger.warn(
            `Failed to delete file ${
              file.id
            } from store ${vectorStoreId}: ${toErrorMessage(err, 'Unknown')}`,
          );
        }
      }
      this.logger.info(
        `Deleted ${filesDeleted}/${files.length} files from store ${vectorStoreId}`,
      );
    } catch (err) {
      this.logger.warn(
        `Could not list files for store ${vectorStoreId} before deletion: ${toErrorMessage(
          err,
          'Unknown',
        )}`,
      );
    }

    // Step 2: Delete the vector store itself
    try {
      await this.client.request(
        `/v1/openai/v1/vector_stores/${vectorStoreId}`,
        { method: 'DELETE' },
      );
      this.logger.info(`Permanently deleted vector store: ${vectorStoreId}`);
      return { success: true, filesDeleted };
    } catch (error) {
      const msg = toErrorMessage(error);
      this.logger.error(
        `Failed to delete vector store ${vectorStoreId}: ${msg}`,
      );
      throw new Error(`Failed to delete vector store ${vectorStoreId}: ${msg}`);
    }
  }
}
