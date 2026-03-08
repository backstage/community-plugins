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
import type {
  LoggerService,
  DatabaseService,
} from '@backstage/backend-plugin-api';
import type {
  DocumentInfo,
  SyncResult,
} from '@backstage-community/plugin-agentic-chat-common';
import { toErrorMessage } from '../../services/utils';
import { MAX_CONTENT_HASH_CACHE_SIZE } from '../../constants';
import { VectorStoreService } from './VectorStoreService';
import { DocumentIngestionService } from '../../services/DocumentIngestionService';
import type { DocumentsConfig, FetchedDocument } from '../../types';
import { generateDefaultAttributes } from '../../services/utils/documentAttributes';
import { categorizeDocuments } from './SyncCategorizer';

export type { SyncResult };

/**
 * Document Sync Service
 *
 * Orchestrates document synchronization from configured sources to the vector store.
 * Supports two sync modes:
 * - 'append': Only add new documents (never removes)
 * - 'full': Sync completely - adds new, updates changed, and removes deleted documents
 *
 * Change detection:
 * Uses content hashing to detect when existing documents have been modified.
 * Changed documents are re-uploaded to the vector store.
 */
const HASH_TABLE = 'agentic_chat_content_hashes';

export class DocumentSyncService {
  private readonly vectorStore: VectorStoreService;
  private readonly ingestion: DocumentIngestionService;
  private readonly logger: LoggerService;
  private readonly database?: DatabaseService;
  private documentsConfig: DocumentsConfig | null;

  /**
   * In-memory cache of content hashes, loaded from the database at
   * the start of each sync and flushed back after mutations.
   */
  private contentHashCache: Map<string, string> = new Map();
  private hashCacheLoaded = false;

  private db: Awaited<ReturnType<DatabaseService['getClient']>> | null = null;

  /**
   * Mutex for preventing concurrent sync operations.
   * When a sync is in progress, this holds a Promise that resolves when complete.
   * This provides a race-condition-free way to check and acquire the lock atomically.
   */
  private syncLock: Promise<SyncResult> | null = null;

  constructor(
    vectorStore: VectorStoreService,
    ingestion: DocumentIngestionService,
    documentsConfig: DocumentsConfig | null,
    logger: LoggerService,
    database?: DatabaseService,
  ) {
    this.vectorStore = vectorStore;
    this.ingestion = ingestion;
    this.documentsConfig = documentsConfig;
    this.logger = logger;
    this.database = database;
  }

  /**
   * Initialize the database table for persisting content hashes.
   * Safe to call multiple times; creates the table only if missing.
   */
  async initialize(): Promise<void> {
    if (!this.database) {
      this.logger.debug(
        'No database provided — content hashes will not persist across restarts',
      );
      return;
    }

    try {
      this.db = await this.database.getClient();
      const hasTable = await this.db.schema.hasTable(HASH_TABLE);
      if (!hasTable) {
        try {
          await this.db.schema.createTable(HASH_TABLE, table => {
            table.string('file_name', 512).primary().notNullable();
            table.string('content_hash', 64).notNullable();
            table.string('source_id', 1024).nullable();
            table
              .timestamp('updated_at')
              .notNullable()
              .defaultTo(this.db!.fn.now());
          });
          this.logger.info(`Created ${HASH_TABLE} table`);
        } catch (createError) {
          const existsNow = await this.db.schema.hasTable(HASH_TABLE);
          if (!existsNow) throw createError;
          this.logger.info(
            `${HASH_TABLE} table was created by another instance`,
          );
        }
      }
    } catch (error) {
      this.logger.warn(
        `Failed to initialize hash cache table: ${toErrorMessage(
          error,
        )}. Falling back to in-memory cache.`,
      );
      this.db = null;
    }
  }

  /**
   * Evict the oldest cache entry if at capacity.
   */
  private evictCacheIfNeeded(): void {
    if (this.contentHashCache.size >= MAX_CONTENT_HASH_CACHE_SIZE) {
      const firstKey = this.contentHashCache.keys().next().value;
      if (firstKey !== undefined) {
        this.contentHashCache.delete(firstKey);
      }
    }
  }

  /**
   * Load all persisted content hashes into the in-memory cache.
   * Called once at the start of each sync to avoid repeated DB reads.
   */
  private async loadHashCache(): Promise<void> {
    if (this.hashCacheLoaded || !this.db) return;

    try {
      const rows = await this.db<{
        file_name: string;
        content_hash: string;
        source_id: string | null;
      }>(HASH_TABLE).select('file_name', 'content_hash', 'source_id');

      for (const row of rows) {
        this.evictCacheIfNeeded();
        const cacheKey = row.source_id || row.file_name;
        this.contentHashCache.set(cacheKey, row.content_hash);
      }
      this.hashCacheLoaded = true;
      this.logger.debug(`Loaded ${rows.length} content hash(es) from database`);
    } catch (error) {
      this.logger.warn(
        `Failed to load hash cache from database: ${toErrorMessage(error)}`,
      );
    }
  }

  /**
   * Persist a single hash entry to the database (upsert).
   */
  private async persistHash(
    fileName: string,
    contentHash: string,
    sourceId?: string,
  ): Promise<void> {
    if (!this.db) return;
    try {
      await this.db(HASH_TABLE)
        .insert({
          file_name: fileName,
          content_hash: contentHash,
          source_id: sourceId ?? null,
          updated_at: this.db.fn.now(),
        })
        .onConflict('file_name')
        .merge({
          content_hash: contentHash,
          source_id: sourceId ?? null,
          updated_at: this.db.fn.now(),
        });
    } catch (error) {
      this.logger.debug(
        `Failed to persist hash for ${fileName}: ${toErrorMessage(error)}`,
      );
    }
  }

  /**
   * Evict cache entries whose key ends with the given fileName.
   * Needed when removing docs by fileName because the cache is keyed on sourceId.
   */
  private evictCacheByFileName(fileName: string): void {
    for (const key of this.contentHashCache.keys()) {
      if (key === fileName || key.endsWith(`:${fileName}`)) {
        this.contentHashCache.delete(key);
      }
    }
  }

  /**
   * Remove a hash entry from the database.
   */
  private async removePersistedHash(fileName: string): Promise<void> {
    if (!this.db) return;
    try {
      await this.db(HASH_TABLE).where('file_name', fileName).delete();
    } catch (error) {
      this.logger.debug(
        `Failed to remove hash for ${fileName}: ${toErrorMessage(error)}`,
      );
    }
  }

  /**
   * Update the documents configuration
   */
  setDocumentsConfig(config: DocumentsConfig | null): void {
    this.documentsConfig = config;
  }

  /**
   * Get the current documents configuration
   */
  getDocumentsConfig(): DocumentsConfig | null {
    return this.documentsConfig;
  }

  /**
   * Check if sync is currently in progress
   */
  isSyncInProgress(): boolean {
    return this.syncLock !== null;
  }

  /**
   * Get the sync schedule configuration
   */
  getSyncSchedule(): string | undefined {
    return this.documentsConfig?.syncSchedule;
  }

  /**
   * Sync documents from configured sources to the vector store
   * This is the main method for config-driven document ingestion.
   *
   * Uses a Promise-based mutex to prevent race conditions when multiple
   * sync requests arrive simultaneously.
   */
  async sync(): Promise<SyncResult> {
    // Atomically check and acquire the lock
    // If syncLock is set, another sync is in progress - return early
    if (this.syncLock !== null) {
      this.logger.info('Document sync already in progress, skipping');
      return {
        added: 0,
        updated: 0,
        removed: 0,
        failed: 0,
        unchanged: 0,
        errors: [],
      };
    }

    if (!this.documentsConfig || this.documentsConfig.sources.length === 0) {
      this.logger.debug('No document sources configured, skipping sync');
      return {
        added: 0,
        updated: 0,
        removed: 0,
        failed: 0,
        unchanged: 0,
        errors: [],
      };
    }

    // Acquire the lock by setting syncLock to our work promise
    // This is atomic in JS single-threaded event loop
    const syncPromise = this.performSync();
    this.syncLock = syncPromise;

    try {
      return await syncPromise;
    } finally {
      // Release the lock
      this.syncLock = null;
    }
  }

  /**
   * Internal method that performs the actual sync work.
   * Called only when the lock is held.
   */
  private async performSync(): Promise<SyncResult> {
    const startTime = Date.now();

    const config = this.documentsConfig;
    if (!config || config.sources.length === 0) {
      return {
        added: 0,
        updated: 0,
        removed: 0,
        failed: 0,
        unchanged: 0,
        errors: [],
      };
    }

    try {
      this.logger.info(`Starting document sync (mode: ${config.syncMode})`);

      const {
        fetchedDocs,
        existingDocs,
        existingDocsMap,
        docsToAdd,
        docsToUpdate,
        docsUnchanged,
      } = await this.fetchAndCategorize(config);

      // Persist hashes for unchanged docs that weren't in cache (first sync after cold start)
      const fetchedByFileName = new Map(fetchedDocs.map(d => [d.fileName, d]));
      for (const fileName of docsUnchanged) {
        const doc = fetchedByFileName.get(fileName);
        if (doc?.contentHash) {
          const cacheKey = doc.sourceId || doc.fileName;
          if (!this.contentHashCache.has(cacheKey)) {
            this.evictCacheIfNeeded();
            this.contentHashCache.set(cacheKey, doc.contentHash);
            await this.persistHash(fileName, doc.contentHash, doc.sourceId);
          }
        }
      }

      let addedCount = 0;
      let updatedCount = 0;
      let failedCount = 0;

      const uploadResult = await this.uploadNewDocuments(docsToAdd);
      addedCount = uploadResult.addedCount;
      failedCount += uploadResult.failedCount;

      const updateResult = await this.updateChangedDocuments(
        docsToUpdate,
        existingDocsMap,
      );
      updatedCount = updateResult.updatedCount;
      failedCount += updateResult.failedCount;

      const removeResult = await this.removeDeletedDocuments(
        config,
        existingDocs,
        fetchedDocs,
      );
      failedCount += removeResult.failedCount;

      const duration = Date.now() - startTime;
      this.logger.info(
        `Document sync completed in ${duration}ms: ` +
          `added=${addedCount}, updated=${updatedCount}, removed=${removeResult.removedCount}, ` +
          `failed=${failedCount}, unchanged=${docsUnchanged.length}`,
      );

      const errors: string[] = [];
      if (failedCount > 0) {
        errors.push(`${failedCount} document(s) failed to sync`);
      }
      return {
        added: addedCount,
        updated: updatedCount,
        removed: removeResult.removedCount,
        failed: failedCount,
        unchanged: docsUnchanged.length,
        errors,
      };
    } catch (error) {
      this.logger.error(`Document sync failed: ${toErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * Steps 1-3: Fetch docs from sources, get existing docs, categorize.
   */
  private async fetchAndCategorize(config: DocumentsConfig): Promise<{
    fetchedDocs: FetchedDocument[];
    existingDocs: DocumentInfo[];
    existingDocsMap: Map<string, DocumentInfo>;
    docsToAdd: FetchedDocument[];
    docsToUpdate: FetchedDocument[];
    docsUnchanged: string[];
  }> {
    await this.loadHashCache();

    const fetchedDocs = await this.ingestion.fetchFromSources(config.sources);
    this.logger.info(`Fetched ${fetchedDocs.length} documents from sources`);

    const existingDocs = await this.vectorStore.listDocuments();
    const existingDocsMap = new Map(existingDocs.map(d => [d.fileName, d]));

    const {
      toAdd: docsToAdd,
      toUpdate: docsToUpdate,
      unchanged: docsUnchanged,
    } = categorizeDocuments(
      fetchedDocs,
      existingDocsMap,
      this.contentHashCache,
    );

    for (const doc of docsToUpdate) {
      const cacheKey = doc.sourceId || doc.fileName;
      this.logger.debug(
        `Document ${
          doc.fileName
        } content changed (hash: ${this.contentHashCache.get(cacheKey)} -> ${
          doc.contentHash
        })`,
      );
    }

    return {
      fetchedDocs,
      existingDocs,
      existingDocsMap,
      docsToAdd,
      docsToUpdate,
      docsUnchanged,
    };
  }

  /**
   * Step 4: Upload new documents and update hash cache.
   */
  private async uploadNewDocuments(
    docsToAdd: FetchedDocument[],
  ): Promise<{ addedCount: number; failedCount: number }> {
    if (docsToAdd.length === 0) {
      return { addedCount: 0, failedCount: 0 };
    }

    this.logger.info(`Uploading ${docsToAdd.length} new documents`);
    const uploadResult = await this.vectorStore.uploadDocuments(
      docsToAdd.map(d => ({
        fileName: d.fileName,
        content: d.content,
        attributes: d.attributes || generateDefaultAttributes(d),
      })),
    );

    for (const doc of docsToAdd) {
      if (doc.contentHash) {
        const cacheKey = doc.sourceId || doc.fileName;
        this.evictCacheIfNeeded();
        this.contentHashCache.set(cacheKey, doc.contentHash);
        await this.persistHash(doc.fileName, doc.contentHash, doc.sourceId);
      }
    }

    return {
      addedCount: uploadResult.uploaded.length,
      failedCount: uploadResult.failed.length,
    };
  }

  /**
   * Step 5: Delete old + upload new for changed documents.
   */
  private async updateChangedDocuments(
    docsToUpdate: FetchedDocument[],
    existingDocsMap: Map<string, DocumentInfo>,
  ): Promise<{ updatedCount: number; failedCount: number }> {
    if (docsToUpdate.length === 0) {
      return { updatedCount: 0, failedCount: 0 };
    }

    this.logger.info(`Updating ${docsToUpdate.length} changed documents`);

    let updatedCount = 0;
    let failedCount = 0;

    for (const doc of docsToUpdate) {
      const existingDoc = existingDocsMap.get(doc.fileName);
      if (!existingDoc) continue;

      try {
        await this.vectorStore.deleteDocument(existingDoc.id);

        const uploadResult = await this.vectorStore.uploadDocuments([
          {
            fileName: doc.fileName,
            content: doc.content,
            attributes: doc.attributes || generateDefaultAttributes(doc),
          },
        ]);

        if (uploadResult.uploaded.length > 0) {
          updatedCount++;
          if (doc.contentHash) {
            const cacheKey = doc.sourceId || doc.fileName;
            this.evictCacheIfNeeded();
            this.contentHashCache.set(cacheKey, doc.contentHash);
            await this.persistHash(doc.fileName, doc.contentHash, doc.sourceId);
          }
        } else {
          failedCount++;
        }
      } catch (error) {
        this.logger.warn(
          `Failed to update document ${doc.fileName}: ${toErrorMessage(error)}`,
        );
        failedCount++;
      }
    }

    return { updatedCount, failedCount };
  }

  /**
   * Step 6: Remove docs no longer in sources (full mode only).
   */
  private async removeDeletedDocuments(
    config: DocumentsConfig,
    existingDocs: DocumentInfo[],
    fetchedDocs: FetchedDocument[],
  ): Promise<{ removedCount: number; failedCount: number }> {
    if (config.syncMode !== 'full') {
      return { removedCount: 0, failedCount: 0 };
    }

    const fetchedFileNames = new Set(fetchedDocs.map(d => d.fileName));
    const docsToRemove = existingDocs.filter(
      d => !fetchedFileNames.has(d.fileName),
    );

    if (docsToRemove.length === 0) {
      return { removedCount: 0, failedCount: 0 };
    }

    this.logger.info(
      `Removing ${docsToRemove.length} documents no longer in sources`,
    );

    let removedCount = 0;
    let failedCount = 0;

    for (const doc of docsToRemove) {
      try {
        await this.vectorStore.deleteDocument(doc.id);
        removedCount++;
        this.evictCacheByFileName(doc.fileName);
        await this.removePersistedHash(doc.fileName);
      } catch (error) {
        this.logger.warn(`Failed to remove document ${doc.fileName}`);
        failedCount++;
      }
    }

    return { removedCount, failedCount };
  }
}
