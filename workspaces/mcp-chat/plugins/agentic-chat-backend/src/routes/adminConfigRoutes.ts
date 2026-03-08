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
  DEFAULT_BRANDING,
  isProviderScopedKey,
} from '@backstage-community/plugin-agentic-chat-common';
import type { ProviderType } from '@backstage-community/plugin-agentic-chat-common';
import { AdminConfigService } from '../services/AdminConfigService';
import { validateAdminConfigValue } from '../services/utils/configValidation';
import { createWithRoute } from './routeWrapper';
import type { AdminRouteDeps } from './adminRouteTypes';

function readBrandingFromConfig(
  branding: import('@backstage/config').Config | undefined,
): Record<string, unknown> {
  if (!branding) return { ...DEFAULT_BRANDING };

  const stringFields = [
    'appName',
    'tagline',
    'inputPlaceholder',
    'primaryColor',
    'secondaryColor',
    'successColor',
    'warningColor',
    'errorColor',
    'infoColor',
    'logoUrl',
    'faviconUrl',
    'fontFamily',
    'fontFamilyMono',
    'themePreset',
    'glassIntensity',
  ] as const;

  const result: Record<string, unknown> = { ...DEFAULT_BRANDING };
  for (const field of stringFields) {
    const val = branding.getOptionalString(field);
    if (val !== undefined) {
      result[field] = val;
    }
  }

  const enableGlass = branding.getOptionalBoolean('enableGlassEffect');
  if (enableGlass !== undefined) {
    result.enableGlassEffect = enableGlass;
  }

  return result;
}

export function registerAdminConfigRoutes(
  router: import('express').Router,
  deps: AdminRouteDeps,
): void {
  const {
    adminConfig,
    config,
    provider,
    logger,
    sendRouteError,
    getUserRef,
    onConfigChanged,
  } = deps;

  const withRoute = createWithRoute(logger, sendRouteError);

  router.get(
    '/admin/config',
    withRoute(
      'GET /admin/config',
      'Failed to list admin configuration',
      async (_req, res) => {
        const entries = await adminConfig.listAll();
        res.json({
          success: true,
          entries,
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );

  router.get(
    '/admin/config/:key',
    withRoute(
      req => `GET /admin/config/${req.params.key}`,
      'Failed to get admin configuration',
      async (req, res) => {
        const validKey = AdminConfigService.validateKey(req.params.key);
        const providerId =
          (req.query.provider as string | undefined) ?? provider.id;

        if (isProviderScopedKey(validKey)) {
          const value = await adminConfig.getScopedValue(
            validKey,
            providerId as ProviderType,
          );
          if (value === undefined) {
            res.json({
              success: true,
              entry: null,
              source: 'default',
              timestamp: new Date().toISOString(),
            });
            return;
          }
          res.json({
            success: true,
            entry: {
              configKey: validKey,
              configValue: value,
              updatedAt: new Date().toISOString(),
              updatedBy: 'system',
            },
            source: 'database',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        const entry = await adminConfig.getEntry(validKey);
        if (!entry) {
          res.json({
            success: true,
            entry: null,
            source: 'default',
            timestamp: new Date().toISOString(),
          });
          return;
        }
        res.json({
          success: true,
          entry,
          source: 'database',
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );

  router.put(
    '/admin/config/:key',
    withRoute(
      req => `PUT /admin/config/${req.params.key}`,
      'Failed to update admin configuration',
      async (req, res) => {
        const validKey = AdminConfigService.validateKey(req.params.key);
        const { value } = req.body;
        if (value === undefined) {
          throw new InputError('Request body must contain a "value" field');
        }

        validateAdminConfigValue(validKey, value);

        const userRef = await getUserRef(req);
        const providerId =
          (req.query.provider as string | undefined) ?? provider.id;

        if (isProviderScopedKey(validKey)) {
          await adminConfig.setScopedValue(
            validKey,
            value,
            providerId as ProviderType,
            userRef,
          );
        } else {
          await adminConfig.set(validKey, value, userRef);
        }

        onConfigChanged?.();

        const warnings: string[] = [];

        if (
          validKey === 'model' &&
          typeof value === 'string' &&
          provider.listModels
        ) {
          try {
            const models = await provider.listModels();
            const found = models.some(m => m.id === value.trim());
            if (!found) {
              warnings.push(
                `Model "${value.trim()}" was not found on the inference server. It will be saved, but chat may fail if the model is unavailable.`,
              );
              logger.warn(
                `Admin saved model "${value.trim()}" which is not in the server's model list`,
              );
            }
          } catch (listErr) {
            logger.warn(`Could not validate model against server: ${listErr}`);
          }
        }

        res.json({
          success: true,
          configKey: validKey,
          ...(warnings.length > 0 && { warnings }),
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );

  router.delete(
    '/admin/config/:key',
    withRoute(
      req => `DELETE /admin/config/${req.params.key}`,
      'Failed to reset admin configuration',
      async (req, res) => {
        const validKey = AdminConfigService.validateKey(req.params.key);
        const providerId =
          (req.query.provider as string | undefined) ?? provider.id;

        let deleted: boolean;
        if (isProviderScopedKey(validKey)) {
          deleted = await adminConfig.deleteScopedValue(
            validKey,
            providerId as ProviderType,
          );
        } else {
          deleted = await adminConfig.delete(validKey);
        }

        onConfigChanged?.();

        res.json({
          success: true,
          deleted,
          configKey: validKey,
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );

  router.get(
    '/admin/effective-config',
    withRoute(
      'GET /admin/effective-config',
      'Failed to get effective configuration',
      async (_req, res) => {
        let effectiveConfig: Record<string, unknown>;

        if (provider.getEffectiveConfig) {
          effectiveConfig = await provider.getEffectiveConfig();
        } else {
          const ls = config.getOptionalConfig('agenticChat.llamaStack');
          const branding = config.getOptionalConfig('agenticChat.branding');
          effectiveConfig = {
            model: ls?.getOptionalString('model') ?? '',
            baseUrl: ls?.getOptionalString('baseUrl') ?? '',
            systemPrompt:
              config.getOptionalString('agenticChat.systemPrompt') ?? '',
            toolChoice: ls?.getOptionalString('toolChoice') ?? 'auto',
            enableWebSearch: ls?.getOptionalBoolean('enableWebSearch') ?? false,
            enableCodeInterpreter:
              ls?.getOptionalBoolean('enableCodeInterpreter') ?? false,
            safetyEnabled: ls?.getOptionalBoolean('safetyEnabled') ?? false,
            inputShields: ls?.getOptionalStringArray('inputShields') ?? [],
            outputShields: ls?.getOptionalStringArray('outputShields') ?? [],
            evaluationEnabled:
              ls?.getOptionalBoolean('evaluationEnabled') ?? false,
            scoringFunctions:
              ls?.getOptionalStringArray('scoringFunctions') ?? [],
            minScoreThreshold: ls?.getOptionalNumber('minScoreThreshold'),
            branding: readBrandingFromConfig(branding),
          };
        }

        const {
          token: _t,
          skipTlsVerify: _s,
          functions: _f,
          ...safeConfig
        } = effectiveConfig;

        res.json({
          success: true,
          config: safeConfig,
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );
}
