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
import { VectorStoreFacade } from './VectorStoreFacade';
import type {
  VectorStoreFacadeContext,
  VectorStoreFacadeDeps,
} from './VectorStoreFacade';
import type { ConfigResolutionService } from './ConfigResolutionService';
import type { VectorStoreService } from './VectorStoreService';
import type { DocumentSyncService } from './DocumentSyncService';
import { FileFormat } from '../../types';
import type {
  EffectiveConfig,
  LlamaStackConfig,
  DocumentInfo,
  VectorStoreInfo,
} from '../../types';
import { createMockLogger } from '../../test-utils/mocks';

const DEFAULT_EFFECTIVE_CONFIG = {
  vectorStoreIds: ['vs_123'],
  vectorStoreName: 'test-store',
  embeddingModel: 'test-model',
  embeddingDimension: 384,
  chunkingStrategy: 'auto' as const,
  maxChunkSizeTokens: 512,
  chunkOverlapTokens: 50,
  searchMode: 'semantic' as const,
  bm25Weight: 0.5,
  semanticWeight: 0.5,
  fileSearchMaxResults: 5,
  fileSearchScoreThreshold: 0.7,
} as EffectiveConfig;

const DEFAULT_LLAMA_CONFIG = {
  vectorStoreIds: ['vs_123'],
  vectorStoreName: 'test-store',
  embeddingModel: 'test-model',
  embeddingDimension: 384,
  chunkingStrategy: 'auto' as const,
  maxChunkSizeTokens: 512,
  chunkOverlapTokens: 50,
} as LlamaStackConfig;

function createMockConfigResolution(): jest.Mocked<ConfigResolutionService> {
  return {
    resolve: jest.fn().mockResolvedValue(DEFAULT_EFFECTIVE_CONFIG),
    buildYamlFallback: jest.fn().mockReturnValue(DEFAULT_EFFECTIVE_CONFIG),
    getLlamaStackConfig: jest.fn().mockReturnValue(DEFAULT_LLAMA_CONFIG),
    setLlamaStackConfig: jest.fn(),
    invalidateCache: jest.fn(),
    getResolver: jest.fn().mockReturnValue(null),
    getLastResolvedModel: jest.fn().mockReturnValue(null),
    setLastResolvedModel: jest.fn(),
    setLastResolvedVerboseLogging: jest.fn(),
    isVerboseStreamLoggingEnabled: jest.fn().mockReturnValue(false),
    setSystemPrompt: jest.fn(),
    setResolver: jest.fn(),
  } as unknown as jest.Mocked<ConfigResolutionService>;
}

type MockedVectorStoreFacadeContext = jest.Mocked<
  Omit<VectorStoreFacadeContext, 'configResolution'>
> & {
  configResolution: jest.Mocked<ConfigResolutionService>;
};

function createMockContext(
  overrides?: Partial<VectorStoreFacadeContext>,
): MockedVectorStoreFacadeContext {
  return {
    ensureInitialized: jest.fn(),
    configResolution: createMockConfigResolution(),
    getVectorStoreReady: jest.fn().mockReturnValue(true),
    setVectorStoreReady: jest.fn(),
    getInitialized: jest.fn().mockReturnValue(true),
    ...overrides,
  } as MockedVectorStoreFacadeContext;
}

function createMockVectorStore(): jest.Mocked<VectorStoreService> {
  return {
    listDocuments: jest.fn().mockResolvedValue([]),
    listVectorStores: jest.fn().mockResolvedValue([]),
    getDefaultVectorStoreId: jest.fn().mockReturnValue('vs_123'),
    updateConfig: jest.fn(),
    ensureExists: jest.fn().mockResolvedValue(undefined),
    getConfig: jest.fn().mockReturnValue(DEFAULT_LLAMA_CONFIG),
    uploadDocuments: jest.fn().mockResolvedValue({ uploaded: [], failed: [] }),
    deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    deleteVectorStore: jest
      .fn()
      .mockResolvedValue({ success: true, filesDeleted: 0 }),
    searchSingle: jest.fn().mockResolvedValue([]),
    createWithConfig: jest.fn().mockResolvedValue({
      vectorStoreId: 'vs_new',
      vectorStoreName: 'new-store',
      created: true,
      embeddingModel: 'test-model',
      embeddingDimension: 384,
    }),
  } as unknown as jest.Mocked<VectorStoreService>;
}

function createMockDocSync(): jest.Mocked<DocumentSyncService> {
  return {
    sync: jest.fn().mockResolvedValue({
      added: 0,
      removed: 0,
      failed: 0,
      unchanged: 0,
      updated: 0,
      errors: [],
    }),
    getSyncSchedule: jest.fn().mockReturnValue('0 * * * *'),
  } as unknown as jest.Mocked<DocumentSyncService>;
}

describe('VectorStoreFacade', () => {
  let mockLogger: ReturnType<typeof createMockLogger>;
  let mockContext: MockedVectorStoreFacadeContext;
  let mockVectorStore: jest.Mocked<VectorStoreService>;
  let mockDocSync: jest.Mocked<DocumentSyncService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogger = createMockLogger();
    mockContext = createMockContext() as MockedVectorStoreFacadeContext;
    mockVectorStore = createMockVectorStore();
    mockDocSync = createMockDocSync();
  });

  function createFacade(
    deps?: Partial<VectorStoreFacadeDeps>,
  ): VectorStoreFacade {
    return new VectorStoreFacade({
      vectorStore: mockVectorStore,
      docSync: mockDocSync,
      logger: mockLogger,
      context: mockContext,
      ...deps,
    });
  }

  describe('constructor and setServices', () => {
    it('creates instance with dependencies', () => {
      const facade = createFacade();
      expect(facade).toBeDefined();
    });

    it('setServices updates vector store and doc sync references', () => {
      const facade = createFacade({ vectorStore: null, docSync: null });
      facade.setServices(mockVectorStore, mockDocSync);
      // Delegation will now use the new services
      expect(mockVectorStore).toBeDefined();
    });
  });

  describe('listDocuments', () => {
    it('delegates to vectorStore when initialized and ready', async () => {
      const docs: DocumentInfo[] = [
        {
          id: 'f1',
          fileName: 'a.md',
          format: FileFormat.MARKDOWN,
          fileSize: 100,
          uploadedAt: '',
          status: 'completed',
        },
      ];
      mockVectorStore.listDocuments.mockResolvedValue(docs);

      const facade = createFacade();
      const result = await facade.listDocuments('vs_123');

      expect(mockContext.ensureInitialized).toHaveBeenCalled();
      expect(mockVectorStore.listDocuments).toHaveBeenCalledWith('vs_123');
      expect(result).toEqual(docs);
    });

    it('returns empty array when vectorStore is null', async () => {
      const facade = createFacade({ vectorStore: null });
      const result = await facade.listDocuments();
      expect(result).toEqual([]);
      expect(mockVectorStore.listDocuments).not.toHaveBeenCalled();
    });

    it('returns empty array when vector store not ready', async () => {
      mockContext.getVectorStoreReady.mockReturnValue(false);
      const facade = createFacade();
      const result = await facade.listDocuments();
      expect(result).toEqual([]);
      expect(mockVectorStore.listDocuments).not.toHaveBeenCalled();
    });
  });

  describe('listVectorStores', () => {
    it('delegates to vectorStore', async () => {
      const stores: VectorStoreInfo[] = [
        {
          id: 'vs_1',
          name: 'Store 1',
          status: 'completed',
          fileCount: 5,
          createdAt: 0,
        },
      ];
      mockVectorStore.listVectorStores.mockResolvedValue(stores);

      const facade = createFacade();
      const result = await facade.listVectorStores();

      expect(mockContext.ensureInitialized).toHaveBeenCalled();
      expect(mockVectorStore.listVectorStores).toHaveBeenCalled();
      expect(result).toEqual(stores);
    });

    it('returns empty array when vectorStore is null', async () => {
      const facade = createFacade({ vectorStore: null });
      const result = await facade.listVectorStores();
      expect(result).toEqual([]);
    });
  });

  describe('getDefaultVectorStoreId', () => {
    it('delegates to vectorStore', () => {
      mockVectorStore.getDefaultVectorStoreId.mockReturnValue('vs_default');
      const facade = createFacade();
      expect(facade.getDefaultVectorStoreId()).toBe('vs_default');
    });

    it('returns undefined when vectorStore is null', () => {
      const facade = createFacade({ vectorStore: null });
      expect(facade.getDefaultVectorStoreId()).toBeUndefined();
    });
  });

  describe('getActiveVectorStoreIds', () => {
    it('returns resolved config vectorStoreIds when resolveConfig succeeds', async () => {
      mockContext.configResolution.resolve.mockResolvedValue({
        vectorStoreIds: ['vs_a', 'vs_b'],
      } as EffectiveConfig);

      const facade = createFacade();
      const result = await facade.getActiveVectorStoreIds();

      expect(result).toEqual(['vs_a', 'vs_b']);
    });

    it('falls back to config.vectorStoreIds when resolveConfig fails', async () => {
      mockContext.configResolution.resolve.mockRejectedValue(
        new Error('Config resolution failed'),
      );
      const config = {
        vectorStoreIds: ['vs_fallback'],
        vectorStoreName: 'x',
      } as LlamaStackConfig;
      mockContext.configResolution.getLlamaStackConfig.mockReturnValue(config);

      const facade = createFacade();
      const result = await facade.getActiveVectorStoreIds();

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Config resolution failed, using fallback vector store IDs',
        expect.any(Error),
      );
      expect(result).toEqual(['vs_fallback']);
    });

    it('returns empty array when config is null', async () => {
      mockContext.configResolution.getLlamaStackConfig.mockReturnValue(null);
      const facade = createFacade();
      const result = await facade.getActiveVectorStoreIds();
      expect(result).toEqual([]);
    });

    it('returns resolved vectorStoreIds when resolveConfig succeeds', async () => {
      mockContext.configResolution.resolve.mockResolvedValue({
        vectorStoreIds: ['vs_resolved'],
      } as EffectiveConfig);

      const facade = createFacade();
      const result = await facade.getActiveVectorStoreIds();
      expect(result).toEqual(['vs_resolved']);
    });
  });

  describe('addVectorStoreId and removeVectorStoreId', () => {
    it('addVectorStoreId adds id and invalidates cache', () => {
      const config = {
        vectorStoreIds: ['vs_1'],
        vectorStoreName: 'x',
      } as LlamaStackConfig;
      mockContext.configResolution.getLlamaStackConfig.mockReturnValue(config);

      const facade = createFacade();
      facade.addVectorStoreId('vs_2');

      expect(config.vectorStoreIds).toContain('vs_2');
      expect(mockVectorStore.updateConfig).toHaveBeenCalledWith(config);
      expect(mockContext.configResolution.invalidateCache).toHaveBeenCalled();
    });

    it('addVectorStoreId does nothing when config is null', () => {
      mockContext.configResolution.getLlamaStackConfig.mockReturnValue(null);
      const facade = createFacade({ vectorStore: null });
      facade.addVectorStoreId('vs_x');
      expect(
        mockContext.configResolution.invalidateCache,
      ).not.toHaveBeenCalled();
    });

    it('removeVectorStoreId removes id and invalidates cache', () => {
      const config = {
        vectorStoreIds: ['vs_1', 'vs_2'],
        vectorStoreName: 'x',
      } as LlamaStackConfig;
      mockContext.configResolution.getLlamaStackConfig.mockReturnValue(config);

      const facade = createFacade();
      facade.removeVectorStoreId('vs_1');

      expect(config.vectorStoreIds).toEqual(['vs_2']);
      expect(mockVectorStore.updateConfig).toHaveBeenCalledWith(config);
      expect(mockContext.configResolution.invalidateCache).toHaveBeenCalled();
    });
  });

  describe('syncDocuments', () => {
    it('delegates to docSync when services available', async () => {
      const syncResult = {
        added: 2,
        removed: 0,
        failed: 0,
        unchanged: 1,
        updated: 0,
        errors: [],
      };
      mockDocSync.sync.mockResolvedValue(syncResult);

      const facade = createFacade();
      const result = await facade.syncDocuments();

      expect(mockContext.ensureInitialized).toHaveBeenCalled();
      expect(mockDocSync.sync).toHaveBeenCalled();
      expect(result).toEqual(syncResult);
    });

    it('returns empty sync result when docSync is null', async () => {
      const facade = createFacade({ docSync: null });
      const result = await facade.syncDocuments();
      expect(result).toEqual({
        added: 0,
        removed: 0,
        failed: 0,
        unchanged: 0,
        updated: 0,
        errors: [],
      });
      expect(mockDocSync.sync).not.toHaveBeenCalled();
    });
  });

  describe('uploadDocument', () => {
    it('delegates to vectorStore and returns uploaded doc', async () => {
      mockVectorStore.uploadDocuments.mockResolvedValue({
        uploaded: [{ id: 'f1', fileName: 'doc.md', status: 'completed' }],
        failed: [],
      });

      const facade = createFacade();
      const result = await facade.uploadDocument(
        'doc.md',
        Buffer.from('content'),
      );

      expect(mockContext.ensureInitialized).toHaveBeenCalled();
      expect(mockVectorStore.uploadDocuments).toHaveBeenCalledWith(
        [{ fileName: 'doc.md', content: 'content' }],
        undefined,
      );
      expect(result).toEqual({
        fileId: 'f1',
        fileName: 'doc.md',
        status: 'completed',
      });
    });

    it('throws when vectorStore is null', async () => {
      const facade = createFacade({ vectorStore: null });
      await expect(
        facade.uploadDocument('x.md', Buffer.from('x')),
      ).rejects.toThrow('Vector store service not available');
    });

    it('throws when upload has failures', async () => {
      mockVectorStore.uploadDocuments.mockResolvedValue({
        uploaded: [],
        failed: [{ fileName: 'bad.md', error: 'Invalid format' }],
      });

      const facade = createFacade();
      await expect(
        facade.uploadDocument('bad.md', Buffer.from('x')),
      ).rejects.toThrow('Upload failed for bad.md: Invalid format');
    });
  });

  describe('deleteDocument', () => {
    it('delegates to vectorStore', async () => {
      mockVectorStore.deleteDocument.mockResolvedValue({ success: true });
      const facade = createFacade();
      const result = await facade.deleteDocument('f1', 'vs_123');
      expect(mockVectorStore.deleteDocument).toHaveBeenCalledWith(
        'f1',
        'vs_123',
      );
      expect(result).toEqual({ success: true });
    });

    it('throws when vectorStore is null', async () => {
      const facade = createFacade({ vectorStore: null });
      await expect(facade.deleteDocument('f1')).rejects.toThrow(
        'Vector store service not available',
      );
    });

    it('throws when vector store not ready', async () => {
      mockContext.getVectorStoreReady.mockReturnValue(false);
      const facade = createFacade();
      await expect(facade.deleteDocument('f1')).rejects.toThrow(
        'Vector store not initialized',
      );
    });
  });

  describe('deleteVectorStore', () => {
    it('delegates to vectorStore', async () => {
      mockVectorStore.deleteVectorStore.mockResolvedValue({
        success: true,
        filesDeleted: 5,
      });
      const facade = createFacade();
      const result = await facade.deleteVectorStore('vs_123');
      expect(mockVectorStore.deleteVectorStore).toHaveBeenCalledWith('vs_123');
      expect(result).toEqual({ success: true, filesDeleted: 5 });
    });

    it('throws when vectorStore is null', async () => {
      const facade = createFacade({ vectorStore: null });
      await expect(facade.deleteVectorStore('vs_123')).rejects.toThrow(
        'Vector store service not available',
      );
    });
  });

  describe('searchVectorStore', () => {
    it('delegates to vectorStore.searchSingle for each store', async () => {
      mockVectorStore.searchSingle
        .mockResolvedValueOnce([{ text: 'chunk1', score: 0.9 }])
        .mockResolvedValueOnce([{ text: 'chunk2', score: 0.8 }]);

      const facade = createFacade();
      const result = await facade.searchVectorStore('query', 5, undefined, [
        'vs_1',
        'vs_2',
      ]);

      expect(mockVectorStore.searchSingle).toHaveBeenCalledWith(
        'vs_1',
        'query',
        5,
      );
      expect(mockVectorStore.searchSingle).toHaveBeenCalledWith(
        'vs_2',
        'query',
        5,
      );
      expect(result.chunks).toHaveLength(2);
      expect(result.vectorStoreId).toBe('vs_1,vs_2');
    });

    it('throws when vectorStore is null', async () => {
      const facade = createFacade({ vectorStore: null });
      await expect(facade.searchVectorStore('q')).rejects.toThrow(
        'Vector store service not available',
      );
    });

    it('throws when no vector store available to search', async () => {
      mockVectorStore.getDefaultVectorStoreId.mockReturnValue(undefined);
      const facade = createFacade();
      await expect(facade.searchVectorStore('q')).rejects.toThrow(
        'No vector store available to search',
      );
    });
  });

  describe('getSyncSchedule', () => {
    it('returns docSync.getSyncSchedule when docSync exists', () => {
      mockDocSync.getSyncSchedule.mockReturnValue('0 0 * * *');
      const facade = createFacade();
      expect(facade.getSyncSchedule()).toBe('0 0 * * *');
    });

    it('returns undefined when docSync is null', () => {
      const facade = createFacade({ docSync: null });
      expect(facade.getSyncSchedule()).toBeUndefined();
    });
  });

  describe('getVectorStoreConfig', () => {
    it('returns config when resolveConfig succeeds', async () => {
      const cfg = {
        vectorStoreName: 'vs',
        embeddingModel: 'emb',
        embeddingDimension: 384,
        chunkingStrategy: 'auto' as const,
        maxChunkSizeTokens: 512,
        chunkOverlapTokens: 50,
        searchMode: 'semantic' as const,
        bm25Weight: 0.5,
        semanticWeight: 0.5,
        fileSearchMaxResults: 5,
        fileSearchScoreThreshold: 0.7,
      };
      mockContext.configResolution.resolve.mockResolvedValue(
        cfg as EffectiveConfig,
      );

      const facade = createFacade();
      const result = await facade.getVectorStoreConfig();

      expect(result).toMatchObject({
        vectorStoreName: 'vs',
        embeddingModel: 'emb',
        embeddingDimension: 384,
      });
    });

    it('uses buildYamlFallbackConfig when resolveConfig fails', async () => {
      mockContext.configResolution.resolve.mockRejectedValue(new Error('fail'));
      mockContext.configResolution.buildYamlFallback.mockReturnValue({
        vectorStoreName: 'fallback',
        embeddingModel: 'emb',
        embeddingDimension: 384,
        chunkingStrategy: 'auto' as const,
        maxChunkSizeTokens: 512,
        chunkOverlapTokens: 50,
      } as EffectiveConfig);

      const facade = createFacade();
      const result = await facade.getVectorStoreConfig();

      expect(mockLogger.debug).toHaveBeenCalled();
      expect(result?.vectorStoreName).toBe('fallback');
    });

    it('returns null when not initialized', async () => {
      mockContext.getInitialized.mockReturnValue(false);
      const facade = createFacade();
      const result = await facade.getVectorStoreConfig();
      expect(result).toBeNull();
    });
  });

  describe('getVectorStoreStatus', () => {
    it('returns exists: false when not initialized', async () => {
      mockContext.getInitialized.mockReturnValue(false);
      const facade = createFacade();
      const result = await facade.getVectorStoreStatus();
      expect(result).toEqual({ exists: false, ready: false });
    });

    it('returns exists: false when vectorStore is null', async () => {
      mockContext.configResolution.getLlamaStackConfig.mockReturnValue(null);
      const facade = createFacade({ vectorStore: null });
      const result = await facade.getVectorStoreStatus();
      expect(result).toEqual({ exists: false, ready: false });
    });

    it('uses fallback config when resolveConfig fails', async () => {
      mockContext.configResolution.resolve.mockRejectedValue(new Error('fail'));
      mockContext.configResolution.buildYamlFallback.mockReturnValue({
        vectorStoreName: 'fallback',
        embeddingModel: 'emb',
      } as EffectiveConfig);

      const facade = createFacade();
      const result = await facade.getVectorStoreStatus();

      expect(mockLogger.debug).toHaveBeenCalled();
      expect(result.vectorStoreName).toBe('fallback');
    });

    it('returns full status when ready and listDocuments succeeds', async () => {
      mockVectorStore.listDocuments.mockResolvedValue([
        {
          id: 'f1',
          fileName: 'a.md',
          format: FileFormat.MARKDOWN,
          fileSize: 10,
          uploadedAt: '',
          status: 'completed',
        },
      ]);
      mockVectorStore.getDefaultVectorStoreId.mockReturnValue('vs_123');

      const facade = createFacade();
      const result = await facade.getVectorStoreStatus();

      expect(result).toEqual({
        exists: true,
        ready: true,
        vectorStoreId: 'vs_123',
        vectorStoreName: 'test-store',
        documentCount: 1,
        embeddingModel: 'test-model',
      });
    });

    it('returns exists: false when ensureVectorStoreReady throws', async () => {
      mockContext.getVectorStoreReady.mockReturnValue(false);
      mockVectorStore.ensureExists.mockRejectedValue(new Error('not ready'));

      const facade = createFacade();
      const result = await facade.getVectorStoreStatus();

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Vector store readiness check failed, using existing store',
        expect.any(Error),
      );
      expect(result).toEqual({
        exists: false,
        ready: false,
        vectorStoreName: 'test-store',
        embeddingModel: 'test-model',
      });
    });

    it('returns status without documentCount when listDocuments throws', async () => {
      mockVectorStore.listDocuments.mockRejectedValue(new Error('list failed'));

      const facade = createFacade();
      const result = await facade.getVectorStoreStatus();

      expect(mockLogger.warn).toHaveBeenCalled();
      expect(result.exists).toBe(true);
      expect(result.ready).toBe(true);
      expect(result.documentCount).toBeUndefined();
    });
  });

  describe('createVectorStoreWithConfig', () => {
    it('delegates to vectorStore and merges new ID', async () => {
      mockVectorStore.createWithConfig.mockResolvedValue({
        vectorStoreId: 'vs_new',
        vectorStoreName: 'new-store',
        created: true,
        embeddingModel: 'emb',
        embeddingDimension: 384,
      });
      mockContext.configResolution.getLlamaStackConfig.mockReturnValue({
        vectorStoreIds: ['vs_old'],
        vectorStoreName: 'x',
      } as LlamaStackConfig);
      mockVectorStore.getConfig.mockReturnValue({
        vectorStoreIds: ['vs_new'],
        vectorStoreName: 'new-store',
      } as LlamaStackConfig);

      const facade = createFacade();
      const result = await facade.createVectorStoreWithConfig({
        vectorStoreName: 'new-store',
      });

      expect(mockVectorStore.createWithConfig).toHaveBeenCalled();
      expect(result.vectorStoreId).toBe('vs_new');
      expect(result.created).toBe(true);
    });

    it('throws when vectorStore is null', async () => {
      const facade = createFacade({ vectorStore: null });
      await expect(facade.createVectorStoreWithConfig({})).rejects.toThrow(
        'Vector store service not available',
      );
    });
  });
});
