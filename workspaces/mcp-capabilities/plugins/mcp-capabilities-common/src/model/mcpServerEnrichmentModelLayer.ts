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

import {
  CatalogModelLayer,
  createCatalogModelLayer,
} from '@backstage/catalog-model/alpha';

/**
 * A catalog model layer that **extends** (does not replace) the upstream
 * `API` / `spec.type: 'mcp-server'` specType with additional, optional fields
 * describing a discovered MCP server: capabilities, counts, server identity,
 * and a flat list of tool names for catalog search.
 *
 * It uses `updateKind`, whose schema is deep-merged onto the native schema, so
 * the native `remotes` / `lifecycle` / `owner` constraints are untouched and
 * entities that have not been enriched yet remain valid.
 *
 * Register it alongside the native layer, e.g.
 * `provideStaticCatalogModel({ layers: [mcpServerApiEntityModel, mcpServerEnrichmentModelLayer] })`.
 *
 * @public
 */
export const mcpServerEnrichmentModelLayer: CatalogModelLayer =
  createCatalogModelLayer({
    layerId: 'internal.mcp/api-mcp-server-enrichment',
    builder: model => {
      model.updateKind({
        names: { kind: 'API' },
        versions: [
          {
            name: ['v1alpha1', 'v1beta1'],
            specType: 'mcp-server',
            description:
              'An MCP server API entity, enriched with discovered capabilities and tools.',
            schema: {
              jsonSchema: {
                type: 'object',
                properties: {
                  spec: {
                    type: 'object',
                    properties: {
                      capabilities: {
                        type: 'object',
                        description:
                          'Which MCP feature groups the server advertises.',
                        properties: {
                          tools: { type: 'boolean' },
                          resources: { type: 'boolean' },
                          prompts: { type: 'boolean' },
                        },
                      },
                      serverInfo: {
                        type: 'object',
                        description:
                          'Server identity reported during the MCP initialize handshake.',
                        properties: {
                          name: { type: 'string', minLength: 1 },
                          version: { type: 'string', minLength: 1 },
                        },
                      },
                      instructions: {
                        type: 'string',
                        description:
                          'Optional usage instructions reported by the server.',
                      },
                      toolCount: { type: 'number', minimum: 0 },
                      resourceCount: { type: 'number', minimum: 0 },
                      promptCount: { type: 'number', minimum: 0 },
                      toolNames: {
                        type: 'array',
                        description:
                          'Flat list of discovered tool names, for catalog search.',
                        items: { type: 'string', minLength: 1 },
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      });
    },
  });
