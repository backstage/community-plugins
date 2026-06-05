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
} from '@backstage/plugin-search-common';
import { Writable } from 'node:stream';
import { LoggerService } from '@backstage/backend-plugin-api';

/**
 * Orchestrator search engine that routes queries across registered sub-engines.
 *
 * @public
 */
export class HybridSearchEngine implements SearchEngine {
  private readonly engines = new Map<string, SearchEngine>();
  private readonly typeMapping = new Map<string, string>(); // type -> engineName

  constructor(private readonly logger: LoggerService) {
    this.logger.info('Initialized custom Hybrid Search Engine.');
  }

  registerEngine(
    name: string,
    engine: SearchEngine,
    options: { supportsTypes: string[] },
  ) {
    this.engines.set(name, engine);
    for (const type of options.supportsTypes) {
      this.typeMapping.set(type, name);
      this.logger.info(
        `Hybrid Search: Registered engine "${name}" for type "${type}"`,
      );
    }
  }

  setTranslator(translator: QueryTranslator): void {
    for (const engine of this.engines.values()) {
      engine.setTranslator(translator);
    }
  }

  // Route document index streams to the appropriate engine
  async getIndexer(type: string): Promise<Writable> {
    let engineName = this.typeMapping.get(type);
    if (!engineName) {
      engineName = this.typeMapping.get('default');
    }

    if (!engineName) {
      this.logger.warn(
        `Hybrid Search: No engine registered for type "${type}" and no default fallback. Using dummy no-op stream.`,
      );
      // Return a dummy no-op stream
      return new Writable({
        objectMode: true,
        write(_chunk, _encoding, callback) {
          callback();
        },
      });
    }

    this.logger.info(
      `Hybrid Search: Routing indexing for type "${type}" to engine "${engineName}".`,
    );
    const engine = this.engines.get(engineName)!;
    return engine.getIndexer(type);
  }

  // Route user queries depending on target category
  async query(query: SearchQuery): Promise<IndexableResultSet> {
    const types = query.types || [];

    // If empty types, execute parallel query across all registered engines and interleave results
    if (types.length === 0) {
      this.logger.info(
        `Hybrid routing: Executing federated search across all registered engines for: "${query.term}"`,
      );
      const allResults = await Promise.all(
        Array.from(this.engines.values()).map(engine => engine.query(query)),
      );
      return {
        results: this.interleaveResults(allResults.map(r => r.results)),
      };
    }

    // Map each requested type to its engine
    const engineQueries = new Map<string, string[]>(); // engineName -> types
    for (const type of types) {
      let engineName = this.typeMapping.get(type);
      if (!engineName) {
        engineName = this.typeMapping.get('default');
      }

      if (engineName) {
        if (!engineQueries.has(engineName)) {
          engineQueries.set(engineName, []);
        }
        engineQueries.get(engineName)!.push(type);
      }
    }

    if (engineQueries.size === 0) {
      this.logger.info(
        `Hybrid routing: No engines matched types: ${JSON.stringify(types)}`,
      );
      return { results: [] };
    }

    // If only one engine matches, query it directly
    if (engineQueries.size === 1) {
      const [[engineName, engineTypes]] = Array.from(engineQueries.entries());
      this.logger.info(
        `Hybrid routing: Routing query for types ${JSON.stringify(
          engineTypes,
        )} to engine "${engineName}"`,
      );
      const engine = this.engines.get(engineName)!;
      return engine.query({ ...query, types: engineTypes });
    }

    // Parallel federated query across matched engines
    this.logger.info(
      `Hybrid routing: Executing parallel federated query for "${
        query.term
      }" across engines: ${Array.from(engineQueries.keys()).join(', ')}`,
    );
    const queries = Array.from(engineQueries.entries()).map(
      ([engineName, engineTypes]) => {
        const engine = this.engines.get(engineName)!;
        return engine.query({ ...query, types: engineTypes });
      },
    );

    const queryResults = await Promise.all(queries);
    return {
      results: this.interleaveResults(queryResults.map(r => r.results)),
    };
  }

  private interleaveResults(sets: any[][]): any[] {
    const merged = [];
    const maxLen = Math.max(...sets.map(s => s.length));
    for (let i = 0; i < maxLen; i++) {
      for (const set of sets) {
        if (i < set.length) {
          merged.push(set[i]);
        }
      }
    }
    return merged;
  }
}
