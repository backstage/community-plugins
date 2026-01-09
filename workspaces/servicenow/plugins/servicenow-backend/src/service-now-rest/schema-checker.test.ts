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

import { ServiceNowSchemaChecker } from './schema-checker';
import { ServiceNowConnection } from './connection';

describe('ServiceNowSchemaChecker', () => {
  let mockConnection: jest.Mocked<ServiceNowConnection>;
  let mockAxiosInstance: {
    get: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();

    mockAxiosInstance = {
      get: jest.fn(),
    };

    mockConnection = {
      getAuthHeaders: jest.fn(),
      getAxiosInstance: jest.fn().mockReturnValue(mockAxiosInstance),
    } as unknown as jest.Mocked<ServiceNowConnection>;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('fieldExists', () => {
    it('should return true for empty fields array', async () => {
      const checker = new ServiceNowSchemaChecker(mockConnection);
      const result = await checker.fieldExists();
      expect(result).toBe(true);
      expect(mockAxiosInstance.get).not.toHaveBeenCalled();
    });

    it('should return true when all fields exist', async () => {
      mockConnection.getAuthHeaders.mockResolvedValue({
        Authorization: 'Bearer token',
      });

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
        data: {
          result: [
            { element: 'u_backstage_entity_id' },
            { element: 'u_service' },
            { element: 'category' },
          ],
        },
      });

      const checker = new ServiceNowSchemaChecker(mockConnection);
      const result = await checker.fieldExists(
        'u_backstage_entity_id',
        'u_service',
        'category',
      );

      expect(result).toBe(true);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining('api/now/table/sys_dictionary'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token',
            Accept: 'application/json',
          }),
          params: expect.objectContaining({
            sysparm_query: 'name=incident',
            sysparm_fields: 'element',
            sysparm_limit: 500,
          }),
        }),
      );
    });

    it('should return false when one or more fields do not exist', async () => {
      mockConnection.getAuthHeaders.mockResolvedValue({
        Authorization: 'Bearer token',
      });

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
        data: {
          result: [
            { element: 'u_backstage_entity_id' },
            { element: 'u_service' },
          ],
        },
      });

      const checker = new ServiceNowSchemaChecker(mockConnection);
      const result = await checker.fieldExists(
        'u_backstage_entity_id',
        'u_service',
        'nonexistent_field',
      );

      expect(result).toBe(false);
    });

    it('should use cache when within TTL', async () => {
      mockConnection.getAuthHeaders.mockResolvedValue({
        Authorization: 'Bearer token',
      });

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
        data: {
          result: [{ element: 'u_backstage_entity_id' }],
        },
      });

      const checker = new ServiceNowSchemaChecker(mockConnection);

      // First call - should fetch from API
      await checker.fieldExists('u_backstage_entity_id');
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      await checker.fieldExists('u_backstage_entity_id');
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
    });

    it('should refresh cache after TTL expires', async () => {
      jest.useFakeTimers();

      mockConnection.getAuthHeaders.mockResolvedValue({
        Authorization: 'Bearer token',
      });

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
        data: {
          result: [{ element: 'u_backstage_entity_id' }],
        },
      });

      const checker = new ServiceNowSchemaChecker(mockConnection);

      // First call
      await checker.fieldExists('u_backstage_entity_id');
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);

      // Fast-forward time past TTL (5 minutes + 1 second)
      jest.advanceTimersByTime(5 * 60 * 1000 + 1000);

      // Second call - should fetch again
      await checker.fieldExists('u_backstage_entity_id');
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    it('should throw error when API returns non-200 status', async () => {
      mockConnection.getAuthHeaders.mockResolvedValue({
        Authorization: 'Bearer token',
      });

      mockAxiosInstance.get.mockResolvedValue({
        status: 500,
        headers: {
          'content-type': 'application/json',
        },
        data: {},
      });

      const checker = new ServiceNowSchemaChecker(mockConnection);

      await expect(checker.fieldExists('field1')).rejects.toThrow(
        'Failed to fetch incident schema: ServiceNow API returned status 500',
      );
    });

    it('should throw error when response is not JSON', async () => {
      mockConnection.getAuthHeaders.mockResolvedValue({
        Authorization: 'Bearer token',
      });

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        headers: {
          'content-type': 'text/html',
        },
        data: '<html>...</html>',
      });

      const checker = new ServiceNowSchemaChecker(mockConnection);

      await expect(checker.fieldExists('field1')).rejects.toThrow(
        'Failed to fetch incident schema: Expected JSON response but got Content-Type: text/html',
      );
    });

    it('should throw error when response data is invalid', async () => {
      mockConnection.getAuthHeaders.mockResolvedValue({
        Authorization: 'Bearer token',
      });

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
        data: null,
      });

      const checker = new ServiceNowSchemaChecker(mockConnection);

      await expect(checker.fieldExists('field1')).rejects.toThrow(
        'Failed to fetch incident schema: ServiceNow API returned invalid JSON response',
      );
    });

    it('should throw error when API returns error in response', async () => {
      mockConnection.getAuthHeaders.mockResolvedValue({
        Authorization: 'Bearer token',
      });

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
        data: {
          error: {
            message: 'Invalid request',
          },
        },
      });

      const checker = new ServiceNowSchemaChecker(mockConnection);

      await expect(checker.fieldExists('field1')).rejects.toThrow(
        'Failed to fetch incident schema: ServiceNow API Error: Invalid request',
      );
    });

    it('should throw error when getAuthHeaders fails', async () => {
      mockConnection.getAuthHeaders.mockRejectedValue(
        new Error('Authentication failed'),
      );

      const checker = new ServiceNowSchemaChecker(mockConnection);

      await expect(checker.fieldExists('field1')).rejects.toThrow(
        'Failed to fetch incident schema: Authentication failed',
      );
    });

    it('should throw error when axios request fails', async () => {
      mockConnection.getAuthHeaders.mockResolvedValue({
        Authorization: 'Bearer token',
      });

      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      const checker = new ServiceNowSchemaChecker(mockConnection);

      await expect(checker.fieldExists('field1')).rejects.toThrow(
        'Failed to fetch incident schema: Network error',
      );
    });

    it('should handle empty result array', async () => {
      mockConnection.getAuthHeaders.mockResolvedValue({
        Authorization: 'Bearer token',
      });

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
        data: {
          result: [],
        },
      });

      const checker = new ServiceNowSchemaChecker(mockConnection);
      const result = await checker.fieldExists('any_field');

      expect(result).toBe(false);
    });

    it('should handle missing result in response', async () => {
      mockConnection.getAuthHeaders.mockResolvedValue({
        Authorization: 'Bearer token',
      });

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
        data: {},
      });

      const checker = new ServiceNowSchemaChecker(mockConnection);
      const result = await checker.fieldExists('any_field');

      expect(result).toBe(false);
    });
  });
});
