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
import { uploadDocuments } from './DocumentUploader';
import type { DocumentUploaderDeps, UploadFile } from './DocumentUploader';
import type { LlamaStackClient } from './LlamaStackClient';
import type { LlamaStackConfig } from '../../types';
import { createMockLogger } from '../../test-utils/mocks';

function createMockClient(): jest.Mocked<Pick<LlamaStackClient, 'request'>> {
  return {
    request: jest.fn(),
  };
}

function createDeps(
  overrides?: Partial<DocumentUploaderDeps>,
): DocumentUploaderDeps & { client: jest.Mocked<LlamaStackClient> } {
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
  } as unknown as DocumentUploaderDeps & {
    client: jest.Mocked<LlamaStackClient>;
  };
}

describe('DocumentUploader', () => {
  describe('uploadDocuments', () => {
    it('uploads a single document successfully', async () => {
      const deps = createDeps();
      deps.client.request
        .mockResolvedValueOnce({
          id: 'file_abc',
          object: 'file',
          bytes: 100,
          created_at: 1234567890,
          filename: 'doc.md',
          purpose: 'assistants',
        })
        .mockResolvedValueOnce({
          id: 'vsfile_xyz',
          object: 'vector_store.file',
          status: 'completed',
          created_at: 1234567890,
          usage_bytes: 100,
          vector_store_id: 'vs_123',
        });

      const files: UploadFile[] = [{ fileName: 'doc.md', content: '# Hello' }];
      const result = await uploadDocuments(files, deps);

      expect(result.uploaded).toHaveLength(1);
      expect(result.uploaded[0]).toEqual({
        id: 'file_abc',
        fileName: 'doc.md',
        status: 'completed',
      });
      expect(result.failed).toHaveLength(0);

      expect(deps.client.request).toHaveBeenCalledTimes(2);
      expect(deps.client.request).toHaveBeenNthCalledWith(
        1,
        '/v1/openai/v1/files',
        expect.objectContaining({ method: 'POST' }),
      );
      expect(deps.client.request).toHaveBeenNthCalledWith(
        2,
        '/v1/openai/v1/vector_stores/vs_123/files',
        expect.objectContaining({
          method: 'POST',
          body: expect.objectContaining({
            file_id: 'file_abc',
            chunking_strategy: { type: 'auto' },
          }),
        }),
      );
    });

    it('uses custom vectorStoreId when provided', async () => {
      const deps = createDeps();
      deps.client.request
        .mockResolvedValueOnce({
          id: 'file_1',
          object: 'file',
          bytes: 10,
          created_at: 0,
          filename: 'a.txt',
          purpose: 'assistants',
        })
        .mockResolvedValueOnce({
          id: 'vsf_1',
          object: 'vector_store.file',
          status: 'completed',
          created_at: 0,
          usage_bytes: 10,
          vector_store_id: 'vs_custom',
        });

      const result = await uploadDocuments(
        [{ fileName: 'a.txt', content: 'x' }],
        deps,
        'vs_custom',
      );

      expect(result.uploaded).toHaveLength(1);
      expect(deps.client.request).toHaveBeenNthCalledWith(
        2,
        '/v1/openai/v1/vector_stores/vs_custom/files',
        expect.any(Object),
      );
    });

    it('includes attributes in attach request when provided', async () => {
      const deps = createDeps();
      deps.client.request
        .mockResolvedValueOnce({
          id: 'file_1',
          object: 'file',
          bytes: 10,
          created_at: 0,
          filename: 'doc.md',
          purpose: 'assistants',
        })
        .mockResolvedValueOnce({
          id: 'vsf_1',
          object: 'vector_store.file',
          status: 'completed',
          created_at: 0,
          usage_bytes: 10,
          vector_store_id: 'vs_123',
        });

      const files: UploadFile[] = [
        {
          fileName: 'doc.md',
          content: 'content',
          attributes: { title: 'My Doc', source_url: 'https://example.com' },
        },
      ];
      await uploadDocuments(files, deps);

      expect(deps.client.request).toHaveBeenNthCalledWith(
        2,
        '/v1/openai/v1/vector_stores/vs_123/files',
        expect.objectContaining({
          body: expect.objectContaining({
            file_id: 'file_1',
            attributes: { title: 'My Doc', source_url: 'https://example.com' },
          }),
        }),
      );
    });

    it('uses static chunking when config specifies it', async () => {
      const deps = createDeps({
        config: {
          baseUrl: 'https://x.com',
          vectorStoreIds: ['vs_1'],
          vectorStoreName: 'x',
          embeddingModel: 'emb',
          embeddingDimension: 384,
          model: 'm',
          chunkingStrategy: 'static',
          maxChunkSizeTokens: 256,
          chunkOverlapTokens: 25,
        } as LlamaStackConfig,
      });
      deps.client.request
        .mockResolvedValueOnce({
          id: 'f1',
          object: 'file',
          bytes: 10,
          created_at: 0,
          filename: 'a.txt',
          purpose: 'assistants',
        })
        .mockResolvedValueOnce({
          id: 'vsf1',
          object: 'vector_store.file',
          status: 'completed',
          created_at: 0,
          usage_bytes: 10,
          vector_store_id: 'vs_1',
        });

      await uploadDocuments([{ fileName: 'a.txt', content: 'x' }], deps);

      expect(deps.client.request).toHaveBeenNthCalledWith(
        2,
        expect.any(String),
        expect.objectContaining({
          body: expect.objectContaining({
            chunking_strategy: {
              type: 'static',
              static: {
                max_chunk_size_tokens: 256,
                chunk_overlap_tokens: 25,
              },
            },
          }),
        }),
      );
    });

    it('batches multiple files and reports individual failures', async () => {
      const deps = createDeps();
      deps.client.request
        .mockResolvedValueOnce({
          id: 'file_1',
          object: 'file',
          bytes: 10,
          created_at: 0,
          filename: 'ok.txt',
          purpose: 'assistants',
        })
        .mockResolvedValueOnce({
          id: 'vsf_1',
          object: 'vector_store.file',
          status: 'completed',
          created_at: 0,
          usage_bytes: 10,
          vector_store_id: 'vs_123',
        })
        .mockRejectedValueOnce(new Error('Files API error'))
        .mockResolvedValueOnce({
          id: 'file_3',
          object: 'file',
          bytes: 10,
          created_at: 0,
          filename: 'third.txt',
          purpose: 'assistants',
        })
        .mockResolvedValueOnce({
          id: 'vsf_3',
          object: 'vector_store.file',
          status: 'failed',
          created_at: 0,
          usage_bytes: 0,
          vector_store_id: 'vs_123',
          last_error: { code: 'err', message: 'Attachment failed' },
        });

      const files: UploadFile[] = [
        { fileName: 'ok.txt', content: 'a' },
        { fileName: 'fail.txt', content: 'b' },
        { fileName: 'third.txt', content: 'c' },
      ];
      const result = await uploadDocuments(files, deps);

      expect(result.uploaded).toHaveLength(1);
      expect(result.uploaded[0].fileName).toBe('ok.txt');

      expect(result.failed).toHaveLength(2);
      const failedFileNames = result.failed.map(f => f.fileName).sort();
      expect(failedFileNames).toEqual(['fail.txt', 'third.txt']);
      const errors = result.failed.map(f => f.error);
      expect(errors.some(e => e.includes('Files API error'))).toBe(true);
      expect(errors.some(e => e.includes('Attachment failed'))).toBe(true);
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

      await expect(
        uploadDocuments([{ fileName: 'a.txt', content: 'x' }], deps),
      ).rejects.toThrow('No vector store configured');
    });

    it('processes files in batches of 5', async () => {
      const deps = createDeps();
      for (let i = 0; i < 7; i++) {
        deps.client.request
          .mockResolvedValueOnce({
            id: `file_${i}`,
            object: 'file',
            bytes: 10,
            created_at: 0,
            filename: `f${i}.txt`,
            purpose: 'assistants',
          })
          .mockResolvedValueOnce({
            id: `vsf_${i}`,
            object: 'vector_store.file',
            status: 'completed',
            created_at: 0,
            usage_bytes: 10,
            vector_store_id: 'vs_123',
          });
      }

      const files: UploadFile[] = Array.from({ length: 7 }, (_, i) => ({
        fileName: `f${i}.txt`,
        content: `content${i}`,
      }));
      const result = await uploadDocuments(files, deps);

      expect(result.uploaded).toHaveLength(7);
      expect(deps.client.request).toHaveBeenCalledTimes(14);
    });
  });
});
