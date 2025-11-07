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
// Assisted-by: claude-4-sonnet

import { ConfigReader } from '@backstage/config';
import { TechDocsService, TechDocsMetadata } from './service';
import { Entity } from '@backstage/catalog-model';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';
import { LoggerService, DiscoveryService } from '@backstage/backend-plugin-api';

describe('TechDocsService', () => {
  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  } as unknown as LoggerService;

  const mockDiscovery = {
    getBaseUrl: jest.fn().mockResolvedValue('http://localhost:7007/api'),
  } as unknown as DiscoveryService;

  const mockConfig = new ConfigReader({
    app: {
      baseUrl: 'http://localhost:3000',
    },
    backend: {
      baseUrl: 'http://localhost:7007',
      auth: {
        externalAccess: [
          {
            type: 'static',
            options: {
              token: 'mock-static-token',
              subject: 'mcp-clients',
            },
          },
        ],
      },
    },
  });

  const mockAuth = {
    getOwnServiceCredentials: jest.fn().mockResolvedValue({
      token: 'mock-service-token',
      principal: { subject: 'user:default/test' },
    }),
    getPluginRequestToken: jest.fn().mockResolvedValue({
      token: 'mock-plugin-token',
    }),
  };

  const createMockEntity = (
    name: string,
    kind: string = 'Component',
    hasTechDocs: boolean = false,
    options: Partial<Entity> = {},
  ): Entity => ({
    apiVersion: 'backstage.io/v1alpha1',
    kind,
    metadata: {
      name,
      namespace: 'default',
      title: `${name} title`,
      description: `${name} description`,
      tags: ['test', 'mock'],
      annotations: hasTechDocs ? { 'backstage.io/techdocs-ref': 'dir:.' } : {},
      ...options.metadata,
    },
    spec: {
      type: 'service',
      owner: 'team-test',
      lifecycle: 'production',
      ...options.spec,
    },
  });

  const mockFetch = jest.fn();

  let service: TechDocsService;

  beforeEach(() => {
    service = new TechDocsService(
      mockConfig,
      mockLogger,
      mockDiscovery,
      mockFetch,
    );
    jest.clearAllMocks();
  });

  describe('generateTechDocsUrls', () => {
    it('should generate correct URLs for an entity', async () => {
      const entity = createMockEntity('test-service');
      const urls = await service.generateTechDocsUrls(entity);

      expect(urls).toEqual({
        techDocsUrl:
          'http://localhost:3000/docs/default/component/test-service',
        metadataUrl:
          'http://localhost:7007/api/catalog/entities/by-name/component/default/test-service',
      });
    });

    it('should handle different entity kinds', async () => {
      const entity = createMockEntity('test-api', 'API');
      const urls = await service.generateTechDocsUrls(entity);

      expect(urls).toEqual({
        techDocsUrl: 'http://localhost:3000/docs/default/api/test-api',
        metadataUrl:
          'http://localhost:7007/api/catalog/entities/by-name/api/default/test-api',
      });
    });

    it('should handle different namespaces', async () => {
      const entity = createMockEntity('test-service', 'Component', false, {
        metadata: { name: 'test-service', namespace: 'production' },
      });
      const urls = await service.generateTechDocsUrls(entity);

      expect(urls).toEqual({
        techDocsUrl:
          'http://localhost:3000/docs/production/component/test-service',
        metadataUrl:
          'http://localhost:7007/api/catalog/entities/by-name/component/production/test-service',
      });
    });
  });

  describe('fetchTechDocsMetadata', () => {
    it('should fetch metadata for an entity successfully', async () => {
      const entity = createMockEntity('test-service');
      const mockMetadata: TechDocsMetadata = {
        site_name: 'Test Service Docs',
        site_description: 'Documentation for test service',
        etag: 'abc123',
        build_timestamp: 1609459200,
        files: ['index.html', 'api.html'],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockMetadata),
      });

      const result = await service.fetchTechDocsMetadata(entity);

      expect(result).toEqual(mockMetadata);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/static/docs/default/component/test-service/techdocs_metadata.json',
        { headers: {} },
      );
    });

    it('should handle errors gracefully and return error object', async () => {
      const entity = createMockEntity('test-service');
      mockFetch.mockRejectedValue(new Error('Metadata not found'));

      const result = await service.fetchTechDocsMetadata(entity);

      expect(result.error).toBeDefined();
      expect(result.error).toContain(
        'Failed to fetch TechDocs metadata for Component:default/test-service',
      );
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle different entity kinds and namespaces', async () => {
      const entity = createMockEntity('test-api', 'API', false, {
        metadata: { name: 'test-api', namespace: 'production' },
      });
      const mockMetadata: TechDocsMetadata = {
        site_name: 'Test API Docs',
        site_description: 'API documentation',
        etag: 'xyz789',
        build_timestamp: 1609459200,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockMetadata),
      });

      const result = await service.fetchTechDocsMetadata(entity);

      expect(result).toEqual(mockMetadata);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/static/docs/production/api/test-api/techdocs_metadata.json',
        { headers: {} },
      );
    });

    it('should handle 404 response and return empty object', async () => {
      const entity = createMockEntity('test-service');
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await service.fetchTechDocsMetadata(entity);

      expect(result).toEqual({});
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'TechDocs metadata not found for Component:default/test-service',
      );
    });

    it('should handle non-404 errors and return error in response', async () => {
      const entity = createMockEntity('test-service');
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await service.fetchTechDocsMetadata(entity);

      expect(result.error).toBeDefined();
      expect(result.error).toContain(
        'Failed to fetch TechDocs metadata: 500 Internal Server Error',
      );
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('listTechDocs', () => {
    it('should return entities with TechDocs annotation', async () => {
      const entitiesWithDocs = [
        createMockEntity('service-1', 'Component', true),
        createMockEntity('api-1', 'API', true),
      ];
      const entitiesWithoutDocs = [
        createMockEntity('service-2', 'Component', false),
      ];

      const mockCatalog = catalogServiceMock({
        entities: [...entitiesWithDocs, ...entitiesWithoutDocs],
      });

      // Mock metadata responses
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await service.listTechDocs({}, mockAuth, mockCatalog);

      expect(result.entities).toHaveLength(2);
      expect(result.entities.map(e => e.name)).toContain('service-1');
      expect(result.entities.map(e => e.name)).toContain('api-1');
      expect(result.entities.map(e => e.name)).not.toContain('service-2');
    });

    it('should include URLs and metadata in the response', async () => {
      const entityWithDocs = createMockEntity(
        'service-with-docs',
        'Component',
        true,
      );
      const mockMetadata: TechDocsMetadata = {
        site_name: 'Service with Docs',
        site_description: 'Documentation for service with docs',
        etag: 'abc123',
        build_timestamp: 1609459200,
        files: ['index.html'],
      };

      const mockCatalog = catalogServiceMock({
        entities: [entityWithDocs],
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockMetadata),
      });

      const result = await service.listTechDocs({}, mockAuth, mockCatalog);

      expect(result.entities).toHaveLength(1);
      expect(result.entities[0]).toEqual({
        name: 'service-with-docs',
        title: 'service-with-docs title',
        tags: 'test,mock',
        description: 'service-with-docs description',
        owner: 'team-test',
        lifecycle: 'production',
        namespace: 'default',
        kind: 'Component',
        techDocsUrl:
          'http://localhost:3000/docs/default/component/service-with-docs',
        metadataUrl:
          'http://localhost:7007/api/catalog/entities/by-name/component/default/service-with-docs',
        metadata: {
          lastUpdated: '2021-01-01T00:00:00.000Z',
          buildTimestamp: 1609459200,
          siteName: 'Service with Docs',
          siteDescription: 'Documentation for service with docs',
          etag: 'abc123',
          files: 'index.html',
        },
      });
    });

    it('should handle entities without metadata gracefully', async () => {
      const entityWithDocs = createMockEntity(
        'service-without-metadata',
        'Component',
        true,
      );
      const mockCatalog = catalogServiceMock({
        entities: [entityWithDocs],
      });

      mockFetch.mockResolvedValue({ ok: false, status: 404 });

      const result = await service.listTechDocs({}, mockAuth, mockCatalog);

      expect(result.entities).toHaveLength(1);
      expect(result.entities[0]).toEqual({
        name: 'service-without-metadata',
        title: 'service-without-metadata title',
        tags: 'test,mock',
        description: 'service-without-metadata description',
        owner: 'team-test',
        lifecycle: 'production',
        namespace: 'default',
        kind: 'Component',
        techDocsUrl:
          'http://localhost:3000/docs/default/component/service-without-metadata',
        metadataUrl:
          'http://localhost:7007/api/catalog/entities/by-name/component/default/service-without-metadata',
        metadata: undefined,
      });
    });

    it('should handle empty catalog', async () => {
      const mockCatalog = catalogServiceMock({ entities: [] });
      mockFetch.mockResolvedValue({ ok: false, status: 404 });

      const result = await service.listTechDocs({}, mockAuth, mockCatalog);

      expect(result.entities).toHaveLength(0);
    });

    it('should filter by entity type', async () => {
      const entities = [
        createMockEntity('component-1', 'Component', true),
        createMockEntity('api-1', 'API', true),
        createMockEntity('system-1', 'System', true),
      ];

      const mockCatalog = catalogServiceMock({ entities });
      jest.spyOn(mockCatalog, 'getEntities');
      mockFetch.mockResolvedValue({ ok: false, status: 404 });

      await service.listTechDocs(
        { entityType: 'Component' },
        mockAuth,
        mockCatalog,
      );

      expect(mockCatalog.getEntities).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: { kind: 'Component' },
        }),
        expect.any(Object),
      );
    });

    it('should filter by namespace', async () => {
      const entities = [
        createMockEntity('service-1', 'Component', true, {
          metadata: { name: 'service-1', namespace: 'production' },
        }),
        createMockEntity('service-2', 'Component', true, {
          metadata: { name: 'service-2', namespace: 'staging' },
        }),
      ];

      const mockCatalog = catalogServiceMock({ entities });
      jest.spyOn(mockCatalog, 'getEntities');
      mockFetch.mockResolvedValue({ ok: false, status: 404 });

      await service.listTechDocs(
        { namespace: 'production' },
        mockAuth,
        mockCatalog,
      );

      expect(mockCatalog.getEntities).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: { 'metadata.namespace': 'production' },
        }),
        expect.any(Object),
      );
    });

    it('should filter by owner', async () => {
      const entities = [
        createMockEntity('service-1', 'Component', true, {
          spec: { owner: 'team-a' },
        }),
        createMockEntity('service-2', 'Component', true, {
          spec: { owner: 'team-b' },
        }),
      ];

      const mockCatalog = catalogServiceMock({ entities });
      jest.spyOn(mockCatalog, 'getEntities');
      mockFetch.mockResolvedValue({ ok: false, status: 404 });

      await service.listTechDocs({ owner: 'team-a' }, mockAuth, mockCatalog);

      expect(mockCatalog.getEntities).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: { 'spec.owner': 'team-a' },
        }),
        expect.any(Object),
      );
    });

    it('should filter by lifecycle', async () => {
      const entities = [
        createMockEntity('service-1', 'Component', true, {
          spec: { lifecycle: 'production' },
        }),
        createMockEntity('service-2', 'Component', true, {
          spec: { lifecycle: 'experimental' },
        }),
      ];

      const mockCatalog = catalogServiceMock({ entities });
      jest.spyOn(mockCatalog, 'getEntities');
      mockFetch.mockResolvedValue({ ok: false, status: 404 });

      await service.listTechDocs(
        { lifecycle: 'production' },
        mockAuth,
        mockCatalog,
      );

      expect(mockCatalog.getEntities).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: { 'spec.lifecycle': 'production' },
        }),
        expect.any(Object),
      );
    });

    it('should filter by tags', async () => {
      const entities = [
        createMockEntity('service-1', 'Component', true, {
          metadata: { name: 'service-1', tags: ['frontend', 'react'] },
        }),
        createMockEntity('service-2', 'Component', true, {
          metadata: { name: 'service-2', tags: ['backend', 'node'] },
        }),
      ];

      const mockCatalog = catalogServiceMock({ entities });
      jest.spyOn(mockCatalog, 'getEntities');
      mockFetch.mockResolvedValue({ ok: false, status: 404 });

      await service.listTechDocs({ tags: 'frontend' }, mockAuth, mockCatalog);

      expect(mockCatalog.getEntities).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: { 'metadata.tags': ['frontend'] },
        }),
        expect.any(Object),
      );
    });

    it('should handle multiple filters', async () => {
      const entities = [
        createMockEntity('service-1', 'Component', true, {
          metadata: { name: 'service-1', namespace: 'production' },
          spec: { owner: 'team-a', lifecycle: 'production' },
        }),
      ];

      const mockCatalog = catalogServiceMock({ entities });
      jest.spyOn(mockCatalog, 'getEntities');
      mockFetch.mockResolvedValue({ ok: false, status: 404 });

      await service.listTechDocs(
        {
          entityType: 'Component',
          namespace: 'production',
          owner: 'team-a',
          lifecycle: 'production',
        },
        mockAuth,
        mockCatalog,
      );

      expect(mockCatalog.getEntities).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: {
            kind: 'Component',
            'metadata.namespace': 'production',
            'spec.owner': 'team-a',
            'spec.lifecycle': 'production',
          },
        }),
        expect.any(Object),
      );
    });

    it('should respect limit option', async () => {
      const entities = [createMockEntity('service-1', 'Component', true)];
      const mockCatalog = catalogServiceMock({ entities });
      jest.spyOn(mockCatalog, 'getEntities');
      mockFetch.mockResolvedValue({ ok: false, status: 404 });

      await service.listTechDocs({ limit: 100 }, mockAuth, mockCatalog);

      expect(mockCatalog.getEntities).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 100,
        }),
        expect.any(Object),
      );
    });

    it('should use default limit when not specified', async () => {
      const entities = [createMockEntity('service-1', 'Component', true)];
      const mockCatalog = catalogServiceMock({ entities });
      jest.spyOn(mockCatalog, 'getEntities');
      mockFetch.mockResolvedValue({ ok: false, status: 404 });

      await service.listTechDocs({}, mockAuth, mockCatalog);

      expect(mockCatalog.getEntities).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 500,
        }),
        expect.any(Object),
      );
    });
  });

  describe('analyzeCoverage', () => {
    it('should calculate correct coverage percentage', async () => {
      const entities = [
        createMockEntity('service-1', 'Component', true),
        createMockEntity('service-2', 'Component', false),
        createMockEntity('service-3', 'Component', true),
        createMockEntity('service-4', 'Component', false),
      ];

      const mockCatalog = catalogServiceMock({ entities });

      const result = await service.analyzeCoverage({}, mockAuth, mockCatalog);

      expect(result).toEqual({
        totalEntities: 4,
        entitiesWithDocs: 2,
        coveragePercentage: 50.0,
      });
    });

    it('should handle 100% coverage', async () => {
      const entities = [
        createMockEntity('service-1', 'Component', true),
        createMockEntity('service-2', 'Component', true),
      ];

      const mockCatalog = catalogServiceMock({ entities });

      const result = await service.analyzeCoverage({}, mockAuth, mockCatalog);

      expect(result).toEqual({
        totalEntities: 2,
        entitiesWithDocs: 2,
        coveragePercentage: 100.0,
      });
    });

    it('should handle 0% coverage', async () => {
      const entities = [
        createMockEntity('service-1', 'Component', false),
        createMockEntity('service-2', 'Component', false),
      ];

      const mockCatalog = catalogServiceMock({ entities });

      const result = await service.analyzeCoverage({}, mockAuth, mockCatalog);

      expect(result).toEqual({
        totalEntities: 2,
        entitiesWithDocs: 0,
        coveragePercentage: 0.0,
      });
    });

    it('should handle empty catalog', async () => {
      const mockCatalog = catalogServiceMock({ entities: [] });

      const result = await service.analyzeCoverage({}, mockAuth, mockCatalog);

      expect(result).toEqual({
        totalEntities: 0,
        entitiesWithDocs: 0,
        coveragePercentage: 0,
      });
    });

    it('should round coverage percentage to 1 decimal place', async () => {
      const entities = [
        createMockEntity('service-1', 'Component', true),
        createMockEntity('service-2', 'Component', false),
        createMockEntity('service-3', 'Component', false),
      ];

      const mockCatalog = catalogServiceMock({ entities });

      const result = await service.analyzeCoverage({}, mockAuth, mockCatalog);

      expect(result.coveragePercentage).toBe(33.3);
    });

    it('should apply filters correctly', async () => {
      const entities = [
        createMockEntity('component-1', 'Component', true, {
          metadata: { name: 'component-1', namespace: 'production' },
          spec: { owner: 'team-a', lifecycle: 'production' },
        }),
        createMockEntity('component-2', 'Component', false, {
          metadata: { name: 'component-2', namespace: 'production' },
          spec: { owner: 'team-a', lifecycle: 'production' },
        }),
        createMockEntity('api-1', 'API', true, {
          metadata: { name: 'api-1', namespace: 'staging' },
          spec: { owner: 'team-b', lifecycle: 'experimental' },
        }),
      ];

      const mockCatalog = catalogServiceMock({ entities });
      jest.spyOn(mockCatalog, 'getEntities');

      await service.analyzeCoverage(
        {
          entityType: 'Component',
          namespace: 'production',
        },
        mockAuth,
        mockCatalog,
      );

      expect(mockCatalog.getEntities).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: {
            kind: 'Component',
            'metadata.namespace': 'production',
          },
        }),
        expect.any(Object),
      );
    });

    it('should log coverage analysis results', async () => {
      const entities = [
        createMockEntity('service-1', 'Component', true),
        createMockEntity('service-2', 'Component', false),
      ];

      const mockCatalog = catalogServiceMock({ entities });

      await service.analyzeCoverage({}, mockAuth, mockCatalog);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Analyzing TechDocs coverage...',
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Coverage analysis complete: 1/2 entities (50.0%) have TechDocs',
      );
    });
  });

  describe('error handling', () => {
    it('should handle catalog service errors in listTechDocs', async () => {
      const mockCatalog = {
        getEntities: jest
          .fn()
          .mockRejectedValue(new Error('Catalog service error')),
      };

      await expect(
        service.listTechDocs({}, mockAuth, mockCatalog as any),
      ).rejects.toThrow('Catalog service error');
    });

    it('should handle catalog service errors in analyzeCoverage', async () => {
      const mockCatalog = {
        getEntities: jest
          .fn()
          .mockRejectedValue(new Error('Catalog service error')),
      };

      await expect(
        service.analyzeCoverage({}, mockAuth, mockCatalog as any),
      ).rejects.toThrow('Catalog service error');
    });
  });

  describe('retrieveTechDocsContent', () => {
    beforeEach(() => {
      mockFetch.mockClear();
      mockDiscovery.getBaseUrl = jest
        .fn()
        .mockResolvedValue('http://localhost:7007/api/techdocs');
    });

    it('should retrieve HTML content for entity', async () => {
      const mockEntity = createMockEntity('test-service', 'Component', true);
      const mockCatalog = {
        getEntityByRef: jest.fn().mockResolvedValue(mockEntity),
      };

      const mockHtmlContent =
        '<html><head><title>Test Service Docs</title></head><body><h1>Welcome</h1></body></html>';

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue(mockHtmlContent),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            site_name: 'Test Service Docs',
            site_description: 'Documentation for test service',
            build_timestamp: 1705313400,
          }),
        });

      const result = await service.retrieveTechDocsContent(
        'component:default/test-service',
        'index.html',
        mockAuth,
        mockCatalog as any,
      );

      expect(result).toEqual({
        entityRef: 'component:default/test-service',
        name: 'test-service',
        title: 'test-service title',
        kind: 'component',
        namespace: 'default',
        content: 'Test Service Docs\n\n# Welcome',
        pageTitle: 'Test Service Docs',
        path: 'index.html',
        contentType: 'text',
        lastModified: '2024-01-15T10:10:00.000Z',
        metadata: {
          lastUpdated: '2024-01-15T10:10:00.000Z',
          buildTimestamp: 1705313400,
          siteName: 'Test Service Docs',
          siteDescription: 'Documentation for test service',
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/techdocs/static/docs/default/component/test-service/index.html',
        {
          headers: {
            Authorization: 'Bearer mock-plugin-token',
          },
        },
      );
    });

    it('should handle markdown content type', async () => {
      const mockEntity = createMockEntity('test-service', 'Component', true);
      const mockCatalog = {
        getEntityByRef: jest.fn().mockResolvedValue(mockEntity),
      };

      const mockMarkdownContent =
        '# Test Service\n\nThis is the documentation.';
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue(mockMarkdownContent),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        });

      const result = await service.retrieveTechDocsContent(
        'component:default/test-service',
        'docs/guide.md',
        mockAuth,
        mockCatalog as any,
      );

      expect(result?.contentType).toBe('markdown');
      expect(result?.content).toBe(mockMarkdownContent);
      expect(result?.path).toBe('docs/guide.md');
    });

    it('should use default index.html when no page path specified', async () => {
      const mockEntity = createMockEntity('test-service', 'Component', true);
      const mockCatalog = {
        getEntityByRef: jest.fn().mockResolvedValue(mockEntity),
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue('<html></html>'),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        });

      await service.retrieveTechDocsContent(
        'component:default/test-service',
        undefined,
        mockAuth,
        mockCatalog as any,
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/techdocs/static/docs/default/component/test-service/index.html',
        {
          headers: {
            Authorization: 'Bearer mock-plugin-token',
          },
        },
      );
    });

    it('should handle entity without TechDocs configured', async () => {
      const mockEntity = createMockEntity('test-service', 'Component', false);
      const mockCatalog = {
        getEntityByRef: jest.fn().mockResolvedValue(mockEntity),
      };

      const result = await service.retrieveTechDocsContent(
        'component:default/test-service',
        'index.html',
        mockAuth,
        mockCatalog as any,
      );

      expect(result.error).toBeDefined();
      expect(result.error).toContain('does not have TechDocs configured');
    });

    it('should handle 401 unauthorized error', async () => {
      const mockEntity = createMockEntity('test-service', 'Component', true);
      const mockCatalog = {
        getEntityByRef: jest.fn().mockResolvedValue(mockEntity),
      };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      const result = await service.retrieveTechDocsContent(
        'component:default/test-service',
        'index.html',
        mockAuth,
        mockCatalog as any,
      );

      expect(result.error).toBeDefined();
      expect(result.error).toContain(
        'Failed to fetch TechDocs content: 401 Unauthorized',
      );
    });

    it('should handle 500 server error', async () => {
      const mockEntity = createMockEntity('test-service', 'Component', true);
      const mockCatalog = {
        getEntityByRef: jest.fn().mockResolvedValue(mockEntity),
      };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await service.retrieveTechDocsContent(
        'component:default/test-service',
        'index.html',
        mockAuth,
        mockCatalog as any,
      );

      expect(result.error).toBeDefined();
      expect(result.error).toContain(
        'Failed to fetch TechDocs content: 500 Internal Server Error',
      );
    });

    it('should handle 404 response and return error', async () => {
      const mockEntity = createMockEntity('test-service', 'Component', true);
      const mockCatalog = {
        getEntityByRef: jest.fn().mockResolvedValue(mockEntity),
      };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await service.retrieveTechDocsContent(
        'component:default/test-service',
        'index.html',
        mockAuth,
        mockCatalog as any,
      );

      expect(result.error).toBeDefined();
      expect(result.error).toContain(
        'TechDocs content not found for component:default/test-service at path: index.html',
      );
      expect(result.error).toContain(
        'The documentation may not have been built yet',
      );
    });

    it('should handle invalid entity reference format', async () => {
      const result = await service.retrieveTechDocsContent(
        'invalid-ref-format',
        'index.html',
        mockAuth,
        {} as any,
      );

      expect(result.error).toBeDefined();
      expect(result.error).toBe(
        'Invalid entity reference format: invalid-ref-format. Expected format: kind:namespace/name',
      );
    });

    it('should handle entity reference with explicit namespace', async () => {
      const mockEntity = createMockEntity('test-service', 'Component', true, {
        metadata: { name: 'test-service', namespace: 'production' },
      });
      const mockCatalog = {
        getEntityByRef: jest.fn().mockResolvedValue(mockEntity),
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue('<html></html>'),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        });

      await service.retrieveTechDocsContent(
        'component:production/test-service',
        'index.html',
        mockAuth,
        mockCatalog as any,
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/techdocs/static/docs/production/component/test-service/index.html',
        {
          headers: {
            Authorization: 'Bearer mock-plugin-token',
          },
        },
      );
    });

    it('should work without auth service provided', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue('<html></html>'),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        });

      const result = await service.retrieveTechDocsContent(
        'component:default/test-service',
        'index.html',
      );

      expect(result?.entityRef).toBe('component:default/test-service');
      expect(result?.name).toBe('test-service');
      expect(result?.kind).toBe('component');
      expect(result?.namespace).toBe('default');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/techdocs/static/docs/default/component/test-service/index.html',
        { headers: {} },
      );
    });
  });
});
