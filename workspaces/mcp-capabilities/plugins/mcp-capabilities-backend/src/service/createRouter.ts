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
import { HttpAuthService, LoggerService } from '@backstage/backend-plugin-api';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { InputError, NotFoundError } from '@backstage/errors';
import { Entity } from '@backstage/catalog-model';
import {
  discoverFromClient,
  McpServerRemote,
  MCPServerSpec,
  parseMcpRemoteUrl,
  selectMcpServerRemote,
} from '@backstage-community/plugin-mcp-capabilities-common';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import express from 'express';
import Router from 'express-promise-router';

export interface RouterOptions {
  httpAuth: HttpAuthService;
  catalog: CatalogService;
  logger: LoggerService;
}

const DISCOVERY_TIMEOUT_MS = 30_000;

function getRemote(entity: Entity): { remote: McpServerRemote; url: URL } {
  const ref = `${entity.kind}:${entity.metadata.namespace}/${entity.metadata.name}`;
  if (entity.kind !== 'API') {
    throw new InputError(`Entity ${ref} is not an API`);
  }
  if ((entity.spec as { type?: string } | undefined)?.type !== 'mcp-server') {
    throw new InputError(`Entity ${ref} is not an mcp-server API`);
  }
  const remote = selectMcpServerRemote(entity);
  if (!remote?.url) {
    throw new InputError('mcp-server entity has no usable remote URL');
  }
  const url = parseMcpRemoteUrl(remote.url);
  if (!url) {
    throw new InputError(
      `mcp-server entity remote URL is not a valid http(s) URL: "${remote.url}"`,
    );
  }
  return { remote, url };
}

/**
 * Connects to an MCP server over streamable-http and discovers its full
 * tool/resource/prompt detail. Owns the client lifecycle; capability-gating
 * and mapping live in `discoverFromClient` (shared with the catalog processor).
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

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { httpAuth, catalog, logger } = options;
  const router = Router();
  router.use(express.json());

  // Live discovery of a native mcp-server entity's tools/resources/prompts.
  // The endpoint reads `spec.remotes` straight off the catalog entity, so the
  // server URL lives in exactly one place (no duplicate provider config).
  router.get('/spec', async (req, res) => {
    const credentials = await httpAuth.credentials(req, {
      allow: ['user', 'service'],
    });

    const entityRef = req.query.entityRef;
    if (typeof entityRef !== 'string' || !entityRef) {
      throw new InputError('Missing required query parameter "entityRef"');
    }

    const entity = await catalog.getEntityByRef(entityRef, { credentials });
    if (!entity) {
      throw new NotFoundError(`No entity found for ref "${entityRef}"`);
    }

    const { remote, url } = getRemote(entity);
    logger.info(`Discovering MCP server ${entityRef} at ${url.origin}`);

    const spec = await discoverMcpServer(remote.url, logger);
    res.json(spec);
  });

  return router;
}
