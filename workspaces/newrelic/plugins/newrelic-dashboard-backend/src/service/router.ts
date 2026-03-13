/*
 * Copyright 2024 The Backstage Authors
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

import { CacheService, LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import fetch from 'node-fetch';

/** @public */
export type NewRelicDashboardRouterOptions = {
  logger: LoggerService;
  config: Config;
  cache: CacheService;
};

const ENTITY_SEARCH_QUERY = `query ($query: String) {
  actor {
    entitySearch(query: $query) {
      results {
        entities {
          name
          ... on DashboardEntityOutline {
            name
            dashboardParentGuid
            guid
          }
          permalink
        }
      }
    }
  }
}`;

const SNAPSHOT_QUERY = `mutation($guid: EntityGuid!, $duration: Milliseconds) {
  dashboardCreateSnapshotUrl(guid: $guid, params: {timeWindow: {duration: $duration}})
}`;

/** @public */
export async function createRouter(
  options: NewRelicDashboardRouterOptions,
): Promise<express.Router> {
  const { logger, config, cache } = options;

  const apiToken = config.getString('newRelicDashboard.apiToken');
  const graphUrl =
    config.getOptionalString('newRelicDashboard.graphUrl') ??
    'https://api.newrelic.com/graphql';

  async function callNerdGraph<T>(
    query: string,
    variables: Record<string, string | number>,
  ): Promise<T> {
    const response = await fetch(graphUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-Key': apiToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`NerdGraph request failed: ${response.status} ${text}`);
    }

    const body = (await response.json()) as {
      data?: T;
      errors?: Array<{ message: string }>;
    };

    if (body.errors?.length) {
      throw new Error(`NerdGraph errors: ${JSON.stringify(body.errors)}`);
    }

    if (!body.data) {
      throw new Error('NerdGraph returned no data');
    }

    return body.data;
  }

  const router = Router();
  router.use(express.json());

  router.get('/entities', async (req, res) => {
    const guid = req.query.guid as string;
    if (!guid) {
      res.status(400).json({ message: 'Missing guid parameter' });
      return;
    }

    try {
      const data = await callNerdGraph<{
        actor: {
          entitySearch: {
            results: {
              entities: Array<{
                name: string;
                dashboardParentGuid: string | null;
                guid: string;
                permalink: string;
              }>;
            };
          };
        };
      }>(ENTITY_SEARCH_QUERY, {
        query: `id ='${guid}' OR parentId ='${guid}'`,
      });

      let entities = data.actor.entitySearch.results.entities ?? [];

      if (entities.length > 1) {
        entities = entities.filter(e => e.dashboardParentGuid !== null);
      }

      res.json({
        data: {
          actor: {
            entitySearch: {
              results: { entities },
            },
          },
        },
      });
    } catch (error) {
      logger.error(`Entity search failed: ${error}`);
      res.status(502).json({ message: 'Failed to fetch dashboard entities' });
    }
  });

  router.get('/snapshot/pdf', async (req, res) => {
    const guid = req.query.guid as string;
    const duration = req.query.duration as string;

    if (!guid || !duration) {
      res.status(400).json({ message: 'Missing guid or duration parameter' });
      return;
    }

    const durationMs = Number(duration);
    if (Number.isNaN(durationMs) || durationMs <= 0) {
      res.status(400).json({ message: 'Invalid duration parameter' });
      return;
    }

    const cacheKey = `snapshot-pdf:${guid}:${duration}`;

    const cached = (await cache.get(cacheKey)) as string | undefined;
    if (cached) {
      const pdfBuffer = Buffer.from(cached, 'base64');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.end(pdfBuffer);
      return;
    }

    try {
      const snapshotData = await callNerdGraph<{
        dashboardCreateSnapshotUrl?: string;
      }>(SNAPSHOT_QUERY, { guid, duration: durationMs });

      const pdfUrl = snapshotData.dashboardCreateSnapshotUrl;
      if (!pdfUrl) {
        res
          .status(502)
          .json({ message: 'No snapshot URL returned from NerdGraph' });
        return;
      }

      const pdfResponse = await fetch(pdfUrl);
      if (!pdfResponse.ok) {
        logger.error(`PDF fetch failed: ${pdfResponse.status}`);
        res.status(502).json({ message: 'Failed to fetch snapshot PDF' });
        return;
      }

      const pdfBuffer = await pdfResponse.buffer();

      await cache.set(cacheKey, pdfBuffer.toString('base64'), {
        ttl: 300_000,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.end(pdfBuffer);
    } catch (error) {
      logger.error(`Snapshot PDF fetch failed: ${error}`);
      res.status(500).json({ message: 'Internal error fetching snapshot PDF' });
    }
  });

  logger.info('New Relic Dashboard backend router initialized');
  return router;
}
