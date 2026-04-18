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
import express from 'express';
import type {
  LoggerService,
  DatabaseService,
  HttpAuthService,
  UserInfoService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { z } from 'zod';
import { PatchStore } from './PatchStore';
import { EntityValueExtractor } from './EntityValueExtractor';

export interface RouterOptions {
  logger: LoggerService;
  database: DatabaseService;
  httpAuth: HttpAuthService;
  userInfo: UserInfoService;
  config: RootConfigService;
  catalogService: CatalogService;
}

const patchBodySchema = z.object({
  patchName: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
});

export async function createRouter(options: RouterOptions) {
  const { logger, database, httpAuth, userInfo, config, catalogService } =
    options;

  const store = await PatchStore.create(database);

  // Build all config-derived values once at startup.
  const extractor = EntityValueExtractor.fromConfig(config, { catalogService });

  const router = Router();
  router.use(express.json());

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  /**
   * GET /values/:namespace/:kind/:name
   *
   * Returns patch data for an entity.
   *
   * By default returns **raw DB-stored data only** — only patches that have
   * been explicitly saved are included. This mode also supports ETag-based
   * conditional requests: the response includes an `ETag` header derived from
   * the latest `updated_at` timestamp in the DB. Callers that send a matching
   * `If-None-Match` header receive a `304 Not Modified` with no body, allowing
   * the catalog processor to skip re-applying unchanged data.
   *
   * Pass `?fillFromEntity=true` to also extract current catalog field values
   * via the configured mapping and merge them as a base (DB data takes
   * precedence). This is the mode used by the frontend form to pre-populate
   * fields from the entity's current state.
   */
  router.get('/values/:namespace/:kind/:name', async (req, res) => {
    const { namespace, kind, name } = req.params;
    const fillFromEntity = req.query.fillFromEntity === 'true';
    const credentials = await httpAuth.credentials(req, {
      allow: ['user', 'service'],
    });
    const entityRef = stringifyEntityRef({ kind, namespace, name });

    const { rows: dbOverlay, latestUpdatedAt } =
      await store.findWithLatestUpdatedAt(entityRef);

    if (!fillFromEntity) {
      const etag = latestUpdatedAt
        ? `"${Buffer.from(latestUpdatedAt).toString('base64')}"`
        : '"empty"';
      res.setHeader('ETag', etag);
      if (req.headers['if-none-match'] === etag) {
        res.status(304).end();
        return;
      }
      logger.debug('Returning raw patch data', { entityRef });
      res.json(dbOverlay);
      return;
    }

    const merged = await extractor.mergeWithCatalog(
      entityRef,
      dbOverlay,
      credentials,
    );
    logger.debug('Returning entity-filled values', { entityRef });
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
        `Invalid request body: ${parsed.error.issues
          .map(i => i.message)
          .join(', ')}`,
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

    // Trigger an immediate catalog refresh so the processor re-processes
    // the entity with the new patch data rather than waiting for the next
    // scheduled ingestion loop. This is best-effort — a failure here does
    // not affect the save result.
    catalogService
      .refreshEntity(entityRef, { credentials })
      .catch(err =>
        logger.warn(
          `Could not trigger catalog refresh for ${entityRef} after patch save: ${err}`,
        ),
      );

    res.status(200).json({ status: 'ok' });
  });

  router.use(MiddlewareFactory.create({ logger, config }).error());

  return router;
}
