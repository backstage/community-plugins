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
import type { ProviderType } from '@backstage-community/plugin-agentic-chat-common';
import {
  getAllProviderDescriptors,
  isValidProviderType,
} from '../providers/registry';
import { toErrorMessage } from '../services/utils';
import { createWithRoute } from './routeWrapper';
import type { AdminRouteDeps } from './adminRouteTypes';

/**
 * Registers provider registry and active-provider endpoints.
 *
 * Endpoints:
 *   GET  /admin/providers        -- List all known providers
 *   GET  /admin/active-provider  -- Get the currently active provider ID
 *   PUT  /admin/active-provider  -- Set the active provider (triggers hot-swap)
 *
 * @internal
 */
export function registerProviderRoutes(
  router: import('express').Router,
  deps: AdminRouteDeps,
): void {
  const {
    logger,
    sendRouteError,
    adminConfig,
    provider,
    providerManager,
    getUserRef,
  } = deps;
  const withRoute = createWithRoute(logger, sendRouteError);

  router.get(
    '/admin/providers',
    withRoute(
      'GET /admin/providers',
      'Failed to list providers',
      async (_req, res) => {
        const descriptors = getAllProviderDescriptors();
        res.json({
          success: true,
          providers: descriptors,
          activeProviderId: provider.id,
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );

  router.get(
    '/admin/active-provider',
    withRoute(
      'GET /admin/active-provider',
      'Failed to get active provider',
      async (_req, res) => {
        const dbValue = await adminConfig.get('activeProvider');
        const providerId = typeof dbValue === 'string' ? dbValue : provider.id;

        res.json({
          success: true,
          providerId,
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );

  router.put(
    '/admin/active-provider',
    withRoute(
      'PUT /admin/active-provider',
      'Failed to set active provider',
      async (req, res) => {
        const { providerId } = req.body as { providerId?: string };

        if (typeof providerId !== 'string' || providerId.trim().length === 0) {
          throw new InputError(
            'Request body must contain a non-empty "providerId" string',
          );
        }

        const trimmed = providerId.trim();

        if (!isValidProviderType(trimmed)) {
          throw new InputError(
            `Unknown provider: "${trimmed}". ` +
              `Known providers: ${getAllProviderDescriptors()
                .map(d => d.id)
                .join(', ')}`,
          );
        }

        const descriptor = getAllProviderDescriptors().find(
          d => d.id === trimmed,
        );
        if (descriptor && !descriptor.implemented) {
          throw new InputError(
            `Provider "${descriptor.displayName}" is not yet implemented. ` +
              `It cannot be activated.`,
          );
        }

        const userRef = await getUserRef(req);
        await adminConfig.set('activeProvider', trimmed, userRef);

        if (providerManager && trimmed !== provider.id) {
          try {
            await providerManager.switchProvider(trimmed as ProviderType);
            logger.info(`Provider hot-swapped to "${trimmed}" by ${userRef}`);
          } catch (swapError) {
            logger.error(
              `Provider hot-swap to "${trimmed}" failed: ${toErrorMessage(
                swapError,
              )}`,
            );
            res.status(500).json({
              success: false,
              providerId: trimmed,
              error: `Provider switch failed: ${toErrorMessage(
                swapError,
                'Unknown error',
              )}. The previous provider remains active.`,
              timestamp: new Date().toISOString(),
            });
            return;
          }
        }

        res.json({
          success: true,
          providerId: trimmed,
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );
}
