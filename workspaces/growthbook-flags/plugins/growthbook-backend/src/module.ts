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
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { RequestHandler } from 'express';
import type { FlagRow } from '@backstage-community/plugin-growthbook-common';
import { MgmtFeature, normalizeMgmtFlags, normalizeSdkFlags } from './helpers';

type GbProject = { id: string; name: string };

type CacheEntry<T> = { data: T; fetchedAt: number };

const FLAG_CACHE_TTL_MS = 60_000;
const PROJECT_CACHE_TTL_MS = 300_000;
const FLAG_CACHE_MAX_ENTRIES = 200;

const flagCache = new Map<string, CacheEntry<FlagRow[]>>();
let projectCache: CacheEntry<GbProject[]> | null = null;
let rawFeaturesCache: CacheEntry<MgmtFeature[]> | null = null;

/** @public */
const growthbookFlagsPlugin = createBackendPlugin({
  pluginId: 'backstage-community-growthbook',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        http: coreServices.httpRouter,
      },
      async init({ logger, config, http }) {
        const gbConfig = config.getOptionalConfig('growthbook');
        if (!gbConfig) {
          logger.warn(
            'growthbook config not found — growthbook-flags plugin will not initialize',
          );
          return;
        }

        const baseUrl = gbConfig.getString('baseUrl').replace(/\/+$/, '');
        const secretKey = gbConfig.getOptionalString('secretKey');
        const sdkKeysConfig = secretKey
          ? undefined
          : gbConfig.getOptionalConfig('sdkKeys');

        if (!secretKey && !sdkKeysConfig) {
          logger.error(
            'Invalid growthbook config: either growthbook.secretKey or growthbook.sdkKeys must be configured',
          );
          throw new Error(
            'Missing required GrowthBook configuration: growthbook.secretKey or growthbook.sdkKeys',
          );
        }
        async function fetchProjects(): Promise<GbProject[]> {
          const now = Date.now();
          if (
            projectCache &&
            now - projectCache.fetchedAt < PROJECT_CACHE_TTL_MS
          ) {
            return projectCache.data;
          }
          const res = await fetch(`${baseUrl}/api/v1/projects?limit=100`, {
            headers: { Authorization: `Bearer ${secretKey}` },
          });
          if (!res.ok)
            throw new Error(`GrowthBook projects API returned ${res.status}`);
          const body = (await res.json()) as { projects: GbProject[] };
          projectCache = { data: body.projects, fetchedAt: now };
          return body.projects;
        }

        async function fetchAllFeaturesByProject(
          projectId: string,
          gbEnv: string,
        ): Promise<FlagRow[]> {
          const cacheKey = `${projectId}:${gbEnv}`;
          const now = Date.now();
          const cached = flagCache.get(cacheKey);
          if (cached && now - cached.fetchedAt < FLAG_CACHE_TTL_MS) {
            return cached.data;
          }

          // GrowthBook API does not support ?project= filter — fetch all and filter client-side
          const allRows = await fetchAllFeatures(gbEnv);
          const allFeatures = await fetchAllRawFeatures();
          const projectFeatureIds = new Set(
            allFeatures.filter(f => f.project === projectId).map(f => f.id),
          );
          const rows = allRows.filter(r => projectFeatureIds.has(r.key));
          if (
            flagCache.has(cacheKey) ||
            flagCache.size < FLAG_CACHE_MAX_ENTRIES
          )
            flagCache.set(cacheKey, { data: rows, fetchedAt: now });
          return rows;
        }

        async function fetchAllRawFeatures(): Promise<MgmtFeature[]> {
          const now = Date.now();
          if (
            rawFeaturesCache &&
            now - rawFeaturesCache.fetchedAt < FLAG_CACHE_TTL_MS
          ) {
            return rawFeaturesCache.data;
          }
          const features: MgmtFeature[] = [];
          let offset = 0;
          const limit = 100;
          let hasMore = true;
          while (hasMore) {
            const url = `${baseUrl}/api/v1/features?limit=${limit}&offset=${offset}`;
            const res = await fetch(url, {
              headers: { Authorization: `Bearer ${secretKey}` },
            });
            if (!res.ok)
              throw new Error(`GrowthBook features API returned ${res.status}`);
            const body = (await res.json()) as {
              features: MgmtFeature[];
              hasMore: boolean;
              nextOffset: number | null;
            };
            features.push(...body.features);
            hasMore = body.hasMore && body.nextOffset !== null;
            if (hasMore) offset = body.nextOffset!;
          }
          rawFeaturesCache = { data: features, fetchedAt: now };
          return features;
        }

        async function fetchAllFeatures(gbEnv: string): Promise<FlagRow[]> {
          const cacheKey = `all:${gbEnv}`;
          const now = Date.now();
          const cached = flagCache.get(cacheKey);
          if (cached && now - cached.fetchedAt < FLAG_CACHE_TTL_MS) {
            return cached.data;
          }
          const features = await fetchAllRawFeatures();
          const rows = normalizeMgmtFlags(features, gbEnv);
          if (
            flagCache.has(cacheKey) ||
            flagCache.size < FLAG_CACHE_MAX_ENTRIES
          )
            flagCache.set(cacheKey, { data: rows, fetchedAt: now });
          return rows;
        }

        const handler: RequestHandler = async (req, res) => {
          if (req.method !== 'GET') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
          }

          // GET /projects — returns list of project names
          if (req.path === '/projects') {
            if (!secretKey) {
              res.json({ projects: [] });
              return;
            }
            try {
              const projects = await fetchProjects();
              res.json({ projects: projects.map(p => p.name) });
            } catch (err) {
              logger.error(`Failed to fetch GrowthBook projects: ${err}`);
              res
                .status(502)
                .json({ error: 'Failed to fetch projects from GrowthBook' });
            }
            return;
          }

          if (req.path !== '/flags') {
            res.status(404).json({ error: 'Not found' });
            return;
          }

          const gbEnv = (req.query.env as string) || 'prod';
          const projectName = req.query.project as string | undefined;

          // --- Management API path (when secretKey is configured) ---
          if (secretKey) {
            try {
              let flags: FlagRow[];
              if (projectName) {
                const projects = await fetchProjects();
                const match = projects.find(
                  p => p.name.toLowerCase() === projectName.toLowerCase(),
                );
                if (!match) {
                  res.status(400).json({ error: 'Unknown project' });
                  return;
                }
                flags = await fetchAllFeaturesByProject(match.id, gbEnv);
              } else {
                flags = await fetchAllFeatures(gbEnv);
              }
              res.json(flags);
            } catch (err) {
              logger.error(
                `Failed to fetch GrowthBook flags (management API): ${err}`,
              );
              res
                .status(502)
                .json({ error: 'Failed to fetch flags from GrowthBook' });
            }
            return;
          }

          // --- SDK API fallback (no secretKey) ---
          if (projectName) {
            res.status(400).json({
              error: 'Project filtering is not supported in SDK mode',
            });
            return;
          }

          if (!sdkKeysConfig) {
            res.status(500).json({ error: 'SDK keys not configured' });
            return;
          }

          let sdkKey: string;
          try {
            sdkKey = sdkKeysConfig.getString(gbEnv);
          } catch {
            res.status(400).json({ error: 'Unknown environment' });
            return;
          }

          const now = Date.now();
          const cached = flagCache.get(sdkKey);
          if (cached && now - cached.fetchedAt < FLAG_CACHE_TTL_MS) {
            res.json(cached.data);
            return;
          }

          try {
            const response = await fetch(`${baseUrl}/api/features/${sdkKey}`);
            if (!response.ok) {
              throw new Error(`GrowthBook returned HTTP ${response.status}`);
            }
            const payload = (await response.json()) as {
              features?: Record<string, { defaultValue: unknown }>;
            };
            const flags = normalizeSdkFlags(payload.features ?? {});
            if (
              flagCache.has(sdkKey) ||
              flagCache.size < FLAG_CACHE_MAX_ENTRIES
            )
              flagCache.set(sdkKey, { data: flags, fetchedAt: now });
            res.json(flags);
          } catch (err) {
            logger.error('Failed to fetch GrowthBook flags (SDK API)', {
              env: gbEnv,
              error: String(err),
            });
            res
              .status(502)
              .json({ error: 'Failed to fetch flags from GrowthBook' });
          }
        };

        http.use(handler);
        logger.info(
          `GrowthBook Flags plugin initialized at /api/backstage-community-growthbook (mode: ${
            secretKey ? 'management API' : 'SDK API'
          })`,
        );
      },
    });
  },
});

export default growthbookFlagsPlugin;
