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
import { fetchAllVectorStoreFiles, listDocuments } from './DocumentLister';
import type { DocumentListerDeps } from './DocumentLister';
import type { LlamaStackClient } from './LlamaStackClient';
import type { LlamaStackConfig } from '../../types';
import { createMockLogger } from '../../test-utils/mocks';

function createMockClient(): jest.Mocked<Pick<LlamaStackClient, 'request'>> {
  return {
    request: jest.fn(),
  };
}

function createDeps(
  overrides?: Partial<DocumentListerDeps>,
): DocumentListerDeps & { client: jest.Mocked<LlamaStackClient> } {
  const client = createMockClient();
  const config: LlamaStackConfig = {
    baseUrl: 'https://llama.example.com',
    vectorStoreIds: ['vs_123'],
    vectorStoreName: 'test-store',
    embeddingModel: 'test-emb',
    embeddingDimension: 384,
    model: 'test-model',
    chunkingStrategy: 'auto',
    maxChunkSizeTokens: 512,
    chunkOverlapTokens: 50,
  };
  return {
    client: client as unknown as jest.Mocked<LlamaStackClient>,
    config,
    logger: createMockLogger(),
    ...overrides,
  } as unknown as DocumentListerDeps & {
    client: jest.Mocked<LlamaStackClient>;
  };
}

describe('DocumentLister', () => {
  describe('fetchAllVectorStoreFiles', () => {
    it('fetches files when response is object with data array', async () => {
      const deps = createDeps();
      deps.client.request.mockResolvedValue({
        data: [
          {
            id: 'file_1',
            object: 'vector_store.file',
            status: 'completed',
            created_at: 1234567890,
            usage_bytes: 100,
            vector_store_id: 'vs_123',
          },
        ],
        has_more: false,
      });

      const result = await fetchAllVectorStoreFiles(deps);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('file_1');
      expect(result[0].status).toBe('completed');
      expect(deps.client.request).toHaveBeenCalledWith(
        '/v1/openai/v1/vector_stores/vs_123/files?limit=100',
        { method: 'GET' },
      );
    });

    it('uses custom vectorStoreId when provided', async () => {
      const deps = createDeps();
      deps.client.request.mockResolvedValue({ data: [], has_more: false });

      await fetchAllVectorStoreFiles(deps, 'vs_custom');

      expect(deps.client.request).toHaveBeenCalledWith(
        '/v1/openai/v1/vector_stores/vs_custom/files?limit=100',
        { method: 'GET' },
      );
    });

    it('throws InputError when no vector store configured', async () => {
      const deps = createDeps({
        config: {
          baseUrl: 'https://x.com',
          vectorStoreIds: [],
          vectorStoreName: 'x',
          embeddingModel: 'emb',
          embeddingDimension: 384,
          model: 'm',
          chunkingStrategy: 'auto',
          maxChunkSizeTokens: 512,
          chunkOverlapTokens: 50,
        } as LlamaStackConfig,
      });

      await expect(fetchAllVectorStoreFiles(deps)).rejects.toThrow(
        'No vector store configured',
      );
    });

    it('paginates when has_more is true', async () => {
      const deps = createDeps();
      deps.client.request
        .mockResolvedValueOnce({
          data: [
            {
              id: 'file_1',
              object: 'vector_store.file',
              status: 'completed',
              created_at: 0,
              usage_bytes: 10,
              vector_store_id: 'vs_123',
            },
          ],
          has_more: true,
        })
        .mockResolvedValueOnce({
          data: [
            {
              id: 'file_2',
              object: 'vector_store.file',
              status: 'completed',
              created_at: 0,
              usage_bytes: 10,
              vector_store_id: 'vs_123',
            },
          ],
          has_more: false,
        });

      const result = await fetchAllVectorStoreFiles(deps);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('file_1');
      expect(result[1].id).toBe('file_2');

      expect(deps.client.request).toHaveBeenCalledTimes(2);
      expect(deps.client.request).toHaveBeenNthCalledWith(
        1,
        '/v1/openai/v1/vector_stores/vs_123/files?limit=100',
        { method: 'GET' },
      );
      expect(deps.client.request).toHaveBeenNthCalledWith(
        2,
        '/v1/openai/v1/vector_stores/vs_123/files?limit=100&after=file_1',
        { method: 'GET' },
      );
    });

    it('handles array response format', async () => {
      const deps = createDeps();
      deps.client.request.mockResolvedValue([
        {
          id: 'f1',
          object: 'vector_store.file',
          status: 'completed',
          created_at: 0,
          usage_bytes: 10,
          vector_store_id: 'vs_123',
        },
      ]);

      const result = await fetchAllVectorStoreFiles(deps);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('f1');
    });
  });

  describe('listDocuments', () => {
    it('returns documents from vector store files endpoint', async () => {
      const deps = createDeps();
      deps.client.request
        .mockResolvedValueOnce({
          data: [
            {
              id: 'vsfile_1',
              object: 'vector_store.file',
              status: 'completed',
              created_at: 0,
              usage_bytes: 50,
              vector_store_id: 'vs_123',
            },
          ],
          has_more: false,
        })
        .mockResolvedValueOnce({
          id: 'vsfile_1',
          object: 'file',
          bytes: 50,
          created_at: 0,
          filename: 'doc.md',
          purpose: 'assistants',
        });

      const result = await listDocuments(deps);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'vsfile_1',
        fileName: 'doc.md',
        fileSize: 50,
        status: 'completed',
      });
      expect(result[0].format).toBeDefined();
      expect(result[0].uploadedAt).toBeDefined();

      expect(deps.client.request).toHaveBeenCalledWith(
        '/v1/openai/v1/files/vsfile_1',
        { method: 'GET' },
      );
    });

    it('logs and uses basic info when file details request fails', async () => {
      const deps = createDeps();
      deps.client.request
        .mockResolvedValueOnce({
          data: [
            {
              id: 'vsfile_1',
              object: 'vector_store.file',
              status: 'completed',
              created_at: 0,
              usage_bytes: 50,
              vector_store_id: 'vs_123',
            },
          ],
          has_more: false,
        })
        .mockRejectedValueOnce(new Error('File not found'));

      const result = await listDocuments(deps);

      expect(deps.logger.debug).toHaveBeenCalledWith(
        'Could not get details for file vsfile_1, using basic info',
      );
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('falls back to Files API when vector store endpoint fails', async () => {
      const deps = createDeps();
      deps.client.request
        .mockRejectedValueOnce(new Error('Vector store unavailable'))
        .mockResolvedValueOnce({
          data: [
            {
              id: 'file_1',
              object: 'file',
              bytes: 100,
              created_at: 1234567890,
              filename: 'fallback.txt',
              purpose: 'assistants',
            },
          ],
        });

      const result = await listDocuments(deps);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('file_1');
      expect(result[0].fileName).toBe('fallback.txt');
      expect(result[0].status).toBe('completed');
      expect(deps.logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Vector store files endpoint not available'),
      );
    });

    it('filters Files API fallback to purpose=assistants only', async () => {
      const deps = createDeps();
      deps.client.request
        .mockRejectedValueOnce(new Error('VS unavailable'))
        .mockResolvedValueOnce({
          data: [
            {
              id: 'f1',
              object: 'file',
              bytes: 10,
              created_at: 0,
              filename: 'assistants.txt',
              purpose: 'assistants',
            },
            {
              id: 'f2',
              object: 'file',
              bytes: 10,
              created_at: 0,
              filename: 'other.txt',
              purpose: 'fine-tune',
            },
          ],
        });

      const result = await listDocuments(deps);

      expect(result).toHaveLength(1);
      expect(result[0].fileName).toBe('assistants.txt');
    });

    it('returns empty array when both endpoints fail', async () => {
      const deps = createDeps();
      deps.client.request
        .mockRejectedValueOnce(new Error('Vector store failed'))
        .mockRejectedValueOnce(new Error('Files API failed'));

      const result = await listDocuments(deps);

      expect(result).toEqual([]);
      expect(deps.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Could not list documents'),
      );
    });

    it('deduplicates files in Files API fallback', async () => {
      const deps = createDeps();
      deps.client.request
        .mockRejectedValueOnce(new Error('VS failed'))
        .mockResolvedValueOnce({
          data: [
            {
              id: 'dup',
              object: 'file',
              bytes: 10,
              created_at: 0,
              filename: 'a.txt',
              purpose: 'assistants',
            },
            {
              id: 'dup',
              object: 'file',
              bytes: 10,
              created_at: 0,
              filename: 'a.txt',
              purpose: 'assistants',
            },
          ],
        });

      const result = await listDocuments(deps);

      expect(result).toHaveLength(1);
    });

    it('processes files in batches of 10 for detail fetching', async () => {
      const deps = createDeps();
      const vsFiles = Array.from({ length: 15 }, (_, i) => ({
        id: `vsfile_${i}`,
        object: 'vector_store.file',
        status: 'completed' as const,
        created_at: 0,
        usage_bytes: 10,
        vector_store_id: 'vs_123',
      }));
      deps.client.request.mockResolvedValueOnce({
        data: vsFiles,
        has_more: false,
      });

      for (let i = 0; i < 15; i++) {
        deps.client.request.mockResolvedValueOnce({
          id: `vsfile_${i}`,
          object: 'file',
          bytes: 10,
          created_at: 0,
          filename: `f${i}.txt`,
          purpose: 'assistants',
        });
      }

      const result = await listDocuments(deps);

      expect(result).toHaveLength(15);
      expect(deps.client.request).toHaveBeenCalledTimes(16);
    });
  });
});
