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
import { InputError } from '@backstage/errors';
import {
  DEFAULT_CHUNK_OVERLAP,
  DEFAULT_CHUNK_SIZE,
  DEFAULT_VECTOR_STORE_NAME,
} from '../constants';
import { createWithRoute } from './routeWrapper';
import type { AdminRouteDeps } from './adminRouteTypes';
import type { ProviderType } from '@backstage-community/plugin-agentic-chat-common';

function readVectorStoreDefaults(
  ls: import('@backstage/config').Config | undefined,
): Record<string, unknown> {
  return {
    vectorStoreName:
      ls?.getOptionalString('vectorStoreName') ?? DEFAULT_VECTOR_STORE_NAME,
    embeddingModel:
      ls?.getOptionalString('embeddingModel') ??
      'sentence-transformers/all-MiniLM-L6-v2',
    embeddingDimension: ls?.getOptionalNumber('embeddingDimension') ?? 384,
    searchMode: ls?.getOptionalString('searchMode') ?? 'semantic',
    bm25Weight: ls?.getOptionalNumber('bm25Weight'),
    semanticWeight: ls?.getOptionalNumber('semanticWeight'),
    chunkingStrategy: ls?.getOptionalString('chunkingStrategy') ?? 'auto',
    maxChunkSizeTokens:
      ls?.getOptionalNumber('maxChunkSizeTokens') ?? DEFAULT_CHUNK_SIZE,
    chunkOverlapTokens:
      ls?.getOptionalNumber('chunkOverlapTokens') ?? DEFAULT_CHUNK_OVERLAP,
    fileSearchMaxResults: ls?.getOptionalNumber('fileSearchMaxResults'),
    fileSearchScoreThreshold: ls?.getOptionalNumber('fileSearchScoreThreshold'),
  };
}

const VECTOR_STORE_CONFIG_FIELDS = [
  'vectorStoreName',
  'embeddingModel',
  'embeddingDimension',
  'searchMode',
  'bm25Weight',
  'semanticWeight',
  'chunkingStrategy',
  'maxChunkSizeTokens',
  'chunkOverlapTokens',
  'fileSearchMaxResults',
  'fileSearchScoreThreshold',
] as const;

/**
 * Simple promise-based mutex to serialise read-modify-write on activeVectorStoreIds.
 */
class ActiveIdsMutex {
  private pending: Promise<void> = Promise.resolve();

  async run<T>(fn: () => Promise<T>): Promise<T> {
    let release: () => void;
    const next = new Promise<void>(resolve => {
      release = resolve;
    });
    const prev = this.pending;
    this.pending = next;
    await prev;
    try {
      return await fn();
    } finally {
      release!();
    }
  }
}

export function registerAdminVectorStoreRoutes(
  router: import('express').Router,
  deps: AdminRouteDeps,
): void {
  const {
    adminConfig,
    config,
    provider,
    logger,
    sendRouteError,
    onConfigChanged,
  } = deps;

  const withRoute = createWithRoute(logger, sendRouteError);
  const activeIdsMutex = new ActiveIdsMutex();

  router.get(
    '/admin/vector-store-config',
    withRoute(
      'GET /admin/vector-store-config',
      'Failed to get vector store configuration',
      async (_req, res) => {
        const resolved = provider.rag?.getVectorStoreConfig
          ? await provider.rag.getVectorStoreConfig()
          : null;

        if (resolved) {
          const dbOverrides = await adminConfig.getScopedValue(
            'vectorStoreConfig',
            provider.id as import('@backstage-community/plugin-agentic-chat-common').ProviderType,
          );
          const source =
            dbOverrides !== undefined ? ('merged' as const) : ('yaml' as const);

          res.json({
            success: true,
            config: resolved,
            source,
            timestamp: new Date().toISOString(),
          });
          return;
        }

        const ls = config.getOptionalConfig('agenticChat.llamaStack');
        res.json({
          success: true,
          config: readVectorStoreDefaults(ls),
          source: 'yaml',
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );

  router.post(
    '/admin/vector-store/create',
    withRoute(
      'POST /admin/vector-store/create',
      'Failed to create vector store',
      async (req, res) => {
        if (!provider.rag?.createVectorStoreWithConfig) {
          res.status(501).json({
            success: false,
            error: 'Vector store creation not supported by current provider',
          });
          return;
        }

        const ls = config.getOptionalConfig('agenticChat.llamaStack');
        const overrides: Record<string, unknown> = readVectorStoreDefaults(ls);

        const dbOverrides = await adminConfig.getScopedValue(
          'vectorStoreConfig',
          provider.id as ProviderType,
        );
        if (
          dbOverrides !== undefined &&
          typeof dbOverrides === 'object' &&
          dbOverrides !== null
        ) {
          Object.assign(overrides, dbOverrides as Record<string, unknown>);
        }

        const body = req.body;
        if (body !== undefined && body !== null) {
          if (Array.isArray(body) || typeof body !== 'object') {
            throw new InputError(
              'Request body must be an object, not null or array',
            );
          }
          if (body.name !== undefined) {
            if (
              typeof body.name !== 'string' ||
              (body.name as string).trim().length === 0
            ) {
              throw new InputError('name must be a non-empty string');
            }
            if ((body.name as string).length > 200) {
              throw new InputError('name must be at most 200 characters');
            }
          }
          if (body.embeddingModel !== undefined) {
            if (typeof body.embeddingModel !== 'string') {
              throw new InputError('embeddingModel must be a string');
            }
          }
          if (body.embeddingDimension !== undefined) {
            if (
              typeof body.embeddingDimension !== 'number' ||
              body.embeddingDimension <= 0 ||
              !Number.isFinite(body.embeddingDimension)
            ) {
              throw new InputError(
                'embeddingDimension must be a positive number',
              );
            }
          }
        }
        if (body && typeof body === 'object' && !Array.isArray(body)) {
          for (const key of VECTOR_STORE_CONFIG_FIELDS) {
            if ((body as Record<string, unknown>)[key] !== undefined) {
              overrides[key] = (body as Record<string, unknown>)[key];
            }
          }
        }

        let result: { vectorStoreId: string; message?: string };
        try {
          result = await provider.rag.createVectorStoreWithConfig(overrides);
        } catch (createErr) {
          if (
            createErr instanceof Error &&
            createErr.message.includes('already exists')
          ) {
            res.status(409).json({
              success: false,
              error: createErr.message,
            });
            return;
          }
          throw createErr;
        }

        const providerId = provider.id as ProviderType;

        if (result.vectorStoreId && result.vectorStoreId.length > 0) {
          try {
            await activeIdsMutex.run(async () => {
              const currentIds = await adminConfig.getScopedValue(
                'activeVectorStoreIds',
                providerId,
              );
              const ids: string[] = Array.isArray(currentIds)
                ? [...currentIds]
                : [];
              if (!ids.includes(result.vectorStoreId)) {
                ids.push(result.vectorStoreId);
                await adminConfig.setScopedValue(
                  'activeVectorStoreIds',
                  ids,
                  providerId,
                  'system',
                );
              }
            });
            onConfigChanged?.();
          } catch (persistErr) {
            logger.warn(
              `Vector store created but failed to persist active ID: ${
                persistErr instanceof Error ? persistErr.message : persistErr
              }. Use "Connect" to add it manually.`,
            );
          }
        }

        res.json({
          success: true,
          ...result,
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );

  router.get(
    '/admin/vector-store/status',
    withRoute(
      'GET /admin/vector-store/status',
      'Failed to get vector store status',
      async (_req, res) => {
        if (!provider.rag?.getVectorStoreStatus) {
          res.status(501).json({
            success: false,
            error: 'Vector store status not supported by current provider',
          });
          return;
        }

        const status = await provider.rag.getVectorStoreStatus();
        res.json({
          success: true,
          ...status,
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );

  router.get(
    '/admin/vector-stores',
    withRoute(
      'GET /admin/vector-stores',
      'Failed to list vector stores',
      async (_req, res) => {
        if (!provider.rag) {
          res.json({
            success: true,
            stores: [],
            timestamp: new Date().toISOString(),
          });
          return;
        }

        const providerId = provider.id as ProviderType;
        let activeIds = await Promise.resolve(
          provider.rag.getActiveVectorStoreIds(),
        );
        const dbValue = await adminConfig.getScopedValue(
          'activeVectorStoreIds',
          providerId,
        );
        const userHasManagedList = dbValue !== undefined;

        if (
          activeIds.length === 0 &&
          !userHasManagedList &&
          provider.rag.getVectorStoreStatus
        ) {
          try {
            const status = await provider.rag.getVectorStoreStatus();
            if (status.exists && status.ready && status.vectorStoreId) {
              const discoveredIds = [status.vectorStoreId];

              await adminConfig.setScopedValue(
                'activeVectorStoreIds',
                discoveredIds,
                providerId,
                'system',
              );

              if (provider.rag.addVectorStoreId) {
                provider.rag.addVectorStoreId(status.vectorStoreId);
              }

              onConfigChanged?.();

              logger.info(
                `Auto-populated active vector store from lazy init: ${status.vectorStoreId}`,
              );
              activeIds = discoveredIds;
            }
          } catch {
            logger.warn(
              'Vector store status check failed, continuing with empty IDs',
            );
          }
        }

        const allStores = await provider.rag.listVectorStores();
        const serverMap = new Map(allStores.map(s => [s.id, s]));

        const stores = await Promise.all(
          activeIds.map(async id => {
            const fromServer = serverMap.get(id);
            if (fromServer && fromServer.status !== 'unknown') {
              return { ...fromServer, active: true };
            }

            if (provider.rag?.getVectorStoreStatus) {
              try {
                const vs = await provider.rag.getVectorStoreStatus();
                if (vs.exists && vs.vectorStoreId === id) {
                  return {
                    id,
                    name: vs.vectorStoreName ?? id,
                    status: vs.ready ? 'completed' : 'in_progress',
                    fileCount: vs.documentCount ?? 0,
                    createdAt: 0,
                    active: true,
                  };
                }
              } catch {
                logger.debug(
                  'Vector store ID resolution failed, falling through',
                );
              }
            }

            return {
              id,
              name: fromServer?.name ?? id,
              status: fromServer?.status ?? 'unknown',
              fileCount: fromServer?.fileCount ?? 0,
              createdAt: fromServer?.createdAt ?? 0,
              active: true,
            };
          }),
        );

        res.json({
          success: true,
          stores,
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );

  router.post(
    '/admin/vector-stores/connect',
    withRoute(
      'POST /admin/vector-stores/connect',
      'Failed to connect vector store',
      async (req, res) => {
        const { vectorStoreId } = req.body;
        if (!vectorStoreId || typeof vectorStoreId !== 'string') {
          throw new InputError('vectorStoreId is required');
        }

        if (!provider.rag) {
          res.status(501).json({ success: false, error: 'RAG not available' });
          return;
        }

        const serverStores = await provider.rag.listVectorStores();
        const found = serverStores.find(s => s.id === vectorStoreId);
        if (!found) {
          res.status(404).json({
            success: false,
            error: `Vector store "${vectorStoreId}" was not found on the server. It may have been deleted.`,
          });
          return;
        }

        const providerId = provider.id as ProviderType;
        const updatedIds = await activeIdsMutex.run(async () => {
          const currentIds = await Promise.resolve(
            provider.rag!.getActiveVectorStoreIds(),
          );
          if (currentIds.includes(vectorStoreId)) {
            return null;
          }
          const ids = [...currentIds, vectorStoreId];
          await adminConfig.setScopedValue(
            'activeVectorStoreIds',
            ids,
            providerId,
            'system',
          );
          return ids;
        });

        if (updatedIds === null) {
          res.status(409).json({
            success: false,
            error: `Vector store "${vectorStoreId}" is already connected.`,
          });
          return;
        }

        if (provider.rag.addVectorStoreId) {
          provider.rag.addVectorStoreId(vectorStoreId);
        }

        onConfigChanged?.();

        res.json({
          success: true,
          activeVectorStoreIds: updatedIds,
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );

  router.delete(
    '/admin/vector-stores/:id',
    withRoute(
      req =>
        `DELETE /admin/vector-stores/${req.params.id} (permanent=${
          req.query.permanent === 'true'
        })`,
      'Failed to remove vector store',
      async (req, res) => {
        const { id } = req.params;
        const permanent = req.query.permanent === 'true';

        if (!id || id.trim().length === 0) {
          throw new InputError('Vector store ID is required');
        }

        if (!provider.rag) {
          res.status(501).json({ success: false, error: 'RAG not available' });
          return;
        }

        let filesDeleted = 0;

        if (permanent && provider.rag.deleteVectorStore) {
          const result = await provider.rag.deleteVectorStore(id);
          filesDeleted = result.filesDeleted;
        }

        const providerId = provider.id as ProviderType;
        const updatedIds = await activeIdsMutex.run(async () => {
          const currentIds = await Promise.resolve(
            provider.rag!.getActiveVectorStoreIds(),
          );
          const ids = currentIds.filter(storeId => storeId !== id);
          await adminConfig.setScopedValue(
            'activeVectorStoreIds',
            ids,
            providerId,
            'system',
          );
          return ids;
        });

        if (provider.rag.removeVectorStoreId) {
          provider.rag.removeVectorStoreId(id);
        }
        onConfigChanged?.();

        res.json({
          success: true,
          removed: id,
          permanent,
          filesDeleted,
          activeVectorStoreIds: updatedIds,
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );
}
