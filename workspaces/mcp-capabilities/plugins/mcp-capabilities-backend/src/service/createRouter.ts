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
import express from 'express';
import Router from 'express-promise-router';
import { MCPClient } from '../lib/MCPClient';

export interface RouterOptions {
  httpAuth: HttpAuthService;
  catalog: CatalogService;
  logger: LoggerService;
}

interface McpRemote {
  type?: string;
  url: string;
}

function getRemote(entity: Entity): McpRemote {
  const spec = (entity.spec ?? {}) as { type?: string; remotes?: McpRemote[] };
  if (spec.type !== 'mcp-server') {
    throw new InputError(
      `Entity ${entity.kind}:${entity.metadata.namespace}/${entity.metadata.name} is not an mcp-server API`,
    );
  }
  const remotes = spec.remotes ?? [];
  const remote = remotes.find(r => r.type === 'streamable-http') ?? remotes[0];
  if (!remote?.url) {
    throw new InputError('mcp-server entity has no usable remote URL');
  }
  return remote;
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
      allow: ['user', 'none'],
    });

    const entityRef = req.query.entityRef;
    if (typeof entityRef !== 'string' || !entityRef) {
      throw new InputError('Missing required query parameter "entityRef"');
    }

    const entity = await catalog.getEntityByRef(entityRef, { credentials });
    if (!entity) {
      throw new NotFoundError(`No entity found for ref "${entityRef}"`);
    }

    const remote = getRemote(entity);
    logger.info(`Discovering MCP server ${entityRef} at ${remote.url}`);

    const client = new MCPClient({ url: remote.url }, logger);
    const spec = await client.discover();
    res.json(spec);
  });

  return router;
}
