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
import type { Entity } from '@backstage/catalog-model';
import type { CatalogProcessorCache } from '@backstage/plugin-catalog-node';
import { mockServices } from '@backstage/backend-test-utils';

import { ScaffolderRelationEntityProcessor } from './ScaffolderRelationEntityProcessor';

describe('ScaffolderRelationEntityProcessor', () => {
  describe('preProcessEntity', () => {
    const mockEventsService = mockServices.events.mock();
    const processor = new ScaffolderRelationEntityProcessor(mockEventsService);
    const location = { type: 'url', target: 'test-url' };
    const emit = jest.fn();
    const mockCache: CatalogProcessorCache = {
      get: jest.fn(),
      set: jest.fn(),
    };

    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
      jest.clearAllMocks();
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it('should return early for non-Template entities', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'test-component' },
      };

      const result = await processor.preProcessEntity(
        entity,
        location,
        emit,
        location,
        mockCache,
      );

      expect(result).toBe(entity);
      expect(mockCache.get).not.toHaveBeenCalled();
      expect(mockCache.set).not.toHaveBeenCalled();
    });

    it('should return early for Template entities without version annotation', async () => {
      const entity: Entity = {
        apiVersion: 'scaffolder.backstage.io/v1beta3',
        kind: 'Template',
        metadata: {
          name: 'test-template',
          annotations: {
            'other.annotation': 'value',
          },
        },
      };

      const result = await processor.preProcessEntity(
        entity,
        location,
        emit,
        location,
        mockCache,
      );

      expect(result).toBe(entity);
      expect(mockCache.get).not.toHaveBeenCalled();
      expect(mockCache.set).not.toHaveBeenCalled();
    });

    it('should handle Template entity with version annotation for the first time', async () => {
      const entity: Entity = {
        apiVersion: 'scaffolder.backstage.io/v1beta3',
        kind: 'Template',
        metadata: {
          name: 'test-template',
          annotations: {
            'backstage.io/template-version': '1.0.0',
          },
        },
      };

      (mockCache.get as jest.Mock).mockResolvedValue(undefined);

      await processor.preProcessEntity(
        entity,
        location,
        emit,
        location,
        mockCache,
      );

      expect(mockCache.get).toHaveBeenCalledWith(
        'template-version-template:default/test-template',
      );
      expect(mockCache.set).toHaveBeenCalledWith(
        'template-version-template:default/test-template',
        {
          version: '1.0.0',
        },
      );
    });

    it('should detect version update and publish event when cached version is different', async () => {
      const entity: Entity = {
        apiVersion: 'scaffolder.backstage.io/v1beta3',
        kind: 'Template',
        metadata: {
          name: 'test-template',
          annotations: {
            'backstage.io/template-version': '2.0.0',
          },
        },
      };

      const cachedData = { version: '1.0.0' };
      (mockCache.get as jest.Mock).mockResolvedValue(cachedData);

      const result = await processor.preProcessEntity(
        entity,
        location,
        emit,
        location,
        mockCache,
      );

      expect(result).toBe(entity);
      expect(mockCache.get).toHaveBeenCalledWith(
        'template-version-template:default/test-template',
      );
      expect(mockCache.set).toHaveBeenCalledWith(
        'template-version-template:default/test-template',
        {
          version: '2.0.0',
        },
      );
      expect(mockEventsService.publish).toHaveBeenCalledWith({
        topic: 'relationProcessor.template:version_updated',
        eventPayload: {
          entityRef: 'template:default/test-template',
          previousVersion: '1.0.0',
          currentVersion: '2.0.0',
        },
      });
    });

    it('should not publish event when cached version is the same', async () => {
      const entity: Entity = {
        apiVersion: 'scaffolder.backstage.io/v1beta3',
        kind: 'Template',
        metadata: {
          name: 'test-template',
          annotations: {
            'backstage.io/template-version': '1.0.0',
          },
        },
      };

      const cachedData = { version: '1.0.0' };
      (mockCache.get as jest.Mock).mockResolvedValue(cachedData);

      const result = await processor.preProcessEntity(
        entity,
        location,
        emit,
        location,
        mockCache,
      );

      expect(result).toBe(entity);
      expect(mockCache.get).toHaveBeenCalledWith(
        'template-version-template:default/test-template',
      );
      expect(mockCache.set).toHaveBeenCalledWith(
        'template-version-template:default/test-template',
        {
          version: '1.0.0',
        },
      );
      expect(mockEventsService.publish).not.toHaveBeenCalled();
    });

    it('should handle template with namespace', async () => {
      const entity: Entity = {
        apiVersion: 'scaffolder.backstage.io/v1beta3',
        kind: 'Template',
        metadata: {
          name: 'test-template',
          namespace: 'custom-namespace',
          annotations: {
            'backstage.io/template-version': '1.0.0',
          },
        },
      };

      (mockCache.get as jest.Mock).mockResolvedValue(undefined);

      const result = await processor.preProcessEntity(
        entity,
        location,
        emit,
        location,
        mockCache,
      );

      expect(result).toBe(entity);
      expect(mockCache.get).toHaveBeenCalledWith(
        'template-version-template:custom-namespace/test-template',
      );
      expect(mockCache.set).toHaveBeenCalledWith(
        'template-version-template:custom-namespace/test-template',
        {
          version: '1.0.0',
        },
      );
    });

    it('should work without events service for backwards compatibility', async () => {
      const processorWithoutEvents = new ScaffolderRelationEntityProcessor();
      const entity: Entity = {
        apiVersion: 'scaffolder.backstage.io/v1beta3',
        kind: 'Template',
        metadata: {
          name: 'test-template',
          annotations: {
            'backstage.io/template-version': '2.0.0',
          },
        },
      };

      const cachedData = { version: '1.0.0' };
      (mockCache.get as jest.Mock).mockResolvedValue(cachedData);

      const result = await processorWithoutEvents.preProcessEntity(
        entity,
        location,
        emit,
        location,
        mockCache,
      );

      expect(result).toBe(entity);
      expect(mockCache.set).toHaveBeenCalledWith(
        'template-version-template:default/test-template',
        {
          version: '2.0.0',
        },
      );
    });

    it('should not change the cached version if the event service fails', async () => {
      const entity: Entity = {
        apiVersion: 'scaffolder.backstage.io/v1beta3',
        kind: 'Template',
        metadata: {
          name: 'test-template',
          annotations: {
            'backstage.io/template-version': '2.0.0',
          },
        },
      };

      const cachedData = { version: '1.0.0' };
      (mockCache.get as jest.Mock).mockResolvedValue(cachedData);

      // Mock event service to throw an error
      (mockEventsService.publish as jest.Mock).mockRejectedValue(
        new Error('Event service unavailable'),
      );

      await expect(
        processor.preProcessEntity(entity, location, emit, location, mockCache),
      ).rejects.toThrow('Event service unavailable');

      expect(mockEventsService.publish).toHaveBeenCalledWith({
        topic: 'relationProcessor.template:version_updated',
        eventPayload: {
          entityRef: 'template:default/test-template',
          previousVersion: '1.0.0',
          currentVersion: '2.0.0',
        },
      });

      // Cache.set should not be called - otherwise the owner would never be notified
      expect(mockCache.set).not.toHaveBeenCalled();
    });

    it('should not trigger event for version downgrade (2.0.0 → 1.0.0)', async () => {
      const entity: Entity = {
        apiVersion: 'scaffolder.backstage.io/v1beta3',
        kind: 'Template',
        metadata: {
          name: 'test-template',
          annotations: {
            'backstage.io/template-version': '1.0.0',
          },
        },
      };

      const cachedData = { version: '2.0.0' };
      (mockCache.get as jest.Mock).mockResolvedValue(cachedData);

      const result = await processor.preProcessEntity(
        entity,
        location,
        emit,
        location,
        mockCache,
      );

      expect(result).toBe(entity);
      expect(mockCache.get).toHaveBeenCalledWith(
        'template-version-template:default/test-template',
      );
      expect(mockCache.set).toHaveBeenCalledWith(
        'template-version-template:default/test-template',
        {
          version: '1.0.0',
        },
      );

      expect(mockEventsService.publish).not.toHaveBeenCalled();
    });
  });

  describe('postProcessEntity', () => {
    const processor = new ScaffolderRelationEntityProcessor();
    const location = { type: 'url', target: 'test-url' };
    const emit = jest.fn();

    afterEach(() => jest.resetAllMocks());

    it('generates relations for any arbitrary entity', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'test-entity' },
        spec: {
          scaffoldedFrom: 'test-template',
        },
      };

      await processor.postProcessEntity(entity, location, emit);
      expect(emit).toHaveBeenCalledTimes(2);
      expect(emit).toHaveBeenCalledWith({
        type: 'relation',
        relation: {
          source: {
            kind: 'Template',
            namespace: 'default',
            name: 'test-template',
          },
          type: 'scaffolderOf',
          target: {
            kind: 'Component',
            namespace: 'default',
            name: 'test-entity',
          },
        },
      });
      expect(emit).toHaveBeenCalledWith({
        type: 'relation',
        relation: {
          source: {
            kind: 'Component',
            namespace: 'default',
            name: 'test-entity',
          },
          type: 'scaffoldedFrom',
          target: {
            kind: 'Template',
            namespace: 'default',
            name: 'test-template',
          },
        },
      });
    });
    it('generates no relations if the `spec.scaffoldedFrom` field is empty or does not exist', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'n' },
        spec: {
          type: 'service',
        },
      };
      await processor.postProcessEntity(entity, location, emit);
      expect(emit).toHaveBeenCalledTimes(0);

      const entity2: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'n' },
        spec: {
          scaffoldedFrom: '',
        },
      };
      await processor.postProcessEntity(entity2, location, emit);
      expect(emit).toHaveBeenCalledTimes(0);
    });
  });
});
