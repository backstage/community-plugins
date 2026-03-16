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
import { ApiiroAnnotationProcessor } from './ApiiroAnnotationProcessor';
import { ConfigReader } from '@backstage/config';
import { Entity } from '@backstage/catalog-model';
import type { LocationSpec } from '@backstage/plugin-catalog-common';
import type {
  CatalogProcessorEmit,
  CatalogProcessorCache,
} from '@backstage/plugin-catalog-node';
import {
  APIIRO_METRICS_VIEW_ANNOTATION,
  APIIRO_PROJECT_ANNOTATION,
  APIIRO_APPLICATION_ANNOTATION,
} from '@backstage-community/plugin-apiiro-common';
import { BACKSTAGE_SOURCE_LOCATION_ANNOTATION } from '../helpers/types';
import { ApiiroApiClient } from '../helpers/apiClient';
import { CacheManager } from '../helpers/cacheManager';
import { CacheService } from '@backstage/backend-plugin-api';

const mockGetRepoKey = jest.fn();
const mockGetApplicationId = jest.fn();
const mockGetEntityUid = jest.fn();

jest.mock('../helpers/apiClient');
jest.mock('../helpers/cacheManager', () => {
  return {
    CacheManager: jest.fn().mockImplementation(() => {
      return {
        getRepoKey: mockGetRepoKey,
        getApplicationId: mockGetApplicationId,
        getEntityUid: mockGetEntityUid,
        refreshRepositoryCacheIfNeeded: jest.fn(),
        refreshApplicationCacheIfNeeded: jest.fn(),
      };
    }),
  };
});

describe('ApiiroAnnotationProcessor', () => {
  const mockLocation: LocationSpec = {
    type: 'url',
    target: 'https://example.com',
  };
  const mockOriginLocation: LocationSpec = mockLocation;
  const mockEmit: CatalogProcessorEmit = jest.fn();

  let cacheStore: Map<string, any>;
  let mockCache: CatalogProcessorCache;
  let mockCacheService: CacheService;

  const createMockCache = (): CatalogProcessorCache => {
    cacheStore = new Map();
    return {
      get: jest.fn().mockImplementation(async (key: string) => {
        return cacheStore.get(key) || null;
      }),
      set: jest.fn().mockImplementation(async (key: string, value: any) => {
        cacheStore.set(key, value);
      }),
    };
  };

  const createMockCacheService = (): CacheService => {
    const cache = new Map();
    return {
      get: jest.fn().mockImplementation(async (key: string) => {
        return cache.get(key) || null;
      }),
      set: jest.fn().mockImplementation(async (key: string, value: any) => {
        cache.set(key, value);
      }),
      delete: jest.fn().mockImplementation(async (key: string) => {
        cache.delete(key);
      }),
      withOptions: jest.fn().mockReturnValue({
        get: jest.fn().mockImplementation(async (key: string) => {
          return cache.get(key) || null;
        }),
        set: jest.fn().mockImplementation(async (key: string, value: any) => {
          cache.set(key, value);
        }),
        delete: jest.fn().mockImplementation(async (key: string) => {
          cache.delete(key);
        }),
      }),
    } as CacheService;
  };

  const buildProcessor = (configOverrides?: Record<string, unknown>) => {
    const config = new ConfigReader({
      apiiro: {
        accessToken: 'test-token',
        annotationControl: {
          exclude: true,
          entityNames: [],
        },
        ...configOverrides,
      },
      app: {
        baseUrl: 'https://backstage.apiiro.com',
      },
    });
    return new ApiiroAnnotationProcessor(config, {
      cache: mockCacheService,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRepoKey.mockReset();
    mockGetApplicationId.mockReset();
    mockGetEntityUid.mockReset();
    mockCache = createMockCache();
    mockCacheService = createMockCacheService();
  });

  describe('getProcessorName', () => {
    it('returns the correct processor name', () => {
      const processor = buildProcessor();

      expect(processor.getProcessorName()).toBe('ApiiroAnnotationProcessor');
    });
  });

  describe('preProcessEntity', () => {
    it('does not process non-Component entities', async () => {
      const processor = buildProcessor();
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: {
          name: 'test-api',
        },
        spec: {},
      };

      const result = await processor.preProcessEntity(
        entity,
        mockLocation,
        mockEmit,
        mockOriginLocation,
        mockCache,
      );

      expect(result).toEqual(entity);
    });

    it('adds project and metrics annotations when repo is found and allowed', async () => {
      mockGetRepoKey.mockResolvedValue('repo-key-123');

      const processor = buildProcessor();

      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test-component',
          namespace: 'default',
          annotations: {
            [BACKSTAGE_SOURCE_LOCATION_ANNOTATION]:
              'url:https://github.com/org/test-repo',
          },
        },
        spec: {},
      };

      const result = await processor.preProcessEntity(
        entity,
        mockLocation,
        mockEmit,
        mockOriginLocation,
        mockCache,
      );

      expect(result.metadata.annotations).toBeDefined();
      expect(result.metadata.annotations![APIIRO_PROJECT_ANNOTATION]).toBe(
        'repo-key-123',
      );
      expect(result.metadata.annotations![APIIRO_METRICS_VIEW_ANNOTATION]).toBe(
        'true',
      );
    });

    it('does not override existing Apiiro annotations', async () => {
      mockGetRepoKey.mockResolvedValue('new-key');

      const processor = buildProcessor();

      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test-component',
          namespace: 'default',
          annotations: {
            [BACKSTAGE_SOURCE_LOCATION_ANNOTATION]:
              'url:https://github.com/org/test-repo',
            [APIIRO_PROJECT_ANNOTATION]: 'existing-key',
            [APIIRO_METRICS_VIEW_ANNOTATION]: 'false',
          },
        },
        spec: {},
      };

      const result = await processor.preProcessEntity(
        entity,
        mockLocation,
        mockEmit,
        mockOriginLocation,
        mockCache,
      );

      expect(result.metadata.annotations![APIIRO_PROJECT_ANNOTATION]).toBe(
        'existing-key',
      );
      expect(result.metadata.annotations![APIIRO_METRICS_VIEW_ANNOTATION]).toBe(
        'false',
      );
    });

    it('respects exclude list in permission control (metrics not added)', async () => {
      mockGetRepoKey.mockResolvedValue(null);

      const processor = buildProcessor({
        annotationControl: {
          exclude: true,
          entityNames: ['component:default/test-component'],
        },
      });

      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test-component',
          namespace: 'default',
          annotations: {
            [BACKSTAGE_SOURCE_LOCATION_ANNOTATION]:
              'url:https://github.com/org/test-repo',
          },
        },
        spec: {},
      };

      const result = await processor.preProcessEntity(
        entity,
        mockLocation,
        mockEmit,
        mockOriginLocation,
        mockCache,
      );

      expect(
        result.metadata.annotations?.[APIIRO_METRICS_VIEW_ANNOTATION],
      ).toBeUndefined();
    });

    it('respects include list in permission control (metrics added)', async () => {
      mockGetRepoKey.mockResolvedValue('new-key');

      const processor = buildProcessor({
        annotationControl: {
          exclude: false,
          entityNames: ['component:default/test-component'],
        },
      });

      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test-component',
          namespace: 'default',
          annotations: {
            [BACKSTAGE_SOURCE_LOCATION_ANNOTATION]:
              'url:https://github.com/org/test-repo',
          },
        },
        spec: {},
      };

      const result = await processor.preProcessEntity(
        entity,
        mockLocation,
        mockEmit,
        mockOriginLocation,
        mockCache,
      );

      expect(
        result.metadata.annotations?.[APIIRO_METRICS_VIEW_ANNOTATION],
      ).toBe('true');
    });
  });

  describe('System entity processing', () => {
    it('does not add application annotation when applications view is disabled', async () => {
      const processor = buildProcessor({
        enableApplicationsView: false,
      });

      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'System',
        metadata: {
          name: 'test-system',
          namespace: 'default',
        },
        spec: {},
      };

      const result = await processor.preProcessEntity(
        entity,
        mockLocation,
        mockEmit,
        mockOriginLocation,
        mockCache,
      );

      expect(
        result.metadata.annotations?.[APIIRO_APPLICATION_ANNOTATION],
      ).toBeUndefined();
    });

    it('adds application annotation when applications view is enabled and app is found', async () => {
      mockGetEntityUid.mockResolvedValue('test-uid-123');
      mockGetApplicationId.mockResolvedValue('app-key-456');

      const processor = buildProcessor({
        enableApplicationsView: true,
      });

      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'System',
        metadata: {
          name: 'test-system',
          namespace: 'default',
          uid: 'test-uid-123',
        },
        spec: {},
      };

      const result = await processor.preProcessEntity(
        entity,
        mockLocation,
        mockEmit,
        mockOriginLocation,
        mockCache,
      );

      expect(result.metadata.annotations).toBeDefined();
      expect(result.metadata.annotations![APIIRO_APPLICATION_ANNOTATION]).toBe(
        'app-key-456',
      );
      expect(result.metadata.annotations![APIIRO_METRICS_VIEW_ANNOTATION]).toBe(
        'true',
      );
    });
  });

  describe('Module integration', () => {
    it('initializes ApiiroApiClient with access token from config', () => {
      buildProcessor();

      expect(ApiiroApiClient).toHaveBeenCalledWith('test-token');
    });

    it('initializes CacheManager with ApiiroApiClient, backstage URL, and CacheService', () => {
      buildProcessor();

      expect(CacheManager).toHaveBeenCalledWith(
        expect.any(Object),
        'https://backstage.apiiro.com',
        mockCacheService,
        undefined,
        undefined,
      );
    });
  });
});
