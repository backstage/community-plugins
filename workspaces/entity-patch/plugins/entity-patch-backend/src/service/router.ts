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
import Router from 'express-promise-router';
import type { NextFunction, Request, Response } from 'express';
import type {
  LoggerService,
  DatabaseService,
  HttpAuthService,
  AuthService,
  UserInfoService,
  DiscoveryService,
  ConfigService,
} from '@backstage/backend-plugin-api';
import { InputError, NotFoundError } from '@backstage/errors';
import { CatalogClient } from '@backstage/catalog-client';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { z } from 'zod';
import { PatchStore } from './PatchStore';
import { extractEntityValues } from './EntityValueExtractor';

export interface RouterOptions {
  logger: LoggerService;
  database: DatabaseService;
  httpAuth: HttpAuthService;
  auth: AuthService;
  userInfo: UserInfoService;
  discovery: DiscoveryService;
  config: ConfigService;
}

const patchBodySchema = z.object({
  patchName: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
});

export async function createRouter(options: RouterOptions) {
  const { logger, database, httpAuth, auth, userInfo, discovery, config } =
    options;

  const store = await PatchStore.create(database);
  const catalogClient = new CatalogClient({ discoveryApi: discovery });

  /** Build a mapping of patchName → field→dotPath from config. */
  function getMappings(): Record<string, Record<string, string>> {
    const patches = config.getOptionalConfigArray('entityPatch.patches') ?? [];
    return Object.fromEntries(
      patches
        .filter(p => p.has('mapping'))
        .map(p => [
          p.getString('name'),
          p.get<Record<string, string>>('mapping'),
        ]),
    );
  }

  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  /**
   * GET /values/:namespace/:kind/:name
   * Returns initial form values for all configured patches on this entity.
   * Catalog values (via mapping) are merged with any DB overlay,
   * DB overlay taking precedence.
   */
  router.get('/values/:namespace/:kind/:name', async (req, res) => {
    const { namespace, kind, name } = req.params;
    const credentials = await httpAuth.credentials(req, {
      allow: ['user', 'service'],
    });

    const entityRef = stringifyEntityRef({ kind, namespace, name });

    const { token } = await auth.getPluginRequestToken({
      onBehalfOf: credentials,
      targetPluginId: 'catalog',
    });

    const entity = await catalogClient.getEntityByRef(entityRef, { token });

    if (!entity) {
      throw new NotFoundError(`Entity '${entityRef}' not found in catalog`);
    }

    const mappings = getMappings();
    const catalogValues: Record<string, Record<string, unknown>> = {};
    for (const [patchName, mapping] of Object.entries(mappings)) {
      catalogValues[patchName] = extractEntityValues(entity, mapping);
    }

    const dbOverlay = await store.findByEntityRef(entityRef);

    // Merge: catalog values as base, DB overlay on top per patch
    const merged: Record<string, Record<string, unknown>> = {
      ...catalogValues,
    };
    for (const [patchName, dbData] of Object.entries(dbOverlay)) {
      merged[patchName] = { ...(catalogValues[patchName] ?? {}), ...dbData };
    }

    logger.debug('Returning initial values', { entityRef });
    res.json(merged);
  });

  /**
   * POST /patches/:namespace/:kind/:name
   * Persists form data for a single patch on an entity.
   */
  router.post('/patches/:namespace/:kind/:name', async (req, res) => {
    const { namespace, kind, name } = req.params;
    const credentials = await httpAuth.credentials(req, { allow: ['user'] });
    const { userEntityRef } = await userInfo.getUserInfo(credentials);

    const parsed = patchBodySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new InputError(
        `Invalid request body: ${parsed.error.issues.map(i => i.message).join(', ')}`,
      );
    }

    const entityRef = stringifyEntityRef({ kind, namespace, name });
    const { patchName, data } = parsed.data;

    await store.upsert(entityRef, patchName, data, userEntityRef);

    logger.info('Patch saved', {
      entityRef,
      patchName,
      updatedBy: userEntityRef,
    });
    res.status(200).json({ status: 'ok' });
  });

  // Map Backstage error types to HTTP status codes
  router.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
    } else if (err instanceof InputError) {
      res.status(400).json({ error: err.message });
    } else {
      next(err);
    }
  });

  return router;
}
