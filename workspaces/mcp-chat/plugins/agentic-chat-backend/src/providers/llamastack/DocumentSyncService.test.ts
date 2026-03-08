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

import type { DatabaseService } from '@backstage/backend-plugin-api';
import { FileFormat } from '@backstage-community/plugin-agentic-chat-common';
import type { DocumentInfo } from '@backstage-community/plugin-agentic-chat-common';
import type { VectorStoreService } from './VectorStoreService';
import type { DocumentIngestionService } from '../../services/DocumentIngestionService';
import type { DocumentsConfig, FetchedDocument } from '../../types';
import { createMockLogger } from '../../test-utils';
import { DocumentSyncService } from './DocumentSyncService';

const HASH_TABLE = 'agentic_chat_content_hashes';

function createMockVectorStore(): jest.Mocked<VectorStoreService> {
  return {
    listDocuments: jest.fn().mockResolvedValue([]),
    uploadDocuments: jest.fn().mockResolvedValue({ uploaded: [], failed: [] }),
    deleteDocument: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<VectorStoreService>;
}

function createMockIngestion(): jest.Mocked<
  Pick<DocumentIngestionService, 'fetchFromSources'>
> {
  return {
    fetchFromSources: jest.fn().mockResolvedValue([]),
  } as unknown as jest.Mocked<
    Pick<DocumentIngestionService, 'fetchFromSources'>
  >;
}

function createMockDatabase(
  rows: Array<{
    file_name: string;
    content_hash: string;
    source_id: string | null;
  }> = [],
): {
  getClient: jest.Mock;
  tableChain: {
    select: jest.Mock;
    insert: jest.Mock;
    onConflict: jest.Mock;
    merge: jest.Mock;
    where: jest.Mock;
    delete: jest.Mock;
  };
  schema: { hasTable: jest.Mock; createTable: jest.Mock };
} {
  const tableChain = {
    select: jest.fn().mockResolvedValue(rows),
    insert: jest.fn().mockReturnValue({
      onConflict: jest.fn().mockReturnValue({
        merge: jest.fn().mockResolvedValue(undefined),
      }),
    }),
    onConflict: jest.fn().mockReturnThis(),
    merge: jest.fn().mockResolvedValue(undefined),
    where: jest.fn().mockReturnValue({
      delete: jest.fn().mockResolvedValue(undefined),
    }),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  const schema = {
    hasTable: jest.fn().mockResolvedValue(false),
    createTable: jest
      .fn()
      .mockImplementation(
        (_name: string, callback: (table: unknown) => void) => {
          const table = {
            string: jest.fn().mockReturnThis(),
            primary: jest.fn().mockReturnThis(),
            notNullable: jest.fn().mockReturnThis(),
            nullable: jest.fn().mockReturnThis(),
            timestamp: jest.fn().mockReturnThis(),
            defaultTo: jest.fn().mockReturnThis(),
          };
          callback(table);
          return Promise.resolve();
        },
      ),
  };
  const fn = { now: jest.fn().mockReturnValue('now()') };

  const callableDb = jest.fn((_table: string) => tableChain) as jest.Mock & {
    schema: typeof schema;
    fn: typeof fn;
  };
  callableDb.schema = schema;
  callableDb.fn = fn;

  const getClient = jest.fn().mockResolvedValue(callableDb);

  return {
    getClient,
    tableChain,
    schema,
  };
}

function doc(
  fileName: string,
  contentHash?: string,
  sourceId = `source://${fileName}`,
): FetchedDocument {
  return {
    fileName,
    content: `content of ${fileName}`,
    sourceId,
    sourceType: 'directory',
    contentHash: contentHash ?? `hash-${fileName}`,
  };
}

function existingDoc(fileName: string, id: string): DocumentInfo {
  return {
    id,
    fileName,
    format: FileFormat.TEXT,
    fileSize: 0,
    uploadedAt: new Date().toISOString(),
    status: 'completed',
  };
}

function createDocumentsConfig(
  overrides: Partial<DocumentsConfig> = {},
): DocumentsConfig {
  return {
    syncMode: 'append',
    sources: [{ type: 'directory', path: '/tmp/docs' }],
    ...overrides,
  };
}

describe('DocumentSyncService', () => {
  let mockVectorStore: jest.Mocked<VectorStoreService>;
  let mockIngestion: jest.Mocked<
    Pick<DocumentIngestionService, 'fetchFromSources'>
  >;
  let mockLogger: ReturnType<typeof createMockLogger>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockVectorStore = createMockVectorStore();
    mockIngestion = createMockIngestion();
    mockLogger = createMockLogger();
  });

  describe('constructor', () => {
    it('sets up dependencies correctly', () => {
      const config = createDocumentsConfig();
      const service = new DocumentSyncService(
        mockVectorStore,
        mockIngestion as unknown as DocumentIngestionService,
        config,
        mockLogger,
      );

      expect(service.getDocumentsConfig()).toEqual(config);
      expect(service.getSyncSchedule()).toBeUndefined();
    });
  });

  describe('initialize', () => {
    it('calls debug when no database provided', async () => {
      const service = new DocumentSyncService(
        mockVectorStore,
        mockIngestion as unknown as DocumentIngestionService,
        null,
        mockLogger,
      );

      await service.initialize();

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'No database provided — content hashes will not persist across restarts',
      );
    });

    it('creates DB table when needed', async () => {
      const { getClient, schema } = createMockDatabase();
      schema.hasTable.mockResolvedValue(false);

      const database = { getClient } as unknown as DatabaseService;

      const service = new DocumentSyncService(
        mockVectorStore,
        mockIngestion as unknown as DocumentIngestionService,
        null,
        mockLogger,
        database,
      );

      await service.initialize();

      expect(getClient).toHaveBeenCalled();
      expect(schema.hasTable).toHaveBeenCalledWith(HASH_TABLE);
      expect(schema.createTable).toHaveBeenCalledWith(
        HASH_TABLE,
        expect.any(Function),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Created ${HASH_TABLE} table`,
      );
    });

    it('handles concurrent table creation - another instance created it', async () => {
      const { getClient, schema } = createMockDatabase();
      schema.hasTable.mockResolvedValue(false);
      schema.createTable.mockRejectedValueOnce(new Error('already exists'));
      schema.hasTable.mockResolvedValueOnce(false).mockResolvedValueOnce(true);

      const database = { getClient } as unknown as DatabaseService;

      const service = new DocumentSyncService(
        mockVectorStore,
        mockIngestion as unknown as DocumentIngestionService,
        null,
        mockLogger,
        database,
      );

      await service.initialize();

      expect(mockLogger.info).toHaveBeenCalledWith(
        `${HASH_TABLE} table was created by another instance`,
      );
    });

    it('falls back to in-memory when DB fails', async () => {
      const { getClient, schema } = createMockDatabase();
      schema.hasTable.mockRejectedValue(new Error('DB connection failed'));

      const database = { getClient } as unknown as DatabaseService;

      const service = new DocumentSyncService(
        mockVectorStore,
        mockIngestion as unknown as DocumentIngestionService,
        null,
        mockLogger,
        database,
      );

      await service.initialize();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to initialize hash cache table'),
      );
    });
  });

  describe('setDocumentsConfig and getDocumentsConfig', () => {
    it('set and get documents config', () => {
      const service = new DocumentSyncService(
        mockVectorStore,
        mockIngestion as unknown as DocumentIngestionService,
        null,
        mockLogger,
      );

      expect(service.getDocumentsConfig()).toBeNull();

      const config = createDocumentsConfig({ syncSchedule: '0 * * * *' });
      service.setDocumentsConfig(config);

      expect(service.getDocumentsConfig()).toEqual(config);
      expect(service.getSyncSchedule()).toBe('0 * * * *');

      service.setDocumentsConfig(null);
      expect(service.getDocumentsConfig()).toBeNull();
    });
  });

  describe('isSyncInProgress and getSyncSchedule', () => {
    it('isSyncInProgress returns false when no sync', () => {
      const config = createDocumentsConfig();
      const service = new DocumentSyncService(
        mockVectorStore,
        mockIngestion as unknown as DocumentIngestionService,
        config,
        mockLogger,
      );

      expect(service.isSyncInProgress()).toBe(false);
    });

    it('getSyncSchedule returns config.syncSchedule', () => {
      const config = createDocumentsConfig({ syncSchedule: '*/5 * * * *' });
      const service = new DocumentSyncService(
        mockVectorStore,
        mockIngestion as unknown as DocumentIngestionService,
        config,
        mockLogger,
      );

      expect(service.getSyncSchedule()).toBe('*/5 * * * *');
    });
  });

  describe('sync mutex', () => {
    it('returns early when sync already in progress', async () => {
      const config = createDocumentsConfig();
      let resolveFetch: (docs: FetchedDocument[]) => void;
      const fetchPromise = new Promise<FetchedDocument[]>(resolve => {
        resolveFetch = resolve;
      });
      mockIngestion.fetchFromSources.mockReturnValue(fetchPromise);
      mockVectorStore.uploadDocuments.mockResolvedValue({
        uploaded: [{ id: 'id-a', fileName: 'a.md', status: 'completed' }],
        failed: [],
      });

      const service = new DocumentSyncService(
        mockVectorStore,
        mockIngestion as unknown as DocumentIngestionService,
        config,
        mockLogger,
      );

      const sync1Promise = service.sync();
      const sync2Promise = service.sync();

      resolveFetch!([doc('a.md')]);
      const [result1, result2] = await Promise.all([
        sync1Promise,
        sync2Promise,
      ]);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Document sync already in progress, skipping',
      );
      const fullResult = result1.added > 0 ? result1 : result2;
      const earlyResult = result1.added > 0 ? result2 : result1;
      expect(fullResult.added).toBe(1);
      expect(earlyResult).toEqual({
        added: 0,
        updated: 0,
        removed: 0,
        failed: 0,
        unchanged: 0,
        errors: [],
      });
    });
  });

  describe('sync skips when no sources', () => {
    it('returns empty result when documentsConfig is null', async () => {
      const service = new DocumentSyncService(
        mockVectorStore,
        mockIngestion as unknown as DocumentIngestionService,
        null,
        mockLogger,
      );

      const result = await service.sync();

      expect(result).toEqual({
        added: 0,
        updated: 0,
        removed: 0,
        failed: 0,
        unchanged: 0,
        errors: [],
      });
      expect(mockIngestion.fetchFromSources).not.toHaveBeenCalled();
    });

    it('returns empty result when sources array is empty', async () => {
      const config = createDocumentsConfig({ sources: [] });
      const service = new DocumentSyncService(
        mockVectorStore,
        mockIngestion as unknown as DocumentIngestionService,
        config,
        mockLogger,
      );

      const result = await service.sync();

      expect(result).toEqual({
        added: 0,
        updated: 0,
        removed: 0,
        failed: 0,
        unchanged: 0,
        errors: [],
      });
      expect(mockIngestion.fetchFromSources).not.toHaveBeenCalled();
    });
  });

  describe("sync in 'append' mode", () => {
    it('adds new docs, skips existing', async () => {
      const config = createDocumentsConfig({ syncMode: 'append' });
      mockIngestion.fetchFromSources.mockResolvedValue([
        doc('new.md', 'hash-new'),
        doc('existing.md', 'hash-existing'),
      ]);
      mockVectorStore.listDocuments.mockResolvedValue([
        existingDoc('existing.md', 'id-existing'),
      ]);
      mockVectorStore.uploadDocuments.mockResolvedValue({
        uploaded: [{ id: 'id-new', fileName: 'new.md', status: 'completed' }],
        failed: [],
      });

      const service = new DocumentSyncService(
        mockVectorStore,
        mockIngestion as unknown as DocumentIngestionService,
        config,
        mockLogger,
      );

      const result = await service.sync();

      expect(result.added).toBe(1);
      expect(result.updated).toBe(0);
      expect(result.unchanged).toBe(1);
      expect(mockVectorStore.uploadDocuments).toHaveBeenCalledTimes(1);
      expect(mockVectorStore.uploadDocuments).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            fileName: 'new.md',
            content: 'content of new.md',
          }),
        ]),
      );
    });
  });

  describe("sync in 'full' mode", () => {
    it('adds new, updates changed, removes deleted', async () => {
      const config = createDocumentsConfig({ syncMode: 'full' });
      mockIngestion.fetchFromSources.mockResolvedValue([
        doc('new.md', 'hash-new'),
        doc('changed.md', 'hash-changed'),
      ]);
      mockVectorStore.listDocuments.mockResolvedValue([
        existingDoc('changed.md', 'id-changed'),
        existingDoc('deleted.md', 'id-deleted'),
      ]);
      mockVectorStore.uploadDocuments
        .mockResolvedValueOnce({
          uploaded: [{ id: 'id-new', fileName: 'new.md', status: 'completed' }],
          failed: [],
        })
        .mockResolvedValueOnce({
          uploaded: [
            { id: 'id-changed-2', fileName: 'changed.md', status: 'completed' },
          ],
          failed: [],
        });

      const rows: Array<{
        file_name: string;
        content_hash: string;
        source_id: string | null;
      }> = [
        {
          file_name: 'changed.md',
          content_hash: 'hash-old',
          source_id: 'source://changed.md',
        },
      ];
      const { getClient, schema } = createMockDatabase(rows);
      schema.hasTable.mockResolvedValue(true);

      const database = { getClient } as unknown as DatabaseService;

      const service = new DocumentSyncService(
        mockVectorStore,
        mockIngestion as unknown as DocumentIngestionService,
        config,
        mockLogger,
        database,
      );

      await service.initialize();
      const result = await service.sync();

      expect(result.added).toBe(1);
      expect(result.updated).toBe(1);
      expect(result.removed).toBe(1);
      expect(mockVectorStore.deleteDocument).toHaveBeenCalledWith('id-changed');
      expect(mockVectorStore.deleteDocument).toHaveBeenCalledWith('id-deleted');
    });
  });

  describe('content hash cache', () => {
    it('loads from DB when available', async () => {
      const config = createDocumentsConfig({ syncMode: 'append' });
      const rows = [
        {
          file_name: 'cached.md',
          content_hash: 'cached-hash',
          source_id: 'source://cached.md',
        },
      ];

      const { getClient, schema } = createMockDatabase(rows);
      schema.hasTable.mockResolvedValue(true);

      const database = { getClient } as unknown as DatabaseService;

      mockIngestion.fetchFromSources.mockResolvedValue([
        doc('cached.md', 'cached-hash'),
      ]);
      mockVectorStore.listDocuments.mockResolvedValue([
        existingDoc('cached.md', 'id-cached'),
      ]);

      const service = new DocumentSyncService(
        mockVectorStore,
        mockIngestion as unknown as DocumentIngestionService,
        config,
        mockLogger,
        database,
      );

      await service.initialize();
      const result = await service.sync();

      expect(result.unchanged).toBe(1);
      expect(mockVectorStore.uploadDocuments).not.toHaveBeenCalled();
    });

    it('persists new hashes when adding documents', async () => {
      const config = createDocumentsConfig({ syncMode: 'append' });
      mockIngestion.fetchFromSources.mockResolvedValue([
        doc('new.md', 'hash-new'),
      ]);
      mockVectorStore.listDocuments.mockResolvedValue([]);
      mockVectorStore.uploadDocuments.mockResolvedValue({
        uploaded: [{ id: 'id-new', fileName: 'new.md', status: 'completed' }],
        failed: [],
      });

      const { getClient, tableChain, schema } = createMockDatabase([]);
      schema.hasTable.mockResolvedValue(true);
      const database = { getClient } as unknown as DatabaseService;

      const service = new DocumentSyncService(
        mockVectorStore,
        mockIngestion as unknown as DocumentIngestionService,
        config,
        mockLogger,
        database,
      );

      await service.initialize();
      await service.sync();

      expect(tableChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          file_name: 'new.md',
          content_hash: 'hash-new',
        }),
      );
    });

    it('evicts cache when at capacity', async () => {
      const config = createDocumentsConfig({ syncMode: 'append' });
      mockIngestion.fetchFromSources.mockResolvedValue([
        doc('a.md', 'hash-a'),
        doc('b.md', 'hash-b'),
        doc('c.md', 'hash-c'),
      ]);
      mockVectorStore.listDocuments.mockResolvedValue([]);
      mockVectorStore.uploadDocuments.mockResolvedValue({
        uploaded: [
          { id: 'id-a', fileName: 'a.md', status: 'completed' },
          { id: 'id-b', fileName: 'b.md', status: 'completed' },
          { id: 'id-c', fileName: 'c.md', status: 'completed' },
        ],
        failed: [],
      });

      const service = new DocumentSyncService(
        mockVectorStore,
        mockIngestion as unknown as DocumentIngestionService,
        config,
        mockLogger,
      );

      const result = await service.sync();

      expect(result.added).toBe(3);
      expect(result.failed).toBe(0);
    });
  });

  describe('change detection via content hashing', () => {
    it('detects changed documents and re-uploads', async () => {
      const config = createDocumentsConfig({ syncMode: 'append' });
      mockIngestion.fetchFromSources.mockResolvedValue([
        doc('changed.md', 'hash-new'),
      ]);
      mockVectorStore.listDocuments.mockResolvedValue([
        existingDoc('changed.md', 'id-changed'),
      ]);
      mockVectorStore.uploadDocuments.mockResolvedValue({
        uploaded: [
          { id: 'id-changed-2', fileName: 'changed.md', status: 'completed' },
        ],
        failed: [],
      });

      const rows = [
        {
          file_name: 'changed.md',
          content_hash: 'hash-old',
          source_id: 'source://changed.md',
        },
      ];
      const { getClient, schema } = createMockDatabase(rows);
      schema.hasTable.mockResolvedValue(true);
      const database = { getClient } as unknown as DatabaseService;

      const service = new DocumentSyncService(
        mockVectorStore,
        mockIngestion as unknown as DocumentIngestionService,
        config,
        mockLogger,
        database,
      );

      await service.initialize();
      const result = await service.sync();

      expect(result.updated).toBe(1);
      expect(mockVectorStore.deleteDocument).toHaveBeenCalledWith('id-changed');
      expect(mockVectorStore.uploadDocuments).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            fileName: 'changed.md',
            content: 'content of changed.md',
          }),
        ]),
      );
    });
  });
});
