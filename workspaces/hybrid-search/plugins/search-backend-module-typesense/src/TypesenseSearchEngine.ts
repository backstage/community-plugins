/*
 * Copyright 2026 The Backstage Authors
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
import {
  SearchEngine,
  QueryTranslator,
} from '@backstage/plugin-search-backend-node';
import {
  IndexableResultSet,
  SearchQuery,
  IndexableDocument,
} from '@backstage/plugin-search-common';
import { Client } from 'typesense';
import { Writable } from 'node:stream';
import { LoggerService } from '@backstage/backend-plugin-api';

/**
 * Options for configuring the TypesenseSearchEngine.
 *
 * @public
 */
export interface TypesenseEngineOptions {
  /**
   * The API Key used to authenticate requests to the Typesense cluster.
   */
  apiKey: string;
  /**
   * The nodes config array for cluster connectivity.
   */
  nodes: Array<{ host: string; port: number; protocol: string; path?: string }>;
  /**
   * Additional configuration options passed straight to the raw Typesense client.
   */
  clientOptions?: Record<string, any>;
  /**
   * Optional custom field definitions and default search query options grouped by collection type.
   */
  collections?: Record<
    string,
    {
      fields?: Array<any>;
      searchOptions?: Record<string, any>;
    }
  >;
  /**
   * Core Backstage logging service utility.
   */
  logger: LoggerService;
}

/**
 * High-performance batching stream for importing documents into Typesense.
 *
 * Extends the Node writable stream in objectMode, buffering collated index documents
 * and flushing them in batch sets of 100 to reduce connection roundtrips and improve ingestion throughput.
 * Maps unique document IDs deterministically from catalog/storage location strings to prevent duplicates.
 */
class TypesenseWritableStream extends Writable {
  private buffer: any[] = [];
  private batchSize = 100;

  constructor(
    private client: Client,
    private collectionName: string,
    private logger: LoggerService,
  ) {
    super({ objectMode: true });
  }

  /**
   * Writable stream internal write handler. Buffers chunk elements and flushes on batch limits.
   */
  async _write(
    chunk: any,
    _encoding: string,
    callback: (error?: Error | null) => void,
  ): Promise<void> {
    this.buffer.push(chunk);

    if (this.buffer.length >= this.batchSize) {
      try {
        await this.flush();
        callback();
      } catch (err: any) {
        this.logger.error(`Failed to flush batch to Typesense:`, err as Error);
        callback(err);
      }
    } else {
      callback();
    }
  }

  /**
   * Writable stream internal final handler. Ensures any remaining buffered documents are flushed.
   */
  async _final(callback: (error?: Error | null) => void): Promise<void> {
    try {
      await this.flush();
      callback();
    } catch (err: any) {
      this.logger.error(
        `Failed to flush final stream buffer to Typesense:`,
        err as Error,
      );
      callback(err);
    }
  }

  /**
   * Flushes the current document buffer to Typesense using upsert.
   */
  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const batch = this.buffer.map(doc => ({
      // Use existing document ID or derive a stable deterministic ID from the file location
      id: doc.id || Buffer.from(doc.location).toString('hex'),
      title: doc.title,
      text: doc.text,
      location: doc.location,
      kind: doc.kind,
      namespace: doc.namespace,
      name: doc.name,
    }));

    this.buffer = [];

    this.logger.info(
      `Flushing ${batch.length} documents to Typesense collection: ${this.collectionName}`,
    );

    // Using 'upsert' ensures existing assets are safely overwritten without producing duplicates
    await this.client
      .collections(this.collectionName)
      .documents()
      .import(batch, { action: 'upsert' });
  }
}

/**
 * Typesense SearchEngine implementation.
 *
 * Orchestrates document ingestion and query handling for Backstage categories
 * mapped to Typesense sub-routing. Registers auto-provisioned collections with
 * fallback schemas, and maps search match score relevancy back to search queries.
 *
 * @public
 */
export class TypesenseSearchEngine implements SearchEngine {
  private client: Client;
  private logger: LoggerService;
  private collectionsConfig?: Record<
    string,
    {
      fields?: Array<any>;
      searchOptions?: Record<string, any>;
    }
  >;

  constructor(options: TypesenseEngineOptions) {
    this.logger = options.logger;
    this.collectionsConfig = options.collections;
    this.client = new Client({
      apiKey: options.apiKey,
      nodes: options.nodes,
      ...options.clientOptions,
    });

    this.logger.info('Initialized custom Typesense Search Engine.');
  }

  /**
   * Registers a query translator. (No-op interface placeholder).
   */
  setTranslator(_translator: QueryTranslator): void {
    // No-op: Translator not needed for raw queries, but interface requires implementation
  }

  /**
   * Asserts that the target collection exists in Typesense, creating it with the fallback
   * or configured schema if it returns a 404.
   */
  private async ensureCollection(collectionName: string): Promise<void> {
    try {
      await this.client.collections(collectionName).retrieve();
    } catch (error: any) {
      // Create the collection if it does not exist
      if (error.status === 404 || error.name === 'ObjectNotFound') {
        this.logger.info(
          `Creating missing Typesense collection: ${collectionName}`,
        );
        const type = collectionName.replace(/^backstage_/, '');
        const config = this.collectionsConfig?.[type];
        // Standard wildcard fallback schema allows dynamic indexing
        const fields = config?.fields || [{ name: '.*', type: 'auto' }];

        await this.client.collections().create({
          name: collectionName,
          fields,
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * Resolves the custom writable stream for document ingestion.
   */
  async getIndexer(type: string): Promise<Writable> {
    const collectionName = `backstage_${type}`;
    await this.ensureCollection(collectionName);

    return new TypesenseWritableStream(
      this.client,
      collectionName,
      this.logger,
    );
  }

  /**
   * Performs federated queries across target collections, mapping Typesense scoring and documents
   * back to the standard Backstage IndexableResultSet shape.
   */
  async query(query: SearchQuery): Promise<IndexableResultSet> {
    const rawTypes = query.types || ['software-catalog'];
    const types = rawTypes.map(t => (t === 'catalog' ? 'software-catalog' : t));
    const results: any[] = [];

    for (const type of types) {
      const collectionName = `backstage_${type}`;

      try {
        this.logger.info(
          `Querying Typesense collection "${collectionName}" for: "${query.term}"`,
        );

        const collectionType = collectionName.replace(/^backstage_/, '');
        const config = this.collectionsConfig?.[collectionType];
        const searchOptions = {
          q: query.term,
          query_by: 'title,text,location', // Standard text index search targets
          ...config?.searchOptions,
        };

        const searchResponse = await this.client
          .collections(collectionName)
          .documents()
          .search(searchOptions);

        const hits = searchResponse.hits || [];
        this.logger.info(
          `Typesense returned ${hits.length} results for query "${query.term}" in collection "${collectionName}"`,
        );

        for (const hit of hits) {
          const doc = hit.document as any;

          results.push({
            document: {
              title: doc.title || '',
              text: doc.text || '',
              location: doc.location || '',
              kind: doc.kind,
              namespace: doc.namespace,
              name: doc.name,
            } as IndexableDocument,
            // Direct mapping of the text match relevance score
            score: hit.text_match_info?.score ?? undefined,
          });
        }
      } catch (error) {
        this.logger.error(
          `Failed to search Typesense collection "${collectionName}"`,
          error as Error,
        );
      }
    }

    return { results };
  }
}
