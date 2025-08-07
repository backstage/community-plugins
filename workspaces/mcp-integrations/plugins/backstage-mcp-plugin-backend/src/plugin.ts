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
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import {
  CatalogService,
  catalogServiceRef,
} from '@backstage/plugin-catalog-node';
import { actionsRegistryServiceRef } from '@backstage/backend-plugin-api/alpha';
/**
 * backstageMcpPlugin backend plugin
 *
 * @public
 */
export const backstageMcpPlugin = createBackendPlugin({
  pluginId: 'backstage-mcp-plugin',
  register(env) {
    env.registerInit({
      deps: {
        actionsRegistry: actionsRegistryServiceRef,
        logger: coreServices.logger,
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        catalog: catalogServiceRef,
        auth: coreServices.auth,
      },
      // Sample action used in the Backstage docs: https://github.com/backstage/backstage/tree/master/plugins/mcp-actions-backend
      async init({ actionsRegistry, catalog, auth }) {
        // This action is used to fetch the list of catalog entities from Backstage. It returns an array of entity names
        actionsRegistry.register({
          name: 'fetch-catalog-entities',
          title: 'Fetch Catalog Entities',
          description: `Search and retrieve catalog entities from the Backstage server.

List all Backstage entities such as Components, Systems, Resources, APIs, Locations, Users, and Groups. 
Results are returned in JSON array format, where each entry in the JSON array has the following fields: 'name', 'description','uid', and 'type'.

This tool searches through the software catalog to find components the entities. It supports filtering by entity properties and 
text-based search across entity metadata.

Examples:
  # Get all entities in the catalog
  fetch-catalog-entities
  Output: {
  "entities": [
    {
      "name": "model-service-api",
      "kind": "API",
      "tags": [
        "api",
        "openai",
        "vllm"
      ]
    },
    {
      "name": "developer-model-service",
      "kind": "Component",
      "tags": [
        "genai",
        "ibm-granite",
        "vllm",
        "llm",
        "developer-model-service",
        "authenticated",
        "gateway"
      ]
    },
    {
      "name": "generated-c4d4657b4fbb886fe0a962cdf12b8732d33946ca",
      "kind": "Location",
      "tags": []
    },
    {
      "name": "ibm-granite-8b-code-instruct",
      "kind": "Resource",
      "tags": [
        "genai",
        "ibm",
        "llm",
        "granite",
        "conversational",
        "task-text-generation"
      ]
    }
  ]
}

  # Find all entities of kind Resource
  fetch-catalog-entities kind:Resource
  Output: {
  "entities": [
    {
      "name": "ibm-granite-8b-code-instruct",
      "kind": "Resource",
      "tags": [
        "genai",
        "ibm",
        "llm",
        "granite",
        "conversational",
        "task-text-generation"
      ]
    }
  ]
}

  # Find all Components of type service
  fetch-catalog-entities kind:Resource type:storage
  Output: {
  "entities": [
    {
      "name": "ibm-granite-s3-bucket",
      "kind": "Resource",
      "type": "storage",
      "tags": [
        "genai",
        "ibm",
        "llm",
        "granite",
        "conversational",
        "task-text-generation"
      ]
    }
  ]
}
`,
          schema: {
            input: z =>
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
                    'Filter entities by type (e.g., ai-model, library, website).',
                  ),
              }),
            output: (
              z, // TODO: This output schema will not scale well beyond the limited set of metadata we currently return, we should look at making this more generic
            ) =>
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
          action: async ({ input }) => {
            // Validate that type is only used with kind -- we could just allow `type` to be specified without `kind` but given types are per kind it made sense to restrict it
            // The Backstage MCP server will return a 500 error if we throw a validation error (without saying why), so instead, let's return the error message in the output
            // TODO: Investigate potential upstream improvements to allow error messages to be returned to the client
            if (input.type && !input.kind) {
              return {
                output: {
                  entities: [],
                  error:
                    'entity type cannot be specified without an entity kind specified',
                },
              };
            }
            try {
              const result = await fetchCatalogEntities(catalog, auth, input);
              return {
                output: {
                  ...result,
                  error: undefined,
                },
              };
            } catch (error) {
              return {
                output: {
                  entities: [],
                  error: error.message,
                },
              };
            }
          },
        });
      },
    });
  },
});

// fetchCatalogEntities retrieves the list of entities present in the Backstage catalog, with optional filtering by kind and type
export async function fetchCatalogEntities(
  catalog: CatalogService,
  auth: any,
  input?: { kind?: string; type?: string },
) {
  const credentials = await auth.getOwnServiceCredentials();

  // Build filter object based on input parameters
  const filter: any = {};
  if (input?.kind) {
    filter.kind = input.kind;
  }
  if (input?.type) {
    filter['spec.type'] = input.type;
  }

  const { items } = await catalog.getEntities(
    {
      fields: [
        'metadata.name',
        'kind',
        'metadata.tags',
        'metadata.description',
        'spec.type',
      ],
      filter,
    },
    {
      credentials,
    },
  );

  return {
    entities: items.map(entity => ({
      name: entity.metadata.name,
      kind: entity.kind,
      tags: entity.metadata.tags || [],
      description: entity.metadata.description,
      type:
        typeof entity.spec?.type === 'string' ? entity.spec.type : undefined,
    })),
  };
}
