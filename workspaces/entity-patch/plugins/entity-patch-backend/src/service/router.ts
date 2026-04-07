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
import type { NextFunction, Request, Response } from 'express';
import type {
  LoggerService,
  DatabaseService,
  HttpAuthService,
  AuthService,
  UserInfoService,
  DiscoveryService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import type { Config } from '@backstage/config';
import { InputError, NotFoundError } from '@backstage/errors';
import { CatalogClient } from '@backstage/catalog-client';
import { stringifyEntityRef } from '@backstage/catalog-model';
import {
  evaluateFilterPredicate,
  FilterPredicate,
} from '@backstage/filter-predicates';
import { z } from 'zod';
import { PatchStore } from './PatchStore';
import { extractEntityValues, RelationPair } from './EntityValueExtractor';

export interface RouterOptions {
  logger: LoggerService;
  database: DatabaseService;
  httpAuth: HttpAuthService;
  auth: AuthService;
  userInfo: UserInfoService;
  discovery: DiscoveryService;
  config: RootConfigService;
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

  /**
   * Builds a lookup map from relation type → RelationPair, indexed by both
   * forward and reverse types. Returns an empty map when no relations are configured.
   */
  function getRelationPairs(): Map<string, RelationPair> {
    const pairs = new Map<string, RelationPair>();
    const relations =
      config.getOptionalConfigArray('entityPatch.relations') ?? [];
    for (const r of relations) {
      const forward = r.getString('forward');
      const reverse = r.getString('reverse');
      const pair: RelationPair = { forward, reverse };
      pairs.set(forward, pair);
      pairs.set(reverse, pair);
    }
    return pairs;
  }

  /**
   * Builds a mapping of patchName → { mapping, filter, sectionProperties } from config.
   * Only patches that have a `mapping` block are included.
   */
  function getPatchConfigs(): Array<{
    name: string;
    mapping: Record<string, string>;
    filter?: FilterPredicate;
    sectionProperties: Record<string, unknown>;
  }> {
    const patches = config.getOptionalConfigArray('entityPatch.patches') ?? [];
    return patches
      .filter((p: Config) => p.has('mapping'))
      .map((p: Config) => {
        const sections =
          p
            .getOptionalConfigArray('sections')
            ?.map(
              s => s.getOptional<Record<string, unknown>>('properties') ?? {},
            ) ?? [];
        const sectionProperties = Object.assign({}, ...sections);
        return {
          name: p.getString('name'),
          mapping: p.getOptional('mapping') as Record<string, string>,
          filter: p.has('filter')
            ? (p.get('filter') as FilterPredicate)
            : undefined,
          sectionProperties,
        };
      });
  }

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

    const dbOverlay = await store.findByEntityRef(entityRef);

    if (!fillFromEntity) {
      // Raw mode (used by the catalog processor): add ETag for conditional requests.
      const latestUpdatedAt = await store.getLatestUpdatedAt(entityRef);
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

    // fillFromEntity mode: merge catalog field values with DB overlay
    const { token } = await auth.getPluginRequestToken({
      onBehalfOf: credentials,
      targetPluginId: 'catalog',
    });

    const entity = await catalogClient.getEntityByRef(entityRef, { token });

    if (!entity) {
      throw new NotFoundError(`Entity '${entityRef}' not found in catalog`);
    }

    // Only extract values for patches whose filter matches the entity
    const patchConfigs = getPatchConfigs().filter(
      p => !p.filter || evaluateFilterPredicate(p.filter, entity),
    );
    const relationPairs = getRelationPairs();

    const catalogValues: Record<string, Record<string, unknown>> = {};
    for (const {
      name: patchName,
      mapping,
      sectionProperties,
    } of patchConfigs) {
      catalogValues[patchName] = extractEntityValues(entity, mapping, {
        relationPairs,
        sectionProperties,
      });
    }

    // Merge: catalog values as base, DB overlay on top per patch
    const merged: Record<string, Record<string, unknown>> = {
      ...catalogValues,
    };
    for (const [patchName, dbData] of Object.entries(dbOverlay)) {
      if (patchName in catalogValues) {
        merged[patchName] = { ...(catalogValues[patchName] ?? {}), ...dbData };
      }
    }

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

    // Trigger an immediate catalog refresh so the processor re-processes
    // the entity with the new patch data rather than waiting for the next
    // scheduled ingestion loop. This is best-effort — a failure here does
    // not affect the save result.
    auth
      .getPluginRequestToken({
        onBehalfOf: credentials,
        targetPluginId: 'catalog',
      })
      .then(({ token }) => catalogClient.refreshEntity(entityRef, { token }))
      .catch(err =>
        logger.warn(
          `Could not trigger catalog refresh for ${entityRef} after patch save: ${err}`,
        ),
      );

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
