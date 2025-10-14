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
import 'express-async-errors';
import express from 'express';
import request from 'supertest';
import { mockServices } from '@backstage/backend-test-utils';
import { ConfigReader } from '@backstage/config';
import { createRouter } from './router';
import { DefectDojoClient } from './services/defectdojoClient';

// Mock the DefectDojoClient
jest.mock('./services/defectdojoClient');
const MockedDefectDojoClient = DefectDojoClient as jest.MockedClass<
  typeof DefectDojoClient
>;

describe('createRouter', () => {
  let app: express.Express;
  let mockClient: jest.Mocked<DefectDojoClient>;

  beforeAll(async () => {
    const config = new ConfigReader({
      defectdojo: {
        baseUrl: 'https://demo.defectdojo.org',
        token: 'test-token',
        requestTimeoutMs: 5000,
        maxPages: 10,
      },
    });

    // Create mock instance
    mockClient = {
      listFindingsByProduct: jest.fn(),
      getProduct: jest.fn(),
      getEngagements: jest.fn(),
    } as unknown as jest.Mocked<DefectDojoClient>;

    MockedDefectDojoClient.mockImplementation(() => mockClient);

    const router = await createRouter({
      config,
      logger: mockServices.logger.mock(),
      httpAuth: mockServices.httpAuth.mock(),
    });

    app = express();
    app.use(router);

    // Add error handler for tests
    app.use(
      (
        err: Error,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction,
      ) => {
        if (err.name === 'InputError') {
          res.status(400).json({ error: err.message });
        } else if (err.name === 'NotFoundError') {
          res.status(404).json({ error: err.message });
        } else {
          res.status(500).json({ error: err.message });
        }
      },
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('returns ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /v1/findings', () => {
    it('returns 400 when productId is missing', async () => {
      const response = await request(app).get('/v1/findings');

      expect(response.status).toEqual(400);
      expect(response.body.error).toContain(
        'productId query parameter is required',
      );
    }, 10000);

    it('returns 400 when productId is invalid', async () => {
      const response = await request(app).get('/v1/findings?productId=invalid');

      expect(response.status).toEqual(400);
      expect(response.body.error).toContain('Invalid product ID');
    }, 10000);

    it('returns 400 when productId is negative', async () => {
      const response = await request(app).get('/v1/findings?productId=-1');

      expect(response.status).toEqual(400);
      expect(response.body.error).toContain('Invalid product ID');
    }, 10000);

    it('returns 400 when productId is zero', async () => {
      const response = await request(app).get('/v1/findings?productId=0');

      expect(response.status).toEqual(400);
      expect(response.body.error).toContain('Invalid product ID');
    }, 10000);

    it('returns findings when valid productId provided', async () => {
      const mockResponse = {
        results: [
          {
            id: 1,
            title: 'SQL Injection',
            severity: 'Critical',
            description: 'A critical vulnerability',
            cwe: 89,
            url: 'https://defectdojo.example.com/finding/1',
            created: '2024-01-01T00:00:00Z',
          },
        ],
        count: 1,
        next: null,
        previous: null,
      };

      mockClient.listFindingsByProduct.mockResolvedValue(mockResponse);

      const response = await request(app).get('/v1/findings?productId=123');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        total: 1,
        findings: [
          {
            id: 1,
            title: 'SQL Injection',
            severity: 'Critical',
            url: 'https://defectdojo.example.com/finding/1',
            description: 'A critical vulnerability',
            cwe: 89,
            product: 'N/A',
            engagement: 'N/A',
            created: '2024-01-01T00:00:00Z',
          },
        ],
        tookMs: expect.any(Number),
        next: null,
        previous: null,
      });

      expect(mockClient.listFindingsByProduct).toHaveBeenCalledWith(
        123,
        undefined,
        { limit: undefined, offset: undefined },
      );
    });

    it('returns findings with engagement filter', async () => {
      const mockResponse = {
        results: [
          {
            id: 1,
            title: 'XSS Vulnerability',
            severity: 'High',
            description: 'Cross-site scripting',
            cwe: 79,
            created: '2024-01-01T00:00:00Z',
          },
        ],
        count: 1,
        next: null,
        previous: null,
      };

      mockClient.listFindingsByProduct.mockResolvedValue(mockResponse);

      const response = await request(app).get(
        '/v1/findings?productId=123&engagementId=456',
      );

      expect(response.status).toEqual(200);
      expect(mockClient.listFindingsByProduct).toHaveBeenCalledWith(123, 456, {
        limit: undefined,
        offset: undefined,
      });
    });

    it('returns 400 when engagementId is invalid', async () => {
      const response = await request(app).get(
        '/v1/findings?productId=123&engagementId=invalid',
      );

      expect(response.status).toEqual(400);
      expect(response.body.error).toContain('Invalid engagement ID');
    }, 10000);

    it('accepts pagination parameters', async () => {
      const mockResponse = {
        results: [
          {
            id: 1,
            title: 'Finding 1',
            severity: 'High',
            description: 'Test finding',
            cwe: 79,
            created: '2024-01-01T00:00:00Z',
          },
        ],
        count: 100,
        next: 'http://api.example.com/findings/?offset=25',
        previous: null,
      };

      mockClient.listFindingsByProduct.mockResolvedValue(mockResponse);

      const response = await request(app).get(
        '/v1/findings?productId=123&limit=25&offset=0',
      );

      expect(response.status).toEqual(200);
      expect(mockClient.listFindingsByProduct).toHaveBeenCalledWith(
        123,
        undefined,
        { limit: 25, offset: 0 },
      );
      expect(response.body.total).toEqual(100);
      expect(response.body.next).toEqual(
        'http://api.example.com/findings/?offset=25',
      );
    });

    it('returns 400 when limit is invalid', async () => {
      const response = await request(app).get(
        '/v1/findings?productId=123&limit=-1',
      );

      expect(response.status).toEqual(400);
      expect(response.body.error).toContain('Invalid limit');
    }, 10000);

    it('returns 400 when offset is invalid', async () => {
      const response = await request(app).get(
        '/v1/findings?productId=123&offset=-1',
      );

      expect(response.status).toEqual(400);
      expect(response.body.error).toContain('Invalid offset');
    }, 10000);

    it('handles API errors gracefully', async () => {
      mockClient.listFindingsByProduct.mockRejectedValue(
        new Error('API Error'),
      );

      const response = await request(app).get('/v1/findings?productId=123');

      expect(response.status).toEqual(500);
      expect(response.body.error).toContain('API Error');
    }, 10000);
  });

  describe('GET /v1/products/:identifier', () => {
    it('returns product by ID', async () => {
      const mockProduct = {
        id: 123,
        name: 'Test Product',
        description: 'A test product',
      };

      mockClient.getProduct.mockResolvedValue(mockProduct);

      const response = await request(app).get('/v1/products/123');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(mockProduct);
      expect(mockClient.getProduct).toHaveBeenCalledWith(123);
    });

    it('returns product by name', async () => {
      const mockProduct = {
        id: 123,
        name: 'Test Product',
        description: 'A test product',
      };

      mockClient.getProduct.mockResolvedValue(mockProduct);

      const response = await request(app).get('/v1/products/Test%20Product');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(mockProduct);
      expect(mockClient.getProduct).toHaveBeenCalledWith('Test Product');
    });

    it('returns 404 when product not found', async () => {
      const { NotFoundError } = require('@backstage/errors');
      mockClient.getProduct.mockRejectedValue(
        new NotFoundError('No product found with name: Nonexistent'),
      );

      const response = await request(app).get('/v1/products/Nonexistent');

      // Backstage error middleware will handle NotFoundError and return 404
      expect(response.status).toEqual(404);
    });
  });

  describe('GET /v1/engagements', () => {
    it('returns engagements for a product', async () => {
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

      mockClient.getEngagements.mockResolvedValue(mockEngagements);

      const response = await request(app).get('/v1/engagements?productId=123');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ engagements: mockEngagements });
      expect(mockClient.getEngagements).toHaveBeenCalledWith(123);
    });

    it('returns 400 when productId is missing', async () => {
      const response = await request(app).get('/v1/engagements');

      expect(response.status).toEqual(400);
      expect(response.body.error).toContain(
        'productId query parameter is required',
      );
    }, 10000);

    it('returns 400 when productId is invalid', async () => {
      const response = await request(app).get(
        '/v1/engagements?productId=invalid',
      );

      expect(response.status).toEqual(400);
      expect(response.body.error).toContain('Invalid product ID');
    }, 10000);

    it('handles API errors gracefully', async () => {
      mockClient.getEngagements.mockRejectedValue(new Error('API Error'));

      const response = await request(app).get('/v1/engagements?productId=123');

      // Backstage error middleware will handle this
      expect(response.status).toEqual(500);
    }, 10000);
  });
});
