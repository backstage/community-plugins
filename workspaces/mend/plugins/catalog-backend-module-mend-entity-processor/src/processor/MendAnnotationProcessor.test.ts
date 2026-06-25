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
import { Entity } from '@backstage/catalog-model';
import { ConfigReader } from '@backstage/config';
import { MendAnnotationProcessor } from './MendAnnotationProcessor';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import { CacheService, LoggerService } from '@backstage/backend-plugin-api';

const mockLogger: LoggerService = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  child: jest.fn(() => mockLogger),
};

const mockCache: jest.Mocked<CacheService> = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  withOptions: jest.fn(),
};

describe('MendAnnotationProcessor', () => {
  let processor: MendAnnotationProcessor;

  beforeEach(() => {
    jest.clearAllMocks();
    const config = new ConfigReader({
      mend: {
        activationKey: 'test-key',
        cacheRefresh: 240,
      },
    });
    processor = new MendAnnotationProcessor(config, {
      cache: mockCache,
      logger: mockLogger,
    });
  });

  describe('getProcessorName', () => {
    it('returns the correct processor name', () => {
      expect(processor.getProcessorName()).toBe('MendAnnotationProcessor');
    });
  });

  describe('preProcessEntity', () => {
    const location: LocationSpec = {
      type: 'url',
      target: 'https://github.com/org/repo/blob/main/catalog-info.yaml',
    };

    describe('entity filtering', () => {
      it('only processes Component entities', async () => {
        const apiEntity: Entity = {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'API',
          metadata: {
            name: 'my-api',
          },
        };

        const result = await processor.preProcessEntity(
          apiEntity,
          location,
          jest.fn(),
          location,
          {} as any,
        );

        expect(result).toEqual(apiEntity);
        expect(mockCache.get).not.toHaveBeenCalled();
      });

      it('processes Component entities', async () => {
        const componentEntity: Entity = {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'my-component',
            annotations: {
              'backstage.io/source-location': 'url:https://github.com/org/repo',
            },
          },
        };

        mockCache.get.mockResolvedValue({
          urlToProjectIdsMap: {
            'https://github.com/org/repo': ['project-1'],
          },
          lastFetched: Date.now(),
          fetchCompleted: true,
        });

        const result = await processor.preProcessEntity(
          componentEntity,
          location,
          jest.fn(),
          location,
          {} as any,
        );

        expect(result.kind).toBe('Component');
        expect(mockCache.get).toHaveBeenCalled();
      });

      it('does not process entities that already have mend.io/project-ids annotation', async () => {
        const entityWithAnnotation: Entity = {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'my-component',
            annotations: {
              'mend.io/project-ids': 'existing-project-1,existing-project-2',
              'backstage.io/source-location': 'url:https://github.com/org/repo',
            },
          },
        };

        const result = await processor.preProcessEntity(
          entityWithAnnotation,
          location,
          jest.fn(),
          location,
          {} as any,
        );

        expect(result).toEqual(entityWithAnnotation);
        expect(mockCache.get).not.toHaveBeenCalled();
      });
    });

    describe('source location handling', () => {
      it('handles entities without source-location annotation', async () => {
        const entity: Entity = {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'my-component',
          },
        };

        const result = await processor.preProcessEntity(
          entity,
          location,
          jest.fn(),
          location,
          {} as any,
        );

        expect(result.metadata.annotations).toEqual({});
        expect(result.metadata.name).toBe('my-component');
        expect(mockCache.get).not.toHaveBeenCalled();
      });

      it('handles entities with invalid source-location format', async () => {
        const entity: Entity = {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'my-component',
            annotations: {
              'backstage.io/source-location': 'invalid-url',
            },
          },
        };

        const result = await processor.preProcessEntity(
          entity,
          location,
          jest.fn(),
          location,
          {} as any,
        );

        expect(result).toEqual(entity);
        expect(mockCache.get).not.toHaveBeenCalled();
      });

      it('extracts repo URL from GitHub source-location', async () => {
        const entity: Entity = {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'my-component',
            annotations: {
              'backstage.io/source-location':
                'url:https://github.com/backstage/backstage/blob/master/catalog-info.yaml',
            },
          },
        };

        mockCache.get.mockResolvedValue({
          urlToProjectIdsMap: {
            'https://github.com/backstage/backstage': ['project-123'],
          },
          lastFetched: Date.now(),
          fetchCompleted: true,
        });

        const result = await processor.preProcessEntity(
          entity,
          location,
          jest.fn(),
          location,
          {} as any,
        );

        expect(result.metadata.annotations?.['mend.io/project-ids']).toBe(
          'project-123',
        );
      });

      it('extracts repo URL from GitLab source-location', async () => {
        const entity: Entity = {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'my-component',
            annotations: {
              'backstage.io/source-location':
                'url:https://gitlab.com/group/subgroup/project/-/blob/main/catalog-info.yaml',
            },
          },
        };

        mockCache.get.mockResolvedValue({
          urlToProjectIdsMap: {
            'https://gitlab.com/group/subgroup/project': ['project-456'],
          },
          lastFetched: Date.now(),
          fetchCompleted: true,
        });

        const result = await processor.preProcessEntity(
          entity,
          location,
          jest.fn(),
          location,
          {} as any,
        );

        expect(result.metadata.annotations?.['mend.io/project-ids']).toBe(
          'project-456',
        );
      });

      it('extracts repo URL from Azure DevOps source-location', async () => {
        const entity: Entity = {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'my-component',
            annotations: {
              'backstage.io/source-location':
                'url:https://dev.azure.com/org/project/_git/repo',
            },
          },
        };

        mockCache.get.mockResolvedValue({
          urlToProjectIdsMap: {
            'https://dev.azure.com/org/project/_git/repo': ['project-789'],
          },
          lastFetched: Date.now(),
          fetchCompleted: true,
        });

        const result = await processor.preProcessEntity(
          entity,
          location,
          jest.fn(),
          location,
          {} as any,
        );

        expect(result.metadata.annotations?.['mend.io/project-ids']).toBe(
          'project-789',
        );
      });
    });

    describe('cache interaction', () => {
      it('adds annotation when cache returns project IDs', async () => {
        const entity: Entity = {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'my-component',
            annotations: {
              'backstage.io/source-location': 'url:https://github.com/org/repo',
            },
          },
        };

        mockCache.get.mockResolvedValue({
          urlToProjectIdsMap: {
            'https://github.com/org/repo': ['project-1', 'project-2'],
          },
          lastFetched: Date.now(),
          fetchCompleted: true,
        });

        const result = await processor.preProcessEntity(
          entity,
          location,
          jest.fn(),
          location,
          {} as any,
        );

        expect(result.metadata.annotations?.['mend.io/project-ids']).toBe(
          'project-1,project-2',
        );
        expect(mockLogger.debug).toHaveBeenCalledWith(
          'Found 2 Mend project(s) for entity my-component',
        );
      });

      it('does not add annotation when cache returns null (cache miss)', async () => {
        const entity: Entity = {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'my-component',
            annotations: {
              'backstage.io/source-location':
                'url:https://github.com/org/unknown-repo',
            },
          },
        };

        mockCache.get.mockResolvedValue({
          urlToProjectIdsMap: {},
          lastFetched: Date.now(),
          fetchCompleted: true,
        });

        const result = await processor.preProcessEntity(
          entity,
          location,
          jest.fn(),
          location,
          {} as any,
        );

        expect(
          result.metadata.annotations?.['mend.io/project-ids'],
        ).toBeUndefined();
      });

      it('does not add annotation when cache returns empty array', async () => {
        const entity: Entity = {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'my-component',
            annotations: {
              'backstage.io/source-location': 'url:https://github.com/org/repo',
            },
          },
        };

        mockCache.get.mockResolvedValue({
          urlToProjectIdsMap: {
            'https://github.com/org/repo': [],
          },
          lastFetched: Date.now(),
          fetchCompleted: true,
        });

        const result = await processor.preProcessEntity(
          entity,
          location,
          jest.fn(),
          location,
          {} as any,
        );

        expect(
          result.metadata.annotations?.['mend.io/project-ids'],
        ).toBeUndefined();
      });
    });

    describe('annotation preservation', () => {
      it('preserves existing annotations when adding mend annotation', async () => {
        const entity: Entity = {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'my-component',
            annotations: {
              'backstage.io/source-location': 'url:https://github.com/org/repo',
              'custom.io/annotation': 'custom-value',
            },
          },
        };

        mockCache.get.mockResolvedValue({
          urlToProjectIdsMap: {
            'https://github.com/org/repo': ['project-1'],
          },
          lastFetched: Date.now(),
          fetchCompleted: true,
        });

        const result = await processor.preProcessEntity(
          entity,
          location,
          jest.fn(),
          location,
          {} as any,
        );

        expect(result.metadata.annotations).toEqual({
          'backstage.io/source-location': 'url:https://github.com/org/repo',
          'custom.io/annotation': 'custom-value',
          'mend.io/project-ids': 'project-1',
        });
      });

      it('handles entities with no existing annotations', async () => {
        const entity: Entity = {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'my-component',
          },
        };

        const result = await processor.preProcessEntity(
          entity,
          location,
          jest.fn(),
          location,
          {} as any,
        );

        expect(result.metadata.annotations).toEqual({});
        expect(result.metadata.name).toBe('my-component');
      });
    });

    describe('multiple project IDs', () => {
      it('joins multiple project IDs with comma', async () => {
        const entity: Entity = {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'my-component',
            annotations: {
              'backstage.io/source-location':
                'url:https://github.com/org/monorepo',
            },
          },
        };

        mockCache.get.mockResolvedValue({
          urlToProjectIdsMap: {
            'https://github.com/org/monorepo': [
              'project-1',
              'project-2',
              'project-3',
            ],
          },
          lastFetched: Date.now(),
          fetchCompleted: true,
        });

        const result = await processor.preProcessEntity(
          entity,
          location,
          jest.fn(),
          location,
          {} as any,
        );

        expect(result.metadata.annotations?.['mend.io/project-ids']).toBe(
          'project-1,project-2,project-3',
        );
      });
    });
  });
});
