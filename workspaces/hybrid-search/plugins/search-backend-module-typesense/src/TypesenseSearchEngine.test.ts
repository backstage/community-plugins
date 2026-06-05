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
import { TypesenseSearchEngine } from './TypesenseSearchEngine';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Writable } from 'node:stream';

// Mock typesense client
const mockImport = jest.fn();
const mockSearch = jest.fn();
const mockRetrieve = jest.fn();
const mockDocuments = jest.fn().mockReturnValue({
  import: mockImport,
  search: mockSearch,
});
const mockCollections = jest.fn().mockReturnValue({
  retrieve: mockRetrieve,
  documents: mockDocuments,
});

jest.mock('typesense', () => {
  return {
    Client: jest.fn().mockImplementation(() => {
      return {
        collections: mockCollections,
      };
    }),
  };
});

describe('TypesenseSearchEngine', () => {
  let engine: TypesenseSearchEngine;
  let mockLogger: jest.Mocked<LoggerService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    } as any;

    engine = new TypesenseSearchEngine({
      apiKey: 'test-key',
      nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }],
      logger: mockLogger,
    });
  });

  describe('getIndexer', () => {
    it('should return a Writable stream that imports documents to Typesense', async () => {
      mockImport.mockResolvedValue([]);

      const indexer = await engine.getIndexer('software-catalog');
      expect(indexer).toBeInstanceOf(Writable);

      // Write a document to the stream and end it
      indexer.write({
        title: 'My Component',
        text: 'This is my component',
        location: 'catalog/default/component/my-comp',
      });
      indexer.end();

      // Wait for stream to finish
      await new Promise<void>((resolve, reject) => {
        indexer.on('finish', resolve);
        indexer.on('error', reject);
      });

      expect(mockCollections).toHaveBeenCalledWith('backstage_software-catalog');
      expect(mockImport).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'My Component',
            text: 'This is my component',
          }),
        ]),
        expect.any(Object),
      );
    });
  });

  describe('query', () => {
    it('should query Typesense collection and map results back to Backstage schema', async () => {
      const mockSearchResponse = {
        hits: [
          {
            document: {
              title: 'My Component',
              text: 'This is my component',
              location: 'catalog/default/component/my-comp',
              kind: 'Component',
              namespace: 'default',
              name: 'my-comp',
            },
            text_match_info: { score: 42 },
          },
        ],
      };
      mockSearch.mockResolvedValue(mockSearchResponse);

      const queryObj = {
        term: 'test-term',
        types: ['software-catalog'],
      };

      const response = await engine.query(queryObj);

      expect(mockCollections).toHaveBeenCalledWith('backstage_software-catalog');
      expect(mockSearch).toHaveBeenCalledWith({
        q: 'test-term',
        query_by: 'title,text,location',
      });

      expect(response.results).toHaveLength(1);
      expect(response.results[0]).toEqual({
        document: {
          title: 'My Component',
          text: 'This is my component',
          location: 'catalog/default/component/my-comp',
          kind: 'Component',
          namespace: 'default',
          name: 'my-comp',
        },
        score: 42,
      });
    });
  });
});
