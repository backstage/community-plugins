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

import { VectorStoreService } from './VectorStoreService';
import { LlamaStackClient } from './LlamaStackClient';
import { LlamaStackConfig } from '../../types';
import { LoggerService } from '@backstage/backend-plugin-api';

// Mock the LlamaStackClient
jest.mock('./LlamaStackClient');

describe('VectorStoreService', () => {
  let mockClient: jest.Mocked<LlamaStackClient>;
  let mockLogger: jest.Mocked<LoggerService>;
  let baseConfig: LlamaStackConfig;

  beforeEach(() => {
    mockClient = {
      request: jest.fn(),
    } as unknown as jest.Mocked<LlamaStackClient>;

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      child: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<LoggerService>;

    baseConfig = {
      baseUrl: 'https://llama-stack.example.com',
      vectorStoreIds: [],
      vectorStoreName: 'test-vector-store',
      embeddingModel: 'sentence-transformers/all-MiniLM-L6-v2',
      embeddingDimension: 384,
      model: 'gemini/gemini-2.5-flash',
      chunkingStrategy: 'auto',
      maxChunkSizeTokens: 200,
      chunkOverlapTokens: 50,
    };
  });

  describe('ensureExists', () => {
    it('should throw error when vectorStoreName is not configured', async () => {
      const configWithoutName = {
        ...baseConfig,
        vectorStoreName: '',
      };
      const service = new VectorStoreService(
        mockClient,
        configWithoutName,
        mockLogger,
      );

      await expect(service.ensureExists()).rejects.toThrow(
        'CONFIGURATION ERROR: agenticChat.llamaStack.vectorStoreName is required',
      );
    });

    it('should use existing vectorStoreId if it validates successfully', async () => {
      const configWithId = {
        ...baseConfig,
        vectorStoreIds: ['vs_existing_123'],
      };
      const service = new VectorStoreService(
        mockClient,
        configWithId,
        mockLogger,
      );

      // Mock successful validation
      mockClient.request.mockResolvedValueOnce({
        id: 'vs_existing_123',
        name: 'test-vector-store',
        status: 'completed',
        file_counts: { total: 5 },
      });

      await service.ensureExists();

      expect(mockClient.request).toHaveBeenCalledWith(
        '/v1/openai/v1/vector_stores/vs_existing_123',
        { method: 'GET' },
      );
      expect(service.getConfig().vectorStoreIds).toEqual(['vs_existing_123']);
    });

    it('should fall back to name-based lookup when configured vectorStoreId is invalid', async () => {
      const configWithInvalidId = {
        ...baseConfig,
        vectorStoreIds: ['vs_invalid_id'],
      };
      const service = new VectorStoreService(
        mockClient,
        configWithInvalidId,
        mockLogger,
      );

      // Mock failed validation (vector store not found)
      mockClient.request
        .mockRejectedValueOnce(new Error('Not found'))
        // Mock listing vector stores - find by name
        .mockResolvedValueOnce({
          data: [
            {
              id: 'vs_found_by_name',
              name: 'test-vector-store',
              status: 'completed',
              file_counts: { total: 3 },
            },
          ],
        });

      await service.ensureExists();

      // Should have tried validation first, then fell back to name lookup
      expect(mockClient.request).toHaveBeenCalledTimes(2);
      expect(service.getConfig().vectorStoreIds).toEqual(['vs_found_by_name']);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('vs_invalid_id'),
      );
    });

    it('should find existing vector store by name when no vectorStoreIds configured', async () => {
      const service = new VectorStoreService(
        mockClient,
        baseConfig,
        mockLogger,
      );

      // Mock listing vector stores - returns matching name
      mockClient.request.mockResolvedValueOnce({
        data: [
          {
            id: 'vs_other',
            name: 'other-store',
            status: 'completed',
            file_counts: { total: 0 },
          },
          {
            id: 'vs_matched',
            name: 'test-vector-store',
            status: 'completed',
            file_counts: { total: 10 },
          },
        ],
      });

      await service.ensureExists();

      expect(service.getConfig().vectorStoreIds).toEqual(['vs_matched']);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Found existing vector store'),
      );
    });

    it('should create new vector store when not found by name', async () => {
      const service = new VectorStoreService(
        mockClient,
        baseConfig,
        mockLogger,
      );

      // Mock listing vector stores - no match
      mockClient.request
        .mockResolvedValueOnce({ data: [] })
        // Mock creation
        .mockResolvedValueOnce({
          id: 'vs_newly_created',
          name: 'test-vector-store',
          status: 'completed',
        });

      await service.ensureExists();

      expect(service.getConfig().vectorStoreIds).toEqual(['vs_newly_created']);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Created new vector store'),
      );
    });

    it('should include hybrid search config when creating vector store', async () => {
      const hybridConfig = {
        ...baseConfig,
        searchMode: 'hybrid' as const,
        bm25Weight: 0.3,
        semanticWeight: 0.7,
      };
      const service = new VectorStoreService(
        mockClient,
        hybridConfig,
        mockLogger,
      );

      // Mock listing - no match
      mockClient.request
        .mockResolvedValueOnce({ data: [] })
        // Mock creation
        .mockResolvedValueOnce({
          id: 'vs_hybrid',
          name: 'test-vector-store',
          status: 'completed',
        });

      await service.ensureExists();

      // Verify create was called with hybrid search params
      expect(mockClient.request).toHaveBeenLastCalledWith(
        '/v1/openai/v1/vector_stores',
        {
          method: 'POST',
          body: JSON.stringify({
            name: 'test-vector-store',
            embedding_model: 'sentence-transformers/all-MiniLM-L6-v2',
            embedding_dimension: 384,
            search_mode: 'hybrid',
            bm25_weight: 0.3,
            semantic_weight: 0.7,
          }),
        },
      );
    });

    it('should handle API errors gracefully during creation', async () => {
      const service = new VectorStoreService(
        mockClient,
        baseConfig,
        mockLogger,
      );

      // Mock listing - no match
      mockClient.request
        .mockResolvedValueOnce({ data: [] })
        // Mock creation failure
        .mockRejectedValueOnce(new Error('API rate limit exceeded'));

      await expect(service.ensureExists()).rejects.toThrow(
        'Failed to create vector store "test-vector-store": API rate limit exceeded',
      );
    });

    it('should handle deleted and recreated vector store scenario', async () => {
      // Scenario: User has old ID in config, but that store was deleted
      // Plugin should fall back to name and find/create the new one
      const configWithOldId = {
        ...baseConfig,
        vectorStoreIds: ['vs_old_deleted'],
      };
      const service = new VectorStoreService(
        mockClient,
        configWithOldId,
        mockLogger,
      );

      // Mock: old ID validation fails
      mockClient.request
        .mockRejectedValueOnce(new Error('Vector store not found'))
        // Mock: list shows the recreated store with same name but new ID
        .mockResolvedValueOnce({
          data: [
            {
              id: 'vs_new_recreated',
              name: 'test-vector-store',
              status: 'completed',
              file_counts: { total: 0 },
            },
          ],
        });

      await service.ensureExists();

      // Should now use the new ID
      expect(service.getConfig().vectorStoreIds).toEqual(['vs_new_recreated']);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('vs_old_deleted'),
      );
    });
  });
});
