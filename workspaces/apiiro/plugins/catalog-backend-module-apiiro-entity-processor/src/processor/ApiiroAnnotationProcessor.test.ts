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
import fetch from 'node-fetch';
import {
  APIIRO_METRICS_VIEW_ANNOTATION,
  APIIRO_PROJECT_ANNOTATION,
} from '@backstage-community/plugin-apiiro-common';

jest.mock('node-fetch');
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const BACKSTAGE_SOURCE_LOCATION_ANNOTATION = 'backstage.io/source-location';

describe('ApiiroAnnotationProcessor', () => {
  const mockLocation: LocationSpec = {
    type: 'url',
    target: 'https://example.com',
  };
  const mockOriginLocation: LocationSpec = mockLocation;
  const mockEmit: CatalogProcessorEmit = jest.fn();
  const mockCache: CatalogProcessorCache = {
    get: jest.fn(),
    set: jest.fn(),
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
    });
    return new ApiiroAnnotationProcessor(config);
  };

  beforeEach(() => {
    jest.clearAllMocks();
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
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('adds project and metrics annotations when repo is found and allowed', async () => {
      const processor = buildProcessor();

      const mockResponse = {
        items: [
          {
            name: 'test-component',
            key: 'repo-key-123',
            url: 'https://github.com/org/test-repo',
            isDefaultBranch: true,
          },
        ],
        next: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as any);

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
      const processor = buildProcessor();

      jest
        .spyOn(processor as any, 'getRepoKey' as any)
        .mockResolvedValue('new-key');

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
      const processor = buildProcessor({
        annotationControl: {
          exclude: true,
          entityNames: ['component:default/test-component'],
        },
      });

      jest.spyOn(processor as any, 'getRepoKey' as any).mockResolvedValue(null);

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
      const processor = buildProcessor({
        annotationControl: {
          exclude: false,
          entityNames: ['component:default/test-component'],
        },
      });

      jest
        .spyOn(processor as any, 'getRepoKey' as any)
        .mockResolvedValue('new-key');

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

  describe('getAccessToken', () => {
    it('returns undefined when access token is not configured', () => {
      const configWithoutToken = new ConfigReader({
        apiiro: {},
      });

      const processorWithoutToken = new ApiiroAnnotationProcessor(
        configWithoutToken,
      );

      const token = (processorWithoutToken as any).getAccessToken();

      expect(token).toBeUndefined();
    });

    it('returns access token when configured', () => {
      const processor = buildProcessor();

      const token = (processor as any).getAccessToken();

      expect(token).toBe('test-token');
    });
  });
});
