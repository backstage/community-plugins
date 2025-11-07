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
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { actionsRegistryServiceRef } from '@backstage/backend-plugin-api/alpha';
import { TechDocsService } from './service';

/**
 * mcpTechdocsRetrievalPlugin
 *
 * @public
 */
export const mcpTechdocsRetrievalPlugin = createBackendPlugin({
  pluginId: 'techdocs-mcp-tool',
  register(env) {
    env.registerInit({
      deps: {
        actionsRegistry: actionsRegistryServiceRef,
        logger: coreServices.logger,
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        catalog: catalogServiceRef,
        auth: coreServices.auth,
        config: coreServices.rootConfig,
        discovery: coreServices.discovery,
      },
      // sample action used in the Backstage docs:
      // https://github.com/backstage/backstage/tree/master/plugins/mcp-actions-backend
      async init({
        actionsRegistry,
        catalog,
        auth,
        logger,
        config,
        discovery,
      }) {
        // fetches all techdoc entities from the catalog.
        // returns:: a list of techdoc entities
        actionsRegistry.register({
          name: 'fetch-techdocs',
          title: 'Fetch TechDoc Entities',
          description: `Search and retrieve all TechDoc entities from the Backstage Server

      List all Backstage entities with techdocs. Results are returned in JSON array format, where each
      entry includes entity details and TechDocs metadata, like last update timestamp and build information.

      Example invocations and the output from those invocations:
        Output: {
          "entities": [
            {
              "name": "developer-model-service",
              "title": "Developer Model Service",
              "tags": [
                "genai",
                "ibm-granite"
              ],
              "description": "A description",
              "owner": "user:default/exampleuser",
              "lifecycle": "experimental",
              "namespace": "default",
              "kind": "Component",
              "techDocsUrl": "https://backstage.example.com/docs/default/component/developer-model-service",
              "metadataUrl": "https://backstage.example.com/api/techdocs/default/component/developer-model-service",
              "metadata": {
                "lastUpdated": "2024-01-15T10:30:00Z",
                "buildTimestamp": 1705313400,
                "siteName": "Developer Model Service Docs",
                "siteDescription": "Documentation for the developer model service"
              }
            }
          ]
        }
      }
`,
          schema: {
            input: z =>
              z.object({
                entityType: z
                  .string()
                  .optional()
                  .describe(
                    'Filter by entity type (e.g., Component, API, System)',
                  ),
                namespace: z
                  .string()
                  .optional()
                  .describe('Filter by namespace'),
                owner: z
                  .string()
                  .optional()
                  .describe(
                    'Filter by owner (e.g., team-platform, user:john.doe)',
                  ),
                lifecycle: z
                  .string()
                  .optional()
                  .describe(
                    'Filter by lifecycle (e.g., production, staging, development)',
                  ),
                tags: z // Don't define using arrays - some mcp clients (notably llama stack) have issues decoding them (more investigation needed)
                  .string()
                  .optional()
                  .describe(
                    'Filter by tags as comma-separated values (e.g., "genai,frontend,api")',
                  ),
              }),
            output: z =>
              z.object({
                entities: z
                  .array(
                    z.object({
                      name: z
                        .string()
                        .describe(
                          'The name field for each techdoc in the backstage server',
                        ),
                      title: z
                        .string()
                        .describe(
                          'The title field for each techdoc in the backstage server',
                        ),
                      tags: z
                        .string()
                        .optional()
                        .describe(
                          'The tags related with the techdoc entity as comma-separated values',
                        ),
                      description: z
                        .string()
                        .describe('The description of the techdoc entity'),
                      owner: z
                        .string()
                        .describe(
                          'The owner of the techdoc entity (e.g., team-platform, user:john.doe)',
                        ),
                      lifecycle: z
                        .string()
                        .describe(
                          'The lifecycle of the techdoc entity (e.g., production, staging, development)',
                        ),
                      namespace: z
                        .string()
                        .describe('The namespace of the techdoc entity'),
                      kind: z
                        .string()
                        .describe(
                          'The kind of the techdoc entity (e.g., Component, API, System)',
                        ),
                      techDocsUrl: z
                        .string()
                        .describe(
                          'Direct URL to the TechDocs site for this entity',
                        ),
                      metadataUrl: z
                        .string()
                        .describe(
                          'API URL to access TechDocs metadata for this entity',
                        ),
                      metadata: z
                        .object({
                          lastUpdated: z
                            .string()
                            .optional()
                            .describe('Last updated TechDoc timestamp'),
                          buildTimestamp: z
                            .number()
                            .optional()
                            .describe('Built TechDoc timestamp'),
                          siteName: z
                            .string()
                            .optional()
                            .describe('Name of the TechDocs site'),
                          siteDescription: z
                            .string()
                            .optional()
                            .describe('Description of the TechDocs site'),
                          etag: z
                            .string()
                            .optional()
                            .describe('ETag for caching purposes'),
                          files: z
                            .string()
                            .optional()
                            .describe(
                              'List of files in the TechDocs site as comma-separated values',
                            ),
                        })
                        .optional()
                        .describe('TechDocs metadata information'),
                    }),
                  )
                  .describe('List of entities with TechDocs'),
                error: z
                  .string()
                  .optional()
                  .describe('Error message if the operation failed'),
              }),
          },
          action: async ({ input }) => {
            try {
              const techDocsService = new TechDocsService(
                config,
                logger,
                discovery,
              );
              const result = await techDocsService.listTechDocs(
                input,
                auth,
                catalog,
              );
              return {
                output: {
                  ...result,
                },
              };
            } catch (error) {
              logger.error(
                'fetch-techdocs: Error fetching TechDoc entities:',
                error,
              );
              return {
                output: {
                  entities: [],
                  error: error.message,
                },
              };
            }
          },
        });

        // analyzes the techdoc coverage on the software
        // catalog entities
        // returns::
        //    1. total of entities in catalog
        //    2. total of entities in catalog with Doc
        //    3. coverage percentage
        actionsRegistry.register({
          name: 'analyze-techdocs-coverage',
          title: 'Analyze TechDocs Coverage',
          description: `Analyze documentation coverage across Backstage entities to understand what percentage of entities have TechDocs available.

      It calculates the percentage of entities that have TechDocs configured, helping identify documentation gaps and improve overall documentation coverage.

      Example output:
      {
        "totalEntities": 150,
        "entitiesWithDocs": 95,
        "coveragePercentage": 63.3
      }

      Supports filtering by entity type, namespace, owner, lifecycle, and tags to analyze coverage for specific subsets of entities.`,
          schema: {
            input: z =>
              z.object({
                entityType: z
                  .string()
                  .optional()
                  .describe(
                    'Filter by entity type (e.g., Component, API, System)',
                  ),
                namespace: z
                  .string()
                  .optional()
                  .describe('Filter by namespace'),
                owner: z
                  .string()
                  .optional()
                  .describe(
                    'Filter by owner (e.g., team-platform, user:john.doe)',
                  ),
                lifecycle: z
                  .string()
                  .optional()
                  .describe(
                    'Filter by lifecycle (e.g., production, staging, development)',
                  ),
                tags: z
                  .string()
                  .optional()
                  .describe(
                    'Filter by tags as comma-separated values (e.g., "genai,frontend,api")',
                  ),
              }),
            output: z =>
              z.object({
                totalEntities: z
                  .number()
                  .describe('Total number of entities in the filtered set'),
                entitiesWithDocs: z
                  .number()
                  .describe('Number of entities that have TechDocs configured'),
                coveragePercentage: z
                  .number()
                  .describe('Percentage of entities with TechDocs (0-100)'),
                error: z
                  .string()
                  .optional()
                  .describe('Error message if the operation failed'),
              }),
          },
          action: async ({ input }) => {
            try {
              const techDocsService = new TechDocsService(
                config,
                logger,
                discovery,
              );
              const result = await techDocsService.analyzeCoverage(
                input,
                auth,
                catalog,
              );
              return {
                output: result,
              };
            } catch (error) {
              logger.error(
                'analyze-techdocs-coverage: Error analyzing coverage:',
                error,
              );
              return {
                output: {
                  totalEntities: 0,
                  entitiesWithDocs: 0,
                  coveragePercentage: 0,
                  error: error.message,
                },
              };
            }
          },
        });

        // retrieves techdocs content for a specific entity.
        // it automatically converts an HTML text into raw text.
        // returns:: JSON repsonse with techdoc content.
        actionsRegistry.register({
          name: 'retrieve-techdocs-content',
          title: 'Retrieve TechDocs Content',
          description: `Retrieve the actual TechDocs content for a specific entity and optional page.

      This tool allows AI clients to access documentation content for specific catalog entities.
      You can retrieve the main documentation page or specific pages within the entity's documentation.

      Example invocations and expected responses:
        Input: {
          "entityRef": "component:default/developer-model-service",
          "pagePath": "index.html"
        }

        Output: {
          "entityRef": "component:default/developer-model-service",
          "name": "developer-model-service",
          "title": "Developer Model Service",
          "kind": "component",
          "namespace": "default",
          "content": "Developer Model Service Documentation\n\nWelcome to the service...",
          "pageTitle": "Developer Model Service Documentation",
          "path": "index.html",
          "contentType": "text",
          "lastModified": "2024-01-15T10:30:00Z",
          "metadata": {
            "lastUpdated": "2024-01-15T10:30:00Z",
            "buildTimestamp": 1705313400,
            "siteName": "Developer Model Service Docs"
          }
        }

      Note: HTML files are automatically converted to plain text for better readability and AI processing.
      Supports retrieving specific pages by providing pagePath parameter (e.g., "api/endpoints.html", "guides/setup.md").`,
          schema: {
            input: z =>
              z.object({
                entityRef: z
                  .string()
                  .describe(
                    'Entity reference in format kind:namespace/name (e.g., component:default/my-service)',
                  ),
                pagePath: z
                  .string()
                  .optional()
                  .describe(
                    'Optional path to specific page within the documentation (defaults to index.html)',
                  ),
              }),
            output: z =>
              z.object({
                entityRef: z
                  .string()
                  .describe('The entity reference that was requested'),
                name: z.string().describe('The name of the entity'),
                title: z.string().describe('The title of the entity'),
                kind: z
                  .string()
                  .describe('The kind of the entity (e.g., component, api)'),
                namespace: z.string().describe('The namespace of the entity'),
                content: z
                  .string()
                  .describe(
                    'The actual documentation content (HTML automatically converted to plain text)',
                  ),
                pageTitle: z
                  .string()
                  .optional()
                  .describe('The title extracted from the page content'),
                path: z
                  .string()
                  .optional()
                  .describe('The path to the requested page'),
                contentType: z
                  .enum(['markdown', 'html', 'text'])
                  .describe(
                    'The type of content returned (HTML files are converted to text)',
                  ),
                lastModified: z
                  .string()
                  .optional()
                  .describe('ISO timestamp when the content was last modified'),
                metadata: z
                  .object({
                    lastUpdated: z
                      .string()
                      .optional()
                      .describe(
                        'ISO timestamp when TechDocs were last updated',
                      ),
                    buildTimestamp: z
                      .number()
                      .optional()
                      .describe('Unix timestamp when TechDocs were built'),
                    siteName: z
                      .string()
                      .optional()
                      .describe('Name of the TechDocs site'),
                    siteDescription: z
                      .string()
                      .optional()
                      .describe('Description of the TechDocs site'),
                  })
                  .optional()
                  .describe('TechDocs metadata information'),
                error: z
                  .string()
                  .optional()
                  .describe('Error message if the operation failed'),
              }),
          },
          action: async ({ input }) => {
            try {
              const techDocsService = new TechDocsService(
                config,
                logger,
                discovery,
              );
              const result = await techDocsService.retrieveTechDocsContent(
                input.entityRef,
                input.pagePath,
                auth,
                catalog,
              );

              return {
                output: result,
              };
            } catch (error) {
              logger.error(
                'retrieve-techdocs-content: Error retrieving TechDocs content:',
                error,
              );
              return {
                output: {
                  entityRef: input.entityRef,
                  name: '',
                  title: '',
                  kind: '',
                  namespace: '',
                  content: '',
                  contentType: 'text' as const,
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
