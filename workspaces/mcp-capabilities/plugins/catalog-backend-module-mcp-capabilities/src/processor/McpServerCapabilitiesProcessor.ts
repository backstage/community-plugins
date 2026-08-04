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
import { LoggerService } from '@backstage/backend-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { JsonObject } from '@backstage/types';
import {
  CatalogProcessor,
  CatalogProcessorCache,
} from '@backstage/plugin-catalog-node';
import {
  discoverFromClient,
  MCPServerEnrichmentSpec,
  MCPServerSpec,
  parseMcpRemoteUrl,
  selectMcpServerRemote,
} from '@backstage-community/plugin-mcp-capabilities-common';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

/** What the processor persists onto an entity. */
export type EnrichmentFields = 'names' | 'summary';

interface CacheItem {
  summary: MCPServerEnrichmentSpec;
  cachedAt: number;
}

const DEFAULT_TTL_MS = 10 * 60 * 1000;
const DISCOVERY_TIMEOUT_MS = 15_000;

/**
 * Connects to an MCP server over streamable-http and discovers what it exposes.
 * Owns the client lifecycle; the capability-gating and mapping live in
 * `discoverFromClient` (shared with the live `/spec` router).
 */
async function discoverMcpServer(
  url: string,
  logger: LoggerService,
): Promise<MCPServerSpec> {
  const client = new Client({
    name: 'backstage-mcp-capabilities',
    version: '1.0.0',
  });
  const transport = new StreamableHTTPClientTransport(new URL(url));
  try {
    await client.connect(transport, { timeout: DISCOVERY_TIMEOUT_MS });
    return await discoverFromClient(client, {
      requestOptions: { timeout: DISCOVERY_TIMEOUT_MS },
      onListError: message => logger.debug(message),
    });
  } finally {
    await client.close().catch(() => {});
  }
}

/**
 * Catalog processor that enriches native `API` / `spec.type: 'mcp-server'`
 * entities with a discovered summary — capabilities, counts, server identity,
 * and a flat list of tool names — by connecting to the server's remote.
 *
 * Tool *detail* (schemas etc.) is served live by the discovery router and is
 * intentionally not stored here. Discovery is cached per remote URL with a TTL
 * so refreshes don't hammer the servers, and any failure leaves the entity
 * unchanged.
 */
export class McpServerCapabilitiesProcessor implements CatalogProcessor {
  private readonly logger: LoggerService;
  private readonly ttlMs: number;
  private readonly fields: EnrichmentFields;

  constructor(options: {
    logger: LoggerService;
    ttlMs?: number;
    fields?: EnrichmentFields;
  }) {
    this.logger = options.logger.child({
      component: 'McpServerCapabilitiesProcessor',
    });
    this.ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
    this.fields = options.fields ?? 'summary';
  }

  getProcessorName(): string {
    return 'McpServerCapabilitiesProcessor';
  }

  async preProcessEntity(
    entity: Entity,
    _location: unknown,
    _emit: unknown,
    _originLocation: unknown,
    cache: CatalogProcessorCache,
  ): Promise<Entity> {
    if (
      entity.kind !== 'API' ||
      (entity.spec as { type?: string } | undefined)?.type !== 'mcp-server'
    ) {
      return entity;
    }

    const remote = selectMcpServerRemote(entity);
    if (!remote?.url || !parseMcpRemoteUrl(remote.url)) {
      return entity;
    }

    try {
      const summary = await this.getSummary(remote.url, cache);
      return {
        ...entity,
        spec: { ...entity.spec, ...(summary as unknown as JsonObject) },
      };
    } catch (error) {
      this.logger.debug(
        `Discovery failed for ${entity.metadata.name} (${remote.url}): ${
          (error as Error).message
        }`,
      );
      return entity;
    }
  }

  private async getSummary(
    url: string,
    cache: CatalogProcessorCache,
  ): Promise<MCPServerEnrichmentSpec> {
    const cacheKey = `mcp-capabilities:${url}`;
    const cached = (await cache.get<JsonObject>(cacheKey)) as
      | CacheItem
      | undefined;
    if (cached && Date.now() - cached.cachedAt < this.ttlMs) {
      return cached.summary;
    }

    const discovered = await discoverMcpServer(url, this.logger);
    const summary = this.toSummary(discovered);

    const item: CacheItem = { summary, cachedAt: Date.now() };
    await cache.set(cacheKey, item as unknown as JsonObject);
    return summary;
  }

  private toSummary(discovered: MCPServerSpec): MCPServerEnrichmentSpec {
    const base: MCPServerEnrichmentSpec = {
      toolCount: discovered.tools.length,
      resourceCount: discovered.resources.length,
      promptCount: discovered.prompts.length,
      toolNames: discovered.tools.map(t => t.name),
    };
    if (this.fields === 'names') {
      return base;
    }
    return {
      ...base,
      capabilities: discovered.capabilities,
      serverInfo: discovered.serverInfo,
      instructions: discovered.instructions,
    };
  }
}
