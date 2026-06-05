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
  apiKey: string;
  nodes: Array<{ host: string; port: number; protocol: string; path?: string }>;
  clientOptions?: Record<string, any>;
  collections?: Record<
    string,
    {
      fields?: Array<any>;
      searchOptions?: Record<string, any>;
    }
  >;
  logger: LoggerService;
}

/**
 * High-performance batching stream for importing documents into Typesense.
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

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const batch = this.buffer.map(doc => ({
      // GCS or Catalog paths make stable document primary IDs
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

    // Import using action: upsert to safely overwrite outdated assets
    await this.client
      .collections(this.collectionName)
      .documents()
      .import(batch, { action: 'upsert' });
  }
}

/**
 * SearchEngine implementation for Typesense.
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

  setTranslator(_translator: QueryTranslator): void {
    // No-op: Translator not needed for raw queries, but interface requires implementation
  }

  // Ensures collection exists with custom schema
  private async ensureCollection(collectionName: string): Promise<void> {
    try {
      await this.client.collections(collectionName).retrieve();
    } catch (error: any) {
      // Retrieve throws ObjectNotFound/404 error if not found
      if (error.status === 404 || error.name === 'ObjectNotFound') {
        this.logger.info(
          `Creating missing Typesense collection: ${collectionName}`,
        );
        const type = collectionName.replace(/^backstage_/, '');
        const config = this.collectionsConfig?.[type];
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

  // Resolves the Writable indexing stream
  async getIndexer(type: string): Promise<Writable> {
    const collectionName = `backstage_${type}`;
    await this.ensureCollection(collectionName);

    return new TypesenseWritableStream(
      this.client,
      collectionName,
      this.logger,
    );
  }

  // Translates and executes Backstage Search Queries
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
          query_by: 'title,text,location', // Main text search index targets
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
            // Typesense text match scores are mapped directly back to Backstage search
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
