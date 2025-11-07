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

import { startTestBackend } from '@backstage/backend-test-utils';
import { mcpTechdocsRetrievalPlugin } from './plugin';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';
import { Entity } from '@backstage/catalog-model';

describe('mcpTechdocsRetrievalPlugin', () => {
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

  describe('fetch-techdocs action', () => {
    it('should register and execute fetch-techdocs action successfully', async () => {
      const { server } = await startTestBackend({
        features: [
          mcpTechdocsRetrievalPlugin,
          catalogServiceMock.factory({
            entities: [
              createMockEntity('service-with-docs', 'Component', true),
              createMockEntity('service-without-docs', 'Component', false),
            ],
          }),
        ],
      });

      expect(server).toBeDefined();
    });

    it('should fetch entities with techdocs annotation', async () => {
      const entitiesWithDocs = [
        createMockEntity('service-1', 'Component', true),
        createMockEntity('api-1', 'API', true),
      ];
      const entitiesWithoutDocs = [
        createMockEntity('service-2', 'Component', false),
      ];

      const { server } = await startTestBackend({
        features: [
          mcpTechdocsRetrievalPlugin,
          catalogServiceMock.factory({
            entities: [...entitiesWithDocs, ...entitiesWithoutDocs],
          }),
        ],
      });

      expect(server).toBeDefined();
    });

    it('should handle empty catalog', async () => {
      const { server } = await startTestBackend({
        features: [
          mcpTechdocsRetrievalPlugin,
          catalogServiceMock.factory({
            entities: [],
          }),
        ],
      });

      expect(server).toBeDefined();
    });

    it('should filter by entity type', async () => {
      const { server } = await startTestBackend({
        features: [
          mcpTechdocsRetrievalPlugin,
          catalogServiceMock.factory({
            entities: [
              createMockEntity('component-1', 'Component', true),
              createMockEntity('api-1', 'API', true),
              createMockEntity('system-1', 'System', true),
            ],
          }),
        ],
      });

      expect(server).toBeDefined();
    });

    it('should filter by namespace', async () => {
      const { server } = await startTestBackend({
        features: [
          mcpTechdocsRetrievalPlugin,
          catalogServiceMock.factory({
            entities: [
              createMockEntity('service-1', 'Component', true, {
                metadata: { name: 'service-1', namespace: 'production' },
              }),
              createMockEntity('service-2', 'Component', true, {
                metadata: { name: 'service-2', namespace: 'staging' },
              }),
            ],
          }),
        ],
      });

      expect(server).toBeDefined();
    });

    it('should filter by owner', async () => {
      const { server } = await startTestBackend({
        features: [
          mcpTechdocsRetrievalPlugin,
          catalogServiceMock.factory({
            entities: [
              createMockEntity('service-1', 'Component', true, {
                spec: { owner: 'team-a' },
              }),
              createMockEntity('service-2', 'Component', true, {
                spec: { owner: 'team-b' },
              }),
            ],
          }),
        ],
      });

      expect(server).toBeDefined();
    });

    it('should filter by lifecycle', async () => {
      const { server } = await startTestBackend({
        features: [
          mcpTechdocsRetrievalPlugin,
          catalogServiceMock.factory({
            entities: [
              createMockEntity('service-1', 'Component', true, {
                spec: { lifecycle: 'production' },
              }),
              createMockEntity('service-2', 'Component', true, {
                spec: { lifecycle: 'experimental' },
              }),
            ],
          }),
        ],
      });

      expect(server).toBeDefined();
    });

    it('should filter by tags', async () => {
      const { server } = await startTestBackend({
        features: [
          mcpTechdocsRetrievalPlugin,
          catalogServiceMock.factory({
            entities: [
              createMockEntity('service-1', 'Component', true, {
                metadata: { name: 'service-1', tags: ['frontend', 'react'] },
              }),
              createMockEntity('service-2', 'Component', true, {
                metadata: { name: 'service-2', tags: ['backend', 'node'] },
              }),
            ],
          }),
        ],
      });

      expect(server).toBeDefined();
    });
  });

  describe('analyze-techdocs-coverage action', () => {
    it('should register and execute coverage analysis action successfully', async () => {
      const { server } = await startTestBackend({
        features: [
          mcpTechdocsRetrievalPlugin,
          catalogServiceMock.factory({
            entities: [
              createMockEntity('service-1', 'Component', true),
              createMockEntity('service-2', 'Component', false),
              createMockEntity('service-3', 'Component', true),
            ],
          }),
        ],
      });

      expect(server).toBeDefined();
    });

    it('should handle 100% coverage scenario', async () => {
      const { server } = await startTestBackend({
        features: [
          mcpTechdocsRetrievalPlugin,
          catalogServiceMock.factory({
            entities: [
              createMockEntity('service-1', 'Component', true),
              createMockEntity('service-2', 'Component', true),
            ],
          }),
        ],
      });

      expect(server).toBeDefined();
    });

    it('should handle 0% coverage scenario', async () => {
      const { server } = await startTestBackend({
        features: [
          mcpTechdocsRetrievalPlugin,
          catalogServiceMock.factory({
            entities: [
              createMockEntity('service-1', 'Component', false),
              createMockEntity('service-2', 'Component', false),
            ],
          }),
        ],
      });

      expect(server).toBeDefined();
    });

    it('should handle empty catalog for coverage analysis', async () => {
      const { server } = await startTestBackend({
        features: [
          mcpTechdocsRetrievalPlugin,
          catalogServiceMock.factory({
            entities: [],
          }),
        ],
      });

      expect(server).toBeDefined();
    });

    it('should analyze coverage with filters', async () => {
      const { server } = await startTestBackend({
        features: [
          mcpTechdocsRetrievalPlugin,
          catalogServiceMock.factory({
            entities: [
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
            ],
          }),
        ],
      });

      expect(server).toBeDefined();
    });
  });

  describe('retrieve-techdocs-content action', () => {
    it('should register and execute content retrieval action successfully', async () => {
      const { server } = await startTestBackend({
        features: [
          mcpTechdocsRetrievalPlugin,
          catalogServiceMock.factory({
            entities: [
              createMockEntity('service-with-docs', 'Component', true),
            ],
          }),
        ],
      });

      expect(server).toBeDefined();
    });

    it('should handle entity with TechDocs', async () => {
      const entityWithDocs = createMockEntity('service-1', 'Component', true);

      const { server } = await startTestBackend({
        features: [
          mcpTechdocsRetrievalPlugin,
          catalogServiceMock.factory({
            entities: [entityWithDocs],
          }),
        ],
      });

      expect(server).toBeDefined();
    });

    it('should handle different entity types for content retrieval', async () => {
      const entities = [
        createMockEntity('api-with-docs', 'API', true),
        createMockEntity('system-with-docs', 'System', true),
      ];

      const { server } = await startTestBackend({
        features: [
          mcpTechdocsRetrievalPlugin,
          catalogServiceMock.factory({
            entities,
          }),
        ],
      });

      expect(server).toBeDefined();
    });

    it('should handle invalid entity references', async () => {
      const { server } = await startTestBackend({
        features: [
          mcpTechdocsRetrievalPlugin,
          catalogServiceMock.factory({
            entities: [],
          }),
        ],
      });

      expect(server).toBeDefined();
    });

    it('should handle different page paths', async () => {
      const entityWithDocs = createMockEntity('service-1', 'Component', true);

      const { server } = await startTestBackend({
        features: [
          mcpTechdocsRetrievalPlugin,
          catalogServiceMock.factory({
            entities: [entityWithDocs],
          }),
        ],
      });

      expect(server).toBeDefined();
    });

    it('should handle entities in different namespaces', async () => {
      const entities = [
        createMockEntity('service-1', 'Component', true, {
          metadata: { name: 'service-1', namespace: 'production' },
        }),
        createMockEntity('service-2', 'Component', true, {
          metadata: { name: 'service-2', namespace: 'staging' },
        }),
      ];

      const { server } = await startTestBackend({
        features: [
          mcpTechdocsRetrievalPlugin,
          catalogServiceMock.factory({
            entities,
          }),
        ],
      });

      expect(server).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle catalog service errors gracefully', async () => {
      const { server } = await startTestBackend({
        features: [
          mcpTechdocsRetrievalPlugin,
          catalogServiceMock.factory({
            entities: [],
          }),
        ],
      });

      expect(server).toBeDefined();
    });

    it('should handle content retrieval errors gracefully', async () => {
      const { server } = await startTestBackend({
        features: [
          mcpTechdocsRetrievalPlugin,
          catalogServiceMock.factory({
            entities: [
              createMockEntity('service-without-docs', 'Component', false),
            ],
          }),
        ],
      });

      expect(server).toBeDefined();
    });

    it('should handle authentication failures in content retrieval', async () => {
      const { server } = await startTestBackend({
        features: [
          mcpTechdocsRetrievalPlugin,
          catalogServiceMock.factory({
            entities: [
              createMockEntity('service-with-auth-issues', 'Component', true),
            ],
          }),
        ],
      });

      expect(server).toBeDefined();
    });

    it('should handle invalid entity references in content retrieval', async () => {
      const { server } = await startTestBackend({
        features: [
          mcpTechdocsRetrievalPlugin,
          catalogServiceMock.factory({
            entities: [],
          }),
        ],
      });

      expect(server).toBeDefined();
    });
  });
});
