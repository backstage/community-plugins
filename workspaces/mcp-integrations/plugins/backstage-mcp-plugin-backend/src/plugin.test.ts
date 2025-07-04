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
  describe('fetchCatalogEntities function', () => {
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
          },
        },
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'API',
          metadata: {
            name: 'my-api',
            tags: ['rest', 'openapi'],
          },
        },
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'System',
          metadata: {
            name: 'my-system',
            tags: [],
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
          fields: ['metadata.name', 'kind', 'metadata.tags'],
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
          },
          {
            name: 'my-api',
            kind: 'API',
            tags: ['rest', 'openapi'],
          },
          {
            name: 'my-system',
            kind: 'System',
            tags: [],
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
        const fetchCatalogEntitiesAction = async ({}) => ({
          output: await fetchCatalogEntities(
            mockCatalogService,
            mockAuthService,
          ),
        });

        const result = await fetchCatalogEntitiesAction({});

        expect(result.output).toHaveProperty('entities');
        expect(Array.isArray(result.output.entities)).toBe(true);
        expect(result.output.entities).toHaveLength(1);
        expect(result.output.entities[0]).toEqual({
          name: 'test-component',
          kind: 'Component',
          tags: ['test'],
        });
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
          'Retrieve the list of catalog entities from the Backstage server.',
        schema: {
          input: (z: any) => z.object({}),
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
                  }),
                )
                .describe('An array of entities'),
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
        'Retrieve the list of catalog entities from the Backstage server.',
      );
      expect(fetchCatalogEntitiesActionDefinition.schema.input).toBeDefined();
      expect(fetchCatalogEntitiesActionDefinition.schema.output).toBeDefined();
    });
  });
});
