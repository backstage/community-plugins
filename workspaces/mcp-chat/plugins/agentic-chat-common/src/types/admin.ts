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

// =============================================================================
// Admin Panel Types
// =============================================================================

/**
 * Allowed keys for admin-managed configuration stored in the database.
 *
 * Keys fall into three categories:
 * - `activeProvider`: which provider is currently active
 * - Global keys: shared across all providers (branding, swimLanes, etc.)
 * - Provider-scoped keys: namespaced per provider in storage (model, baseUrl, etc.)
 *
 * @public
 */
export type AdminConfigKey =
  | 'activeProvider'
  | 'swimLanes'
  | 'systemPrompt'
  | 'branding'
  | 'safetyPatterns'
  | 'vectorStoreConfig'
  | 'activeVectorStoreIds'
  | 'model'
  | 'baseUrl'
  | 'toolChoice'
  | 'enableWebSearch'
  | 'enableCodeInterpreter'
  | 'mcpServers'
  | 'disabledMcpServerIds'
  | 'mcpProxyUrl'
  | 'safetyEnabled'
  | 'inputShields'
  | 'outputShields'
  | 'safetyOnError'
  | 'evaluationEnabled'
  | 'scoringFunctions'
  | 'minScoreThreshold'
  | 'evaluationOnError';

/**
 * A single admin config entry stored in the database.
 * @public
 */
export interface AdminConfigEntry {
  configKey: AdminConfigKey;
  configValue: unknown;
  updatedAt: string;
  updatedBy: string;
}

/**
 * A single chunk returned from a RAG test query.
 * @public
 */
export interface RagTestChunk {
  text: string;
  score?: number;
  fileId?: string;
  fileName?: string;
  vectorStoreId?: string;
}

/**
 * Result of a RAG test query against the vector store.
 * @public
 */
export interface RagTestResult {
  query: string;
  chunks: RagTestChunk[];
  vectorStoreId: string;
  totalResults: number;
}

/**
 * Result of uploading a document to the vector store.
 * @public
 */
export interface UploadResult {
  fileId: string;
  fileName: string;
  status: string;
}

/**
 * Vector store configuration editable from the admin panel.
 * Fields mirror the vector store section of the active provider's app-config.
 * @public
 */
export interface VectorStoreConfig {
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
}

/**
 * Result of creating a vector store.
 * @public
 */
export interface VectorStoreCreateResult {
  vectorStoreId: string;
  vectorStoreName: string;
  created: boolean;
  embeddingModel: string;
  embeddingDimension?: number;
}

/**
 * Current status of the vector store.
 * @public
 */
export interface VectorStoreStatusResult {
  exists: boolean;
  vectorStoreId?: string;
  vectorStoreName?: string;
  documentCount?: number;
  embeddingModel?: string;
  ready: boolean;
}
