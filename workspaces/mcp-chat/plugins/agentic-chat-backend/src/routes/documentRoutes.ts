/*
 * Copyright 2025 The Backstage Authors
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
import { createWithRoute } from './routeWrapper';
import type { RouteContext } from './types';

/**
 * Registers document, RAG sync, safety, evaluation, and vector-store endpoints.
 */
export function registerDocumentRoutes(ctx: RouteContext): void {
  const { router, logger, provider, sendRouteError } = ctx;
  const withRoute = createWithRoute(logger, sendRouteError);

  router.get(
    '/documents',
    withRoute(
      'GET /documents',
      'Failed to list documents',
      async (req, res) => {
        if (!provider.rag) {
          res.json({
            success: true,
            documents: [],
            totalDocuments: 0,
            timestamp: new Date().toISOString(),
          });
          return;
        }
        const vectorStoreId =
          typeof req.query.vectorStoreId === 'string'
            ? req.query.vectorStoreId
            : undefined;
        const documents = await provider.rag.listDocuments(vectorStoreId);
        res.json({
          success: true,
          documents,
          totalDocuments: documents.length,
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );

  router.post(
    '/sync',
    withRoute('POST /sync', 'Failed to sync documents', async (_req, res) => {
      if (!provider.rag) {
        res.status(501).json({
          success: false,
          error: 'RAG not supported by current provider',
        });
        return;
      }
      const result = await provider.rag.syncDocuments();
      res.json({
        success: true,
        ...result,
        timestamp: new Date().toISOString(),
      });
    }),
  );

  router.get(
    '/safety/status',
    withRoute(
      'GET /safety/status',
      'Failed to get safety status',
      async (_req, res) => {
        await provider.refreshDynamicConfig?.();
        if (provider.safety) {
          const safetyStatus = await provider.safety.getStatus();
          res.json({ ...safetyStatus, timestamp: new Date().toISOString() });
        } else {
          res.json({
            enabled: false,
            shields: [],
            timestamp: new Date().toISOString(),
          });
        }
      },
    ),
  );

  router.get(
    '/evaluation/status',
    withRoute(
      'GET /evaluation/status',
      'Failed to get evaluation status',
      async (_req, res) => {
        await provider.refreshDynamicConfig?.();
        if (provider.evaluation) {
          const evalStatus = await provider.evaluation.getStatus();
          res.json({ ...evalStatus, timestamp: new Date().toISOString() });
        } else {
          res.json({
            enabled: false,
            scoringFunctions: [],
            timestamp: new Date().toISOString(),
          });
        }
      },
    ),
  );

  router.get(
    '/vector-stores',
    withRoute(
      'GET /vector-stores',
      'Failed to list vector stores',
      async (_req, res) => {
        if (!provider.rag) {
          res.json({
            success: true,
            vectorStores: [],
            timestamp: new Date().toISOString(),
          });
          return;
        }
        const vectorStores = await provider.rag.listVectorStores();
        const defaultId = provider.rag.getDefaultVectorStoreId();
        res.json({
          success: true,
          vectorStores,
          defaultVectorStoreId: defaultId,
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );
}
