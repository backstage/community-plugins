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
import { SearchServiceClient } from '@google-cloud/discoveryengine';
import { Writable } from 'node:stream';
import { LoggerService } from '@backstage/backend-plugin-api';

interface ExtendedIndexableDocument extends IndexableDocument {
  kind?: string;
  namespace?: string;
  name?: string;
}

/**
 * SearchEngine implementation for Google Cloud Vertex AI Search.
 *
 * @public
 */
export class VertexAISearchEngine implements SearchEngine {
  private client: SearchServiceClient;
  private projectId: string;
  private location: string;
  private dataStoreId: string;
  private logger?: LoggerService;

  constructor(options: {
    projectId: string;
    location: string;
    dataStoreId: string;
    logger?: LoggerService;
  }) {
    if (!options.projectId) {
      throw new Error(
        'projectId is strictly required for VertexAISearchEngine',
      );
    }
    if (!options.location) {
      throw new Error('location is strictly required for VertexAISearchEngine');
    }
    if (!options.dataStoreId) {
      throw new Error(
        'dataStoreId is strictly required for VertexAISearchEngine',
      );
    }

    this.projectId = options.projectId;
    this.location = options.location;
    this.dataStoreId = options.dataStoreId;
    this.logger = options.logger;

    this.logger?.info(
      `Initializing VertexAISearchEngine for project ${this.projectId}, location ${this.location}, dataStore ${this.dataStoreId}`,
    );

    // Initialize the Google Cloud Discovery Engine client
    // Ensure the environment has GOOGLE_APPLICATION_CREDENTIALS set or runs on GCP with identity
    this.client = new SearchServiceClient({
      apiEndpoint:
        this.location !== 'global'
          ? `${this.location}-discoveryengine.googleapis.com`
          : undefined,
    });
  }

  setTranslator(_translator: QueryTranslator): void {
    // No-op: interface requires implementation
  }

  async getIndexer(_type: string): Promise<Writable> {
    throw new Error(
      'Indexing is not supported directly through VertexAISearchEngine',
    );
  }

  async query(query: SearchQuery): Promise<IndexableResultSet> {
    const parent = `projects/${this.projectId}/locations/${this.location}/dataStores/${this.dataStoreId}/servingConfigs/default_search`;

    this.logger?.info(`Using parent serving config: "${parent}"`);
    this.logger?.info(`Querying Vertex AI Search with term: "${query.term}"`);

    try {
      const [apiResults] = await this.client.search({
        servingConfig: parent,
        query: query.term,
        relevanceScoreSpec: {
          returnRelevanceScore: true,
        },
      });

      const resultsCount = apiResults?.length || 0;
      this.logger?.info(`Vertex AI Search returned ${resultsCount} results`);

      const results = (apiResults || []).map((result: any) => {
        const structData = result.document.structData || {};

        // Helper to handle both plain objects and protobuf Struct objects
        const getField = (obj: any, fieldName: string) => {
          if (obj.fields && obj.fields[fieldName]) {
            const val = obj.fields[fieldName];
            return val.stringValue ?? val.numberValue ?? val.boolValue ?? val;
          }
          return obj[fieldName];
        };

        const kind = getField(structData, 'kind') || 'other';
        const namespace = getField(structData, 'namespace') || 'default';
        const name = getField(structData, 'name') || '';
        const fileLocation = getField(structData, 'location') || '';

        const doc: ExtendedIndexableDocument = {
          title: getField(structData, 'title') || result.document.name,
          text: getField(structData, 'text') || '',
          location: `/docs/${namespace}/${kind}/${name}/${fileLocation}`,
          kind,
          namespace,
          name,
        };

        // Extract relevance score from rankSignals if populated
        const relevanceScore = result.rankSignals?.relevanceScore;

        this.logger?.debug(
          `Mapped document: ${doc.title} with semantic score: ${relevanceScore}`,
        );

        return {
          type: 'techdocs',
          document: doc,
          score:
            typeof relevanceScore === 'number' ? relevanceScore : undefined,
        };
      });

      return { results } as IndexableResultSet;
    } catch (error) {
      this.logger?.error(`Vertex AI Search failed`, error as Error);
      throw error;
    }
  }
}
