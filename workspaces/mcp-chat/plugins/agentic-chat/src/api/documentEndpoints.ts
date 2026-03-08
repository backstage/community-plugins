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

import type { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import type {
  DocumentInfo,
  RagTestResult,
  UploadResult,
  VectorStoreConfig,
  VectorStoreCreateResult,
  VectorStoreStatusResult,
  VectorStoreInfo,
} from '../types';
import { jsonBody } from './fetchHelpers';

export interface DocumentApiDeps {
  fetchJson: <T>(path: string, init?: RequestInit) => Promise<T>;
  discoveryApi: DiscoveryApi;
  fetchApi: FetchApi;
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export async function listDocuments(
  deps: DocumentApiDeps,
): Promise<DocumentInfo[]> {
  const data = await deps.fetchJson<{ documents: DocumentInfo[] }>(
    '/documents',
  );
  return data.documents;
}

export async function syncDocuments(deps: DocumentApiDeps): Promise<{
  added: number;
  updated: number;
  removed: number;
  failed: number;
  unchanged: number;
  errors: string[];
}> {
  return deps.fetchJson('/sync', { method: 'POST' });
}

export async function uploadDocument(
  deps: DocumentApiDeps,
  file: File,
  vectorStoreId?: string,
  replace?: boolean,
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  const params = new URLSearchParams();
  if (vectorStoreId) params.set('vectorStoreId', vectorStoreId);
  if (replace) params.set('replace', 'true');
  const qs = params.toString() ? `?${params.toString()}` : '';
  return deps.fetchJson(`/admin/documents${qs}`, {
    method: 'POST',
    body: formData,
  });
}

export async function deleteDocument(
  deps: DocumentApiDeps,
  fileId: string,
  vectorStoreId?: string,
): Promise<{ success: boolean }> {
  const qs = vectorStoreId
    ? `?vectorStoreId=${encodeURIComponent(vectorStoreId)}`
    : '';
  return deps.fetchJson(`/admin/documents/${encodeURIComponent(fileId)}${qs}`, {
    method: 'DELETE',
  });
}

export async function listDocumentsForStore(
  deps: DocumentApiDeps,
  vectorStoreId: string,
): Promise<DocumentInfo[]> {
  const data = await deps.fetchJson<{ documents: DocumentInfo[] }>(
    `/documents?vectorStoreId=${encodeURIComponent(vectorStoreId)}`,
  );
  return data.documents;
}

// ---------------------------------------------------------------------------
// RAG
// ---------------------------------------------------------------------------

export async function testRagQuery(
  deps: DocumentApiDeps,
  query: string,
  maxResults?: number,
  vectorStoreId?: string,
  vectorStoreIds?: string[],
): Promise<RagTestResult> {
  return deps.fetchJson(
    '/admin/rag-test',
    jsonBody({ query, maxResults, vectorStoreId, vectorStoreIds }),
  );
}

// ---------------------------------------------------------------------------
// Vector Store Config
// ---------------------------------------------------------------------------

export async function getVectorStoreConfig(deps: DocumentApiDeps): Promise<{
  config: VectorStoreConfig;
  source: 'yaml' | 'database' | 'merged';
}> {
  return deps.fetchJson('/admin/vector-store-config');
}

export async function saveVectorStoreConfig(
  deps: DocumentApiDeps,
  overrides: Partial<VectorStoreConfig>,
): Promise<void> {
  await deps.fetchJson(
    '/admin/config/vectorStoreConfig',
    jsonBody({ value: overrides }, 'PUT'),
  );
}

export async function resetVectorStoreConfig(
  deps: DocumentApiDeps,
): Promise<{ deleted: boolean }> {
  return deps.fetchJson('/admin/config/vectorStoreConfig', {
    method: 'DELETE',
  });
}

export async function createVectorStore(
  deps: DocumentApiDeps,
  config?: Record<string, unknown>,
): Promise<VectorStoreCreateResult> {
  return deps.fetchJson('/admin/vector-store/create', jsonBody(config ?? {}));
}

export async function getVectorStoreStatus(
  deps: DocumentApiDeps,
): Promise<VectorStoreStatusResult> {
  return deps.fetchJson('/admin/vector-store/status');
}

// ---------------------------------------------------------------------------
// Multi-Vector-Store Management
// ---------------------------------------------------------------------------

export async function listActiveVectorStores(deps: DocumentApiDeps): Promise<{
  stores: Array<VectorStoreInfo & { active: boolean }>;
}> {
  return deps.fetchJson('/admin/vector-stores');
}

export async function connectVectorStore(
  deps: DocumentApiDeps,
  vectorStoreId: string,
): Promise<{
  activeVectorStoreIds: string[];
}> {
  return deps.fetchJson(
    '/admin/vector-stores/connect',
    jsonBody({ vectorStoreId }),
  );
}

export async function removeVectorStore(
  deps: DocumentApiDeps,
  vectorStoreId: string,
  permanent?: boolean,
): Promise<{
  removed: string;
  permanent: boolean;
  filesDeleted: number;
  activeVectorStoreIds: string[];
}> {
  const qs = permanent ? '?permanent=true' : '';
  return deps.fetchJson(
    `/admin/vector-stores/${encodeURIComponent(vectorStoreId)}${qs}`,
    { method: 'DELETE' },
  );
}
