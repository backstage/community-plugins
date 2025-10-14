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
import { DefectDojoClient } from './client';
import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';

// Mock the discovery and fetch APIs
const mockDiscoveryApi: Partial<DiscoveryApi> = {
  getBaseUrl: jest.fn(),
};

const mockFetchApi: Partial<FetchApi> = {
  fetch: jest.fn(),
};

describe('DefectDojoClient', () => {
  let client: DefectDojoClient;
  let mockFetch: jest.MockedFunction<any>;

  beforeEach(() => {
    client = new DefectDojoClient(
      mockDiscoveryApi as DiscoveryApi,
      mockFetchApi as FetchApi,
    );
    mockFetch = mockFetchApi.fetch as jest.MockedFunction<any>;

    // Setup default mocks
    (
      mockDiscoveryApi.getBaseUrl as jest.MockedFunction<any>
    )?.mockResolvedValue('http://localhost:7007/api/defectdojo');

    jest.clearAllMocks();
  });

  describe('makeRequest', () => {
    it('should make requests with proper headers', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 123, name: 'Test Product' }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await client.getProduct(123);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/defectdojo/v1/products/123',
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue('Not Found'),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await expect(client.getProduct(123)).rejects.toThrow(
        'DefectDojo API error 404: Not Found',
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(client.getProduct(123)).rejects.toThrow('Network error');
    });
  });

  describe('getProduct', () => {
    it('should get product by ID', async () => {
      const mockProduct = { id: 123, name: 'Test Product' };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockProduct),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      const result = await client.getProduct(123);

      expect(result).toEqual(mockProduct);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/defectdojo/v1/products/123',
        expect.any(Object),
      );
    });

    it('should get product by name', async () => {
      const mockProduct = { id: 123, name: 'Test Product' };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockProduct),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      const result = await client.getProduct('Test Product');

      expect(result).toEqual(mockProduct);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/defectdojo/v1/products/Test%20Product',
        expect.any(Object),
      );
    });
  });

  describe('getEngagements', () => {
    it('should get engagements for a product', async () => {
      const mockEngagements = [
        { id: 1, name: 'Production', product: 123 },
        { id: 2, name: 'Staging', product: 123 },
      ];
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ engagements: mockEngagements }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      const result = await client.getEngagements(123);

      expect(result).toEqual(mockEngagements);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/defectdojo/v1/engagements?productId=123',
        expect.any(Object),
      );
    });
  });

  describe('getFindings', () => {
    it('should get findings for a product', async () => {
      const mockFindings = [
        {
          id: 1,
          title: 'SQL Injection',
          severity: 'Critical',
          description: 'A critical vulnerability',
          cwe: 89,
          product: 'Test Product',
          engagement: 'Production',
          url: 'https://defectdojo.example.com/finding/1',
          created: '2024-01-01T00:00:00Z',
        },
      ];
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          total: 1,
          findings: mockFindings,
          next: null,
          previous: null,
        }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      const result = await client.getFindings(123);

      expect(result).toEqual({
        total: 1,
        findings: mockFindings,
        next: null,
        previous: null,
      });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/defectdojo/v1/findings?productId=123',
        expect.any(Object),
      );
    });

    it('should get findings with engagement filter', async () => {
      const mockFindings = [
        {
          id: 1,
          title: 'XSS Vulnerability',
          severity: 'High',
          description: 'Cross-site scripting',
          cwe: 79,
          product: 'Test Product',
          engagement: 'Staging',
          url: 'https://defectdojo.example.com/finding/1',
          created: '2024-01-01T00:00:00Z',
        },
      ];
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          total: 1,
          findings: mockFindings,
          next: null,
          previous: null,
        }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      const result = await client.getFindings(123, 456);

      expect(result).toEqual({
        total: 1,
        findings: mockFindings,
        next: null,
        previous: null,
      });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/defectdojo/v1/findings?productId=123&engagementId=456',
        expect.any(Object),
      );
    });

    it('should handle empty findings response', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          total: 0,
          findings: [],
          next: null,
          previous: null,
        }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      const result = await client.getFindings(123);

      expect(result).toEqual({
        total: 0,
        findings: [],
        next: null,
        previous: null,
      });
    });
  });

  describe('error handling', () => {
    it('should handle 401 unauthorized errors', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        text: jest.fn().mockResolvedValue('Unauthorized'),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await expect(client.getFindings(123)).rejects.toThrow(
        'DefectDojo API error 401: Unauthorized',
      );
    });

    it('should handle 403 forbidden errors', async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        text: jest.fn().mockResolvedValue('Forbidden'),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await expect(client.getFindings(123)).rejects.toThrow(
        'DefectDojo API error 403: Forbidden',
      );
    });

    it('should handle 500 server errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal Server Error'),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await expect(client.getFindings(123)).rejects.toThrow(
        'DefectDojo API error 500: Internal Server Error',
      );
    });
  });
});
