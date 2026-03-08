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

import type { DocumentApiDeps } from './documentEndpoints';
import {
  listDocuments,
  syncDocuments,
  uploadDocument,
  deleteDocument,
  listDocumentsForStore,
  testRagQuery,
  getVectorStoreConfig,
  saveVectorStoreConfig,
  resetVectorStoreConfig,
  createVectorStore,
  getVectorStoreStatus,
  listActiveVectorStores,
  connectVectorStore,
  removeVectorStore,
} from './documentEndpoints';

describe('documentEndpoints', () => {
  const baseUrl = 'http://localhost:7007/api/agentic-chat';

  function createDeps(
    overrides: Partial<DocumentApiDeps> = {},
  ): DocumentApiDeps {
    return {
      fetchJson: jest.fn(),
      discoveryApi: {
        getBaseUrl: jest.fn().mockResolvedValue(baseUrl),
      } as unknown as DocumentApiDeps['discoveryApi'],
      fetchApi: {
        fetch: jest.fn(),
      } as unknown as DocumentApiDeps['fetchApi'],
      ...overrides,
    };
  }

  describe('Documents', () => {
    describe('listDocuments', () => {
      it('should fetch documents', async () => {
        const deps = createDeps();
        const mockDocs = [
          {
            id: 'file-1',
            fileName: 'test.md',
            format: 'text',
            fileSize: 1024,
            uploadedAt: '2025-01-15',
            status: 'completed',
          },
        ];
        (deps.fetchJson as jest.Mock).mockResolvedValue({
          documents: mockDocs,
        });

        const result = await listDocuments(deps);

        expect(deps.fetchJson).toHaveBeenCalledWith('/documents');
        expect(result).toEqual(mockDocs);
      });
    });

    describe('syncDocuments', () => {
      it('should POST to sync and return result', async () => {
        const deps = createDeps();
        const mockResult = {
          added: 2,
          updated: 1,
          removed: 0,
          failed: 0,
          unchanged: 5,
          errors: [],
        };
        (deps.fetchJson as jest.Mock).mockResolvedValue(mockResult);

        const result = await syncDocuments(deps);

        expect(deps.fetchJson).toHaveBeenCalledWith('/sync', {
          method: 'POST',
        });
        expect(result).toEqual(mockResult);
      });
    });

    describe('uploadDocument', () => {
      it('should upload file via FormData', async () => {
        const deps = createDeps();
        const file = new File(['content'], 'doc.txt', { type: 'text/plain' });
        const mockResult = { fileId: 'file-123', status: 'completed' };
        (deps.fetchJson as jest.Mock).mockResolvedValue(mockResult);

        const result = await uploadDocument(deps, file);

        expect(deps.fetchJson).toHaveBeenCalledWith(
          '/admin/documents',
          expect.objectContaining({
            method: 'POST',
            body: expect.any(FormData),
          }),
        );
        expect(result).toEqual(mockResult);
      });

      it('should include vectorStoreId and replace in query', async () => {
        const deps = createDeps();
        const file = new File(['x'], 'x.txt');
        (deps.fetchJson as jest.Mock).mockResolvedValue({});

        await uploadDocument(deps, file, 'vs-1', true);

        expect(deps.fetchJson).toHaveBeenCalledWith(
          '/admin/documents?vectorStoreId=vs-1&replace=true',
          expect.any(Object),
        );
      });
    });

    describe('deleteDocument', () => {
      it('should DELETE document by fileId', async () => {
        const deps = createDeps();
        (deps.fetchJson as jest.Mock).mockResolvedValue({ success: true });

        const result = await deleteDocument(deps, 'file-123');

        expect(deps.fetchJson).toHaveBeenCalledWith(
          '/admin/documents/file-123',
          { method: 'DELETE' },
        );
        expect(result).toEqual({ success: true });
      });

      it('should include vectorStoreId in query when provided', async () => {
        const deps = createDeps();
        (deps.fetchJson as jest.Mock).mockResolvedValue({ success: true });

        await deleteDocument(deps, 'file-123', 'vs-1');

        expect(deps.fetchJson).toHaveBeenCalledWith(
          '/admin/documents/file-123?vectorStoreId=vs-1',
          { method: 'DELETE' },
        );
      });
    });

    describe('listDocumentsForStore', () => {
      it('should fetch documents for vector store', async () => {
        const deps = createDeps();
        const mockDocs = [{ id: 'f1', fileName: 'a.md' }];
        (deps.fetchJson as jest.Mock).mockResolvedValue({
          documents: mockDocs,
        });

        const result = await listDocumentsForStore(deps, 'vs-1');

        expect(deps.fetchJson).toHaveBeenCalledWith(
          '/documents?vectorStoreId=vs-1',
        );
        expect(result).toEqual(mockDocs);
      });
    });
  });

  describe('RAG', () => {
    describe('testRagQuery', () => {
      it('should POST query and return results', async () => {
        const deps = createDeps();
        const mockResult = {
          chunks: [{ text: 'match', score: 0.9 }],
          query: 'test',
        };
        (deps.fetchJson as jest.Mock).mockResolvedValue(mockResult);

        const result = await testRagQuery(deps, 'test query', 5);

        expect(deps.fetchJson).toHaveBeenCalledWith(
          '/admin/rag-test',
          expect.objectContaining({
            body: JSON.stringify({
              query: 'test query',
              maxResults: 5,
              vectorStoreId: undefined,
              vectorStoreIds: undefined,
            }),
          }),
        );
        expect(result).toEqual(mockResult);
      });

      it('should pass vectorStoreId and vectorStoreIds', async () => {
        const deps = createDeps();
        (deps.fetchJson as jest.Mock).mockResolvedValue({});

        await testRagQuery(deps, 'q', 3, 'vs-1', ['vs-1', 'vs-2']);

        expect(deps.fetchJson).toHaveBeenCalledWith(
          '/admin/rag-test',
          expect.objectContaining({
            body: JSON.stringify({
              query: 'q',
              maxResults: 3,
              vectorStoreId: 'vs-1',
              vectorStoreIds: ['vs-1', 'vs-2'],
            }),
          }),
        );
      });
    });
  });

  describe('Vector Store Config', () => {
    describe('getVectorStoreConfig', () => {
      it('should fetch config', async () => {
        const deps = createDeps();
        const mockConfig = { config: {}, source: 'yaml' as const };
        (deps.fetchJson as jest.Mock).mockResolvedValue(mockConfig);

        const result = await getVectorStoreConfig(deps);

        expect(deps.fetchJson).toHaveBeenCalledWith(
          '/admin/vector-store-config',
        );
        expect(result).toEqual(mockConfig);
      });
    });

    describe('saveVectorStoreConfig', () => {
      it('should PUT overrides', async () => {
        const deps = createDeps();
        (deps.fetchJson as jest.Mock).mockResolvedValue(undefined);

        await saveVectorStoreConfig(deps, { vectorStoreName: 'test-store' });

        expect(deps.fetchJson).toHaveBeenCalledWith(
          '/admin/config/vectorStoreConfig',
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify({ value: { vectorStoreName: 'test-store' } }),
          }),
        );
      });
    });

    describe('resetVectorStoreConfig', () => {
      it('should DELETE config', async () => {
        const deps = createDeps();
        (deps.fetchJson as jest.Mock).mockResolvedValue({ deleted: true });

        const result = await resetVectorStoreConfig(deps);

        expect(deps.fetchJson).toHaveBeenCalledWith(
          '/admin/config/vectorStoreConfig',
          { method: 'DELETE' },
        );
        expect(result).toEqual({ deleted: true });
      });
    });

    describe('createVectorStore', () => {
      it('should create vector store', async () => {
        const deps = createDeps();
        const mockResult = { vectorStoreId: 'vs-new' };
        (deps.fetchJson as jest.Mock).mockResolvedValue(mockResult);

        const result = await createVectorStore(deps, {
          vectorStoreName: 'test-store',
          embeddingModel: 'test-model',
        });

        expect(deps.fetchJson).toHaveBeenCalledWith(
          '/admin/vector-store/create',
          expect.objectContaining({
            body: JSON.stringify({
              vectorStoreName: 'test-store',
              embeddingModel: 'test-model',
            }),
          }),
        );
        expect(result).toEqual(mockResult);
      });
    });

    describe('getVectorStoreStatus', () => {
      it('should fetch status', async () => {
        const deps = createDeps();
        const mockStatus = { connected: true };
        (deps.fetchJson as jest.Mock).mockResolvedValue(mockStatus);

        const result = await getVectorStoreStatus(deps);

        expect(deps.fetchJson).toHaveBeenCalledWith(
          '/admin/vector-store/status',
        );
        expect(result).toEqual(mockStatus);
      });
    });
  });

  describe('Multi-Vector-Store Management', () => {
    describe('listActiveVectorStores', () => {
      it('should list stores', async () => {
        const deps = createDeps();
        const mockStores = [{ id: 'vs-1', active: true }];
        (deps.fetchJson as jest.Mock).mockResolvedValue({ stores: mockStores });

        const result = await listActiveVectorStores(deps);

        expect(deps.fetchJson).toHaveBeenCalledWith('/admin/vector-stores');
        expect(result.stores).toEqual(mockStores);
      });
    });

    describe('connectVectorStore', () => {
      it('should connect store', async () => {
        const deps = createDeps();
        (deps.fetchJson as jest.Mock).mockResolvedValue({
          activeVectorStoreIds: ['vs-1'],
        });

        const result = await connectVectorStore(deps, 'vs-1');

        expect(deps.fetchJson).toHaveBeenCalledWith(
          '/admin/vector-stores/connect',
          expect.objectContaining({
            body: JSON.stringify({ vectorStoreId: 'vs-1' }),
          }),
        );
        expect(result.activeVectorStoreIds).toEqual(['vs-1']);
      });
    });

    describe('removeVectorStore', () => {
      it('should remove store', async () => {
        const deps = createDeps();
        (deps.fetchJson as jest.Mock).mockResolvedValue({
          removed: 'vs-1',
          permanent: false,
          filesDeleted: 0,
          activeVectorStoreIds: [],
        });

        const result = await removeVectorStore(deps, 'vs-1');

        expect(deps.fetchJson).toHaveBeenCalledWith(
          '/admin/vector-stores/vs-1',
          { method: 'DELETE' },
        );
        expect(result.removed).toBe('vs-1');
      });

      it('should pass permanent=true in query', async () => {
        const deps = createDeps();
        (deps.fetchJson as jest.Mock).mockResolvedValue({});

        await removeVectorStore(deps, 'vs-1', true);

        expect(deps.fetchJson).toHaveBeenCalledWith(
          '/admin/vector-stores/vs-1?permanent=true',
          { method: 'DELETE' },
        );
      });
    });
  });
});
