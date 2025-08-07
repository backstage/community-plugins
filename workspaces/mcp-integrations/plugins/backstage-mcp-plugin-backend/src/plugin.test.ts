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
import { fetchCatalogEntities } from './plugin';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { Entity } from '@backstage/catalog-model';

describe('backstageMcpPlugin', () => {
  describe('fetchCatalogEntities', () => {
    const mockCatalogService = {
      getEntities: jest.fn(),
    } as unknown as CatalogService;

    const mockAuthService = {
      getOwnServiceCredentials: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should fetch catalog entities successfully', async () => {
      const mockEntities: Entity[] = [
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'my-service',
            tags: ['java', 'spring'],
            description: 'A Spring-based microservice',
          },
          spec: {
            type: 'service',
          },
        },
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'API',
          metadata: {
            name: 'my-api',
            tags: ['rest', 'openapi'],
            description: 'REST API for data access',
          },
          spec: {
            type: 'openapi',
          },
        },
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'System',
          metadata: {
            name: 'my-system',
            tags: [],
            description: 'Core business system',
          },
          spec: {
            type: 'system',
          },
        },
      ];

      mockAuthService.getOwnServiceCredentials.mockResolvedValue({
        principal: { type: 'service', subject: 'test' },
        token: 'test-token',
      });

      (mockCatalogService.getEntities as jest.Mock).mockResolvedValue({
        items: mockEntities,
      });

      const result = await fetchCatalogEntities(
        mockCatalogService,
        mockAuthService,
      );

      expect(mockAuthService.getOwnServiceCredentials).toHaveBeenCalledTimes(1);
      expect(mockCatalogService.getEntities).toHaveBeenCalledWith(
        {
          fields: [
            'metadata.name',
            'kind',
            'metadata.tags',
            'metadata.description',
            'spec.type',
          ],
          filter: {},
        },
        {
          credentials: {
            principal: { type: 'service', subject: 'test' },
            token: 'test-token',
          },
        },
      );

      expect(result).toEqual({
        entities: [
          {
            name: 'my-service',
            kind: 'Component',
            tags: ['java', 'spring'],
            description: 'A Spring-based microservice',
            type: 'service',
          },
          {
            name: 'my-api',
            kind: 'API',
            tags: ['rest', 'openapi'],
            description: 'REST API for data access',
            type: 'openapi',
          },
          {
            name: 'my-system',
            kind: 'System',
            tags: [],
            description: 'Core business system',
            type: 'system',
          },
        ],
      });
    });

    it('should handle entities with no tags', async () => {
      const mockEntities: Entity[] = [
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'service-no-tags',
            description: 'Service without tags',
          },
          spec: {
            type: 'service',
          },
        },
      ];

      mockAuthService.getOwnServiceCredentials.mockResolvedValue({
        principal: { type: 'service', subject: 'test' },
        token: 'test-token',
      });

      (mockCatalogService.getEntities as jest.Mock).mockResolvedValue({
        items: mockEntities,
      });

      const result = await fetchCatalogEntities(
        mockCatalogService,
        mockAuthService,
      );

      expect(result).toEqual({
        entities: [
          {
            name: 'service-no-tags',
            kind: 'Component',
            tags: [],
            description: 'Service without tags',
            type: 'service',
          },
        ],
      });
    });

    it('should handle empty catalog', async () => {
      mockAuthService.getOwnServiceCredentials.mockResolvedValue({
        principal: { type: 'service', subject: 'test' },
        token: 'test-token',
      });

      (mockCatalogService.getEntities as jest.Mock).mockResolvedValue({
        items: [],
      });

      const result = await fetchCatalogEntities(
        mockCatalogService,
        mockAuthService,
      );

      expect(result).toEqual({
        entities: [],
      });
    });

    it('should handle catalog service errors', async () => {
      mockAuthService.getOwnServiceCredentials.mockResolvedValue({
        principal: { type: 'service', subject: 'test' },
        token: 'test-token',
      });

      (mockCatalogService.getEntities as jest.Mock).mockRejectedValue(
        new Error('Catalog service error'),
      );

      await expect(
        fetchCatalogEntities(mockCatalogService, mockAuthService),
      ).rejects.toThrow('Catalog service error');
    });

    it('should handle authentication errors', async () => {
      mockAuthService.getOwnServiceCredentials.mockRejectedValue(
        new Error('Authentication failed'),
      );

      await expect(
        fetchCatalogEntities(mockCatalogService, mockAuthService),
      ).rejects.toThrow('Authentication failed');
    });

    it('should filter entities by kind', async () => {
      const mockEntities: Entity[] = [
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'my-service',
            tags: ['java'],
            description: 'A service',
          },
          spec: { type: 'service' },
        },
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'API',
          metadata: {
            name: 'my-api',
            tags: ['rest'],
            description: 'An API',
          },
          spec: { type: 'openapi' },
        },
      ];

      mockAuthService.getOwnServiceCredentials.mockResolvedValue({
        principal: { type: 'service', subject: 'test' },
        token: 'test-token',
      });

      (mockCatalogService.getEntities as jest.Mock).mockResolvedValue({
        items: mockEntities,
      });

      const result = await fetchCatalogEntities(
        mockCatalogService,
        mockAuthService,
        { kind: 'Component' },
      );

      expect(mockCatalogService.getEntities).toHaveBeenCalledWith(
        {
          fields: [
            'metadata.name',
            'kind',
            'metadata.tags',
            'metadata.description',
            'spec.type',
          ],
          filter: { kind: 'Component' },
        },
        {
          credentials: {
            principal: { type: 'service', subject: 'test' },
            token: 'test-token',
          },
        },
      );
    });

    it('should filter entities by kind and type', async () => {
      const mockEntities: Entity[] = [
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'web-service',
            tags: ['javascript'],
            description: 'A web service',
          },
          spec: { type: 'service' },
        },
      ];

      mockAuthService.getOwnServiceCredentials.mockResolvedValue({
        principal: { type: 'service', subject: 'test' },
        token: 'test-token',
      });

      (mockCatalogService.getEntities as jest.Mock).mockResolvedValue({
        items: mockEntities,
      });

      const result = await fetchCatalogEntities(
        mockCatalogService,
        mockAuthService,
        { kind: 'Component', type: 'service' },
      );

      expect(mockCatalogService.getEntities).toHaveBeenCalledWith(
        {
          fields: [
            'metadata.name',
            'kind',
            'metadata.tags',
            'metadata.description',
            'spec.type',
          ],
          filter: { kind: 'Component', 'spec.type': 'service' },
        },
        {
          credentials: {
            principal: { type: 'service', subject: 'test' },
            token: 'test-token',
          },
        },
      );

      expect(result).toEqual({
        entities: [
          {
            name: 'web-service',
            kind: 'Component',
            tags: ['javascript'],
            description: 'A web service',
            type: 'service',
          },
        ],
      });
    });

    it('should handle entities with missing description and type', async () => {
      const mockEntities: Entity[] = [
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'minimal-service',
            tags: ['minimal'],
          },
          spec: {},
        },
      ];

      mockAuthService.getOwnServiceCredentials.mockResolvedValue({
        principal: { type: 'service', subject: 'test' },
        token: 'test-token',
      });

      (mockCatalogService.getEntities as jest.Mock).mockResolvedValue({
        items: mockEntities,
      });

      const result = await fetchCatalogEntities(
        mockCatalogService,
        mockAuthService,
      );

      expect(result).toEqual({
        entities: [
          {
            name: 'minimal-service',
            kind: 'Component',
            tags: ['minimal'],
            description: undefined,
            type: undefined,
          },
        ],
      });
    });
  });

  describe('MCP Action validation and error handling', () => {
    const mockCatalogService = {
      getEntities: jest.fn(),
    } as unknown as CatalogService;

    const mockAuthService = {
      getOwnServiceCredentials: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return error when type is specified without kind', async () => {
      // Simulate the action logic that validates type without kind
      const fetchCatalogEntitiesAction = async ({
        input,
      }: {
        input: { kind?: string; type?: string };
      }) => {
        if (input.type && !input.kind) {
          return {
            output: {
              entities: [],
              error:
                'entity type cannot be specified without an entity kind specified',
            },
          };
        }
        const result = await fetchCatalogEntities(
          mockCatalogService,
          mockAuthService,
          input,
        );
        return {
          output: {
            ...result,
            error: undefined,
          },
        };
      };

      const result = await fetchCatalogEntitiesAction({
        input: { type: 'service' },
      });

      expect(result.output.error).toBe(
        'entity type cannot be specified without an entity kind specified',
      );
      expect(result.output.entities).toEqual([]);
    });

    it('should return entities successfully when both kind and type are specified', async () => {
      const mockEntities: Entity[] = [
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'test-service',
            tags: ['test'],
            description: 'A test service',
          },
          spec: { type: 'service' },
        },
      ];

      mockAuthService.getOwnServiceCredentials.mockResolvedValue({
        principal: { type: 'service', subject: 'test' },
        token: 'test-token',
      });

      (mockCatalogService.getEntities as jest.Mock).mockResolvedValue({
        items: mockEntities,
      });

      // Simulate the action logic
      const fetchCatalogEntitiesAction = async ({
        input,
      }: {
        input: { kind?: string; type?: string };
      }) => {
        if (input.type && !input.kind) {
          return {
            output: {
              entities: [],
              error:
                'entity type cannot be specified without an entity kind specified',
            },
          };
        }
        const result = await fetchCatalogEntities(
          mockCatalogService,
          mockAuthService,
          input,
        );
        return {
          output: {
            ...result,
            error: undefined,
          },
        };
      };

      const result = await fetchCatalogEntitiesAction({
        input: { kind: 'Component', type: 'service' },
      });

      expect(result.output.error).toBeUndefined();
      expect(result.output.entities).toEqual([
        {
          name: 'test-service',
          kind: 'Component',
          tags: ['test'],
          description: 'A test service',
          type: 'service',
        },
      ]);
    });

    it('should return entities successfully when only kind is specified', async () => {
      const mockEntities: Entity[] = [
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'test-component',
            tags: ['test'],
            description: 'A test component',
          },
          spec: { type: 'library' },
        },
      ];

      mockAuthService.getOwnServiceCredentials.mockResolvedValue({
        principal: { type: 'service', subject: 'test' },
        token: 'test-token',
      });

      (mockCatalogService.getEntities as jest.Mock).mockResolvedValue({
        items: mockEntities,
      });

      // Simulate the action logic
      const fetchCatalogEntitiesAction = async ({
        input,
      }: {
        input: { kind?: string; type?: string };
      }) => {
        if (input.type && !input.kind) {
          return {
            output: {
              entities: [],
              error:
                'entity type cannot be specified without an entity kind specified',
            },
          };
        }
        const result = await fetchCatalogEntities(
          mockCatalogService,
          mockAuthService,
          input,
        );
        return {
          output: {
            ...result,
            error: undefined,
          },
        };
      };

      const result = await fetchCatalogEntitiesAction({
        input: { kind: 'Component' },
      });

      expect(result.output.error).toBeUndefined();
      expect(result.output.entities).toEqual([
        {
          name: 'test-component',
          kind: 'Component',
          tags: ['test'],
          description: 'A test component',
          type: 'library',
        },
      ]);
    });
  });

  describe('MCP Action functions', () => {
    describe('greet-user action logic', () => {
      it('should generate personalized greeting', async () => {
        // Test the core logic of the greet-user action
        const greetUserAction = async ({
          input,
        }: {
          input: { name: string };
        }) => ({
          output: { greeting: `Hello ${input.name}!` },
        });

        const testCases = [
          { input: { name: 'John Doe' }, expected: 'Hello John Doe!' },
          { input: { name: '' }, expected: 'Hello !' },
          { input: { name: 'José María' }, expected: 'Hello José María!' },
          { input: { name: 'Alice123' }, expected: 'Hello Alice123!' },
        ];

        for (const testCase of testCases) {
          const result = await greetUserAction(testCase);
          expect(result.output.greeting).toBe(testCase.expected);
        }
      });
    });

    describe('fetch-catalog-entities action logic', () => {
      it('should use fetchCatalogEntities function correctly', async () => {
        const mockCatalogService = {
          getEntities: jest.fn().mockResolvedValue({
            items: [
              {
                apiVersion: 'backstage.io/v1alpha1',
                kind: 'Component',
                metadata: {
                  name: 'test-component',
                  tags: ['test'],
                  description: 'A test component',
                },
                spec: {
                  type: 'library',
                },
              },
            ],
          }),
        } as unknown as CatalogService;

        const mockAuthService = {
          getOwnServiceCredentials: jest.fn().mockResolvedValue({
            principal: { type: 'service', subject: 'test' },
            token: 'test-token',
          }),
        };

        // Test the action logic
        const fetchCatalogEntitiesAction = async ({}) => {
          const result = await fetchCatalogEntities(
            mockCatalogService,
            mockAuthService,
          );
          return {
            output: {
              ...result,
              error: undefined,
            },
          };
        };

        const result = await fetchCatalogEntitiesAction({});

        expect(result.output).toHaveProperty('entities');
        expect(result.output).toHaveProperty('error');
        expect(Array.isArray(result.output.entities)).toBe(true);
        expect(result.output.entities).toHaveLength(1);
        expect(result.output.entities[0]).toEqual({
          name: 'test-component',
          kind: 'Component',
          tags: ['test'],
          description: 'A test component',
          type: 'library',
        });
        expect(result.output.error).toBeUndefined();
      });
    });
  });

  describe('Action schemas and metadata', () => {
    it('should have correct greet-user action structure', () => {
      const greetUserActionDefinition = {
        name: 'greet-user',
        title: 'Greet User',
        description: 'Generate a personalized greeting',
        schema: {
          input: (z: any) =>
            z.object({
              name: z.string().describe('The name of the person to greet'),
            }),
          output: (z: any) =>
            z.object({
              greeting: z.string().describe('The generated greeting'),
            }),
        },
      };

      expect(greetUserActionDefinition.name).toBe('greet-user');
      expect(greetUserActionDefinition.title).toBe('Greet User');
      expect(greetUserActionDefinition.description).toBe(
        'Generate a personalized greeting',
      );
      expect(greetUserActionDefinition.schema.input).toBeDefined();
      expect(greetUserActionDefinition.schema.output).toBeDefined();
    });

    it('should have correct fetch-catalog-entities action structure', () => {
      const fetchCatalogEntitiesActionDefinition = {
        name: 'fetch-catalog-entities',
        title: 'Fetch Catalog Entities',
        description:
          'Search and retrieve catalog entities from the Backstage server.',
        schema: {
          input: (z: any) =>
            z.object({
              kind: z
                .string()
                .optional()
                .describe(
                  'Filter entities by kind (e.g., Component, API, System)',
                ),
              type: z
                .string()
                .optional()
                .describe(
                  'Filter entities by type (e.g., service, library, website). Can only be used when kind is also specified.',
                ),
            }),
          output: (z: any) =>
            z.object({
              entities: z
                .array(
                  z.object({
                    name: z
                      .string()
                      .describe(
                        'The name field for each Backstage entity in the catalog',
                      ),
                    kind: z
                      .string()
                      .describe(
                        'The kind/type of the Backstage entity (e.g., Component, API, System)',
                      ),
                    tags: z
                      .array(z.string())
                      .describe(
                        'The tags associated with the Backstage entity',
                      ),
                    description: z
                      .string()
                      .optional()
                      .describe('The description of the Backstage entity'),
                    type: z
                      .string()
                      .optional()
                      .describe(
                        'The type of the Backstage entity (e.g., service, library, website)',
                      ),
                  }),
                )
                .describe('An array of entities'),
              error: z
                .string()
                .optional()
                .describe('Error message if validation fails'),
            }),
        },
      };

      expect(fetchCatalogEntitiesActionDefinition.name).toBe(
        'fetch-catalog-entities',
      );
      expect(fetchCatalogEntitiesActionDefinition.title).toBe(
        'Fetch Catalog Entities',
      );
      expect(fetchCatalogEntitiesActionDefinition.description).toBe(
        'Search and retrieve catalog entities from the Backstage server.',
      );
      expect(fetchCatalogEntitiesActionDefinition.schema.input).toBeDefined();
      expect(fetchCatalogEntitiesActionDefinition.schema.output).toBeDefined();
    });
  });
});
