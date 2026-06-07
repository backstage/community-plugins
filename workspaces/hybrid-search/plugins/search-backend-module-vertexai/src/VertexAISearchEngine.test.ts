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
import { VertexAISearchEngine } from './VertexAISearchEngine';
import { LoggerService } from '@backstage/backend-plugin-api';

// Mock Discovery Engine client
const mockSearch = jest.fn();
jest.mock('@google-cloud/discoveryengine', () => {
  return {
    SearchServiceClient: jest.fn().mockImplementation(() => {
      return {
        search: mockSearch,
      };
    }),
  };
});

describe('VertexAISearchEngine', () => {
  let engine: VertexAISearchEngine;
  let mockLogger: jest.Mocked<LoggerService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    } as any;

    engine = new VertexAISearchEngine({
      projectId: 'my-project',
      location: 'europe-west4',
      dataStoreId: 'my-datastore',
      logger: mockLogger,
    });
  });

  describe('getIndexer', () => {
    it('should throw an error because indexing is not supported directly', async () => {
      await expect(engine.getIndexer('techdocs')).rejects.toThrow(
        'Indexing is not supported directly through VertexAISearchEngine',
      );
    });
  });

  describe('query', () => {
    it('should query Vertex AI Search and map struct data fields back', async () => {
      const mockResult = [
        {
          document: {
            name: 'doc-name',
            structData: {
              fields: {
                title: { stringValue: 'My Document' },
                text: { stringValue: 'Some document content' },
                location: { stringValue: 'index.html' },
                kind: { stringValue: 'Component' },
                namespace: { stringValue: 'default' },
                name: { stringValue: 'my-comp' },
              },
            },
          },
          rankSignals: { relevanceScore: 0.95 },
        },
      ];
      mockSearch.mockResolvedValue([mockResult]);

      const queryObj = {
        term: 'search-term',
        types: ['techdocs'],
      };

      const response = await engine.query(queryObj);

      expect(mockSearch).toHaveBeenCalledWith({
        servingConfig:
          'projects/my-project/locations/europe-west4/dataStores/my-datastore/servingConfigs/default_search',
        query: 'search-term',
        relevanceScoreSpec: { returnRelevanceScore: true },
      });

      expect(response.results).toHaveLength(1);
      expect(response.results[0]).toEqual({
        type: 'techdocs',
        document: {
          title: 'My Document',
          text: 'Some document content',
          location: '/docs/default/Component/my-comp/index.html',
          kind: 'Component',
          namespace: 'default',
          name: 'my-comp',
        },
        score: 0.95,
      });
    });

    it('should merge and pass custom searchOptions to Vertex AI search API', async () => {
      const customEngine = new VertexAISearchEngine({
        projectId: 'my-project',
        location: 'europe-west4',
        dataStoreId: 'my-datastore',
        searchOptions: {
          summarySpec: {
            summaryResultCount: 3,
            includeCitations: true,
          },
          spellCorrectionSpec: {
            mode: 'AUTO',
          },
        },
      });

      mockSearch.mockResolvedValue([[]]);

      await customEngine.query({
        term: 'test-query',
        types: ['techdocs'],
      });

      expect(mockSearch).toHaveBeenCalledWith({
        servingConfig:
          'projects/my-project/locations/europe-west4/dataStores/my-datastore/servingConfigs/default_search',
        query: 'test-query',
        relevanceScoreSpec: { returnRelevanceScore: true },
        summarySpec: {
          summaryResultCount: 3,
          includeCitations: true,
        },
        spellCorrectionSpec: {
          mode: 'AUTO',
        },
      });
    });
  });
});
