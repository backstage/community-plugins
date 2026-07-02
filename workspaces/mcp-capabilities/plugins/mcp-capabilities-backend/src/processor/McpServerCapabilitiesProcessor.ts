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
import { MCPServerEnrichmentSpec } from '@backstage-community/plugin-mcp-capabilities-common';
import { MCPClient } from '../lib/MCPClient';

interface CacheItem {
  summary: MCPServerEnrichmentSpec;
  cachedAt: number;
}

const DEFAULT_TTL_MS = 10 * 60 * 1000;

interface McpServerSpec {
  type?: string;
  remotes?: Array<{ type?: string; url: string }>;
}

/**
 * Catalog processor that enriches native `API` / `spec.type: 'mcp-server'`
 * entities with a discovered summary — capabilities, counts, server identity,
 * and a flat list of tool names — by connecting to the server's remote.
 *
 * The summary is what the model layer added to the schema, so the values are
 * valid on the entity. Tool *detail* (schemas etc.) is served live by the
 * discovery router and is intentionally not stored here.
 *
 * Discovery is cached per remote URL with a TTL so refreshes don't hammer the
 * servers, and any failure leaves the entity unchanged.
 */
export class McpServerCapabilitiesProcessor implements CatalogProcessor {
  private readonly logger: LoggerService;
  private readonly ttlMs: number;

  constructor(options: { logger: LoggerService; ttlMs?: number }) {
    this.logger = options.logger.child({
      component: 'McpServerCapabilitiesProcessor',
    });
    this.ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
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
    const spec = (entity.spec ?? {}) as McpServerSpec;
    if (entity.kind !== 'API' || spec.type !== 'mcp-server') {
      return entity;
    }

    const remote =
      (spec.remotes ?? []).find(r => r.type === 'streamable-http') ??
      (spec.remotes ?? [])[0];
    if (!remote?.url) {
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

    const client = new MCPClient({ url, timeoutMs: 15_000 }, this.logger);
    const discovered = await client.discover();
    const summary: MCPServerEnrichmentSpec = {
      capabilities: discovered.capabilities,
      serverInfo: discovered.serverInfo,
      instructions: discovered.instructions,
      toolCount: discovered.tools.length,
      resourceCount: discovered.resources.length,
      promptCount: discovered.prompts.length,
      toolNames: discovered.tools.map(t => t.name),
    };

    const item: CacheItem = { summary, cachedAt: Date.now() };
    await cache.set(cacheKey, item as unknown as JsonObject);
    return summary;
  }
}
