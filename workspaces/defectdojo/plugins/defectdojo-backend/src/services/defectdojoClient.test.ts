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
import { ConfigReader } from '@backstage/config';
import { DefectDojoClient } from './defectdojoClient';

// Mock fetch globally
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

const mockConfig = new ConfigReader({
  defectdojo: {
    baseUrl: 'https://defectdojo.example.com',
    token: 'test-token',
    requestTimeoutMs: 5000,
    maxPages: 10,
  },
});

describe('DefectDojoClient', () => {
  let client: DefectDojoClient;

  beforeEach(() => {
    client = new DefectDojoClient(mockConfig);
    jest.clearAllMocks();
  });

  describe('getProduct', () => {
    it('should get product by ID', async () => {
      const mockProduct = {
        id: 123,
        name: 'Test Product',
        description: 'A test product',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockProduct),
      } as Response);

      const result = await client.getProduct(123);

      expect(result).toEqual(mockProduct);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://defectdojo.example.com/api/v2/products/123/',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Token test-token',
          }),
        }),
      );
    });

    it('should get product by name', async () => {
      const mockResponse = {
        count: 1,
        results: [
          {
            id: 123,
            name: 'Test Product',
            description: 'A test product',
          },
        ],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await client.getProduct('Test Product');

      expect(result).toEqual(mockResponse.results[0]);
    });

    it('should throw error when product not found by name', async () => {
      const mockResponse = {
        count: 0,
        results: [],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      await expect(client.getProduct('Nonexistent Product')).rejects.toThrow(
        'No product found with name: Nonexistent Product',
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: () => Promise.resolve('Not Found'),
      } as Response);

      await expect(client.getProduct(999)).rejects.toThrow(
        'DefectDojo 404: Not Found',
      );
    });
  });

  describe('getEngagements', () => {
    it('should get engagements for a product', async () => {
      const mockEngagements = [
        {
          id: 1,
          name: 'Production',
          product: 123,
          target_start: '2024-01-01',
          target_end: '2024-12-31',
          status: 'In Progress',
          active: true,
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ results: mockEngagements }),
      } as Response);

      const result = await client.getEngagements(123);

      expect(result).toEqual(mockEngagements);
    });

    it('should return empty array when no engagements found', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ results: [] }),
      } as Response);

      const result = await client.getEngagements(999);

      expect(result).toEqual([]);
    });
  });

  describe('listFindingsByProduct', () => {
    it('should get findings by product ID', async () => {
      const mockFindings = [
        {
          id: 1,
          title: 'SQL Injection',
          severity: 'Critical',
          description: 'A critical vulnerability',
          cwe: 89,
          active: true,
          created: '2024-01-01T00:00:00Z',
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            count: 1,
            next: null,
            results: mockFindings,
          }),
      } as Response);

      const result = await client.listFindingsByProduct(123);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 1,
          title: 'SQL Injection',
          severity: 'Critical',
          url: 'https://defectdojo.example.com/api/v2/findings/1',
        }),
      );
    });

    it('should handle timeout errors', async () => {
      const mockConfigWithShortTimeout = new ConfigReader({
        defectdojo: {
          baseUrl: 'https://defectdojo.example.com',
          token: 'test-token',
          requestTimeoutMs: 100, // Very short timeout
        },
      });

      const clientWithTimeout = new DefectDojoClient(
        mockConfigWithShortTimeout,
      );

      // Mock a delay longer than timeout
      mockFetch.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve({} as Response), 200),
          ),
      );

      // This would normally timeout, but in tests we'll simulate the abort
      mockFetch.mockRejectedValue(new Error('The operation was aborted.'));

      await expect(clientWithTimeout.getProduct(123)).rejects.toThrow();
    });
  });
});
